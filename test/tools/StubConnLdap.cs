// 測試用替身 exe: 取代 connLDAP.net*.exe, 供 test/unit-WLdap.test.mjs 於不需 AD 下驗證 WLdap 之結局判定與輸入管道
// 測試時以 .NET Framework 內建 csc.exe 編譯至 test/_tmp/<案名>/ 下, 版控只放原始碼
// 輸入: 有命令列參數時取參數(舊協定, 僅供以修前副本對照), 否則讀 stdin(現行協定), 兩者皆為 base64(JSON)
// 行為由 exe 所在資料夾之 stub-behavior.json 控制:
//   exitCode(int, 預設0), sleepMs(int), stdout(string), stderr(string)
//   file: none(不寫檔, 預設) | raw(原樣寫 content) | json(寫 base64(content)) | echo(寫 base64({"success":<收到之輸入>}))
//   content(string), bom(bool, 預設true, 真 exe 以 Encoding.UTF8 寫檔故帶 BOM)
//   holdMs(int, 寫檔後以子程序用不含 FileShare.Delete 之模式持有輸出檔, 模擬他程序占用)
// 另把自身 PID、收到之命令列、stdin 內容分別寫入 stub-pid.txt、stub-cmdline.txt、stub-stdin.txt, 供測試斷言
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

class StubConnLdap {

    //record, 寫紀錄檔; 並發多個替身時會互相占用同一檔, 故失敗即略過(並發案例不讀紀錄)
    static void record(string fp, string text) {
        try {
            File.WriteAllText(fp, text, new UTF8Encoding(false));
        }
        catch {
        }
    }

    static int Main(string[] args) {
        //全包 try/catch: 替身不得以未處理例外結束(會觸發 Windows 錯誤報告)
        try {
            return run(args);
        }
        catch (Exception ex) {
            Console.Error.Write("stub error: " + ex.Message);
            return 99;
        }
    }

    static int run(string[] args) {

        //占檔模式: --hold <path> <ms>
        if (args.Length == 3 && args[0] == "--hold") {
            using (var fsHold = new FileStream(args[1], FileMode.Open, FileAccess.Read, FileShare.Read)) {
                Thread.Sleep(int.Parse(args[2]));
            }
            return 0;
        }

        string dir = AppDomain.CurrentDomain.BaseDirectory;
        var utf8 = new UTF8Encoding(false);
        record(Path.Combine(dir, "stub-pid.txt"), Process.GetCurrentProcess().Id.ToString());
        record(Path.Combine(dir, "stub-cmdline.txt"), Environment.CommandLine);

        //輸入
        string b64 = "";
        if (args.Length > 0) {
            b64 = string.Join(" ", args);
            record(Path.Combine(dir, "stub-stdin.txt"), "");
        }
        else {
            using (var sr = new StreamReader(Console.OpenStandardInput(), utf8)) {
                b64 = sr.ReadToEnd();
            }
            record(Path.Combine(dir, "stub-stdin.txt"), b64);
        }

        //behavior
        var ser = new JavaScriptSerializer();
        ser.MaxJsonLength = int.MaxValue;
        string bpath = Path.Combine(dir, "stub-behavior.json");
        var b = File.Exists(bpath) ? ser.Deserialize<Dictionary<string, object>>(File.ReadAllText(bpath, Encoding.UTF8)) : new Dictionary<string, object>();
        Func<string, object, object> g = (k, d) => b.ContainsKey(k) && b[k] != null ? b[k] : d;

        int sleepMs = Convert.ToInt32(g("sleepMs", 0));
        if (sleepMs > 0) {
            Thread.Sleep(sleepMs);
        }
        string so = (string)g("stdout", null);
        string se = (string)g("stderr", null);
        if (so != null) {
            Console.Out.Write(so);
        }
        if (se != null) {
            Console.Error.Write(se);
        }

        //輸出檔名取自輸入
        string fnOut = null;
        Dictionary<string, object> inp = null;
        try {
            string json = Encoding.UTF8.GetString(Convert.FromBase64String(b64.Trim()));
            inp = ser.Deserialize<Dictionary<string, object>>(json);
            if (inp.ContainsKey("__System:OutputFilename")) {
                fnOut = (string)inp["__System:OutputFilename"];
            }
        }
        catch {
        }

        string file = (string)g("file", "none");
        if (fnOut != null && file != "none") {
            string content = "";
            if (file == "raw") {
                content = (string)g("content", "");
            }
            else if (file == "json") {
                content = Convert.ToBase64String(Encoding.UTF8.GetBytes((string)g("content", "{}")));
            }
            else if (file == "echo") {
                content = Convert.ToBase64String(Encoding.UTF8.GetBytes(ser.Serialize(new Dictionary<string, object> { { "success", inp } })));
            }
            bool bom = Convert.ToBoolean(g("bom", true));
            string fpOut = Path.Combine(dir, fnOut);
            File.WriteAllText(fpOut, content, new UTF8Encoding(bom));
            int holdMs = Convert.ToInt32(g("holdMs", 0));
            if (holdMs > 0) {
                //以 ShellExecute 啟動占檔子程序, 不繼承本程序之 stdio 管道, 否則呼叫端要等占檔子程序結束才收到 close
                var psi = new ProcessStartInfo(Assembly.GetExecutingAssembly().Location, "--hold \"" + fpOut + "\" " + holdMs);
                psi.UseShellExecute = true;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                Process.Start(psi);
                Thread.Sleep(500);
            }
        }
        return Convert.ToInt32(g("exitCode", 0));
    }
}
