# 狀態(現況)

本檔記當前已開發功能之最新狀態:各功能做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證或發布之版本.只記現況,過程寫入 `sgud/exp/experience.md`.接續工作先讀本檔.

> 狀態基準:2026-10-29(任務 20261028054319 bin-ldap,工作樹未提交、未發布;`package.json` 版本 1.0.39 未動).

## 功能現況

| 功能 | 狀態 | 規則帳本 | 測試檔 | 說明 |
|---|---|---|---|---|
| `WLdap(input, opt)`:logIn / listUsers,結局判定(失敗關閉、字串拒絕) | 完成 | RB1–RB8 | `unit-judgeResult`、`unit-WLdap`、`api-ldap-sambaAd` | 呼叫 .NET exe(stdin 傳入 base64(JSON)),輸出檔判定;`opt.ver`(4.5/4.6/4.7.2/4.8)、`opt.timeout` |
| 外部執行檔組 `connLDAP`(四版 exe + `Newtonsoft.Json.dll`)取得 | 完成(依制式規格 `C:\opensrcOper\dspec\外部執行檔之存放下載校驗與離線.md`) | RB12、RB13、RB15、RB16 | `unit-binManifest`(T1、T2)、`api-ensureBins`(T3~T7 檔案組版、入口攔截)、`unit-WLdap`(取得失敗、組內缺版本) | 釘選模式;清單 `bin/manifest.json`(commit `3ecddc12fd51f46eb5790f7e8eaac8aa0084ca0a`);`src/ensureBins.mjs` 轉呼叫 wsemi `fsEnsureBins`(wsemi 1.9.30);`WLdap.ensureBins` 靜態屬性;首次使用才下載,不在 postinstall |
| 輸出檔落點 | 完成;exe 端限制見已知缺口 | RB14 | `unit-getOutPlace`、`unit-WLdap` | 同磁碟機:相對路徑導向 `os.tmpdir()`;跨磁碟機:退回 exe 所在夾 |
| Samba AD DC 整合測試 | 完成 | RB10、RB11 | `api-ldap-sambaAd` | Docker(Linux 容器);沙箱 exe 組經 ensureBins 自離線鏡像取得 |
| UMD 打包(`dist/w-ldap.umd.js`) | 設定已補 external(`url`、`crypto`、`stream`、`stream/promises`、`os`);`dist/` 由發布流程產製,本輪未重建受追蹤之 `dist/` | RB15 | 無自動化測試(2026-10-29 於 `./tmp` 試建並離線取得 exe 組通過) | 套件根由 `dist/` 的上一層推得 |

## 已知缺口與待辦

- exe 不接受絕對輸出路徑(`srcVB/connLDAP/run.vb:73-76` 以字串串接):跨磁碟機時輸出檔只能寫在快取夾(須可寫).根治須改 `getOutputPath` 並重建 exe(清單雜湊與釘選提交隨之更新,U1 流程),待使用者裁示.
- 建置輸出(`OutputPath` = `bin/connLDAP/`)會多出 `connLDAP.exe`、`connLDAP.exe.config`、`connLDAP.pdb`、`*.xml`:`.gitignore` 已列,但重建後須依 RB13 手動複製改名各版 exe 並刪除多餘檔,再產生清單;此流程未自動化.
- `srcVB/connLDAP/bin/Debug`、`obj/Debug` 之建置產物仍受 git 追蹤(不入 npm 包;`git rm` 為主控職權,本輪未動).
- 與 Windows Server AD 之差異未驗(見規則帳本已知限制).

## 最近一次驗證

- 2026-10-29:全套 `npm test` 綠(含 Docker Samba 整合),見任務報告 `C:\opensrcOper\dnow\20261028054319\agent-out\bin-ldap-修正報告.md`;`node C:/opensrcOper/tools/scan-bins.mjs --only w-ldap` 為 OK.
- 最近一次發布版本:未發布(1.0.39 為發布前版本).
