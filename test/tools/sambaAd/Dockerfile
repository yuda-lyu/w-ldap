# w-ldap 整合測試(test/api-ldap-sambaAd.test.mjs)用之 Samba AD DC 映像: 官方 debian 映像 + Debian 套件庫之 samba(不用社群映像)
# 由該測試於 before 建置(映像名 w-ldap-test-samba-ad:<本資料夾兩檔內容之雜湊>, 已存在則不重建), 佈建參數由測試以環境變數 REALM、DOMAIN、ADMINPASS 給定
# 容器須以 --privileged 執行(佈建 sysvol 時須設定 ACL)
FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
 && apt-get install -y --no-install-recommends samba samba-ad-dc samba-ad-provision winbind ldb-tools \
 && rm -rf /var/lib/apt/lists/*
COPY entrypoint.sh /entrypoint.sh
# 於 Windows 取出之 entrypoint.sh 可能為 CRLF, 先轉為 LF
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
EXPOSE 389
ENTRYPOINT ["/entrypoint.sh"]
