import assert from 'assert'
import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import h from './tools/wldapHarness.mjs'


//斷言之依據: WLdap 之 JSDoc 與 run02 需求述語(R/P 編號); 括號內為 run01 審計表 A、B 之列號
//替身(test/tools/StubConnLdap.cs)於 before 以 csc 編譯至 test/_tmp/unit-WLdap/, after 刪除; 除平台案例外僅於 Windows 執行


let pw = 'P@ss-秘密-😀-123'
let base = () => ({ mode: 'logIn', account: 'test-user', password: pw, ldappath: 'LDAP://stub' })
let b64 = (s) => Buffer.from(s, 'utf8').toString('base64')
let rejectPrefixes = ['spawn[', 'code[', 'timeout[', 'invalid output from connLDAP:', 'connLDAP exited without output file']


describe('unit-WLdap', function() {

    let fdRoot = h.fdTmp('unit-WLdap')
    let fpStub = path.join(fdRoot, 'StubConnLdap.exe')

    //stub, 以替身跑一案
    let stub = (name, behavior, c = {}) => {
        let fd = h.makeSandbox(fdRoot, name, { exe: 'stub', fpStub, behavior })
        return h.runWLdap(fd, { input: base(), ...c })
    }

    //expectReject, 拒絕值須為字串(R04)
    let expectReject = (r, msg) => {
        assert.strict.equal(r.outcome, 'reject', JSON.stringify(r.value))
        assert.strict.equal(r.valueType, 'string', JSON.stringify(r.value))
        if (msg !== undefined) {
            assert.strict.equal(r.value, msg)
        }
    }

    before(function() {
        h.rmrf(fdRoot)
        fs.mkdirSync(fdRoot, { recursive: true })
        if (h.isWin) {
            h.compileCs(path.join(h.fdTools, 'StubConnLdap.cs'), fpStub, ['System.Web.Extensions.dll'])
        }
    })

    after(function() {
        h.rmrf(fdRoot)
    })

    it('非 Windows → 以字串拒絕(A01)', function() {
        let fd = h.makeSandbox(fdRoot, 'platform', { exe: 'none' })
        let r = h.runWLdap(fd, { input: base(), fakePlatform: 'linux' })
        expectReject(r, 'operating system is not windows')
    })

    describe('替身 exe', function() {

        before(function() {
            if (!h.isWin) {
                this.skip()
            }
        })

        it('exe 以非 0 結束且不寫檔 → code[N] 字串並帶 exe 之 stderr(P01b, A13)', function() {
            let r = stub('exit3-nofile', { exitCode: 3, stderr: 'stub-boom', file: 'none' })
            expectReject(r)
            assert.ok(r.value.startsWith('code[3]:'), r.value)
            assert.ok(r.value.includes('stub-boom'), r.value)
        })

        it('exe 以 0 結束但不寫檔 → 拒絕而非 resolve(P01c, A15)', function() {
            expectReject(stub('exit0-nofile', { file: 'none' }), 'connLDAP exited without output file')
        })

        it('輸出非 base64 → 拒絕(P01d, A18)', function() {
            expectReject(stub('notb64', { file: 'raw', content: '@@not-base64@@' }), 'invalid output from connLDAP: not base64')
        })

        it('輸出為 base64 但非 JSON → 拒絕(P01d, A19)', function() {
            expectReject(stub('notjson', { file: 'json', content: 'not json at all' }), 'invalid output from connLDAP: not json')
        })

        it('輸出為 0 位元組或只有 BOM → 拒絕(P01d, A16, A17)', function() {
            expectReject(stub('empty0', { file: 'raw', content: '', bom: false }), 'invalid output from connLDAP: empty')
            expectReject(stub('bomonly', { file: 'raw', content: '', bom: true }), 'invalid output from connLDAP: empty')
        })

        it('輸出根非物件 → 拒絕(P01d, A21, A24)', function() {
            expectReject(stub('rootnull', { file: 'json', content: 'null' }), 'invalid output from connLDAP: not an object')
            expectReject(stub('rootarr', { file: 'json', content: '[1,2]' }), 'invalid output from connLDAP: not an object')
        })

        it('輸出物件兩鍵皆無 → 拒絕(P01g, A25)', function() {
            expectReject(stub('neither', { file: 'json', content: '{"foo":1}' }), 'invalid output from connLDAP: no success or error')
        })

        it('輸出 error 為空字串 → 拒絕而非 resolve(P01e, A27)', function() {
            expectReject(stub('erroremtpy', { file: 'json', content: '{"error":""}' }), 'connLDAP reported an empty error')
        })

        it('輸出 error 為非空字串 → 以原文拒絕(P01e, A26)', function() {
            expectReject(stub('errorx', { file: 'json', content: '{"error":"x"}' }), 'x')
        })

        it('輸出 success 為物件 → resolve 其值(P01f, A28)', function() {
            let r = stub('success', { file: 'json', content: '{"success":{"a":1}}' })
            assert.strict.equal(r.outcome, 'resolve')
            assert.strict.deepEqual(r.value, { a: 1 })
        })

        it('輸出 {success:null} → resolve 整個物件(R08, A29)', function() {
            let r = stub('successnull', { file: 'json', content: '{"success":null}' })
            assert.strict.equal(r.outcome, 'resolve')
            assert.strict.deepEqual(r.value, { success: null })
        })

        it('exe 成功但輸出檔被他程序占用 → 仍依 exe 結果 resolve, 清理不決定結局(R02, A31)', function() {
            let r = stub('locked', { file: 'json', content: '{"success":{"a":1}}', holdMs: 3000 })
            assert.strict.equal(r.outcome, 'resolve', JSON.stringify(r.value))
            assert.strict.deepEqual(r.value, { a: 1 })
        })

        it('exe 非有效 PE(spawn 同步失敗)→ spawn[ 字串而非 Error(P01a, R04, A10)', function() {
            let fd = h.makeSandbox(fdRoot, 'notpe', { exe: 'notpe' })
            let r = h.runWLdap(fd, { input: base() })
            expectReject(r)
            assert.ok(r.value.startsWith('spawn['), r.value)
        })

        it('失敗路徑不寫 console(R03, N5)', function() {
            let r1 = stub('log-exit3', { exitCode: 3, stderr: 'stub-boom', file: 'none' })
            let fd = h.makeSandbox(fdRoot, 'log-notpe', { exe: 'notpe' })
            let r2 = h.runWLdap(fd, { input: base() })
            assert.strict.deepEqual(r1.logs, [])
            assert.strict.deepEqual(r2.logs, [])
        })

        it('輸入經 stdin 交給 exe, 命令列不含密碼與輸入之 base64(P06a, R06)', function() {
            let r = stub('channel', { file: 'echo' })
            assert.strict.equal(r.outcome, 'resolve', JSON.stringify(r.value))
            let stdin = (r.stubStdin || '').trim()
            let received = stdin ? JSON.parse(Buffer.from(stdin, 'base64').toString('utf8')) : {}
            assert.strict.equal(received.password, pw)
            assert.ok(!r.stubCmdline.includes(pw), r.stubCmdline)
            assert.ok(!r.stubCmdline.includes(stdin), r.stubCmdline)
            //命令列只剩 exe 路徑
            let rest = r.stubCmdline.trim().replace(/^"[^"]*"|^\S+/, '').trim()
            assert.strict.equal(rest, '', r.stubCmdline)
        })

        it('不改動呼叫端物件, 自帶之內部鍵與額外鍵不送給 exe(R05, A37, B01, B07)', function() {
            let input = { ...base(), '__System:OutputFilename': 'caller-value', 'extraKey': 'not-for-exe' }
            let r = stub('nomutate', { file: 'echo' }, { input })
            assert.strict.equal(r.outcome, 'resolve', JSON.stringify(r.value))
            assert.strict.deepEqual(r.after, r.before)
            assert.ok(/^_[0-9A-Za-z]{32}$/.test(r.value['__System:OutputFilename']), r.value['__System:OutputFilename'])
            assert.strict.deepEqual(Object.keys(r.value).sort(), ['__System:OutputFilename', 'account', 'ldappath', 'mode', 'password'])
        })

        it('freeze 與 seal 之 input 可正常呼叫(R05, A07, B02, B03)', function() {
            let r1 = stub('freeze', { file: 'json', content: '{"success":{"a":1}}' }, { freeze: true })
            let r2 = stub('seal', { file: 'json', content: '{"success":{"a":1}}' }, { seal: true })
            assert.strict.equal(r1.outcome, 'resolve', JSON.stringify(r1.value))
            assert.strict.equal(r2.outcome, 'resolve', JSON.stringify(r2.value))
        })

        it('額外鍵為 BigInt 或循環參照不影響呼叫且不送給 exe(R05, A08)', function() {
            let r1 = stub('bigint', { file: 'echo' }, { extra: 'bigint' })
            let r2 = stub('circular', { file: 'echo' }, { extra: 'circular' })
            assert.strict.equal(r1.outcome, 'resolve', JSON.stringify(r1.value))
            assert.strict.equal(r2.outcome, 'resolve', JSON.stringify(r2.value))
            assert.ok(!('extra' in r1.value))
            assert.ok(!('extra' in r2.value))
        })

        it('opt.timeout 逾時 → timeout[Nms] 字串且 exe 已被終止(R07, P01i)', function() {
            let t0 = Date.now()
            let r = stub('timeout', { sleepMs: 8000, file: 'json', content: '{"success":{"a":1}}' }, { opt: { timeout: 1000 } })
            let ms = Date.now() - t0
            expectReject(r)
            assert.ok(r.value.startsWith('timeout[1000ms]'), r.value)
            assert.ok(ms < 7000, `${ms}ms`)
            assert.strict.equal(h.isAlive(r.stubPid), false)
        })

        it('opt.timeout 非正整數視為未給, 不逾時(R07)', function() {
            let r1 = stub('timeout-neg', { sleepMs: 1500, file: 'json', content: '{"success":{"a":1}}' }, { opt: { timeout: -1 } })
            let r2 = stub('timeout-str', { sleepMs: 1500, file: 'json', content: '{"success":{"a":1}}' }, { opt: { timeout: 'abc' } })
            assert.strict.equal(r1.outcome, 'resolve', JSON.stringify(r1.value))
            assert.strict.equal(r2.outcome, 'resolve', JSON.stringify(r2.value))
        })

        it('並發 20 次各自對應且無殘檔(A36)', function() {
            let fd = h.makeSandbox(fdRoot, 'parallel', { exe: 'stub', fpStub, behavior: { file: 'echo' } })
            let r = h.runWLdap(fd, { input: base(), parallel: 20 })
            assert.strict.equal(r.parallel.length, 20)
            r.parallel.forEach((x, i) => {
                assert.strict.equal(x.outcome, 'resolve', JSON.stringify(x.value))
                assert.strict.equal(x.value.password, `pw-${i}`)
            })
            assert.strict.deepEqual(r.filesInSrc.filter((f) => f.startsWith('_')), [])
        })

    })

    describe('真 exe(不需 AD、不連網)', function() {

        before(function() {
            if (!h.isWin) {
                this.skip()
            }
        })

        it('經 stdin 之輸入被 exe 正確解析: ldappath 非 ADsPath → exe 回報之 LDAP 錯誤原文(P06b, A26)', function() {
            let fd = h.makeSandbox(fdRoot, 'real-adspath', { exe: 'real' })
            let r = h.runWLdap(fd, { input: { ...base(), ldappath: 'not-an-adspath' } })
            expectReject(r)
            assert.ok(r.value.trim().length > 0)
            assert.ok(!rejectPrefixes.some((p) => r.value.startsWith(p)), r.value)
            assert.strict.deepEqual(r.filesInSrc.filter((f) => f.startsWith('_')), [])
        })

        it('缺 Newtonsoft.Json.dll → code[1] 並指出原因, 不再遮蔽(P06d, N2, A15)', function() {
            let fd = h.makeSandbox(fdRoot, 'real-nonewtonsoft', { exe: 'real', newtonsoft: false })
            let r = h.runWLdap(fd, { input: base() })
            expectReject(r)
            assert.ok(r.value.startsWith('code[1]:'), r.value)
            assert.ok(r.value.includes('Newtonsoft.Json'), r.value)
        })

        it('exe 不接受命令列輸入: 帶參數執行 → 非 0 結束且 stderr 說明須用 stdin, 不寫輸出檔(P06c)', function() {
            let fd = h.makeSandbox(fdRoot, 'real-args', { exe: 'real' })
            let fpExe = path.join(fd, 'src', 'connLDAP.net4.8.exe')
            let payload = { ...base(), 'ldappath': 'not-an-adspath', '__System:OutputFilename': '_args' }
            let r = cp.spawnSync(fpExe, [b64(JSON.stringify(payload))], { input: '', windowsHide: true, timeout: 60000 })
            assert.notStrictEqual(r.status, 0)
            assert.ok(r.stderr.toString('utf8').includes('stdin'), r.stderr.toString('utf8'))
            assert.strict.equal(fs.existsSync(path.join(fd, 'src', '_args')), false)
        })

        it('像日期之密碼不被 exe 改寫(P06e, N3)', function() {
            let fd = h.makeSandbox(fdRoot, 'real-parse', { exe: 'real' })
            let fdSrc = path.join(fd, 'src')
            fs.copyFileSync(path.join(fdSrc, 'connLDAP.net4.8.exe'), path.join(fdSrc, 'connLDAP.exe'))
            let fpProbe = path.join(fdSrc, 'ExeParseProbe.exe')
            h.compileCs(path.join(h.fdTools, 'ExeParseProbe.cs'), fpProbe, [path.join(fdSrc, 'connLDAP.exe'), 'Microsoft.VisualBasic.dll'])
            for (let p of ['2020-01-01T00:00:00', '1999-12-31T23:59:59.123+08:00', '/Date(0)/', pw]) {
                let fpOut = path.join(fdSrc, 'probe-out.txt')
                let payload = { 'mode': 'logIn', 'account': 'test-user', 'password': p, 'ldappath': 'LDAP://x', '__System:OutputFilename': '_x' }
                let r = cp.spawnSync(fpProbe, [b64(JSON.stringify(payload)), fpOut], { windowsHide: true, timeout: 60000 })
                assert.strict.equal(r.status, 0, String(r.stderr))
                assert.strict.equal(fs.readFileSync(fpOut, 'utf8'), p)
            }
        })

    })

})
