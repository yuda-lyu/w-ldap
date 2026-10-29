import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { execSync, execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import fsGetBinManifestEntry from 'wsemi/src/fsGetBinManifestEntry.mjs'
import fsEnsureBins from 'wsemi/src/fsEnsureBins.mjs'


//規格: 外部執行檔之存放下載校驗與離線(制式規格, C:\opensrcOper\dspec\外部執行檔之存放下載校驗與離線.md) S1、S2、S5、M1、M2、M4、M6、§8 T1、T2
//本檔與平台無關(不執行 exe), CI(ubuntu)亦跑
//註: 清單讀取放在 it 內, 缺清單時以個別案例失敗呈現, 不使整個檔載入失敗

let fdRepo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let fdt = path.join(fdRepo, 'test', '_tmp', 'unit-binManifest')
let fpManifest = path.join(fdRepo, 'bin', 'manifest.json')
let pkg = JSON.parse(fs.readFileSync(path.join(fdRepo, 'package.json'), 'utf8'))

let readManifest = () => {
    return JSON.parse(fs.readFileSync(fpManifest, 'utf8'))
}

let fnsAll = ['Newtonsoft.Json.dll', 'connLDAP.net4.5.exe', 'connLDAP.net4.6.exe', 'connLDAP.net4.7.2.exe', 'connLDAP.net4.8.exe']


describe(`unit-binManifest: bin/manifest.json`, function() {
    this.timeout(180000)

    before(function() {
        fs.rmSync(fdt, { recursive: true, force: true })
    })

    after(function() {
        fs.rmSync(fdt, { recursive: true, force: true })
    })

    it(`should be a pinned manifest of this package with the single bundle connLDAP of five files (M1, M6, S2, 本套件為D類釘選模式)`, function() {
        let m = readManifest()
        assert.strict.equal(m.schema, 1)
        assert.strict.equal(m.pkg, pkg.name)
        assert.strict.equal(m.mode, 'pinned')
        assert.strict.equal(m.repo, `yuda-lyu/${pkg.name}`)
        assert.strict.ok(/^[0-9a-f]{40}$/.test(m.commit), `commit須為40碼小寫十六進位: ${m.commit}`)
        assert.strict.equal(m.files, undefined, '單檔清單項應為空, 全部在檔案組內')
        assert.strict.equal(m.bundles.length, 1)
        let b = m.bundles[0]
        assert.strict.equal(b.name, 'connLDAP')
        assert.strict.equal(b.dir, 'bin/connLDAP')
        assert.strict.deepEqual(b.files.map((f) => f.path), fnsAll)
        for (let f of b.files) {
            assert.strict.ok(/^[0-9a-f]{64}$/.test(f.sha256), `sha256須為64碼十六進位: ${f.sha256}`)
            assert.strict.ok(Number.isInteger(f.size) && f.size > 0, `size須為正整數: ${f.size}`)
        }
    })

    it(`should pass the schema check of fsEnsureBins (M1, M2, M6)`, async function() {
        //離線且快取為空資料夾: 清單有效時為E_OFFLINE_MISSING(缺檔), 清單無效時為E_MANIFEST; 不連網
        let err = null
        try {
            await fsEnsureBins('bin/manifest.json', { pkgRoot: fdRepo, cacheDir: path.join(fdt, 'cache'), mirror: '', offline: true })
        }
        catch (e) {
            err = e
        }
        assert.strict.equal(err && err.code, 'E_OFFLINE_MISSING', err && err.message)
        //離線缺檔時列出全組(M6)
        assert.strict.equal(err.missing.length, 1)
        assert.strict.deepEqual(err.missing[0].bundle.files.map((f) => f.path), fnsAll)
    })

    it(`should match the real files in bin/connLDAP (M4, T2)`, async function() {
        let m = readManifest()
        let b = m.bundles[0]
        for (let f of b.files) {
            let e = await fsGetBinManifestEntry(path.join(fdRepo, b.dir, f.path))
            assert.strict.deepStrictEqual([e.sha256, e.size], [f.sha256, f.size], f.path)
        }
    })

    it(`should list every file in bin/ in the manifest (M4 反向: bin/內不得有清單未載之檔)`, function() {
        let m = readManifest()
        let inManifest = m.bundles[0].files.map((f) => f.path).sort()
        let inBundle = fs.readdirSync(path.join(fdRepo, 'bin', 'connLDAP')).sort()
        assert.strict.deepStrictEqual(inBundle, inManifest)
        assert.strict.deepStrictEqual(fs.readdirSync(path.join(fdRepo, 'bin')).sort(), ['connLDAP', 'manifest.json'])
    })

    it(`should ignore the non-shipping outputs of srcVB (OutputPath is bin/connLDAP/) but not the shipped files (S2)`, function() {
        let ignored = (fn) => {
            try {
                execFileSync('git', ['check-ignore', '-q', `bin/connLDAP/${fn}`], { cwd: fdRepo, windowsHide: true, stdio: 'ignore' })
                return true
            }
            catch (err) {
                return false
            }
        }
        for (let fn of ['connLDAP.exe', 'connLDAP.exe.config', 'connLDAP.pdb', 'connLDAP.xml', 'Newtonsoft.Json.xml']) {
            assert.strict.equal(ignored(fn), true, fn)
        }
        for (let fn of fnsAll) {
            assert.strict.equal(ignored(fn), false, fn)
        }
        //vbproj 之 OutputPath 確實指向 bin/connLDAP/(Debug 與 Release)
        let vbproj = fs.readFileSync(path.join(fdRepo, 'srcVB', 'connLDAP', 'connLDAP.vbproj'), 'utf8')
        assert.strict.deepStrictEqual(vbproj.match(/<OutputPath>[^<]*<\/OutputPath>/g), ['<OutputPath>..\\..\\bin\\connLDAP\\</OutputPath>', '<OutputPath>..\\..\\bin\\connLDAP\\</OutputPath>'])
    })

    it(`should have the pinned commit contain the same bytes as bin/ (M2: 釘選提交之原始檔=清單所載, GitHub依此提交供檔)`, function() {
        let m = readManifest()
        let git = (args) => {
            return execFileSync('git', args, { cwd: fdRepo, windowsHide: true, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
        }
        try {
            git(['cat-file', '-e', `${m.commit}^{commit}`])
        }
        catch (err) {
            //淺層clone等取不到該提交時無從比對(本機完整clone必有)
            this.skip()
        }
        let b = m.bundles[0]
        for (let f of b.files) {
            let fp = `${b.dir}/${f.path}`
            let bytes = git(['show', `${m.commit}:${fp}`])
            assert.strict.equal(bytes.length, f.size, `${fp} size@${m.commit}`)
            let sha = fs.readFileSync(path.join(fdRepo, fp))
            assert.strict.ok(bytes.equals(sha), `${fp}@${m.commit} 與工作樹內容不同`)
        }
    })

    it(`should not pack external executables into the npm package, only bin/manifest.json, even when decoys are present (S1, S5, T1)`, function() {
        //誘餌: 舊路徑(src/)之 exe 與 dll、bin/ 根與 bin-cache/ 與 test/_tmp/ 與 srcVB/ 內之執行檔; 規則缺漏時此案確定性變紅
        let decoys = [
            'src/connLDAP.net4.8.exe',
            'src/Newtonsoft.Json.dll',
            'bin/decoy-root.exe',
            'bin-cache/decoy/connLDAP.net4.8.exe',
            'test/_tmp/decoy/decoy.exe',
            'srcVB/decoy.dll',
        ].map((v) => path.join(fdRepo, v))
        let made = []
        try {
            for (let fp of decoys) {
                fs.mkdirSync(path.dirname(fp), { recursive: true })
                fs.writeFileSync(fp, 'decoy')
                made.push(fp)
            }
            let r = JSON.parse(execSync('npm pack --dry-run --json', { cwd: fdRepo, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }))
            let info = Array.isArray(r) ? r[0] : Object.values(r)[0] //npm 11以前為陣列, npm 12起為以套件名為鍵之物件
            let fps = info.files.map((v) => v.path)
            //任何位置皆無外部執行檔(含舊路徑 src/connLDAP.net*.exe、src/Newtonsoft.Json.dll)
            assert.strict.deepStrictEqual(fps.filter((v) => /\.(exe|dll|msi|zip|7z|\d{3})$/i.test(v)), [])
            //bin/與bin-cache/下只有清單
            assert.strict.deepStrictEqual(fps.filter((v) => v.startsWith('bin/') || v.startsWith('bin-cache/')), ['bin/manifest.json'])
            //srcVB/與test/_tmp/不入包
            assert.strict.deepStrictEqual(fps.filter((v) => v.startsWith('srcVB/') || v.startsWith('test/_tmp/')), [])
            //入包之程式含取得與啟動執行檔所需之檔
            for (let fp of ['src/WLdap.mjs', 'src/ensureBins.mjs', 'src/getOutPlace.mjs', 'src/judgeResult.mjs']) {
                assert.strict.ok(fps.includes(fp), `${fp}須入包`)
            }
        }
        finally {
            for (let fp of made) {
                fs.rmSync(fp, { force: true })
            }
            for (let fd of ['bin-cache/decoy', 'test/_tmp/decoy']) {
                fs.rmSync(path.join(fdRepo, fd), { recursive: true, force: true })
            }
            //bin-cache/ 與 srcVB 內為本案才建立者: 空資料夾一併移除
            for (let fd of ['bin-cache']) {
                try {
                    fs.rmdirSync(path.join(fdRepo, fd))
                }
                catch (err) {}
            }
        }
    })

})
