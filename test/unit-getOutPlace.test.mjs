import assert from 'assert'
import path from 'path'
import getOutPlace from '../src/getOutPlace.mjs'


//依據: 制式規格 §9「執行期之交換檔不寫執行檔所在夾, 改作業系統暫存夾」; exe 以其所在資料夾字串串接輸出檔名(srcVB/connLDAP/run.vb 之 getOutputPath, 不接受絕對路徑),
//故輸出檔名給相對於 exe 所在資料夾之相對路徑; 暫存夾與 exe 不同磁碟機時相對路徑不存在, 退而寫在 exe 所在資料夾
//本檔為純函式(以 path.win32 計算), 與平台無關


describe('unit-getOutPlace', function() {

    //拼成 exe 實際使用之路徑: 所在資料夾 + '\\' + 輸出檔名, 再以 win32 規則正規化
    let resolveLikeExe = (fdExe, fnOut) => {
        return path.win32.resolve(`${fdExe}\\${fnOut}`)
    }

    it('同磁碟機: 輸出檔名為指向暫存夾的相對路徑, 依 exe 串接規則解出之路徑即暫存夾內的 _<id>', function() {
        let r = getOutPlace('C:\\proj\\node_modules\\w-ldap\\bin-cache\\abc', 'C:\\Users\\u\\AppData\\Local\\Temp', 'ID1')
        assert.strict.deepEqual(r, {
            fnOut: '..\\..\\..\\..\\..\\Users\\u\\AppData\\Local\\Temp\\_ID1', //exe 資料夾在根之下 5 層(proj、node_modules、w-ldap、bin-cache、abc)
            fpOut: 'C:\\Users\\u\\AppData\\Local\\Temp\\_ID1',
            inTmp: true,
        })
        assert.strict.equal(resolveLikeExe('C:\\proj\\node_modules\\w-ldap\\bin-cache\\abc', r.fnOut), r.fpOut)
    })

    it('磁碟機代號大小寫不同仍視為同一磁碟機', function() {
        let r = getOutPlace('c:\\a\\b', 'C:\\Temp', 'ID2')
        assert.strict.equal(r.inTmp, true)
        assert.strict.equal(r.fnOut, '..\\..\\Temp\\_ID2')
    })

    it('中文與空白路徑', function() {
        let fdExe = 'C:\\開源 專案\\w-ldap\\bin-cache\\abc'
        let r = getOutPlace(fdExe, 'C:\\Users\\使用者\\Temp', 'ID3')
        assert.strict.equal(r.inTmp, true)
        assert.strict.equal(resolveLikeExe(fdExe, r.fnOut), 'C:\\Users\\使用者\\Temp\\_ID3')
    })

    it('不同磁碟機: 退而寫在 exe 所在資料夾, 輸出檔名為不含路徑之 _<id>', function() {
        let r = getOutPlace('D:\\cache\\abc', 'C:\\Users\\u\\Temp', 'ID4')
        assert.strict.deepEqual(r, { fnOut: '_ID4', fpOut: 'D:\\cache\\abc\\_ID4', inTmp: false })
    })

    it('不同 UNC 共用: 同上退回', function() {
        let r = getOutPlace('\\\\srv\\share\\cache\\abc', 'C:\\Temp', 'ID5')
        assert.strict.deepEqual(r, { fnOut: '_ID5', fpOut: '\\\\srv\\share\\cache\\abc\\_ID5', inTmp: false })
    })

    it('同一 UNC 共用: 相對路徑', function() {
        let r = getOutPlace('\\\\srv\\share\\cache\\abc', '\\\\srv\\share\\tmp', 'ID6')
        assert.strict.deepEqual(r, { fnOut: '..\\..\\tmp\\_ID6', fpOut: '\\\\srv\\share\\tmp\\_ID6', inTmp: true })
    })

})
