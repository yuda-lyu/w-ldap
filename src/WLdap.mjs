import os from 'os'
import fs from 'fs'
import process from 'process'
import get from 'lodash-es/get.js'
import genID from 'wsemi/src/genID.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import ispint from 'wsemi/src/ispint.mjs'
import arrHas from 'wsemi/src/arrHas.mjs'
import str2b64 from 'wsemi/src/str2b64.mjs'
import execCli from 'wsemi/src/execCli.mjs'
import ensureBins from './ensureBins.mjs'
import getOutPlace from './getOutPlace.mjs'
import judgeResult from './judgeResult.mjs'


//timeoutMax, 未給opt.timeout時之逾時上限, 取計時器上限(約24.8天)即實質不設限, 使行為與改用execCli前相同
let timeoutMax = 2147483647


function isWindows() {
    return process.platform === 'win32'
}


//readOutput, 讀取exe之輸出檔, 不存在與讀取失敗分開回報
function readOutput(fp) {
    try {
        return { state: 'read', text: fs.readFileSync(fp, 'utf8') }
    }
    catch (err) {
        if (get(err, 'code') === 'ENOENT') {
            return { state: 'missing' }
        }
        return { state: 'unreadable', msg: `${get(err, 'code', '')} ${get(err, 'message', '')}`.trim() }
    }
}


/**
 * 呼叫LDAP服務進行登入或取得使用者清單，係呼叫Net程式呼叫LDAP取得資料，故會有Net Framework版本與作業系統限制
 *
 * 輸入(含帳密)經子程序之stdin交給Net程式，不出現在程序之命令列；只轉交mode、account、password、ldappath，不改動呼叫端之input
 *
 * Net程式(connLDAP.net4.x.exe與其相鄰之Newtonsoft.Json.dll)不隨npm包發布：首次使用時經ensureBins依bin/manifest.json下載、逐檔校驗並整組放入快取，之後自快取取用；環境變數W_BIN_CACHE、W_BIN_MIRROR、W_BIN_OFFLINE見README〈External executables〉。輸出檔寫在作業系統暫存夾(跨磁碟機時寫在Net程式所在之快取夾)，用畢即刪
 *
 * @param {Object} input 輸入呼叫資料物件
 * @param {String} input.mode 輸入呼叫方法字串，可有'logIn'與'listUsers'
 * @param {String} input.account 輸入LDAP帳號字串
 * @param {String} input.password 輸入LDAP帳號之密碼字串
 * @param {String} input.ldappath 輸入LDAP伺服器位址字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.ver='4.8'] 輸入調用windows程序之Net Framework版本字串，可有'4.5'、'4.6'、'4.7.2'與'4.8'，預設'4.8'
 * @param {Number} [opt.timeout] 輸入逾時毫秒數正整數，逾時將強制結束Net程式並reject，未給或非正整數時不設限(實際上限為計時器上限約24.8天)。LDAP伺服器接受連線卻不回應時，Net程式約240秒後自行以錯誤結束
 * @returns {Promise} 回傳Promise。resolve回傳成功資料：logIn為該帳號之LDAP條目，帳密驗證成功但以samaccountname查無該帳號條目時回傳{success:null}；listUsers為使用者條目陣列。reject一律回傳錯誤訊息字串：輸入檢查失敗為說明字串；取得Net程式失敗(首次使用時下載、校驗或離線缺檔)以'ensureBins[錯誤碼]:'開頭；LDAP回報之錯誤為其原始訊息；Net程式啟動失敗以'spawn['開頭；Net程式以非0結束以'code['開頭；逾時以'timeout['開頭；Net程式結束但未產生輸出檔為'connLDAP exited without output file'；輸出內容不合格式以'invalid output from connLDAP:'開頭
 * @example
 * import WLdap from 'w-ldap'
 *
 * async function test() {
 *     let inp
 *     let r
 *     let account = '{account}'
 *     let password = '{password}'
 *     let ldappath = 'LDAP://{PATH}'
 *
 *     inp = {
 *         mode: 'logIn',
 *         account,
 *         password,
 *         ldappath,
 *     }
 *     r = await WLdap(inp)
 *     console.log('logIn', r)
 *     w.fsWriteText('logIn.txt', w.o2j(r, true))
 *
 *     inp = {
 *         mode: 'listUsers',
 *         account,
 *         password,
 *         ldappath,
 *     }
 *     r = await WLdap(inp)
 *     w.fsWriteText('listUsers.txt', w.o2j(r, true))
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log('catch', err)
 *     })
 *
 */
async function WLdap(input = {}, opt = {}) {

    //isWindows
    if (!isWindows()) {
        return Promise.reject('operating system is not windows')
    }

    //check
    if (!iseobj(input)) {
        return Promise.reject('invalid input')
    }

    //check
    let mode = get(input, 'mode')
    if (mode !== 'logIn' && mode !== 'listUsers') {
        return Promise.reject(`input.mode needs to be 'logIn' or 'listUsers'`)
    }
    let account = get(input, 'account')
    if (!isestr(account)) {
        return Promise.reject('invalid input.account')
    }
    let password = get(input, 'password')
    if (!isestr(password)) {
        return Promise.reject('invalid input.password')
    }
    let ldappath = get(input, 'ldappath')
    if (!isestr(ldappath)) {
        return Promise.reject('invalid input.ldappath')
    }

    //ver
    let ver = get(opt, 'ver', null)
    if (!isestr(ver)) {
        ver = '4.8'
    }

    //check
    if (!arrHas(ver, ['4.5', '4.6', '4.7.2', '4.8'])) {
        return Promise.reject('opt.ver needs to be one of 4.5, 4.6, 4.7.2 or 4.8')
    }

    //timeout, 未給或非正整數時不設限
    let timeout = get(opt, 'timeout', null)
    if (!ispint(timeout)) {
        timeout = timeoutMax
    }

    //fnExe
    let fnExe = `connLDAP.net${ver}.exe`

    //bundle, exe須與Newtonsoft.Json.dll相鄰, 故經ensureBins取得檔案組(校驗後整組放在同一資料夾), 失敗以字串拒絕
    let bundle = null
    try {
        let bins = await ensureBins()
        bundle = bins.bundles.connLDAP
    }
    catch (err) {
        return Promise.reject(`ensureBins[${get(err, 'code', '')}]: ${get(err, 'message', '')}`)
    }

    //prog, fdExe
    let prog = get(bundle, ['files', fnExe], null)
    if (!isestr(prog)) {
        return Promise.reject(`${fnExe} is not in the bundle of connLDAP`)
    }
    let fdExe = bundle.dir
    // console.log('prog', prog)

    //id
    let id = genID()

    //fnOut, fpOut, 輸出檔名由WLdap決定, 輸出檔落在作業系統暫存夾, 不寫入exe所在之快取夾
    let { fnOut, fpOut } = getOutPlace(fdExe, os.tmpdir(), id)

    //payload, 只轉交exe所需之欄位另建物件, 不改動呼叫端之input
    let payload = {
        mode,
        account,
        password,
        ldappath,
        '__System:OutputFilename': fnOut,
    }

    //b64Input
    let b64Input = str2b64(JSON.stringify(payload))

    //exec, 輸入經stdin交給exe, 不出現在程序之命令列
    let exec = null
    try {
        exec = await execCli(prog, [], { input: b64Input, timeoutMs: timeout })
    }
    catch (err) {
        //execCli於spawn同步失敗(如EPERM、UNKNOWN)時會拋錯, 轉為同格式之結果物件, 只取code與message
        exec = {
            ok: false,
            code: null,
            error: `${get(err, 'code') || 'UNKNOWN'}: ${get(err, 'message', '')}`,
            stdout: '',
            stderr: '',
        }
    }

    //file
    let file = readOutput(fpOut)

    //unlinkSync, 清理盡力而為, 不決定結局
    try {
        fs.unlinkSync(fpOut)
    }
    catch (err) {}

    //judgeResult
    let r = judgeResult({ exec, timeoutMs: timeout, file })
    if (r.state === 'error') {
        return Promise.reject(r.msg)
    }
    return r.msg
}


//ensureBins, 預先取得並校驗外部執行檔組connLDAP(離線部署前於連網機器呼叫, 見README), 以靜態屬性匯出以維持單一default匯出
WLdap.ensureBins = ensureBins


export default WLdap
