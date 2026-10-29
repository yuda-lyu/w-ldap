# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.

## exe(connLDAP)之事實(2026-10-13 run01 審計實測;輸入、離開碼、日期改寫三條為修前之舊 exe,run02 已改,現況見下方「run02 實作之經驗」)

- **原始碼在 repo 內**:`srcVB/connLDAP/run.vb`、`sysFunction.vb`(VB.NET,受 git 追蹤).`src/` 之四個 exe(net4.5/4.6/4.7.2/4.8)IL 逐指令相同,只差 `TargetFrameworkAttribute`;與 `srcVB/connLDAP/bin/Debug/connLDAP.exe` 相同.別再說「無原始碼」.
- 驗證「二進位是否由某份原始碼編出」之方法:自寫反射式 IL 傾印(token 解析為名稱)比對兩個 exe;與重編產物比對時只比「呼叫/字串/欄位/例外子句」骨架(舊版 framework vbc 會多插 `ProjectData.ClearProjectError`、`RuntimeHelpers.GetObjectValue`,屬產碼差異).工具與結果留在 run01 之 `tmp/ildump/`(tmp 會被清,需要時重寫,約 100 行 C#).
- (舊 exe)輸入:只讀 `Interaction.Command()`(命令列),且須恰為一個參數;不讀 stdin.
- 輸出:成功與 LDAP 錯誤才寫檔,落在 exe 所在資料夾,檔名取自輸入之 `__System:OutputFilename`(exe 不檢查路徑,可寫到資料夾外);內容為 UTF-8 含 BOM 之 base64(JSON):`{"success":…}` 或 `{"error":"<在地化訊息>\r\n"}`.
- (舊 exe)離開碼:WLdap 可達之輸入下恆為 0;exe 自身之早期錯誤(無參數、非 base64、mode 無效、缺鍵、缺 Newtonsoft.Json.dll)不寫檔也無任何輸出.
- (舊 exe)以 Newtonsoft 預設設定解析輸入,ISO 日期樣式與 `/Date(n)/` 樣式之字串會被轉成 DateTime 再以在地格式轉回字串(例 `2020-01-01T00:00:00`→`2020/1/1`).
- 不需 AD 之觀察手段:ldappath 給非 ADsPath 字串(約 0.2-0.3 秒得 `無法指出的錯誤`,不連網)、或 `LDAP://127.0.0.1:<關閉之埠>/…`(約 2.3 秒得 `無法操作伺服器。`).對「接受連線不回應」之端點,ADSI 120 秒逾時重送一次,240 秒後 exit 0 並寫出 `已逾時…`.**不得連外部 LDAP、不得用真實帳密.**

## 探測與測試之手法

- (2026-10-29 前之舊制;現況見下方「外部執行檔改制式規格」)WLdap 於模組載入時以 cwd 為錨找 exe(`<cwd>/src/` 或 `<cwd>/node_modules/w-ldap/src/`),故要換成替身 exe 必須另起子行程、cwd 設為沙箱(沙箱 `src/connLDAP.net4.8.exe`);不要把替身放進 repo 之 `src/`.現制:WLdap 經 `ensureBins` 取得 exe 組,沙箱為迷你套件(manifest + 離線鏡像),見該節.
- 替身 exe 以 `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe` 編譯(約 0.2 秒),行為由同資料夾之設定檔控制,每案一個沙箱即可並行.
- csc/vbc 之檔案參數一律用反斜線 Windows 路徑:以正斜線給含中文之絕對路徑時 csc 改以 cwd 相對路徑開檔而失敗.
- Git Bash 中 `export MSYS_NO_PATHCONV=1` 後,再把 `/c/...` 傳給 node 會變成 `C:\c\...`(全域規範 §11.3);同一指令內兩者不要混用.
- 把 .NET exe 當程式庫引用時,檔名須等於組件名(`connLDAP.exe`),否則執行時探測不到.
- 模擬「輸出檔被他程序占用」:替身寫檔後以 ShellExecute(`UseShellExecute=true`)啟動自身之占檔模式,用 `FileShare.Read` 開檔持有;若用一般 `Process.Start` 會繼承 node 之 stdio 管道,node 之 close 事件要等占檔程序結束才觸發,模擬失效.
- Windows 上 spawn 失敗之分流:拒絕執行權限(icacls deny X)為同步 `EPERM`、非 PE 為同步 `UNKNOWN`、參數逾約 32K 字元為同步 `ENAMETOOLONG`(皆不帶 `spawnargs`);不存在之檔為非同步 `ENOENT`(帶 `spawnargs` 與 `path`).
- 未處理例外可能觸發 WER 對話框而在使用者桌面彈窗,run01 刻意未實測;要測請先確認不會干擾使用者.

## run02 實作(2026-10-13)之經驗

- exe 協定已改:只讀 stdin(base64(JSON)),有任何命令列參數即以 2 結束;早期錯誤以 1 結束、訊息以 UTF-8 寫 stderr(已知輸出檔名時另寫 `{error}`);完成 LDAP 呼叫(成功或 LDAP 錯誤)才以 0 結束.直接試 exe 時記得用 stdin 餵輸入,否則會等 EOF.
- 重建 exe:`node ./tmp/run02/build.mjs` 之做法(framework vbc、vbproj Debug 選項、每版另寫 `.NETFramework,Version=v<ver>.AssemblyAttributes.vb`、`-resource` 嵌入 `obj/Debug/connLDAP.Resources.resources`、輸出名須為 `connLDAP.exe` 才會得到組件名 connLDAP,再複製改名).tmp 會被清,需要時依此重寫.IL 傾印時要把 Newtonsoft.Json.dll 所在資料夾當探測路徑,否則反射解析簽章即崩潰.
- 舊版 vbc 產出之 `DebuggableAttribute` 為 259(原 VS 建置為 263,差 EnableEditAndContinue),XML 文件檔內容相同但排序與空白不同——屬編譯器差異,不必追.
- wsemi `execCli` 在 spawn 同步失敗(UNKNOWN、EPERM、ENAMETOOLONG)時會 reject(與其「不throw」之文件不符),呼叫端一定要包 try/catch;非同步之 ENOENT 才回 `{ ok: false }`.
- 以 Write 工具寫 `﻿` 等跳脫序列時曾被轉成實體字元(eslint `no-irregular-whitespace` 抓到);不可見字元一律用 `String.fromCharCode(...)` 表示.
- 替身被多程序並發執行時,寫同一個紀錄檔會撞 IOException;替身內共用檔之寫入一律容錯,Main 全包 try/catch(未處理例外可能觸發 WER).
- 修前紅的做法:把 `test/` 複製到 `./tmp/red/test/`、`git show HEAD:<path>` 取舊 src 與 exe 到 `./tmp/red/src/`,直接用 mocha 跑副本;測試輔助以自身位置推得 repo 根,故不必在測試中加任何切換開關.不可用 stash/checkout/reset.
- 內部模組(如 `src/judgeResult.mjs`)之 JSDoc 加 `@ignore`,`jsdoc -c .jsdoc` 才不會把它列進文件站(自有套件 w-orm-mdb 同慣例);可用 `jsdoc -c .jsdoc -d ./tmp/<x>/docs` 先驗.
- 打包驗證不要動受追蹤之 `dist/`:另寫與 `toolg/gDistRollup.mjs` 同設定、`fdTar` 指向 `./tmp/...` 之腳本.打包產物之 `require("util")` 來自 lodash-es 之選用探測,不是新相依.

## Samba AD DC 整合測試之經驗(2026-10-13 任務 20261013230930)

- 就緒判斷要走協定:docker 之埠轉送在容器內服務尚未監聽時仍會接受 TCP 連線再立即關閉(實測 `end` 且 0 位元組),只測 TCP 可連會提早誤判就緒.做法:送 LDAP 匿名 simple bind(`300c020101600702010304008000`),收到 `0x30 … 0x61`(BindResponse)才算就緒.實測 `docker run` 返回後約 6 秒就緒,之後經 WLdap 之綁定(ADSI 預設 Secure,推測落為 NTLM)立即可用,不需另等.
- 解析位元組時 `i += readLen()`(readLen 內部會 `i++`)是陷阱:JS 先讀舊 i 再加回傳值,readLen 之前進被覆蓋.先 `let n = readLen()` 再 `i += n`.第一次實作因此 180 秒逾時.
- BuildKit 每次 `docker build` 都會執行基底映像之 `load metadata`(實測 0.9-1.6 秒;推測為向 registry 解析標籤,未於離線下驗證),即使各層皆快取.故映像標籤取 Dockerfile 與 entrypoint.sh 內容(換行正規化為 LF)之雜湊,`docker image inspect` 已有即不 build;LF 與 CRLF 取出得同一雜湊(已驗).
- build cache 為整台 Docker 共用:主控先前之同內容建置使 apt 層 `CACHED`,首次建置僅約 10 秒.不可為了量測冷建置而 `docker builder prune`(會清掉他人之快取);要量冷建置用 `--no-cache`.
- Dockerfile 與 entrypoint.sh 於 Windows(autocrlf=true)取出為 CRLF:Dockerfile 之 CRLF 由 BuildKit 正確處理;entrypoint 以 `sed -i 's/\r$//'` 轉 LF(已以 CRLF 副本建置並確認映像內檔案無 `\r`).
- mocha 11.8:before 拋錯或呼叫 `this.skip()` 時,同 describe 之 after 仍會執行(serial、parallel 皆然),容器清理放 after 即可;hook 放在 describe 內,不放檔案頂層(serial 模式下頂層 hook 會套到所有測試檔).
- `execFile` 失敗之 `err.message` 含完整指令(`docker exec … samba-tool user create <帳號> <密碼>`),組錯誤訊息只取 `err.stderr`,無 stderr 時取 `err.code`(ENOENT 或離開碼).
- 模擬環境:docker daemon 不可達用 `DOCKER_HOST=npipe:////./pipe/<不存在>`(不要停 Docker Desktop);docker CLI 不存在用 PATH 濾掉含 docker 之路徑(得 ENOENT);非 Windows 用 `NODE_OPTIONS="--import=<預載檔>"` 預載 `Object.defineProperty(process, 'platform', { value: 'linux' })` 再直接跑 `node ./node_modules/mocha/bin/mocha.js`;埠被占用用 node 在 127.0.0.1:8990 監聽(docker 回 `ports are not available … bind`);容器提早結束用副本拿掉 `-e REALM`(entrypoint 以 `REALM is required` 結束).
- `--rm` 之容器提早結束時日誌隨之刪除,`docker logs` 得 `No such container`;要看佈建日誌就手動前景跑映像.
- 容器內 `samba_dnsupdate` 查 Docker Desktop 內建之 DNS 約 17 秒逾時並印 Python traceback,無害,但容器日誌末段常被它占滿.
- Samba 4.17 之 `samba-tool user create <帳號> <密碼> --use-username-as-cn` 使 CN 等於帳號(條目 Path 可精確預期),每個約 0.4 秒;佈建後之密碼原則(`samba-tool domain passwordsettings show` 實查):複雜度開、最短 7 字元(`2020-01-01T00:00:00` 可)、帳號鎖定門檻 0(錯誤密碼之案例不會鎖住測試帳號);sAMAccountName 不允許 `*`,允許 `(`、`)`、`&`.
- ADSI(未加入網域之 Windows,繁中語系)對 Samba AD 之實測結局:密碼錯誤、帳號不存在皆 `使用者名稱或密碼不正確。\r\n`;未監聽之埠 `無法操作伺服器。\r\n`(約 2.4 秒);`TEST\帳號`、`帳號@test.local` 綁定成功但 logIn 之 samaccountname 篩選查無 → `{success:null}`,listUsers 則回全部(45 筆,含群組);帳號大小寫不同(`WLDAPUSER`)可登入並回 samaccountname 為 `wldapuser` 之條目;含括號之帳號 `wldap(x)` 未跳脫仍可登入;小寫 `ldap://` 與省略 base DN 之 ldappath 皆可.
- 整合測試之修前紅要用 cc23d9a 之 WLdap 與 exe 成對(舊 exe 只讀命令列);副本與突變副本與主測試共用容器名與埠,只能依序跑.舊二進位用 `git cat-file blob <rev>:<path>` 取出(不經換行轉換).
- 他 repo 是否占用某埠:用 Grep 工具於 `C:\opensrc` 搜 `\b<埠>\b` 並排除 node_modules、dist、docs、tmp;命中資料檔之數值不算.
- 在 Git Bash 手動驗 docker 引數時,含 `=/` 之引數會被 MSYS 路徑轉換改寫:`--filter 'name=^/w-ldap-test-samba-ad$'` 實際送出 `name=^C:/Program Files/Git/w-ldap-test-samba-ad$`,對存活容器也比不到,曾因此誤判測試之 after 回驗無效而改碼(已還原).手動驗證這類引數要加 `MSYS_NO_PATHCONV=1` 或改由 node `execFile` 送(測試本身走 execFile,不受影響);懷疑時先用 `node -e "console.log(process.argv)" <引數>` 看實際收到什麼.docker 29.6 之 name 過濾器 `^/<名>$`、`^<名>$`、子字串皆可比到.
- `String.prototype.replace` 之第二參數為字串時會解讀 `` $` ``、`$&` 等序列;取代內容含 `$`(如樣板字串 `^/${ctName}$`)要用函式形式 `() => 字串`.產生突變副本之腳本加「恰好出現一次」之守門,才抓得到取代失敗.

## 外部執行檔改制式規格(bin-ldap,2026-10-29)之經驗

- **exe 的輸出檔路徑是字串串接**(`srcVB/connLDAP/run.vb:73-76`:`BaseDirectory & fnOut`):給絕對路徑會變成 `<exe 夾>C:\...` 而失敗,但給 `..\..\` 開頭的相對路徑可行(`.NET` 先串接再正規化).實測:四版 exe 於 exe 夾長 150/200/230 字元(串接後原始長度 222/274/308 > 260)皆可寫成功(正規化後路徑短);經 junction 啟動時以「從 junction 路徑算出的相對路徑」也可寫成功(BaseDirectory 保持啟動時的路徑,不必 realpath).跨磁碟機(或不同 UNC 共用)無相對路徑,只能退回 exe 夾——這是 exe 端限制,要根治須改 exe(會動清單雜湊與釘選提交,非單輪可為).
- **跨磁碟機的真實測試**:本機只有 C 槽時,用 `subst <代號>: <資料夾>` 暫掛一個未用的磁碟機代號當快取位置(`W_BIN_CACHE=<代號>:\`),`finally` 以 `subst <代號>: /D` 卸除;找不到可用代號或 `subst` 失敗就 `this.skip()`.不需系統管理員權限.
- **測試沙箱要走真的 ensureBins**:exe 在內容定址的快取夾後,測試不能再把替身放進 `src/`.做法:沙箱即迷你套件(`src/*.mjs` 副本 + 該案的 `bin/manifest.json` + 離線鏡像 `mirror/w-ldap/<sha256>/<檔名>` + `W_BIN_OFFLINE=1`),子行程 `TEMP`/`TMP` 指向沙箱內 `tmp/` 以檢查輸出檔落點與殘檔;替身的行為檔與紀錄檔不能放快取夾(會改變組內容與組識別),改由環境變數 `STUB_DIR` 指到沙箱內另一夾.替身比照真 exe 以字串串接輸出檔名(`dir + fnOut`),否則會掩蓋「給了絕對路徑」的錯.
- **攔截 `child_process.spawn`**:wsemi 的 `execCli` 以 `import { spawn } from 'child_process'` 具名匯入;測試對 `cp.spawn` 換成記錄包裝後必須呼叫 `module.syncBuiltinESMExports()` 才會生效,`after` 還原後也要再同步一次.攔截全域 `fetch` 時,轉發用的是「換掉之前保存的原始 fetch」;若轉發函式內再呼叫 `globalThis.fetch`(例如共用的 `fetchLocal`)會遞迴.
- **`floatingManifestUrl` 不轉傳的測試要用「無效值」**:釘選模式下 wsemi 只在該值不是合法 https 網址(非網址、帶帳密、非 https)時才 `E_ARG`;合法但不在 `raw.githubusercontent.com/<repo>/` 之下的值只在主幹模式才被拒,故用 `'not a url'`、`'https://user:pw@…'`、`'http://…'` 三種才能殺掉「轉傳」變異.
- **T1 誘餌檔**:`npm pack --dry-run --json` 前在 `src/`、`bin/`、`bin-cache/`、`test/_tmp/`、`srcVB/` 放誘餌 exe/dll,`finally` 刪除;缺規則時確定性變紅.`src/` 之誘餌逼出 `.npmignore` 的 `/src/*.exe`、`/src/*.dll`(舊路徑守門).
- **vbproj 輸出改到 `bin/connLDAP/`**:以框架 MSBuild(`C:\Windows\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe`)建置複本可行(`-p:Configuration=Debug -nologo -v:m`;Git Bash 下 `/p:` 開頭會被當路徑改寫,一律用 `-` 開頭).產出 `connLDAP.exe`(net4.8)、`Newtonsoft.Json.dll`(與出貨檔同位元組)、`Newtonsoft.Json.xml`、`connLDAP.exe.config`、`connLDAP.pdb`、`connLDAP.xml`;後四者非出貨檔,`.gitignore` 已列(`script.txt` 的 `git add . -A` 會全數加入).
- **變異驗證腳本**的陷阱:工作樹檔案為 CRLF(autocrlf=true),變異文字含 `\n` 會在 CRLF 檔上「0 次命中」;腳本要有「恰好命中一次」的守門,且片段勿含換行.測試檔因變異而載入即失敗(如清單形狀變了)也算擊殺,但要與「有案例紅」分開記.
- **測試鎖等待**:同機多套件並行時 `quiet-run --lock` 常等 2~9 分鐘;批次跑(變異、修前紅)宜包成單一腳本一次取放鎖,不要逐項各取一次.
- 每次 `ensureBins()` 的快取命中成本實測約 0.57 ms(200 次平均,行程內記憶校驗結果),不必在 `WLdap` 內自行記憶.

## 文件撰寫

- Markdown 表格儲存格內不要出現管線字元(JS 之邏輯或運算子也會切壞表格);URL 後面要先空一格再接括號,否則自動連結會把括號文字吃進網址.
- 「所有/皆/恆/只」之全稱與限定句是最常寫錯的地方:run01 自檢抓到 5 處過寬或過窄;寫完用 Grep 掃這些字逐句核對.
- 由搜尋推得之數量(幾個呼叫端、幾處)一定要用全範圍搜尋;run01 曾因只搜 6 檔把「7 個套件 8 處」寫成「兩支」.
