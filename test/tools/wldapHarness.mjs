// unit-WLdap 與 api-ldap-sambaAd 測試之共用工具: 編譯替身與探針、建沙箱、以子行程呼叫 WLdap
// 沙箱為一個迷你套件(套件根＝沙箱資料夾): src/ 為 repo 之 src/*.mjs 副本, bin/manifest.json 描述沙箱要用的 exe 組,
//   mirror/ 為離線鏡像(W_BIN_MIRROR, 每檔存成 <鏡像>/w-ldap/<sha256>/<組內路徑>), 子行程設 W_BIN_OFFLINE=1, 故 WLdap 走真正的 ensureBins 取得 exe(不連網),
//   快取在沙箱內 bin-cache/, 作業系統暫存夾(TEMP/TMP)指向沙箱內 tmp/ 以檢查輸出檔落點與殘檔
// 路徑皆由本檔位置推得(test/tools -> test -> repo 根), 沙箱落在 test/_tmp/<案名>/
import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import crypto from 'crypto'
import { fileURLToPath } from 'url'


let fdTools = path.dirname(fileURLToPath(import.meta.url))
let fdTest = path.resolve(fdTools, '..')
let fdRepo = path.resolve(fdTools, '..', '..')
let isWin = process.platform === 'win32'
let vers = ['4.5', '4.6', '4.7.2', '4.8']


//fdTmp, 測試專用之暫存資料夾
function fdTmp(name) {
    return path.join(fdTest, '_tmp', name)
}


//rmrf, 刪除資料夾, 子程序剛結束時檔案可能短暫被占用故重試
function rmrf(fd) {
    fs.rmSync(fd, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
}


//listFiles, 遞迴列出資料夾內所有檔(相對路徑, 斜線分隔, 排序), 資料夾不存在回空陣列
function listFiles(fd) {
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


//findCsc, .NET Framework 4 內建之 C# 編譯器
function findCsc() {
    let fdWin = process.env.WINDIR || process.env.windir || 'C:\\Windows'
    for (let fd of ['Framework64', 'Framework']) {
        let fp = path.join(fdWin, 'Microsoft.NET', fd, 'v4.0.30319', 'csc.exe')
        if (fs.existsSync(fp)) {
            return fp
        }
    }
    throw new Error('can not find csc.exe of .NET Framework 4')
}


//compileCs, 檔案參數一律給反斜線之 Windows 絕對路徑(以正斜線給含中文之絕對路徑時 csc 會改以 cwd 相對路徑開檔而失敗)
function compileCs(fpCs, fpOut, refs = []) {
    let args = ['-nologo', '-target:exe', `-out:${path.win32.resolve(fpOut)}`]
    for (let ref of refs) {
        let isPath = ref.includes('\\') || ref.includes('/')
        args.push(`-reference:${isPath ? path.win32.resolve(ref) : ref}`)
    }
    args.push(path.win32.resolve(fpCs))
    let r = cp.spawnSync(findCsc(), args, { windowsHide: true })
    if (r.status !== 0) {
        //csc 之輸出為系統字碼頁(中文系統為 cp950)
        let msg = new TextDecoder('big5').decode(Buffer.concat([r.stdout || Buffer.alloc(0), r.stderr || Buffer.alloc(0)]))
        throw new Error(`csc failed[${r.status}]: ${msg}`)
    }
}


//makeSandbox, 建立沙箱(迷你套件), 其 exe 組放替身、真 exe 或非 PE 檔
// opt.exe: 'stub'(connLDAP.net4.8.exe 為替身, 另需 fpStub、behavior) | 'real'(repo 之 bin/connLDAP 全部五檔, 用 repo 之 bin/manifest.json; newtonsoft:false 時組內不含 dll) | 'notpe'(exe 為非 PE 檔) | 'none'(不使用)
// 組內檔之原件另存於 <沙箱>/files/, 供直接執行 exe 之案例使用(在快取之外, 可寫)
function makeSandbox(fdRoot, name, opt = {}) {
    let fdCase = path.join(fdRoot, name)
    rmrf(fdCase)
    let fdSrc = path.join(fdCase, 'src')
    let fdFiles = path.join(fdCase, 'files')
    for (let fd of [fdSrc, fdFiles, path.join(fdCase, 'bin'), path.join(fdCase, 'tmp'), path.join(fdCase, 'stub')]) {
        fs.mkdirSync(fd, { recursive: true })
    }

    //src, repo 之 src/*.mjs 副本(含 ensureBins.mjs, 其套件根為沙箱)
    for (let fn of fs.readdirSync(path.join(fdRepo, 'src'))) {
        if (fn.endsWith('.mjs')) {
            fs.copyFileSync(path.join(fdRepo, 'src', fn), path.join(fdSrc, fn))
        }
    }

    //files, 組內檔
    let files = {}
    if (opt.exe === 'real') {
        for (let fn of fs.readdirSync(path.join(fdRepo, 'bin', 'connLDAP'))) {
            if (fn === 'Newtonsoft.Json.dll' && opt.newtonsoft === false) {
                continue
            }
            files[fn] = fs.readFileSync(path.join(fdRepo, 'bin', 'connLDAP', fn))
        }
    }
    else if (opt.exe === 'stub') {
        files['connLDAP.net4.8.exe'] = fs.readFileSync(opt.fpStub)
        fs.writeFileSync(path.join(fdCase, 'stub', 'stub-behavior.json'), JSON.stringify(opt.behavior || {}), 'utf8')
    }
    else if (opt.exe === 'notpe') {
        files['connLDAP.net4.8.exe'] = Buffer.from('this is not a PE file', 'utf8')
    }
    else {
        files['connLDAP.net4.8.exe'] = Buffer.from('unused', 'utf8')
    }

    //files/, mirror/(每檔 <鏡像>/w-ldap/<sha256>/<組內路徑>), manifest
    let entries = []
    for (let fn of Object.keys(files).sort()) {
        let b = files[fn]
        let sha256 = crypto.createHash('sha256').update(b).digest('hex')
        fs.writeFileSync(path.join(fdFiles, fn), b)
        fs.mkdirSync(path.join(fdCase, 'mirror', 'w-ldap', sha256), { recursive: true })
        fs.writeFileSync(path.join(fdCase, 'mirror', 'w-ldap', sha256, fn), b)
        entries.push({ path: fn, sha256, size: b.length })
    }
    let manifest = null
    if (opt.exe === 'real' && opt.newtonsoft !== false) {
        manifest = JSON.parse(fs.readFileSync(path.join(fdRepo, 'bin', 'manifest.json'), 'utf8'))
    }
    else {
        manifest = { schema: 1, pkg: 'w-ldap', mode: 'pinned', repo: 'yuda-lyu/w-ldap', commit: '0'.repeat(40), bundles: [{ name: 'connLDAP', dir: 'bin/connLDAP', files: entries }] }
    }
    fs.writeFileSync(path.join(fdCase, 'bin', 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
    return fdCase
}


//envOf, 子行程之環境變數: 只連沙箱鏡像(離線)、暫存夾指向沙箱、替身之紀錄夾; envExtra 可覆寫(如 W_BIN_CACHE 指到他處)
function envOf(fdCase, envExtra = {}) {
    let env = { ...process.env }
    delete env.W_BIN_CACHE
    env.W_BIN_MIRROR = path.join(fdCase, 'mirror')
    env.W_BIN_OFFLINE = '1'
    env.TEMP = path.join(fdCase, 'tmp')
    env.TMP = path.join(fdCase, 'tmp')
    env.STUB_DIR = path.join(fdCase, 'stub')
    return { ...env, ...envExtra }
}


//withSubstDrive, 以 subst 把資料夾暫掛為未使用之磁碟機代號並執行 fn(代號), 結束即卸除; 無可用代號或 subst 失敗時回 null(呼叫端 skip)
function withSubstDrive(fdTarget, fn) {
    let letter = [...'ZYXWVUTSRQPONM'].find((l) => !fs.existsSync(`${l}:\\`))
    if (!letter) {
        return null
    }
    let r = cp.spawnSync('subst', [`${letter}:`, path.win32.resolve(fdTarget)], { windowsHide: true })
    if (r.status !== 0) {
        return null
    }
    try {
        return { value: fn(letter) }
    }
    finally {
        cp.spawnSync('subst', [`${letter}:`, '/D'], { windowsHide: true })
    }
}


//runWLdap, 於沙箱以子行程呼叫一次 WLdap, 回傳結局與替身之紀錄
function runWLdap(fdCase, c = {}, envExtra = {}) {
    let fpCase = path.join(fdCase, 'case.json')
    fs.writeFileSync(fpCase, JSON.stringify(c), 'utf8')
    let r = cp.spawnSync(process.execPath, [path.join(fdTools, 'runWLdap.mjs'), path.join(fdCase, 'src', 'WLdap.mjs'), fpCase], { cwd: fdCase, env: envOf(fdCase, envExtra), encoding: 'utf8', timeout: 170000, windowsHide: true })
    let line = (r.stdout || '').split(/\r?\n/).find((l) => l.startsWith('RESULT '))
    if (!line) {
        throw new Error(`runWLdap no result: status=${r.status} stdout=${r.stdout} stderr=${r.stderr}`)
    }
    let res = JSON.parse(line.slice('RESULT '.length))
    let read = (fn) => {
        let fp = path.join(fdCase, 'stub', fn)
        return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : null
    }
    res.stubCmdline = read('stub-cmdline.txt')
    res.stubStdin = read('stub-stdin.txt')
    res.stubPid = read('stub-pid.txt')
    res.stubOutPath = read('stub-outpath.txt')
    res.filesInTmp = listFiles(path.join(fdCase, 'tmp')) //作業系統暫存夾(TEMP)內之檔
    res.filesInCache = listFiles(path.join(fdCase, 'bin-cache')) //快取內之檔(<組識別>/<組內路徑>)
    return res
}


//isAlive, 程序是否仍存在
function isAlive(pid) {
    try {
        process.kill(Number(pid), 0)
        return true
    }
    catch (err) {
        return false
    }
}


export default {
    fdTools,
    fdTest,
    fdRepo,
    isWin,
    vers,
    fdTmp,
    rmrf,
    listFiles,
    findCsc,
    compileCs,
    makeSandbox,
    withSubstDrive,
    runWLdap,
    isAlive,
}
