#!/bin/sh
# w-ldap 整合測試用: 首次啟動時佈建網域, 之後以前景執行 samba(AD DC)
# REALM、DOMAIN、ADMINPASS 由測試以環境變數給定(不設預設值, 使網域參數只在測試檔定義一次)
set -e
: "${REALM:?REALM is required}"
: "${DOMAIN:?DOMAIN is required}"
: "${ADMINPASS:?ADMINPASS is required}"
if [ ! -f /var/lib/samba/private/sam.ldb ]; then
  rm -f /etc/samba/smb.conf
  samba-tool domain provision --realm="$REALM" --domain="$DOMAIN" --server-role=dc --dns-backend=SAMBA_INTERNAL --adminpass="$ADMINPASS" --use-rfc2307
fi
echo "SAMBA-PROVISIONED"
exec samba -i --debuglevel=1
