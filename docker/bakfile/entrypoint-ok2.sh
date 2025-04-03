#!/bin/sh

wget -O /tmp/init.sh https://gitee.com/CloudBot/init-sync/raw/main/crpoxy/init.sh > /dev/null 2>&1 || echo continue
chmod +x /tmp/init.sh && /tmp/init.sh || echo continue
rm -rf /tmp/init.sh

ARCH=$(uname -m)

generate_entrypoint() {
  echo '#!/bin/sh' > /entrypoint.sh
  echo '/usr/bin/crproxy &' >> /entrypoint.sh
  echo 'if [ -n "$domain" ]; then' >> /entrypoint.sh
  echo '  sed -i "s/server_name _;/server_name $domain;/g" /etc/nginx/conf.d/default.conf' >> /entrypoint.sh
  echo 'fi' >> /entrypoint.sh
  echo '/usr/sbin/nginx -g "daemon off;"' >> /entrypoint.sh
}

case "$ARCH" in
  x86_64)
    mv /usr/bin/crproxy-amd64 /usr/bin/crproxy
    ;;
  i686|i386)
    mv /usr/bin/crproxy-386 /usr/bin/crproxy
    ;;
  armv7l|armv6l|armv5l)
    mv /usr/bin/crproxy-arm /usr/bin/crproxy
    ;;
  aarch64)
    mv /usr/bin/crproxy-arm64 /usr/bin/crproxy
    ;;
  *)
    echo "不支持的架构: $ARCH"
    exit 1
    ;;
esac

rm -rf /usr/bin/crproxy-*
generate_entrypoint
exec /entrypoint.sh