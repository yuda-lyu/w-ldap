import get from 'lodash-es/get.js'
import isestr from 'wsemi/src/isestr.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import b642str from 'wsemi/src/b642str.mjs'
import j2o from 'wsemi/src/j2o.mjs'


let msgNoFile = 'connLDAP exited without output file'
let msgEmptyError = 'connLDAP reported an empty error'
let preInvalid = 'invalid output from connLDAP: '


//judgeExec, 判定執行器結果, 失敗回拒絕訊息, 成功回null
function judgeExec(exec, timeoutMs) {

    //ok
    if (get(exec, 'ok') === true) {
        return null
    }

    //error, code
    let error = String(get(exec, 'error', '') || '')
    let code = get(exec, 'code', null)

    //detail, exe之輸出, 無輸出時以執行器訊息補足
    let detail = [get(exec, 'stderr', ''), get(exec, 'stdout', '')]
        .map((s) => String(s || '').trim())
        .filter((s) => s !== '')
        .join('\n')
    if (detail === '') {
        detail = error
    }

    //timeout
    if (error.indexOf('TIMEOUT') === 0) {
        return `timeout[${timeoutMs}ms]:\n${detail}`
    }

    //code, 離開碼非0
    if (code !== null && code !== undefined) {
        return `code[${code}]:\n${detail}`
    }

    //signal, 被訊號終止
    let ms = error.match(/^Signal: (\S+)/)
    if (ms) {
        return `code[${ms[1]}]:\n${detail}`
    }

    //spawn, 啟動失敗, 執行器訊息格式為'<code>: <message>', 不含呼叫參數
    let m = error.match(/^([A-Z0-9_]+): ([\s\S]*)$/)
    if (m) {
        return `spawn[${m[1]}]: ${m[2]}`
    }
    return `spawn[UNKNOWN]: ${error}`
}


//judgeFile, 判定輸出檔, 回傳結果物件
function judgeFile(file) {
    let rErr = (msg) => {
        return { state: 'error', msg }
    }

    //state
    let state = get(file, 'state')
    if (state === 'missing') {
        return rErr(msgNoFile)
    }
    if (state !== 'read') {
        return rErr(`${preInvalid}unreadable(${get(file, 'msg', '')})`)
    }

    //text, 去開頭BOM(exe以UTF-8含BOM寫檔)與前後空白
    let text = get(file, 'text')
    text = String(isestr(text) ? text : '')
    if (text.charAt(0) === String.fromCharCode(65279)) {
        text = text.slice(1)
    }
    text = text.trim()
    if (text === '') {
        return rErr(`${preInvalid}empty`)
    }

    //base64
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(text) || text.length % 4 !== 0) {
        return rErr(`${preInvalid}not base64`)
    }

    //str
    let rs = b642str(text, { returnWithStateAndMsg: true })
    if (rs.state !== 'success') {
        return rErr(`${preInvalid}not utf-8 text`)
    }

    //output
    let rj = j2o(rs.msg, { returnWithStateAndMsg: true })
    if (rj.state !== 'success') {
        return rErr(`${preInvalid}not json`)
    }
    let output = rj.msg
    if (!isobj(output)) {
        return rErr(`${preInvalid}not an object`)
    }

    //hasOwn, 只認自有鍵
    let hasOwn = (k) => {
        return Object.prototype.hasOwnProperty.call(output, k)
    }

    //error
    if (hasOwn('error')) {
        let err = output.error
        if (typeof err !== 'string') {
            return rErr(`${preInvalid}error is not a string`)
        }
        if (err === '') {
            return rErr(msgEmptyError)
        }
        return rErr(err)
    }

    //success, 值為falsy時(如logIn綁定成功但查無帳號條目之null)回傳整個output
    if (hasOwn('success')) {
        return { state: 'success', msg: get(output, 'success') || output }
    }

    return rErr(`${preInvalid}no success or error`)
}


/**
 * 判定一次connLDAP呼叫之結局，失敗關閉：只有exe正常結束、輸出檔存在且可解為具自有鍵success之物件時才判為成功，其餘一律判為錯誤並給錯誤訊息字串
 *
 * 判定順序(先命中者決定結局)：exe啟動失敗、逾時、非0離開碼、輸出檔不存在、輸出檔讀取失敗或內容不合格式、具error鍵、具success鍵、兩鍵皆無
 *
 * @ignore
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.exec={}] 輸入執行器結果物件，格式同wsemi之execCli回傳：ok、code、error、stdout、stderr
 * @param {Number} [opt.timeoutMs=null] 輸入執行器之逾時毫秒數，僅用於組逾時訊息
 * @param {Object} [opt.file={}] 輸入輸出檔讀取結果物件，state為'missing'代表不存在，'unreadable'代表存在但讀取失敗(msg為原因)，'read'代表已讀取(text為內容)
 * @returns {Object} 回傳結果物件，state為'success'時msg為resolve值：success之值，該值為falsy時為整個輸出物件；state為'error'時msg為拒絕訊息字串：exe啟動失敗為'spawn[<code>]: <message>'，逾時為'timeout[<ms>ms]:\n<exe輸出>'，非0離開碼為'code[<N>]:\n<exe輸出>'，輸出檔不存在為'connLDAP exited without output file'，內容不合格式為'invalid output from connLDAP: <原因>'，error為空字串為'connLDAP reported an empty error'，其餘為exe回報之error原文
 * @example
 * let r = judgeResult({ exec: { ok: true, code: 0, error: '', stdout: '', stderr: '' }, timeoutMs: 1000, file: { state: 'missing' } })
 * // => { state: 'error', msg: 'connLDAP exited without output file' }
 */
function judgeResult(opt = {}) {

    //exec
    let msgExec = judgeExec(get(opt, 'exec', {}), get(opt, 'timeoutMs', null))
    if (msgExec !== null) {
        return { state: 'error', msg: msgExec }
    }

    //file
    return judgeFile(get(opt, 'file', {}))
}


export default judgeResult
