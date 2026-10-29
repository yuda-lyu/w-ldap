import assert from 'assert'
import crypto from 'crypto'
import fs from 'fs'
import net from 'net'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import h from './tools/wldapHarness.mjs'


//測試自行建立docker容器供Samba AD DC服務(映像以test/tools/sambaAd/之Dockerfile自建), 測試結束即銷毀, 故需環境已安裝並啟動docker(Linux容器模式)
//容器對外埠固定為8990且只綁127.0.0.1; 映像保留供下次沿用(Dockerfile與entrypoint.sh內容未變即不重建、不需連網), 首次建置需下載debian與samba套件
//斷言之依據: WLdap之JSDoc與CLAUDE_rulebook.md之規則(RB編號)、已知限制; 括號內S編號對應規則帳本之測試表
//WLdap以子行程於沙箱呼叫真exe(同unit-WLdap; 沙箱test/_tmp/api-ldap-sambaAd/, after刪除); exe只能在Windows執行, 非Windows整支略過


let execFileAsync = promisify(execFile)

let ctName = 'w-ldap-test-samba-ad'
let imgRepo = 'w-ldap-test-samba-ad'
let fdDocker = path.join(h.fdTools, 'sambaAd')
let ctPort = 8990 //容器LDAP對外埠, 依全域規範固定(≥8000、禁止隨機), 只綁127.0.0.1
let closedPort = 8991 //未監聽之固定埠, 供伺服器不可達之案例
let realm = 'TEST.LOCAL'
let domain = 'TEST'
let adminPass = 'Wldap-Adm1n!23'
let baseDn = realm.toLowerCase().split('.').map((s) => `DC=${s}`).join(',')
let ldappath = `LDAP://127.0.0.1:${ctPort}/${baseDn}`
let wrongPw = 'Wrong-Pass!99'

//測試帳號, 於容器內以samba-tool建立, CN取帳號(--use-username-as-cn)
let userNormal = { account: 'wldapuser', password: 'Wldap-Pass!23' }
let userDate = { account: 'wldapdate', password: '2020-01-01T00:00:00' } //像日期之密碼
let userUni = { account: 'wldapuni', password: 'P@ss-秘密-😀-123' } //含非ASCII字元之密碼
let users = [userNormal, userDate, userUni]

//網域格式之帳號: <NETBIOS>\<帳號>、<帳號>@<realm>
let fmtAccounts = [`${domain}\\${userNormal.account}`, `${userNormal.account}@${realm.toLowerCase()}`]

//WLdap自組之拒絕訊息前綴(RB2), LDAP回報之錯誤原文不帶這些前綴
let rejectPrefixes = ['spawn[', 'code[', 'timeout[', 'invalid output from connLDAP:', 'connLDAP exited without output file', 'connLDAP reported an empty error']


let delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

//docker, 以陣列傳參不經shell; 失敗時只取stderr(err.message含完整指令與帳密)
let docker = async (args) => {
    try {
        return await execFileAsync('docker', args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true })
    }
    catch (err) {
        let detail = String(err.stderr || '').trim() || String(err.code || 'unknown error')
        throw new Error(`docker ${args[0]} failed: ${detail.slice(-2000)}`)
    }
}

//ensureImage, 映像標籤取Dockerfile與entrypoint.sh內容(換行統一為LF)之雜湊, 已存在即沿用, 內容變更時才建置
//不每次docker build: build每次皆執行基底映像之load metadata(實測每次約1-2秒, 推測為向registry解析標籤); 沿用既有映像則同w-orm-postgresql之docker run, 不需建置
let ensureImage = async () => {
    let hash = crypto.createHash('sha256')
    for (let fn of ['Dockerfile', 'entrypoint.sh']) {
        hash.update(`${fn}\n${fs.readFileSync(path.join(fdDocker, fn), 'utf8').replace(/\r\n/g, '\n')}\n`)
    }
    let image = `${imgRepo}:${hash.digest('hex').slice(0, 12)}`
    let exists = await docker(['image', 'inspect', '--format', '{{.Id}}', image]).then(() => true, () => false)
    if (!exists) {
        await docker(['build', '-t', image, fdDocker])
    }
    return image
}

//bindRequest, LDAP匿名simple bind(messageID 1, version 3, name '', simple '')
let bindRequest = Buffer.from('300c020101600702010304008000', 'hex')

//isBindResponse, 回應是否為LDAPMessage(SEQUENCE 0x30)且其protocolOp為BindResponse([APPLICATION 1] 0x61)
let isBindResponse = (buf) => {
    let i = 0
    let readLen = () => {
        let b = buf[i++]
        if (b < 0x80) {
            return b
        }
        let v = 0
        for (let k = 0; k < b - 0x80; k++) {
            v = v * 256 + buf[i++]
        }
        return v
    }
    if (buf[i++] !== 0x30) {
        return false
    }
    readLen()
    if (buf[i++] !== 0x02) {
        return false
    }
    let n = readLen() //messageID之長度; 須先取值再前進, 寫成i += readLen()會先讀舊i而丟失readLen之前進
    i += n
    return buf[i] === 0x61
}

//probeLdap, 以匿名bind直連對外埠, 收到BindResponse才算就緒
//不以TCP可連線判斷: docker之埠轉送於容器內服務尚未監聽時仍會接受連線再關閉(實測)
let probeLdap = () => {
    return new Promise((resolve) => {
        let chunks = []
        let sock = net.connect({ host: '127.0.0.1', port: ctPort })
        let done = (ok) => {
            sock.destroy()
            resolve(ok)
        }
        sock.setTimeout(3000, () => done(false))
        sock.on('error', () => done(false))
        sock.on('end', () => done(false))
        sock.on('connect', () => sock.write(bindRequest))
        sock.on('data', (b) => {
            chunks.push(b)
            if (isBindResponse(Buffer.concat(chunks))) {
                done(true)
            }
        })
    })
}

//isListening, 本機該埠是否有服務接受連線(逾時無從判定, 亦視為有)
let isListening = (port) => {
    return new Promise((resolve) => {
        let sock = net.connect({ host: '127.0.0.1', port })
        let done = (v) => {
            sock.destroy()
            resolve(v)
        }
        sock.setTimeout(3000, () => done(true))
        sock.on('connect', () => done(true))
        sock.on('error', () => done(false))
    })
}

//ctLogs, 容器日誌末段, 供啟動失敗時診斷
let ctLogs = async () => {
    return docker(['logs', '--tail', '30', ctName])
        .then((r) => `${r.stdout}${r.stderr}`.trim(), (err) => err.message)
}

//waitReady, 等待LDAP就緒; 容器已結束(佈建或啟動失敗)即提早報錯, 並附容器日誌
let waitReady = async () => {
    let t = Date.now()
    while (true) {
        if (await probeLdap()) {
            return
        }
        let running = await docker(['inspect', '--format', '{{.State.Running}}', ctName]).then((r) => r.stdout.trim() === 'true', () => false)
        if (!running) {
            throw new Error(`samba容器已結束(佈建或啟動失敗): ${await ctLogs()}`)
        }
        if (Date.now() - t > 180000) {
            throw new Error(`samba容器啟動逾時: ${await ctLogs()}`)
        }
        await delay(1000)
    }
}

//entryPath, 測試帳號條目之ADsPath
let entryPath = (account) => {
    return `LDAP://127.0.0.1:${ctPort}/CN=${account},CN=Users,${baseDn}`
}


describe('api-ldap-sambaAd', function() {

    let fdRoot = h.fdTmp('api-ldap-sambaAd')
    let dockerOk = false

    //call, 於新沙箱以子行程呼叫一次WLdap(真exe經ensureBins自沙箱鏡像離線取得, 組內四版exe與dll皆在)
    let call = (name, input, opt = {}) => {
        let fd = h.makeSandbox(fdRoot, name, { exe: 'real' })
        let r = h.runWLdap(fd, { input, opt })
        //RB3: 輸出檔於呼叫後清除, 不殘留(輸出檔落在作業系統暫存夾, 快取夾內也不得有)
        assert.strict.deepEqual(r.filesInTmp, [], `${name}: 暫存夾輸出檔殘留`)
        assert.strict.deepEqual(r.filesInCache.filter((f) => path.posix.basename(f).startsWith('_')), [], `${name}: 快取夾輸出檔殘留`)
        //RB4: 函式庫不寫console
        assert.strict.deepEqual(r.logs, [], `${name}: 寫了console`)
        return r
    }

    //expectEntry, JSDoc: logIn之resolve值為該帳號之LDAP條目 —— Path指向該帳號(DN不分大小寫比對), Properties.samaccountname為該帳號
    let expectEntry = (r, account) => {
        assert.strict.equal(r.outcome, 'resolve', JSON.stringify(r.value))
        assert.strict.equal(r.valueType, 'object', JSON.stringify(r.value))
        assert.strict.equal(String(r.value.Path).toLowerCase(), entryPath(account).toLowerCase(), JSON.stringify(r.value).slice(0, 500))
        assert.strict.deepEqual(r.value.Properties.samaccountname, [account])
    }

    //expectUserList, JSDoc: listUsers之resolve值為使用者條目陣列 —— 各元素為該伺服器之條目(Path、Properties), 含測試建立之帳號且其Path指向該帳號
    let expectUserList = (r) => {
        assert.strict.equal(r.outcome, 'resolve', JSON.stringify(r.value).slice(0, 500))
        assert.strict.equal(r.valueType, 'array')
        for (let e of r.value) {
            assert.ok(String(e.Path).toLowerCase().startsWith(`LDAP://127.0.0.1:${ctPort}/`.toLowerCase()), JSON.stringify(e).slice(0, 500))
            assert.ok(e.Properties !== null && typeof e.Properties === 'object', JSON.stringify(e).slice(0, 500))
        }
        for (let u of users) {
            let e = r.value.find((x) => (x.Properties.samaccountname || [])[0] === u.account)
            assert.ok(e, `缺${u.account}`)
            assert.strict.equal(String(e.Path).toLowerCase(), entryPath(u.account).toLowerCase())
        }
    }

    //expectLdapReject, JSDoc: reject一律為字串, LDAP回報之錯誤為其原始訊息(不帶WLdap自組之前綴, RB2), 原文隨系統語系而變故不寫死; RB4: 不含輸入之密碼
    let expectLdapReject = (r, password) => {
        assert.strict.equal(r.outcome, 'reject', JSON.stringify(r.value))
        assert.strict.equal(r.valueType, 'string', JSON.stringify(r.value))
        assert.ok(r.value.trim() !== '', JSON.stringify(r.value))
        assert.ok(!rejectPrefixes.some((p) => r.value.startsWith(p)), r.value)
        assert.ok(!r.value.includes(password), r.value)
    }

    //expectLoginOk, 負向案例之前提: 同一伺服器以正確帳密可登入, 使拒絕確由帳密所致而非伺服器不可達
    let expectLoginOk = (name) => {
        expectEntry(call(name, { mode: 'logIn', ...userNormal, ldappath }), userNormal.account)
    }

    before(async function() {
        this.timeout(900000) //含首次建置映像(下載debian與samba套件)、網域佈建與samba啟動
        if (!h.isWin) {
            this.skip()
        }

        //check docker
        let os = await docker(['version', '--format', '{{.Server.Os}}'])
            .then((r) => r.stdout.trim(), (err) => {
                throw new Error(`需先安裝並啟動docker才能執行samba ad整合測試: ${err.message}`)
            })
        if (os !== 'linux') {
            throw new Error(`需將docker切換為Linux容器模式才能執行samba ad整合測試(目前為${os})`)
        }
        dockerOk = true

        //image
        let image = await ensureImage()

        //清除前次殘留容器
        await docker(['rm', '-f', ctName]).catch(() => {})

        //run, 佈建sysvol時須設定ACL故以--privileged執行
        await docker(['run', '-d', '--rm', '--privileged', '--name', ctName, '--hostname', 'dc1', '-e', `REALM=${realm}`, '-e', `DOMAIN=${domain}`, '-e', `ADMINPASS=${adminPass}`, '-p', `127.0.0.1:${ctPort}:389`, image])

        //等待LDAP就緒
        await waitReady()

        //建立測試帳號
        for (let u of users) {
            await docker(['exec', ctName, 'samba-tool', 'user', 'create', u.account, u.password, '--use-username-as-cn'])
        }

        h.rmrf(fdRoot)
        fs.mkdirSync(fdRoot, { recursive: true })
    })

    after(async function() {
        this.timeout(120000)
        h.rmrf(fdRoot)
        if (!dockerOk) {
            return
        }

        //銷毀容器並回驗已移除
        await docker(['rm', '-f', ctName]).catch(() => {})
        let r = await docker(['ps', '-a', '--filter', `name=^/${ctName}$`, '--format', '{{.Names}}'])
        assert.strict.equal(r.stdout.trim(), '', `容器${ctName}未移除`)
    })

    it('logIn 帳密正確 → resolve 該帳號之 LDAP 條目(S01)', function() {
        expectEntry(call('S01', { mode: 'logIn', ...userNormal, ldappath }), userNormal.account)
    })

    it('logIn 密碼錯誤或帳號不存在 → 以字串 reject, 為 LDAP 錯誤原文(S02)', function() {
        expectLoginOk('S02-pre')
        expectLdapReject(call('S02-wrongpw', { mode: 'logIn', account: userNormal.account, password: wrongPw, ldappath }), wrongPw)
        expectLdapReject(call('S02-nouser', { mode: 'logIn', account: 'wldapnosuch', password: userNormal.password, ldappath }), userNormal.password)
    })

    it('listUsers → resolve 條目陣列, 含測試建立之帳號(S03)', function() {
        expectUserList(call('S03', { mode: 'listUsers', ...userNormal, ldappath }))
    })

    it('listUsers 密碼錯誤或帳號不存在 → 以字串 reject, 為 LDAP 錯誤原文(S04)', function() {
        expectLoginOk('S04-pre')
        expectLdapReject(call('S04-wrongpw', { mode: 'listUsers', account: userNormal.account, password: wrongPw, ldappath }), wrongPw)
        expectLdapReject(call('S04-nouser', { mode: 'listUsers', account: 'wldapnosuch', password: userNormal.password, ldappath }), userNormal.password)
    })

    it('密碼像日期(2020-01-01T00:00:00)→ resolve 該帳號條目, 密碼未被 exe 改寫(S05, RB8)', function() {
        expectEntry(call('S05', { mode: 'logIn', ...userDate, ldappath }), userDate.account)
    })

    it('密碼含非 ASCII 字元 → resolve 該帳號條目, 經 stdin 傳遞未失真(S06, RB6)', function() {
        expectEntry(call('S06', { mode: 'logIn', ...userUni, ldappath }), userUni.account)
    })

    it('logIn 帳號為 <NETBIOS>\\<帳號> 或 <帳號>@<realm>: 密碼正確 → resolve {success:null}, 密碼錯誤 → 以字串 reject(S07)', function() {
        fmtAccounts.forEach((account, i) => {
            //JSDoc: 帳密驗證成功但以samaccountname查無該帳號條目時回傳{success:null}(已知限制, 主控Q4裁示維持)
            let r = call(`S07-${i}-ok`, { mode: 'logIn', account, password: userNormal.password, ldappath })
            assert.strict.equal(r.outcome, 'resolve', JSON.stringify(r.value))
            assert.strict.deepEqual(r.value, { success: null })
            //同格式密碼錯誤即拒絕: {success:null}係綁定成功之後的結果
            expectLdapReject(call(`S07-${i}-wrongpw`, { mode: 'logIn', account, password: wrongPw, ldappath }), wrongPw)
        })
    })

    it('ldappath 指向未監聽之固定埠 → 以字串 reject, 為 LDAP 錯誤原文(S08)', async function() {
        //前提: 該埠確實未監聽
        assert.strict.equal(await isListening(closedPort), false, `埠${closedPort}有服務監聽, 無法驗證伺服器不可達`)
        expectLdapReject(call('S08', { mode: 'logIn', ...userNormal, ldappath: `LDAP://127.0.0.1:${closedPort}/${baseDn}` }), userNormal.password)
    })

    it('ldappath 之 scheme 為小寫 ldap:// → logIn 與 listUsers 皆 resolve(S09)', function() {
        //exe連線前將ldappath之ldap不分大小寫改為大寫, logIn與listUsers各寫一處(srcVB/connLDAP/run.vb), 故兩者皆測
        let lower = ldappath.replace('LDAP://', 'ldap://')
        expectEntry(call('S09-login', { mode: 'logIn', ...userNormal, ldappath: lower }), userNormal.account)
        expectUserList(call('S09-list', { mode: 'listUsers', ...userNormal, ldappath: lower }))
    })

    it('opt.ver 四版 exe 皆可登入並回該帳號條目(S10, RB9)', function() {
        for (let ver of ['4.5', '4.6', '4.7.2', '4.8']) {
            let r = call(`S10-${ver}`, { mode: 'logIn', ...userNormal, ldappath }, { ver })
            expectEntry(r, userNormal.account)
        }
    })

    it('listUsers 帳號為 <NETBIOS>\\<帳號> 或 <帳號>@<realm> → resolve 條目陣列(S11)', function() {
        //listUsers之查詢不依帳號(samaccountname=*), 綁定成功即回全部條目; 與logIn之{success:null}(S07)對照
        fmtAccounts.forEach((account, i) => {
            expectUserList(call(`S11-${i}`, { mode: 'listUsers', account, password: userNormal.password, ldappath }))
        })
    })

})
