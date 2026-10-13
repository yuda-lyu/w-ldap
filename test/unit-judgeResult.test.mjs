import assert from 'assert'
import judgeResult from '../src/judgeResult.mjs'


//斷言之依據: judgeResult 之 JSDoc(失敗關閉之判準)與 run02 需求述語 P01a-P01i; 括號內為 run01 審計表 A 之列號


let b64 = (s) => Buffer.from(s, 'utf8').toString('base64')
let execOk = { ok: true, code: 0, error: '', stdout: '', stderr: '' }
let read = (text) => ({ state: 'read', text })
let judgeText = (text) => judgeResult({ exec: execOk, timeoutMs: 1000, file: read(text) })
let pre = 'invalid output from connLDAP: '


describe('unit-judgeResult', function() {

    it('exe 啟動失敗之非同步錯誤 → spawn[<code>] 字串(P01a, A12)', function() {
        let exec = { ok: false, code: null, error: 'ENOENT: spawn C:\\x\\connLDAP.net4.8.exe ENOENT', stdout: '', stderr: '' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'spawn[ENOENT]: spawn C:\\x\\connLDAP.net4.8.exe ENOENT' })
    })

    it('exe 啟動失敗之同步錯誤 → spawn[<code>] 字串(P01a, A10)', function() {
        let exec = { ok: false, code: null, error: 'UNKNOWN: spawn UNKNOWN', stdout: '', stderr: '' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'spawn[UNKNOWN]: spawn UNKNOWN' })
    })

    it('spawn 錯誤訊息無法解析出代碼時標為 UNKNOWN(P01a)', function() {
        let exec = { ok: false, code: null, error: 'something odd', stdout: '', stderr: '' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'spawn[UNKNOWN]: something odd' })
    })

    it('非 0 離開碼 → code[N] 並帶 exe 之 stderr(P01b, A13)', function() {
        let exec = { ok: false, code: 3, error: 'Exit code 3', stdout: '', stderr: 'boom\r\n' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'code[3]:\nboom' })
    })

    it('非 0 離開碼且 exe 無任何輸出 → 以執行器訊息補足(P01b)', function() {
        let exec = { ok: false, code: 3, error: 'Exit code 3', stdout: '', stderr: '' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'code[3]:\nExit code 3' })
    })

    it('非 0 離開碼優先於輸出檔之成功內容(P01b, A14)', function() {
        let exec = { ok: false, code: 1, error: 'Exit code 1', stdout: '', stderr: 'invalid mode' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: read(b64('{"success":{"a":1}}')) })
        assert.strict.deepEqual(r, { state: 'error', msg: 'code[1]:\ninvalid mode' })
    })

    it('逾時 → timeout[Nms](P01i)', function() {
        let exec = { ok: false, code: 1, error: 'TIMEOUT after 1s', stdout: '', stderr: '' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'timeout[1000ms]:\nTIMEOUT after 1s' })
    })

    it('被訊號終止 → code[<訊號>](P01b, A32)', function() {
        let exec = { ok: false, code: null, error: 'Signal: SIGTERM', stdout: '', stderr: '' }
        let r = judgeResult({ exec, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'code[SIGTERM]:\nSignal: SIGTERM' })
    })

    it('離開碼 0 但無輸出檔 → 固定訊息(P01c, A15)', function() {
        let r = judgeResult({ exec: execOk, timeoutMs: 1000, file: { state: 'missing' } })
        assert.strict.deepEqual(r, { state: 'error', msg: 'connLDAP exited without output file' })
    })

    it('輸出檔存在但讀取失敗 → invalid output(P01d)', function() {
        let r = judgeResult({ exec: execOk, timeoutMs: 1000, file: { state: 'unreadable', msg: 'EBUSY resource busy or locked' } })
        assert.strict.deepEqual(r, { state: 'error', msg: `${pre}unreadable(EBUSY resource busy or locked)` })
    })

    it('0 位元組、只有 BOM、只有空白 → empty(P01d, A16, A17)', function() {
        for (let text of ['', '\uFEFF', ' \r\n']) {
            assert.strict.deepEqual(judgeText(text), { state: 'error', msg: `${pre}empty` }, JSON.stringify(text))
        }
    })

    it('非 base64 → not base64(P01d, A18)', function() {
        for (let text of ['@@not-base64@@', 'abc', 'YWJj=x']) {
            assert.strict.deepEqual(judgeText(text), { state: 'error', msg: `${pre}not base64` }, text)
        }
    })

    it('base64 但內容非 UTF-8 → not utf-8 text(P01d)', function() {
        let text = Buffer.from([0xff, 0xfe, 0xfd]).toString('base64')
        assert.strict.deepEqual(judgeText(text), { state: 'error', msg: `${pre}not utf-8 text` })
    })

    it('base64 但非 JSON 或 JSON 截斷 → not json(P01d, A19, A20)', function() {
        for (let s of ['not json at all', '{"success":{"a"']) {
            assert.strict.deepEqual(judgeText(b64(s)), { state: 'error', msg: `${pre}not json` }, s)
        }
    })

    it('JSON 根非 plain object → not an object(P01d, A21-A24)', function() {
        for (let s of ['null', '123', '"abc"', '[1,2]', 'true']) {
            assert.strict.deepEqual(judgeText(b64(s)), { state: 'error', msg: `${pre}not an object` }, s)
        }
    })

    it('物件兩鍵皆無 → no success or error(P01g, A25)', function() {
        assert.strict.deepEqual(judgeText(b64('{"foo":1}')), { state: 'error', msg: `${pre}no success or error` })
    })

    it('只認自有鍵, 不認 __proto__ 內之鍵(P01g)', function() {
        assert.strict.deepEqual(judgeText(b64('{"__proto__":{"success":1}}')), { state: 'error', msg: `${pre}no success or error` })
    })

    it('error 為空字串 → 固定訊息而非成功(P01e, A27)', function() {
        assert.strict.deepEqual(judgeText(b64('{"error":""}')), { state: 'error', msg: 'connLDAP reported an empty error' })
    })

    it('error 非字串 → invalid output(P01e)', function() {
        assert.strict.deepEqual(judgeText(b64('{"error":{"a":1}}')), { state: 'error', msg: `${pre}error is not a string` })
    })

    it('error 為非空字串 → 原文拒絕(P01e, A26)', function() {
        assert.strict.deepEqual(judgeText(b64('{"error":"無法操作伺服器。\\r\\n"}')), { state: 'error', msg: '無法操作伺服器。\r\n' })
    })

    it('success 與 error 並存 → 以 error 拒絕(P01h, A30)', function() {
        assert.strict.deepEqual(judgeText(b64('{"success":1,"error":"e"}')), { state: 'error', msg: 'e' })
    })

    it('success 為物件 → resolve 其值(P01f, A28)', function() {
        assert.strict.deepEqual(judgeText(b64('{"success":{"Path":"LDAP://x","Properties":{"cn":["u"]}}}')), { state: 'success', msg: { Path: 'LDAP://x', Properties: { cn: ['u'] } } })
    })

    it('success 為空陣列 → resolve [](P01f, A28)', function() {
        assert.strict.deepEqual(judgeText(b64('{"success":[]}')), { state: 'success', msg: [] })
    })

    it('success 為 null → resolve 整個 {success:null}(P01f, A29, Q4)', function() {
        assert.strict.deepEqual(judgeText(b64('{"success":null}')), { state: 'success', msg: { success: null } })
    })

    it('帶 BOM 與尾端換行之輸出仍可解(P01f)', function() {
        assert.strict.deepEqual(judgeText(`\uFEFF${b64('{"success":{"a":1}}')}\r\n`), { state: 'success', msg: { a: 1 } })
    })

})
