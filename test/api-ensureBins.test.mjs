import fs from 'fs'
import os from 'os'
import path from 'path'
import http from 'http'
import crypto from 'crypto'
import assert from 'assert'
import cp, { spawnSync } from 'child_process'
import { syncBuiltinESMExports } from 'module'
import { fileURLToPath } from 'url'
import ensureBins from '../src/ensureBins.mjs'
import WLdap from '../src/WLdap.mjs'


//規格: 外部執行檔之存放下載校驗與離線(制式規格, C:\opensrcOper\dspec\外部執行檔之存放下載校驗與離線.md) D1~D4、O1~O3、E2、M6、§8 T3~T7(T8為主幹模式, 本套件為釘選模式不適用)
//exe 須與 Newtonsoft.Json.dll 相鄰, 故為檔案組 connLDAP(五檔): 整組取得、組內一檔不符即整組重取、離線缺檔時列出全組
//以本機 HTTP 伺服器扮 GitHub(raw.githubusercontent.com)與 HTTP 鏡像, 以本地資料夾扮鏡像, 全程不連外網; 下載與校驗之細節由 wsemi 之測試涵蓋, 本檔驗本套件接線:
//  清單(bin/manifest.json)與釘選網址、快取位置、環境變數、離線錯誤格式, 以及主函數 WLdap 確實經 ensureBins 取得並啟動組內之 exe
//註: 取得流程不執行 exe 故與平台無關; 經主函數啟動 exe 之案例僅 Windows


let fdRepo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let fdt = path.join(fdRepo, 'test', '_tmp', 'api-ensureBins')
let PORT = 8893 //固定埠(≥8000, 不隨機), 本機其他測試未用
let base = `http://127.0.0.1:${PORT}`
let isWin = process.platform === 'win32'

let manifest = JSON.parse(fs.readFileSync(path.join(fdRepo, 'bin', 'manifest.json'), 'utf8'))
let bundle = manifest.bundles[0]
let files = bundle.files //[{ path, sha256, size }]
let bytesOf = {}
for (let f of files) {
    bytesOf[f.path] = fs.readFileSync(path.join(fdRepo, bundle.dir, f.path))
}
let fnsAll = files.map((f) => f.path)
//組識別(規格M6): 組內各檔依path排序後逐行'<sha256>  <path>\n'之SHA-256, 此處獨立計算以驗 wsemi 之實作
let id = crypto.createHash('sha256').update([...files].sort((a, b) => (a.path < b.path ? -1 : 1)).map((f) => `${f.sha256}  ${f.path}\n`).join('')).digest('hex')
//GitHub 釘選網址之路徑(raw.githubusercontent.com 之後)
let urlPath = (fn) => `/${manifest.repo}/${manifest.commit}/${bundle.dir}/${fn}`
let urlsGithub = fnsAll.map(urlPath).sort()

//flip, 同大小但內容不同之位元組
let flip = (b) => {
    let c = Buffer.from(b)
    c[100] = c[100] ^ 0xff
    return c
}

//listFiles, 遞迴列出資料夾內所有檔(相對路徑, 斜線分隔)
let listFiles = (fd) => {
    let rs = []
    let walk = (d, pre) => {
        if (!fs.existsSync(d)) {
            return
        }
        for (let n of fs.readdirSync(d)) {
            let fp = path.join(d, n)
            if (fs.statSync(fp).isDirectory()) {
                walk(fp, `${pre}${n}/`)
            }
            else {
                rs.push(`${pre}${n}`)
            }
        }
    }
    walk(fd, '')
    return rs.sort()
}

//expectedList, 快取夾內應有之檔: <組識別>/<組內路徑>
let expectedList = fnsAll.map((fn) => `${id}/${fn}`).sort()

//扮GitHub之fetch: 將raw.githubusercontent.com改指本機伺服器
let fetchLocal = (url, init) => {
    return globalThis.fetch(String(url).replace('https://raw.githubusercontent.com', base), init)
}

//不得連網之fetch, 被呼叫即失敗
let fetchNever = () => {
    throw new Error('network must not be used')
}

//取得結果之錯誤
let getErr = async (pm) => {
    try {
        await pm
        return null
    }
    catch (err) {
        return err
    }
}

//seedMirror, 於本地資料夾建鏡像: 組資料夾形式 <鏡像>/w-ldap/<組識別>/<組內路徑>
let seedMirror = (mirror, tamper = {}) => {
    for (let f of files) {
        let fp = path.join(mirror, manifest.pkg, id, f.path)
        fs.mkdirSync(path.dirname(fp), { recursive: true })
        fs.writeFileSync(fp, tamper[f.path] ? flip(bytesOf[f.path]) : bytesOf[f.path])
    }
}

//本機伺服器: GET /<repo>/<commit>/bin/connLDAP/<path> 扮GitHub, GET /mirror/w-ldap/<組識別>/<path> 扮HTTP鏡像
let mode = { kind: 'ok', path: '' } // kind: ok | flip | short | e404, path: 受影響之組內檔
let hits = []
let server = null

//子行程以env覆寫三個環境變數(未給者刪除), 其餘繼承
let envOf = (ext = {}) => {
    let env = { ...process.env }
    for (let k of ['W_BIN_CACHE', 'W_BIN_MIRROR', 'W_BIN_OFFLINE']) {
        delete env[k]
    }
    return { ...env, ...ext }
}

//runChild, 子行程以ESM執行code, 回傳其stdout最後一行之JSON
let runChild = (code, ext = {}, cwd = fdt) => {
    let r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: path.resolve(cwd), env: envOf(ext), encoding: 'utf8', timeout: 120000, windowsHide: true })
    let lines = String(r.stdout || '').trim().split('\n')
    let m = null
    try {
        m = JSON.parse(lines[lines.length - 1])
    }
    catch (err) {}
    assert.strict.ok(m !== null, `子行程無JSON輸出: status=${r.status} stderr=${String(r.stderr || '').slice(0, 600)}`)
    return m
}

let urlEnsure = new URL('../src/ensureBins.mjs', import.meta.url).href

//CHILD_ENSURE, 無任何選項呼叫ensureBins(環境變數驅動)
let CHILD_ENSURE = `
import ensureBins from ${JSON.stringify(urlEnsure)}
let o = {}
try {
    let r = await ensureBins()
    o = { ok: true, bins: r, dir: r.bundles.connLDAP.dir }
}
catch (err) {
    o = { ok: false, code: err.code, message: String(err.message), missing: err.missing || null }
}
console.log(JSON.stringify(o))
`


describe(`api-ensureBins (外部執行檔組connLDAP之取得, 制式規格§8 T3~T7)`, function() {
    this.timeout(120000)

    before(async function() {
        fs.rmSync(fdt, { recursive: true, force: true })
        fs.mkdirSync(fdt, { recursive: true })
        server = http.createServer((req, res) => {
            hits.push(req.url)
            let u = decodeURIComponent(req.url)
            let fnGithub = fnsAll.find((fn) => u === urlPath(fn))
            let fnMirror = fnsAll.find((fn) => u === `/mirror/${manifest.pkg}/${id}/${fn}`)
            let fn = fnGithub || fnMirror
            if (!fn) {
                res.writeHead(404)
                res.end('not found')
                return
            }
            let body = bytesOf[fn]
            if (fnGithub && mode.path === fn) {
                if (mode.kind === 'e404') {
                    res.writeHead(404)
                    res.end('not found')
                    return
                }
                if (mode.kind === 'flip') {
                    body = flip(body)
                }
                else if (mode.kind === 'short') {
                    body = body.subarray(0, body.length - 10)
                }
            }
            res.writeHead(200, { 'content-length': String(body.length) })
            res.end(body)
        })
        await new Promise((resolve, reject) => {
            server.once('error', reject)
            server.listen(PORT, '127.0.0.1', resolve)
        })
    })

    after(async function() {
        await new Promise((resolve) => {
            server.close(resolve)
            server.closeAllConnections()
        })
        fs.rmSync(fdt, { recursive: true, force: true })
    })

    beforeEach(function() {
        mode = { kind: 'ok', path: '' }
        hits = []
    })

    it(`should export ensureBins as a function and attach it to the default export (D1, E2③)`, function() {
        assert.strict.equal(typeof ensureBins, 'function')
        assert.strict.equal(WLdap.ensureBins, ensureBins)
    })

    it(`T3: should download the whole bundle from the pinned commit URLs on first use, verify, publish it as one folder, then not use the network on the second call (D1, D3, D4, M2, M6)`, async function() {
        let cacheDir = path.join(fdt, 't3')
        let r = await ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchLocal, maxAttempts: 1 })
        let dir = path.join(path.resolve(cacheDir), id)
        assert.strict.deepStrictEqual(Object.keys(r), ['connLDAP'])
        assert.strict.equal(path.resolve(r.connLDAP), dir, '組資料夾須為<快取>/<組識別>(M6)')
        assert.strict.equal(path.resolve(r.bundles.connLDAP.dir), dir)
        //exe 與 dll 同一資料夾, 內容與 repo 之 bin/connLDAP 相同
        assert.strict.deepStrictEqual(Object.keys(r.bundles.connLDAP.files).sort(), [...fnsAll].sort())
        for (let fn of fnsAll) {
            let fp = r.bundles.connLDAP.files[fn]
            assert.strict.equal(path.resolve(path.dirname(fp)), dir, fn)
            assert.strict.ok(fs.readFileSync(fp).equals(bytesOf[fn]), fn)
        }
        //網址釘選到清單之提交, 非master(M2、U1), 恰五檔
        assert.strict.deepStrictEqual([...hits].sort(), urlsGithub)
        assert.strict.deepStrictEqual(listFiles(cacheDir), expectedList, '快取只存組內檔, 不留暫存')

        //第二次: 快取命中(整組校驗通過)不連網
        let r2 = await ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchNever })
        assert.strict.equal(path.resolve(r2.connLDAP), dir)
        assert.strict.equal(hits.length, 5)
    })

    it(`T3: concurrent calls share one download of the bundle (E2)`, async function() {
        let cacheDir = path.join(fdt, 't3-conc')
        let rs = await Promise.all([1, 2, 3].map(() => ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchLocal, maxAttempts: 1 })))
        assert.strict.equal(new Set(rs.map((r) => path.resolve(r.connLDAP))).size, 1)
        assert.strict.equal(hits.length, 5, `三次並發呼叫只下載一次: ${hits.length}`)
    })

    it(`T4: should reject and leave nothing when one file of the bundle differs in content, size, or is missing at the source (M2, M6, D2)`, async function() {
        let dll = 'Newtonsoft.Json.dll'
        let exe = 'connLDAP.net4.7.2.exe'
        for (let [kind, p, code] of [['flip', dll, 'E_HASH_MISMATCH'], ['short', exe, 'E_SIZE_MISMATCH'], ['e404', exe, 'E_HTTP']]) {
            mode = { kind, path: p }
            let cacheDir = path.join(fdt, `t4-${kind}`)
            let err = await getErr(ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchLocal, maxAttempts: 1, retryDelayMs: 1 }))
            assert.strict.equal(err && err.code, code, `${kind}: ${err && err.message}`)
            assert.strict.equal(err.bin, 'connLDAP', `${kind}: 錯誤須指出檔案組`)
            assert.strict.equal(err.file, p, `${kind}: 錯誤須指出組內檔`)
            assert.strict.deepStrictEqual(listFiles(cacheDir), [], `${kind}: 不符者不得留檔(整組不發布)`)
            assert.strict.deepStrictEqual(fs.existsSync(cacheDir) ? fs.readdirSync(cacheDir) : [], [], `${kind}: 不得留資料夾或暫存夾`)
        }
    })

    it(`T5: should take the bundle from a local-folder mirror (bundle-folder form and per-file form), and refuse a tampered mirror file (O1, O2, O3, M6)`, async function() {
        //組資料夾形式: 全離線(offline:true且fetch被呼叫即失敗)
        let mirror = path.join(fdt, 't5-mirror')
        seedMirror(mirror)
        let cacheDir = path.join(fdt, 't5-cache')
        let r = await ensureBins({ cacheDir, mirror, offline: true, fetch: fetchNever })
        for (let fn of fnsAll) {
            assert.strict.ok(fs.readFileSync(r.bundles.connLDAP.files[fn]).equals(bytesOf[fn]), fn)
        }
        assert.strict.equal(path.resolve(r.connLDAP), path.join(path.resolve(cacheDir), id))
        assert.strict.deepStrictEqual(listFiles(cacheDir), expectedList)
        assert.strict.equal(hits.length, 0)

        //單檔形式 <鏡像>/<pkg>/<sha256>/<檔名>
        let mirror2 = path.join(fdt, 't5-mirror2')
        for (let f of files) {
            fs.mkdirSync(path.join(mirror2, manifest.pkg, f.sha256), { recursive: true })
            fs.writeFileSync(path.join(mirror2, manifest.pkg, f.sha256, f.path), bytesOf[f.path])
        }
        let r2 = await ensureBins({ cacheDir: path.join(fdt, 't5-cache2'), mirror: mirror2, offline: true, fetch: fetchNever })
        assert.strict.ok(fs.readFileSync(r2.bundles.connLDAP.files['connLDAP.net4.8.exe']).equals(bytesOf['connLDAP.net4.8.exe']))

        //鏡像內一檔被竄改(同大小): 離線時拒用且不留檔 → E_OFFLINE_MISSING
        let mirror3 = path.join(fdt, 't5-mirror3')
        seedMirror(mirror3, { 'Newtonsoft.Json.dll': true })
        let cache3 = path.join(fdt, 't5-cache3')
        let err = await getErr(ensureBins({ cacheDir: cache3, mirror: mirror3, offline: true, fetch: fetchNever }))
        assert.strict.equal(err && err.code, 'E_OFFLINE_MISSING', err && err.message)
        assert.strict.deepStrictEqual(listFiles(cache3), [])

        //鏡像內一檔被竄改: 可連網時拒用鏡像、續找下一來源(GitHub)取得整組正確檔
        let cache4 = path.join(fdt, 't5-cache4')
        let r4 = await ensureBins({ cacheDir: cache4, mirror: mirror3, offline: false, fetch: fetchLocal, maxAttempts: 1 })
        for (let fn of fnsAll) {
            assert.strict.ok(fs.readFileSync(r4.bundles.connLDAP.files[fn]).equals(bytesOf[fn]), fn)
        }
        assert.strict.ok(hits.length >= 1, '被竄改之檔須改向GitHub取得')
    })

    it(`T5b: should take the bundle from an http mirror (O1, M6)`, async function() {
        let cacheDir = path.join(fdt, 't5b')
        let r = await ensureBins({ cacheDir, mirror: `${base}/mirror`, offline: false, maxAttempts: 1 })
        for (let fn of fnsAll) {
            assert.strict.ok(fs.readFileSync(r.bundles.connLDAP.files[fn]).equals(bytesOf[fn]), fn)
        }
        //只連鏡像, 不連GitHub網址
        assert.strict.deepStrictEqual([...hits].sort(), fnsAll.map((fn) => `/mirror/${manifest.pkg}/${id}/${fn}`).sort())
    })

    it(`T6: should reject with E_OFFLINE_MISSING listing the whole bundle (names, sha256, sizes, the bundle folder) when offline with no cache and no mirror (O3, M6)`, async function() {
        let cacheDir = path.join(fdt, 't6')
        let err = await getErr(ensureBins({ cacheDir, mirror: '', offline: true, fetch: fetchNever }))
        let dir = path.join(path.resolve(cacheDir), id)
        assert.strict.equal(err && err.code, 'E_OFFLINE_MISSING', err && err.message)
        assert.strict.equal(err.missing.length, 1)
        assert.strict.equal(path.resolve(err.missing[0].cachePath), dir, '應放位置為組資料夾')
        assert.strict.deepStrictEqual(err.missing[0].bundle.files.map((f) => f.path).sort(), [...fnsAll].sort())
        for (let s of [...fnsAll, ...files.map((f) => f.sha256), dir]) {
            assert.strict.ok(err.message.includes(s), `訊息須含: ${s}`)
        }
        assert.strict.deepStrictEqual(listFiles(cacheDir), [])
        assert.strict.equal(hits.length, 0)
    })

    it(`T6: should list the whole bundle even when only one file is absent from the mirror (O3, M6)`, async function() {
        let mirror = path.join(fdt, 't6-mirror')
        seedMirror(mirror)
        fs.rmSync(path.join(mirror, manifest.pkg, id, 'connLDAP.net4.6.exe'))
        let cacheDir = path.join(fdt, 't6-cache')
        let err = await getErr(ensureBins({ cacheDir, mirror, offline: true, fetch: fetchNever }))
        assert.strict.equal(err && err.code, 'E_OFFLINE_MISSING', err && err.message)
        for (let fn of fnsAll) {
            assert.strict.ok(err.message.includes(fn), `訊息須列全組, 缺: ${fn}`)
        }
        assert.strict.deepStrictEqual(listFiles(cacheDir), [], '缺一檔時不得發布殘缺的組')
    })

    it(`T7: should fetch the whole bundle again when one cached file is tampered, and never return the tampered file offline (D4, M6)`, async function() {
        let cacheDir = path.join(fdt, 't7')
        let r = await ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchLocal, maxAttempts: 1 })
        assert.strict.equal(hits.length, 5)
        let fpDll = r.bundles.connLDAP.files['Newtonsoft.Json.dll']

        //同大小竄改一檔 → 整組重取(五檔皆再下載)
        fs.writeFileSync(fpDll, flip(bytesOf['Newtonsoft.Json.dll']))
        hits = []
        let r2 = await ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchLocal, maxAttempts: 1 })
        assert.strict.ok(fs.readFileSync(r2.bundles.connLDAP.files['Newtonsoft.Json.dll']).equals(bytesOf['Newtonsoft.Json.dll']), '同大小竄改後須還原')
        assert.strict.deepStrictEqual([...hits].sort(), urlsGithub, '組內一檔不符即整組重取')
        assert.strict.deepStrictEqual(listFiles(cacheDir), expectedList)

        //截短竄改另一檔 → 重取
        fs.writeFileSync(r2.bundles.connLDAP.files['connLDAP.net4.5.exe'], Buffer.from('MZ'))
        let r3 = await ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchLocal, maxAttempts: 1 })
        assert.strict.ok(fs.readFileSync(r3.bundles.connLDAP.files['connLDAP.net4.5.exe']).equals(bytesOf['connLDAP.net4.5.exe']), '截短竄改後須還原')

        //缺一檔 → 重取
        fs.rmSync(r3.bundles.connLDAP.files['connLDAP.net4.6.exe'])
        let r4 = await ensureBins({ cacheDir, mirror: '', offline: false, fetch: fetchLocal, maxAttempts: 1 })
        assert.strict.ok(fs.existsSync(r4.bundles.connLDAP.files['connLDAP.net4.6.exe']))

        //竄改且無鏡像、離線: 不得回傳, 離線缺檔
        fs.writeFileSync(fpDll, flip(bytesOf['Newtonsoft.Json.dll']))
        let err = await getErr(ensureBins({ cacheDir, mirror: '', offline: true, fetch: fetchNever }))
        assert.strict.equal(err && err.code, 'E_OFFLINE_MISSING', err && err.message)
    })

    it(`should read W_BIN_CACHE, W_BIN_MIRROR and W_BIN_OFFLINE from the environment when no option is given (D3, O1, O3, E1)`, function() {
        let mirror = path.resolve(path.join(fdt, 'env-mirror'))
        seedMirror(mirror)
        let cache = path.resolve(path.join(fdt, 'env-cache'))

        //三者皆設: 自鏡像取得, 快取為<W_BIN_CACHE>/<套件>/<組識別>/<組內路徑>(跨套件共用結構)
        let o = runChild(CHILD_ENSURE, { W_BIN_CACHE: cache, W_BIN_MIRROR: mirror, W_BIN_OFFLINE: '1' })
        assert.strict.equal(o.ok, true, JSON.stringify(o))
        assert.strict.equal(path.resolve(o.dir), path.join(cache, manifest.pkg, id))
        assert.strict.deepStrictEqual(listFiles(cache), expectedList.map((v) => `${manifest.pkg}/${v}`))

        //只設離線與空快取: E_OFFLINE_MISSING
        let o2 = runChild(CHILD_ENSURE, { W_BIN_CACHE: path.resolve(path.join(fdt, 'env-cache2')), W_BIN_OFFLINE: '1' })
        assert.strict.equal(o2.ok, false)
        assert.strict.equal(o2.code, 'E_OFFLINE_MISSING', o2.message)
        assert.strict.ok(o2.message.includes(path.join(path.resolve(path.join(fdt, 'env-cache2')), manifest.pkg, id)))
    })

    it(`should locate the package root from the module file, not from the working directory (E2)`, function() {
        //預設快取為<套件根>/bin-cache; 子行程以他處為工作目錄, 以離線＋空鏡像取得缺檔錯誤, 錯誤訊息中之快取路徑須在本套件根
        let o = runChild(CHILD_ENSURE, { W_BIN_OFFLINE: '1', W_BIN_MIRROR: path.resolve(path.join(fdt, 'empty-mirror')) }, os.tmpdir())
        assert.strict.equal(o.ok, false)
        assert.strict.equal(o.code, 'E_OFFLINE_MISSING', o.message)
        assert.strict.ok(o.message.includes(path.join(fdRepo, 'bin-cache', id)), o.message)
    })

    it(`should not forward floatingManifestUrl to fsEnsureBins (it changes the trust anchor; E2)`, async function() {
        let mirror = path.join(fdt, 'float-mirror')
        seedMirror(mirror)
        //釘選模式下該選項本無作用, 但若被轉傳, fsEnsureBins 會對無效之網址(非網址、帶帳密、非 https)以 E_ARG 拒絕; 不轉傳則一律成功
        for (let [i, v] of ['not a url', 'https://user:pw@evil.example/manifest.json', 'http://evil.example/manifest.json'].entries()) {
            let r = await ensureBins({ cacheDir: path.join(fdt, `float-cache${i}`), mirror, offline: true, fetch: fetchNever, floatingManifestUrl: v })
            assert.strict.deepStrictEqual(Object.keys(r), ['connLDAP'], v)
        }
    })

    //經主函數啟動 exe, 僅Windows
    ;(isWin ? describe : describe.skip)(`WLdap (main function) obtains the executable through ensureBins and runs it from the bundle folder`, function() {

        let fdMain = path.join(fdt, 'main')
        let envKeys = ['W_BIN_CACHE', 'W_BIN_MIRROR', 'W_BIN_OFFLINE']
        let envSaved = {}
        let origFetch = null
        let origSpawn = null
        let fetchCalls = []
        let spawnCalls = []
        let fetchImpl = null

        //ldappath 非 ADsPath: exe 於本機立即回報 LDAP 錯誤(不連網), 證明 exe 已啟動並載入 dll、解析 stdin、寫出輸出檔
        let input = { mode: 'logIn', account: 'u', password: 'p-w', ldappath: 'not-an-adspath' }

        //exeSpawns, 啟動 connLDAP exe 之 spawn 呼叫
        let exeSpawns = () => spawnCalls.filter((c) => /connLDAP\.net[\d.]+\.exe$/i.test(String(c.command)))

        before(function() {
            fs.mkdirSync(fdMain, { recursive: true })
            for (let k of envKeys) {
                envSaved[k] = process.env[k]
            }
            origFetch = globalThis.fetch
            origSpawn = cp.spawn
            globalThis.fetch = (...a) => {
                fetchCalls.push(String(a[0]))
                return fetchImpl(...a)
            }
            cp.spawn = (...a) => {
                spawnCalls.push({ command: a[0], args: a[1] })
                return origSpawn(...a)
            }
            syncBuiltinESMExports() //使 wsemi 之 execCli 以具名匯入取得之 spawn 同步為替換後者
        })

        after(function() {
            globalThis.fetch = origFetch
            cp.spawn = origSpawn
            syncBuiltinESMExports()
            for (let k of envKeys) {
                if (envSaved[k] === undefined) {
                    delete process.env[k]
                }
                else {
                    process.env[k] = envSaved[k]
                }
            }
        })

        beforeEach(function() {
            fetchCalls = []
            spawnCalls = []
            fetchImpl = fetchNever
            for (let k of envKeys) {
                delete process.env[k]
            }
        })

        it(`should start the exe inside the bundle folder returned by ensureBins, offline from the mirror, without touching the global fetch (E2②, O2, O3)`, async function() {
            let mirror = path.join(fdMain, 'a-mirror')
            seedMirror(mirror)
            let cache = path.join(fdMain, 'a-cache')
            process.env.W_BIN_CACHE = cache
            process.env.W_BIN_MIRROR = mirror
            process.env.W_BIN_OFFLINE = '1'
            let bins = await ensureBins()
            let dir = path.resolve(bins.connLDAP)
            assert.strict.equal(dir, path.join(path.resolve(cache), manifest.pkg, id))

            let err = await getErr(WLdap(input))
            assert.strict.equal(typeof err, 'string', '拒絕值須為字串')
            assert.strict.ok(err.trim().length > 0 && !/^(spawn\[|code\[|timeout\[|ensureBins\[)/.test(err), `應為exe回報之LDAP錯誤原文: ${err}`)
            assert.strict.deepStrictEqual(fetchCalls, [], '快取/鏡像取得時主函數不得連網')
            let calls = exeSpawns()
            assert.strict.equal(calls.length, 1)
            //啟動者為組資料夾內之 connLDAP.net4.8.exe(舊路徑 bin/connLDAP、src、node_modules 內之同位元組檔不算)
            assert.strict.equal(path.resolve(calls[0].command), path.join(dir, 'connLDAP.net4.8.exe'))
            assert.strict.deepStrictEqual(calls[0].args, [], '輸入經stdin, 命令列無參數')
            //組資料夾內仍只有組內五檔, 無輸出檔
            assert.strict.deepStrictEqual(listFiles(path.join(path.resolve(cache), manifest.pkg)), expectedList)
        })

        it(`should start the exe of the version selected by opt.ver, each from the same bundle folder`, async function() {
            let mirror = path.join(fdMain, 'v-mirror')
            seedMirror(mirror)
            process.env.W_BIN_CACHE = path.join(fdMain, 'v-cache')
            process.env.W_BIN_MIRROR = mirror
            process.env.W_BIN_OFFLINE = '1'
            let dir = path.resolve((await ensureBins()).connLDAP)
            for (let ver of ['4.5', '4.6', '4.7.2', '4.8']) {
                spawnCalls = []
                let err = await getErr(WLdap(input, { ver }))
                assert.strict.equal(typeof err, 'string', ver)
                assert.strict.ok(!/^(spawn\[|code\[|timeout\[|ensureBins\[)/.test(err), `${ver}: ${err}`)
                assert.strict.deepStrictEqual(exeSpawns().map((c) => path.resolve(c.command)), [path.join(dir, `connLDAP.net${ver}.exe`)], ver)
            }
            assert.strict.deepStrictEqual(fetchCalls, [])
        })

        it(`T3 via the main function: first use downloads the whole bundle from the pinned commit URLs through the global fetch, second call hits the verified cache (D1, D4, M2)`, async function() {
            let cache = path.join(fdMain, 'd-cache')
            process.env.W_BIN_CACHE = cache
            //全域 fetch 已被本區塊換為記錄用包裝, 轉發時用原始 fetch(fetchLocal 內用 globalThis.fetch 會遞迴)
            fetchImpl = (url, init) => origFetch(String(url).replace('https://raw.githubusercontent.com', base), init)
            let err = await getErr(WLdap(input))
            assert.strict.equal(typeof err, 'string')
            assert.strict.ok(!/^(spawn\[|code\[|timeout\[|ensureBins\[)/.test(err), err)
            assert.strict.deepStrictEqual(fetchCalls.map((u) => u.replace('https://raw.githubusercontent.com', '')).sort(), urlsGithub)
            let dir = path.join(path.resolve(cache), manifest.pkg, id)
            assert.strict.deepStrictEqual(exeSpawns().map((c) => path.resolve(c.command)), [path.join(dir, 'connLDAP.net4.8.exe')])
            assert.strict.deepStrictEqual(listFiles(path.join(path.resolve(cache), manifest.pkg)), expectedList)

            //第二次: 快取命中, 不再連網
            fetchCalls = []
            let err2 = await getErr(WLdap(input))
            assert.strict.equal(typeof err2, 'string')
            assert.strict.deepStrictEqual(fetchCalls, [])
        })

        it(`should reject with the string 'ensureBins[E_OFFLINE_MISSING]: ...' and start nothing when offline with no cache and no mirror (O3, E3)`, async function() {
            process.env.W_BIN_CACHE = path.join(fdMain, 'o-cache')
            process.env.W_BIN_OFFLINE = '1'
            let err = await getErr(WLdap(input))
            assert.strict.equal(typeof err, 'string')
            assert.strict.ok(err.startsWith('ensureBins[E_OFFLINE_MISSING]: '), err)
            for (let fn of fnsAll) {
                assert.strict.ok(err.includes(fn), fn)
            }
            assert.strict.ok(!err.includes(input.password), '訊息不含密碼')
            assert.strict.deepStrictEqual(fetchCalls, [])
            assert.strict.deepStrictEqual(exeSpawns(), [])
        })

        it(`should not read the working directory: a foreign cwd still resolves the package root and runs the real exe next to its dll (E2, S1)`, function() {
            //真 exe 自快取之組資料夾啟動: 連不到 LDAP(非 ADsPath)時得 LDAP 錯誤原文; 缺相鄰之 dll 時則為 code[1] 並指出 Newtonsoft.Json
            let mirror = path.join(fdMain, 'c-mirror')
            seedMirror(mirror)
            let fpCase = path.join(fdMain, 'c-case.json')
            fs.writeFileSync(fpCase, JSON.stringify({ input, opt: {} }), 'utf8')
            let cache = path.join(fdMain, 'c-cache')
            let r = spawnSync(process.execPath, [path.join(fdRepo, 'test', 'tools', 'runWLdap.mjs'), path.join(fdRepo, 'src', 'WLdap.mjs'), fpCase], {
                cwd: os.tmpdir(),
                env: envOf({ W_BIN_CACHE: cache, W_BIN_MIRROR: mirror, W_BIN_OFFLINE: '1' }),
                encoding: 'utf8',
                timeout: 120000,
                windowsHide: true,
            })
            let line = String(r.stdout || '').split(/\r?\n/).find((l) => l.startsWith('RESULT '))
            assert.strict.ok(line, `子行程無結果: status=${r.status} stderr=${String(r.stderr || '').slice(0, 400)}`)
            let res = JSON.parse(line.slice('RESULT '.length))
            assert.strict.equal(res.outcome, 'reject')
            assert.strict.equal(res.valueType, 'string')
            assert.strict.ok(res.value.trim().length > 0 && !/^(spawn\[|code\[|timeout\[|ensureBins\[)/.test(res.value), res.value)
            assert.strict.ok(!res.value.includes('Newtonsoft'), res.value)
            assert.strict.deepStrictEqual(listFiles(cache), expectedList.map((v) => `${manifest.pkg}/${v}`), '快取在W_BIN_CACHE, 與工作目錄無關')
        })

    })

})
