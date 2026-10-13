// 測試用探針: 以 connLDAP exe 為程式庫, 重現其交給 DirectoryEntry 前之輸入解析(sysFunction.b2o 後以 VB 之 NewLateBinding.LateIndexGet 與 Conversions.ToString 取欄位, 同 run.vb 之 logIn/listUsers 呼叫)
// 供 test/unit-WLdap.test.mjs 驗證像日期之字串(例 2020-01-01T00:00:00)不被改寫
// 用法: ExeParseProbe.exe <base64輸入> <輸出檔>; 須與 exe 同資料夾, 且 exe 以組件名 connLDAP.exe 存放
using System;
using System.IO;
using System.Text;
using Microsoft.VisualBasic.CompilerServices;

class ExeParseProbe {
    static int Main(string[] args) {
        object oInput = connLDAP.sysFunction.b2o(args[0]);
        object raw = NewLateBinding.LateIndexGet(oInput, new object[] { "password" }, null);
        File.WriteAllText(args[1], Conversions.ToString(raw), new UTF8Encoding(false));
        return 0;
    }
}
