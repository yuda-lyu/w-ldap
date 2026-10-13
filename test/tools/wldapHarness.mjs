// unit-WLdap 測試之共用工具: 編譯替身與探針、建沙箱、以子行程呼叫 WLdap
// WLdap 於模組載入時以 cwd 為錨找 exe(<cwd>/src/), 故每案於沙箱另起子行程並以沙箱為 cwd
// 路徑皆由本檔位置推得(test/tools -> test -> repo 根), 沙箱落在 test/_tmp/<案名>/
import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import { fileURLToPath } from 'url'


let fdTools = path.dirname(fileURLToPath(import.meta.url))
let fdTest = path.resolve(fdTools, '..')
let fdRepo = path.resolve(fdTools, '..', '..')
let isWin = process.platform === 'win32'


//fdTmp, 測試專用之暫存資料夾
function fdTmp(name) {
    return path.join(fdTest, '_tmp', name)
}


//rmrf, 刪除資料夾, 子程序剛結束時檔案可能短暫被占用故重試
function rmrf(fd) {
    fs.rmSync(fd, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
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


//makeSandbox, 建立沙箱, 其 src/ 放替身、真 exe 副本或非 PE 檔
function makeSandbox(fdRoot, name, opt = {}) {
    let fdCase = path.join(fdRoot, name)
    rmrf(fdCase)
    let fdSrc = path.join(fdCase, 'src')
    fs.mkdirSync(fdSrc, { recursive: true })
    let fpExe = path.join(fdSrc, 'connLDAP.net4.8.exe')
    if (opt.exe === 'stub') {
        fs.copyFileSync(opt.fpStub, fpExe)
        fs.writeFileSync(path.join(fdSrc, 'stub-behavior.json'), JSON.stringify(opt.behavior || {}), 'utf8')
    }
    else if (opt.exe === 'real') {
        fs.copyFileSync(path.join(fdRepo, 'src', 'connLDAP.net4.8.exe'), fpExe)
        if (opt.newtonsoft !== false) {
            fs.copyFileSync(path.join(fdRepo, 'src', 'Newtonsoft.Json.dll'), path.join(fdSrc, 'Newtonsoft.Json.dll'))
        }
    }
    else if (opt.exe === 'notpe') {
        fs.writeFileSync(fpExe, 'this is not a PE file', 'utf8')
    }
    return fdCase
}


//runWLdap, 於沙箱以子行程呼叫一次 WLdap, 回傳結局與替身之紀錄
function runWLdap(fdCase, c = {}) {
    let fpCase = path.join(fdCase, 'case.json')
    fs.writeFileSync(fpCase, JSON.stringify(c), 'utf8')
    let r = cp.spawnSync(process.execPath, [path.join(fdTools, 'runWLdap.mjs'), path.join(fdRepo, 'src', 'WLdap.mjs'), fpCase], { cwd: fdCase, encoding: 'utf8', timeout: 170000, windowsHide: true })
    let line = (r.stdout || '').split(/\r?\n/).find((l) => l.startsWith('RESULT '))
    if (!line) {
        throw new Error(`runWLdap no result: status=${r.status} stdout=${r.stdout} stderr=${r.stderr}`)
    }
    let res = JSON.parse(line.slice('RESULT '.length))
    let fdSrc = path.join(fdCase, 'src')
    let read = (fn) => {
        let fp = path.join(fdSrc, fn)
        return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : null
    }
    res.stubCmdline = read('stub-cmdline.txt')
    res.stubStdin = read('stub-stdin.txt')
    res.stubPid = read('stub-pid.txt')
    res.filesInSrc = fs.existsSync(fdSrc) ? fs.readdirSync(fdSrc) : []
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
    fdTmp,
    rmrf,
    findCsc,
    compileCs,
    makeSandbox,
    runWLdap,
    isAlive,
}
