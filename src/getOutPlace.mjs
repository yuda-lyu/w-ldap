import path from 'path'


/**
 * 決定exe輸出檔之落點
 *
 * exe以其所在資料夾字串串接輸出檔名(srcVB/connLDAP/run.vb之getOutputPath，不接受絕對路徑)，而exe所在之組資料夾為內容定址之快取夾，可能共用或唯讀，不宜寫入交換檔(制式規格§9)。故輸出檔名給相對於exe所在資料夾之相對路徑，使輸出檔落在作業系統暫存夾；暫存夾與exe不同磁碟機(或不同UNC共用)時相對路徑不存在，退而寫在exe所在資料夾
 *
 * @ignore
 * @param {String} fdExe 輸入exe所在資料夾絕對路徑字串
 * @param {String} fdTmp 輸入作業系統暫存夾絕對路徑字串
 * @param {String} id 輸入本次呼叫之識別字串
 * @returns {Object} 回傳物件，fnOut為交給exe之輸出檔名(相對於exe所在資料夾)，fpOut為輸出檔實際之絕對路徑，inTmp為是否落在暫存夾
 */
function getOutPlace(fdExe, fdTmp, id) {
    let fn = `_${id}`
    let fpTmp = path.win32.join(fdTmp, fn)
    let rel = path.win32.relative(fdExe, fpTmp)
    if (path.win32.isAbsolute(rel)) {
        return { fnOut: fn, fpOut: path.win32.join(fdExe, fn), inTmp: false }
    }
    return { fnOut: rel, fpOut: fpTmp, inTmp: true }
}


export default getOutPlace
