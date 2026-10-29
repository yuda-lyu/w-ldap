# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

> 狀態基準:2026-10-13 23:4x(任務 20261013230930 run01)——w-ldap 1.0.36(HEAD `dd22951`)之工作樹新增 Samba AD DC 整合測試(未提交;產品碼未改).RB1–RB9 為 1.0.36(run02)所定,來源:run01 審計回應與主控之 run01 複審裁決(`C:\opensrcOper\dhist\20261013211750\review\run01-複審.md`);RB10–RB11 為本次新增(來源:主控 `建議w-ldap調整.md`、全域規範 §16.5).RB1–RB9 之站點以下列盤點指令於 2026-10-13 23:38 重跑,與 run02 所載相同.

> 2026-10-29(任務 20261028054319 bin-ldap):外部執行檔(四版 exe 與 Newtonsoft.Json.dll)依制式規格(`C:\opensrcOper\dspec\外部執行檔之存放下載校驗與離線.md`)改為檔案組 `connLDAP`,不入 npm 包,經 wsemi `fsEnsureBins` 取得(新增 RB12–RB16);RB1–RB6 之站點行號已隨 `src/WLdap.mjs` 改動重盤(2026-10-29 重跑盤點指令).

## 軸

- 結局判定:spawn 結果(成功/同步拋出/非同步 error)× 離開碼(0/非 0/null/不結束)× 輸出檔(無/有)× 內容(空/只有 BOM/非 base64/非 UTF-8/非 JSON/截斷/根非物件/error 非空/error 空/error 非字串/success truthy/success null/並存/兩鍵皆無)× 清理(成功/ENOENT/EBUSY·EPERM)× 模式(logIn/listUsers)× 入口(src/dist)× opt.timeout(未給/正整數/非正整數).
- 呼叫端資料:欄位(mode/account/password/ldappath/額外鍵/自帶內部鍵)× 經手點(呼叫端物件/序列化/子程序命令列/console/exe 解析/輸出檔/拒絕訊息/resolve 值)× 物件狀態(一般/freeze/seal/類別實例/getter/重複使用).
- exe 協定:輸入管道(stdin/命令列參數/皆無)× 離開碼(0 已完成 LDAP 呼叫、1 exe 本身錯誤、2 誤用命令列).
- AD 呼叫(整合測試):mode(logIn/listUsers)× 帳號格式(samaccountname/`<NETBIOS>\<帳號>`/`<帳號>@<realm>`/不存在)× 密碼(正確/錯誤/像日期/含非 ASCII)× ldappath(大寫 scheme 含 base DN/小寫 scheme/未監聽之埠)× opt.ver(4.5/4.6/4.7.2/4.8).
- 整合測試之環境:平台(Windows/非 Windows)× docker(CLI 不存在/daemon 不可達/Windows 容器模式/可用)× 映像(不存在/已存在/內容變更/CRLF 取出)× 前次殘留容器(無/有)× 埠 8990(空/被他程序占用)× 容器(正常就緒/提早結束/逾時)× 收尾(after 正常/before 失敗後之 after/行程被中斷).

## 規則

| # | 規則 | 盤點指令(於 repo 根執行) | 站點全集與狀態 | 單一擁有者 |
|---|---|---|---|---|
| RB1 | 失敗關閉:只有「exe 正常結束(離開碼 0)+輸出檔存在+可解為 plain object+具自有鍵 success 且無自有鍵 error」才 resolve;其餘一律拒絕 | `grep -n -e "Promise.reject" -e "judgeResult(" src/WLdap.mjs`;`grep -n -e "return rErr(" -e "state: 'success'" src/judgeResult.mjs` | 已套:`src/WLdap.mjs:204-208` 只依 judgeResult 之結果;`src/judgeResult.mjs` 唯一 resolve 點為 judgeFile 之 success 分支 | `src/judgeResult.mjs`(純函式) |
| RB2 | 拒絕值一律為字串,並帶穩定前綴(`ensureBins[<code>]:`、`spawn[`、`code[`、`timeout[`、`connLDAP exited without output file`、`invalid output from connLDAP:`、`connLDAP reported an empty error`;exe 回報之 error 原文) | 同上 | 已套:輸入檢查 7 處(`src/WLdap.mjs:96 :101 :107 :111 :115 :119 :130`)、取得 exe 失敗 `:149`(`ensureBins[<code>]: <message>`,不拒絕 Error 物件)、組內無所選版本之 exe `:155`(`<檔名> is not in the bundle of connLDAP`)與 `:206`(judgeResult 之 msg,皆字串);judgeResult 之前綴產生點 `:36 :41 :47 :53 :55`、`:68-128` | `src/judgeResult.mjs`(前綴 `ensureBins[` 與組內缺檔字串之擁有者為 `src/WLdap.mjs`) |
| RB3 | 清理(刪輸出檔)盡力而為、不參與判定、不拋錯 | `grep -n -e "unlinkSync" -e "rmSync" src/WLdap.mjs` | 已套:`src/WLdap.mjs:197-201`(try/catch 吞錯,在判定之前、不影響結局;刪除對象為 `getOutPlace` 回傳之 `fpOut`) | WLdap 本體之收尾 |
| RB4 | 函式庫不得 console 輸出;組錯誤訊息只取 `err.code`/`err.message`,不得序列化整個 Error 物件或輸入 | `grep -n -e "console\.log" -e "console\.error" -e "console\.warn" src/WLdap.mjs src/judgeResult.mjs`(排除註解與 JSDoc 範例) | 已套:執行碼 0 處(餘 `:73`、`:88` 為 JSDoc 範例,`:158` 為註解);`src/WLdap.mjs:149`(ensureBins 錯誤)與 `:183-192`(execCli 同步拋錯)只取 code/message | — |
| RB5 | 不改動呼叫端物件;交給 exe 之物件以白名單另建:mode、account、password、ldappath、內部檔名(內部鍵由 WLdap 決定) | `grep -n -e "input\[" -e "JSON.stringify(" src/WLdap.mjs` | 已套:無 `input[` 寫入;唯一序列化點 `:176` 為白名單 payload(`:167-173`) | WLdap 本體 |
| RB6 | 機密不得出現在子程序命令列:exe 只讀 stdin,有命令列參數即以 2 結束;WLdap 以 execCli 之 `input` 送 stdin、args 為空陣列 | `grep -n -e "execCli(" -e "execProcess(" src/WLdap.mjs`;`grep -n -e "Interaction.Command" -e "GetCommandLineArgs" -e "readStdin()" srcVB/connLDAP/run.vb` | 已套:`src/WLdap.mjs:181`;`run.vb:22-25`(拒絕參數)、`:45`、`:57-60`(讀 stdin);`Interaction.Command` 0 處 | exe 之輸入管道 |
| RB7 | exe 之早期錯誤:訊息寫 stderr(UTF-8)、已知輸出檔名時另寫 `{error}`、以 1 結束;寫檔失敗亦以 1 結束 | `grep -n -e "reportError(" -e "Return exit" srcVB/connLDAP/run.vb` | 已套:`run.vb:103 :111 :122 :130 :141 :144` 經 `reportError`(`:80-86`);`:152-155` 寫檔失敗;`:50-53` 其餘例外 | exe |
| RB8 | exe 解析輸入不得改寫字串值(`DateParseHandling.None`);`b2o`/`b642str` 不吞例外 | `grep -n -e "DeserializeObject" -e "DateParseHandling" srcVB/connLDAP/sysFunction.vb` | 已套:`sysFunction.vb:31-33` | exe |
| RB9 | 四個 exe 由同一份 `srcVB` 原始碼以 vbc 依 vbproj Debug 選項建置,只差 TargetFrameworkAttribute;`srcVB/connLDAP/bin/Debug`、`obj/Debug` 之 exe/pdb 為 net4.8 建置產物 | IL 傾印比對(做法見 `sgud/exp/experience.md`);`md5sum bin/connLDAP/connLDAP.net4.8.exe srcVB/connLDAP/bin/Debug/connLDAP.exe srcVB/connLDAP/obj/Debug/connLDAP.exe`(exe 自 2026-10-29 起在 `bin/connLDAP/`,不再在 `src/`) | 已套(2026-10-13 run02 重建;三者 md5 相同);四版對 AD 之登入由 S10 端到端驗證 | 建置者 |
| RB10 | 整合測試之容器生命週期(照 `C:\opensrc\開源-JS-015-4-w-orm-postgresql\w-orm-postgresql\test\api-postgresql.test.mjs` 之型態):before 依序「非 Windows 即 `this.skip()` → `docker version` 不可用或非 Linux 模式即以明確訊息失敗 → 映像標籤取 `test/tools/sambaAd/` 之 Dockerfile 與 entrypoint.sh 內容(換行正規化為 LF)之雜湊,不存在才 `docker build` → `docker rm -f` 清前次殘留 → `docker run -d --rm --privileged` → 以 LDAP 匿名 bind 收到 BindResponse 判就緒(容器已結束即提早失敗、180 秒逾時)→ `docker exec … samba-tool user create` 建測試帳號」;after 一律 `docker rm -f` 並以 `docker ps -a` 回驗已移除;docker 一律經同一輔助函式以陣列傳參、不經 shell,失敗訊息只取 stderr(不取含指令與帳密之 err.message) | `grep -n "docker(\[" test/api-ldap-sambaAd.test.mjs`;`grep -n "execFile" test/*.mjs test/tools/*.mjs` | 已套:docker 呼叫 10 處皆經 `docker()`(`test/api-ldap-sambaAd.test.mjs:51-59`);`execFile` 只在該輔助(`:6`、`:17`、`:53`);生命週期 `:226-273`;就緒判斷 `:77-126`、`:149-164` | `test/api-ldap-sambaAd.test.mjs` 之 before/after |
| RB11 | 測試所用之埠固定(≥ 8000、不向系統隨機要)且只綁 127.0.0.1;容器與映像名以 `w-ldap` 開頭:容器 `w-ldap-test-samba-ad`、映像 `w-ldap-test-samba-ad:<雜湊 12 碼>`、LDAP 對外埠 8990、刻意未監聽之埠 8991 | `grep -n -e 'ctPort =' -e 'closedPort =' -e 'ctName =' -e 'imgRepo =' -e '127.0.0.1:${ctPort}:389' test/api-ldap-sambaAd.test.mjs`;他 repo 是否占用:Grep 工具於 `C:\opensrc` 搜 `\b899[01]\b`(排除 node_modules、dist、docs、tmp) | 已套:`:19-23`、`:249`(`-p 127.0.0.1:8990:389`);2026-10-13 盤點他 repo 無使用(命中者僅資料檔之數值) | `test/api-ldap-sambaAd.test.mjs` 開頭常數 |
| RB12 | 外部執行檔(四版 exe 與相鄰之 `Newtonsoft.Json.dll`)為檔案組 `connLDAP`:不入 npm 包、不在 `src/`;只經 `src/ensureBins.mjs`(轉呼叫 wsemi `fsEnsureBins`,套件根由本檔位置推得,不轉傳 `floatingManifestUrl`)取得,`WLdap` 以 `bundles.connLDAP.files[<檔名>]` 啟動、`bundle.dir` 為輸出檔相對路徑之基準;不得自寫下載、快取、校驗、鏡像,不得有舊路徑(套件根、`node_modules`、工作路徑)查找。制式規格:`C:\opensrcOper\dspec\外部執行檔之存放下載校驗與離線.md`(S1~S5、D1~D6、O1~O5、E1~E3、M1~M6、§8、§9) | `grep -rn "fsEnsureBins" src/`(應只有 `src/ensureBins.mjs`);`grep -n -e "connLDAP.net" -e "Newtonsoft" -e "fsIsFile" -e "path.resolve()" src/*.mjs`(`connLDAP.net` 與 `Newtonsoft` 只應出現在 JSDoc/註解與 `src/WLdap.mjs:140` 之檔名組合;`fsEnsureBins` 只在 `src/ensureBins.mjs`);`npm pack --dry-run --json`(無 `.exe`/`.dll`、`bin/` 下只有 `manifest.json`) | 已套:`src/ensureBins.mjs` 唯一呼叫 `fsEnsureBins`;`src/WLdap.mjs:142-157`(取得、失敗以字串拒絕、組內無所選版本之 exe 即拒絕);`WLdap.ensureBins` 為靜態屬性(`:213`,不加具名匯出以維持 UMD 之 `require()` 形態) | `src/ensureBins.mjs` |
| RB13 | 清單 `bin/manifest.json` 由 `toolg/genBinManifest.mjs` 依 `bin/connLDAP/` 實檔產生(不手寫);釘選模式,`commit` 為含該 5 檔之提交(目前 `3ecddc12fd51f46eb5790f7e8eaac8aa0084ca0a`),清單與工作樹 `bin/` 實檔、與釘選提交內之位元組皆須一致;`bin/` 內不得有清單未載之檔。更新流程(U1):重建 exe(MSBuild 或 vbc,輸出在 `bin/connLDAP/`)→ 把 `connLDAP.exe` 複製改名為各版 `connLDAP.net4.x.exe`(每版須另寫 `.NETFramework,Version=v<版>.AssemblyAttributes.vb` 以得 TargetFrameworkAttribute,見 `sgud/exp/experience.md`)→ 刪建置多出之 `connLDAP.exe`、`connLDAP.exe.config`、`connLDAP.pdb`、`*.xml`(`.gitignore` 已列,但 `genBinManifest` 以讀資料夾列舉會納入)→ 提交並推 GitHub → `node toolg/genBinManifest.mjs --commit <該提交>` → `npm test` → 發布 | `node toolg/genBinManifest.mjs --commit <40 碼>`(會改寫 `bin/manifest.json`);`git ls-files bin` | 已套:`bin/manifest.json`(1 組 5 檔,`bundles[0].dir` 為 `bin/connLDAP`);測試 `unit-binManifest` 之 T2、反向、提交位元組各案 | `toolg/genBinManifest.mjs` |
| RB14 | 執行期交換檔不寫執行檔所在夾(制式規格 §9):exe 以所在資料夾字串串接輸出檔名(`srcVB/connLDAP/run.vb:73-76` 之 `getOutputPath`,不接受絕對路徑),故 `WLdap` 以 `src/getOutPlace.mjs` 給相對路徑使輸出檔落在 `os.tmpdir()`;暫存夾與 exe 不同磁碟機或不同 UNC 共用時無相對路徑,退而寫在 exe 所在夾(`inTmp: false`);輸入走 stdin(RB6),故交換檔只有輸出檔 | `grep -n -e "getOutPlace" -e "os.tmpdir" -e "__System:OutputFilename" src/*.mjs` | 已套:`src/WLdap.mjs:164`;`src/getOutPlace.mjs`;exe 端不改(改 exe 須重建並更新清單提交,見已知限制) | `src/getOutPlace.mjs` |
| RB15 | 忽略規則:`.npmignore` 含 `/bin/*`、`!/bin/manifest.json`、`/bin-cache/`、`/src/*.exe`、`/src/*.dll`、`/test/_tmp/`、`/srcVB/`;`.gitignore` 含 `/bin-cache/` 與 `srcVB` 建置多出之非出貨檔(`/bin/connLDAP/connLDAP.exe` 等);`toolg/gDistRollup.mjs` 之 `external`/`globals` 含 `url`、`crypto`、`stream`、`stream/promises`、`os`(wsemi 之 `fsEnsureBins` 與交換檔所需);`srcVB/connLDAP/connLDAP.vbproj` 之 `OutputPath`(Debug、Release)為 `..\..\bin\connLDAP\` | `grep -n "" .npmignore .gitignore`;`grep -n "external" -A 12 toolg/gDistRollup.mjs`;`grep -n "OutputPath" srcVB/connLDAP/connLDAP.vbproj` | 已套;驗證:`unit-binManifest` 之 T1(含誘餌檔)與 gitignore/OutputPath 案;UMD 打包於 `./tmp` 試建並離線取得 exe 組(2026-10-29) | `.npmignore`、`.gitignore` |
| RB16 | 取得 exe 失敗(離線缺檔、校驗不符、網路)時不啟動任何程序,以字串 `ensureBins[<code>]: <message>` 拒絕(訊息不含輸入之帳密);離線缺檔時訊息列出全組(每檔名稱、sha256、大小、快取與鏡像之完整路徑) | `grep -n "ensureBins\[" src/WLdap.mjs` | 已套:`src/WLdap.mjs:149`;測試 `unit-WLdap`「取得 exe 失敗」與 `api-ensureBins` 之 T6 | `src/WLdap.mjs` |

## 測試

| 測試檔 | 對應規則與全盤表列 | 指令 | 平台 |
|---|---|---|---|
| `test/unit-judgeResult.test.mjs`(25 案) | RB1、RB2;表 A 之 A10-A30 | `npm test`;單檔:`npx mocha --no-parallel test/unit-judgeResult.test.mjs --timeout 180000` | 全平台 |
| `test/unit-WLdap.test.mjs`(30 案;替身原始碼 `test/tools/StubConnLdap.cs`、N3 探針 `test/tools/ExeParseProbe.cs`、輔助 `test/tools/wldapHarness.mjs`、子行程執行器 `test/tools/runWLdap.mjs`;沙箱 `test/_tmp/unit-WLdap/`,after 刪除.**每案之沙箱為迷你套件**:`src/*.mjs` 為 repo 副本、`bin/manifest.json` 描述該案之 exe 組、離線鏡像 `mirror/`、`W_BIN_OFFLINE=1`,子行程 `TEMP`/`TMP` 指向沙箱 `tmp/`、`STUB_DIR` 指向替身紀錄夾——WLdap 走真正的 `ensureBins`,不繞過) | RB1-RB8、RB12、RB14、RB16;表 A 之 A01、A07、A08、A10、A13、A15-A21、A24-A29、A31、A36、A37;表 B-2;真 exe 契約(非 ADsPath、缺 Newtonsoft、命令列參數、像日期之密碼);輸出檔落點(暫存夾,不在快取夾)、跨磁碟機退回(以 `subst` 暫掛磁碟機代號,無可用代號即 skip)、組內無所選版本、取得失敗之字串拒絕 | 同上 | Windows(非 Windows 只跑平台拒絕一案) |
| `test/unit-getOutPlace.test.mjs`(6 案) | RB14(相對路徑、磁碟機大小寫、中文空白、跨磁碟機、UNC) | 同上 | 全平台(以 `path.win32` 計算) |
| `test/unit-binManifest.test.mjs`(7 案) | RB12、RB13、RB15;制式規格 T1(npm 包無執行檔,含誘餌檔)、T2(清單＝實檔,含反向與釘選提交內之位元組) | 同上 | 全平台(需 git 與 npm) |
| `test/api-ensureBins.test.mjs`(17 案;本機 HTTP 伺服器埠 8893,固定) | RB12、RB16;制式規格 T3~T7 之檔案組版(整組取得、組內一檔不符整組重取、離線缺檔列出全組);環境變數、套件根與 cwd 無關、不轉傳 `floatingManifestUrl`;主函數 `WLdap` 入口:攔截全域 `fetch`(斷言未被呼叫或被呼叫之網址)與 `child_process.spawn`(斷言啟動者為組資料夾內之 exe)、真 exe 自快取之組資料夾啟動 | 同上 | 取得流程全平台;經主函數啟動 exe 之案例僅 Windows |
| `test/api-ldap-sambaAd.test.mjs`(11 案,S01-S11;映像定義 `test/tools/sambaAd/Dockerfile`、`entrypoint.sh`;沿用 `wldapHarness.mjs`、`runWLdap.mjs` 以子行程於沙箱呼叫真 exe;沙箱 `test/_tmp/api-ldap-sambaAd/`,after 刪除;容器 `w-ldap-test-samba-ad`,after 銷毀並回驗) | AD 成功路徑(JSDoc 之 resolve/reject 形狀);RB2、RB3、RB4(每次呼叫皆驗無 `_*` 殘檔、無 console)、RB6、RB8、RB9;RB10、RB11 | `npm test`;單檔:`npx mocha --no-parallel test/api-ldap-sambaAd.test.mjs --timeout 180000` | Windows + docker(Linux 容器模式);非 Windows 整支略過;docker 不可用時 before 以「需先安裝並啟動docker才能執行samba ad整合測試: …」失敗,其餘測試不受影響.首次建置映像需下載 debian 與 samba 套件(主控實測 apt 層約 31 秒);之後映像沿用,單檔約 20 秒 |

整合測試案例(帳號 `wldapuser`/`wldapdate`/`wldapuni` 於 before 建立,CN 取帳號;網域 `TEST`/`test.local`;ldappath `LDAP://127.0.0.1:8990/DC=test,DC=local`):

| S | 案例 | 斷言 | 依據 |
|---|---|---|---|
| S01 | logIn 帳密正確 | resolve;`Path` 等於 `LDAP://127.0.0.1:8990/CN=<帳號>,CN=Users,DC=test,DC=local`(不分大小寫);`Properties.samaccountname` 等於 `[帳號]` | JSDoc:logIn 之 resolve 為該帳號之 LDAP 條目 |
| S02 | logIn 密碼錯誤、帳號不存在 | 前提:同伺服器正確帳密可登入;以字串 reject、非空、不帶 WLdap 自組前綴、不含輸入之密碼;原文不寫死(隨系統語系) | JSDoc:reject 一律為字串、LDAP 錯誤為其原始訊息;RB2;RB4 |
| S03 | listUsers 帳密正確 | resolve 陣列;每元素 `Path` 以 `LDAP://127.0.0.1:8990/` 開頭且 `Properties` 為物件;含三個測試帳號且其 `Path` 同 S01 | JSDoc:listUsers 為使用者條目陣列(含群組為既有行為,不斷言筆數) |
| S04 | listUsers 密碼錯誤、帳號不存在 | 同 S02 | 同 S02 |
| S05 | 密碼 `2020-01-01T00:00:00` | 同 S01 | RB8 之端到端守門;修前(cc23d9a)紅 |
| S06 | 密碼含非 ASCII 字元(`P@ss-秘密-😀-123`) | 同 S01 | RB6(stdin 傳遞)之端到端守門;latin1 突變紅 |
| S07 | logIn 帳號 `TEST\wldapuser`、`wldapuser@test.local` | 密碼正確 → resolve 恰為 `{success:null}`;密碼錯誤 → 同 S02 之拒絕 | JSDoc:帳密驗證成功但以 samaccountname 查無條目時回傳 `{success:null}`(已知限制,Q4 維持) |
| S08 | ldappath 指向 `127.0.0.1:8991` | 前提:8991 未監聽;同 S02 之拒絕 | JSDoc(LDAP 錯誤原文) |
| S09 | ldappath 之 scheme 為小寫 `ldap://` | logIn 同 S01、listUsers 同 S03 | exe 之大小寫置換手寫兩處(`srcVB/connLDAP/run.vb:170`、`:198`),兩處各測 |
| S10 | opt.ver 4.5/4.6/4.7.2/4.8 | 沙箱之 exe 組(取自 `bin/connLDAP/` 全部五檔,經 ensureBins 離線取得)本含四版,各版同 S01 | JSDoc opt.ver;RB9;RB12 |
| S11 | listUsers 帳號 `TEST\wldapuser`、`wldapuser@test.local` | 同 S03 | JSDoc:listUsers 為使用者條目陣列(查詢 `samaccountname=*` 不依帳號);與 S07 對照 |

- (2026-10-29 注意:沙箱已改為迷你套件、exe 組經 ensureBins 離線取得,以下兩條為 run02 與 Samba 任務當時之舊制做法,舊 WLdap 與舊 exe 成對之對照需自行調整沙箱;bin-ldap 任務之修前紅做法見 `sgud/state/state.md` 與 `sgud/exp/experience.md`.)
- 修前對照做法:把 `test/` 複製到 `./tmp/red/test/`,以 `git show HEAD:<path>` 取舊 `src/WLdap.mjs` 與 exe 至 `./tmp/red/src/`,執行 `npx mocha --no-parallel "tmp/red/test/*.test.mjs" --timeout 180000`(測試輔助以自身位置推得 repo 根,故自動改用副本).run02 結果:修前 14 綠 37 紅(綠者皆為契約案例)、修後 51 綠.
- 整合測試之修前對照(2026-10-13 任務 20261013230930):`test/` 複製到 `./tmp/redSamba/test/`(去掉 `_tmp`),`git show cc23d9a:src/WLdap.mjs` 與 `git cat-file blob cc23d9a:src/<檔>`(四個 exe、`Newtonsoft.Json.dll`)放 `./tmp/redSamba/src/`,執行 `npx mocha --no-parallel "tmp/redSamba/test/api-ldap-sambaAd.test.mjs" --timeout 180000`.須舊 WLdap 與舊 exe 成對(舊 exe 只讀命令列、新 WLdap 只送 stdin,混搭會全紅而非只紅 S05).結果:10 綠 1 紅(S05,`使用者名稱或密碼不正確。`).另以突變(副本之 WLdap 改用 latin1 編 base64)跑:10 綠 1 紅(S06).副本與主測試共用容器名與埠,不可同時執行.

## 已知限制(刻意不套或另案)

- exe 定位與中介檔落點(原以 cwd 為錨、輸出檔寫 exe 所在夾)已於 2026-10-29 依制式規格改造(RB12、RB14).仍存在者:exe 信任 `__System:OutputFilename`(以字串串接組路徑,可經 `..\` 寫到任何可寫處,`WLdap` 即利用此點把輸出檔導向暫存夾);exe 不接受絕對路徑,故暫存夾與快取夾不同磁碟機時退而寫在快取夾(須可寫;`W_BIN_CACHE` 指唯讀位置且跨磁碟機時 exe 寫檔失敗,依 RB7 預期以 1 結束而得 `code[1]:`,未實測).要根治須改 `srcVB/connLDAP/run.vb` 之 `getOutputPath` 接受絕對路徑,但重建 exe 會改變清單之雜湊與釘選提交(U1 流程),列為待裁示.清理失敗(`EBUSY`/`EPERM`)時殘檔留在暫存夾(RB3 盡力而為).
- 未給 `opt.timeout` 時不設限(計時器上限約 24.8 天);LDAP 端點接受連線不回應時,exe 約 240 秒後自行以錯誤結束(run01、run02 實測 240.3、240.2 秒).
- logIn 綁定成功但以 samaccountname 查無條目時 resolve `{success:null}`(整個外層物件)——主控 Q4 裁示維持.
- AD 成功路徑已由 `test/api-ldap-sambaAd.test.mjs` 以 Samba AD DC(Debian bookworm 之 samba 4.17)涵蓋;與 Windows Server AD 之差異未驗(本機未加入網域,ADSI 之預設 Secure 綁定推測經 Negotiate 落為 NTLM,未擷取封包確認;LDAP 簽章或通道繫結之強制、Kerberos 等未涵蓋),業主環境仍以 `g.mjs` 驗證為準.
- 整合測試之容器以 `--rm` 執行(照 w-orm-postgresql):佈建或啟動失敗而容器自行結束時,日誌隨容器刪除,錯誤訊息只能指出「samba容器已結束(佈建或啟動失敗)」;要看日誌請手動前景執行 `docker run --rm --privileged -e REALM=TEST.LOCAL -e DOMAIN=TEST -e ADMINPASS=<任意合規密碼> -p 127.0.0.1:8990:389 w-ldap-test-samba-ad:<雜湊>`.
- 整合測試之容器名與埠固定:同機同時執行兩份(例如修前副本與主測試)會互相 `docker rm -f` 對方之容器,不支援.行程被中斷(after 未執行)時容器留存至下次執行之 before 清除.
- 映像保留供下次沿用;Dockerfile 或 entrypoint.sh 內容變更後,舊雜湊標籤之映像不再使用,可手動 `docker rmi w-ldap-test-samba-ad:<舊雜湊>`(只限此名稱).
- Windows 之 Hyper-V/WinNAT 可能於重開機後把 8990 劃入保留埠範圍,此時 `docker run` 以 bind 錯誤失敗(訊息含 `ports are not available`);以 `netsh int ipv4 show excludedportrange protocol=tcp` 確認.
- logIn 之查詢篩選器 `(&(samaccountname=<帳號>))`(`srcVB/connLDAP/run.vb:204`)未跳脫特殊字元:對 Samba AD 實測含 `(`、`)`、`&` 之帳號可正常登入並回其條目(`*` 不允許於 sAMAccountName);`<NETBIOS>\<帳號>` 得 `{success:null}`(S07).對 Windows AD 未驗.
- `sysFunction.vb` 之 `JObj2Dict`/`JObj2Arr` 遇非預期 JSON 節點仍 `MsgBox`(由 WLdap 之輸入不可達,未改).
- 重建 exe 使用 .NET Framework 內建之舊版 vbc,與原出貨版(VS2019 之 Roslyn)產碼略異:`DebuggableAttribute` 263→259、部分方法多插 `ProjectData.ClearProjectError`;不影響執行.`srcVB/connLDAP/obj/Debug` 之 MSBuild 快取與 `bin/obj` 之 `connLDAP.xml`(內容相同、排序與空白不同)未重產.

## 破壞性變更紀錄

| 時間 | 版本 | 變更 | 對使用端之影響 |
|---|---|---|---|
| 2026-10-29(bin-ldap,未發布) | 1.0.39 之後一版(版號由發布流程決定) | 外部執行檔(四版 exe 與 `Newtonsoft.Json.dll`)移出 npm 包,首次使用時依 `bin/manifest.json` 下載並逐檔校驗、整組放入快取(`WLdap.ensureBins()`、`W_BIN_CACHE`/`W_BIN_MIRROR`/`W_BIN_OFFLINE`);`srcVB/` 不再入包;`src/` 不再有 exe、dll、`Newtonsoft.Json.xml` | 首次呼叫須能連 GitHub 或有鏡像(離線部署見 README);以 `src/connLDAP.net4.x.exe`、`node_modules/w-ldap/src/` 路徑直接取用 exe 者須改用 `WLdap.ensureBins()` |
| 同上 | 同上 | 不再以工作目錄尋找 exe;取不到 exe 之拒絕由 `can not find folder for connLDAP` 改為 `ensureBins[<code>]: <message>`(字串);組內無所選版本之 exe 為 `<檔名> is not in the bundle of connLDAP` | 以全字比對舊訊息者須改為前綴比對 |
| 同上 | 同上 | 輸出檔改寫作業系統暫存夾(不再寫 exe 所在夾);跨磁碟機時寫快取夾 | 無(用畢即刪);`W_BIN_CACHE` 指唯讀位置且跨磁碟機時預期失敗(未實測) |
| 同上 | 同上 | `srcVB/connLDAP/connLDAP.vbproj` 之 `OutputPath` 改為 `..\..\bin\connLDAP\` | 重建 exe 後須依 RB13 整理 `bin/connLDAP/` 再產生清單 |
| 2026-10-13(run02,未發布) | 1.0.35 之後一版(版號由發布流程決定) | 拒絕值一律為字串並帶前綴;原以 Error 物件拒絕之路徑(ENOENT/EBUSY/TypeError)改為字串 | 以 `instanceof Error`、`err.code` 判斷拒絕值者須改為字串前綴判斷 |
| 同上 | 同上 | 失敗開放改為失敗關閉:輸出缺漏、不可解析、根非物件、兩鍵皆無、`{error:''}` 由 resolve 改為拒絕 | 原本會收到 `{}`/`null`/非物件之 resolve 者改收拒絕 |
| 同上 | 同上 | mode 檢查訊息改為 `input.mode needs to be 'logIn' or 'listUsers'`(補齊引號) | 以全字比對該訊息者須更新 |
| 同上 | 同上 | 不再於呼叫端 input 寫入 `__System:OutputFilename`;額外鍵不再轉交 exe | 依賴該內部鍵者(不應有)不再取得 |
| 同上 | 同上 | exe 改為只讀 stdin,命令列參數即以 2 結束;早期錯誤以 1 結束並回報;像日期之字串不再被改寫 | 只影響直接呼叫 exe 者;經 WLdap 者無感 |
| 同上 | 同上 | 新增 `opt.timeout`(opt-in) | 無(未給時行為不變) |
