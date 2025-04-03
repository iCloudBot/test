#!/bin/ash

ARCH=$(uname -m)

generate_entrypoint() {
  echo '#!/bin/ash' > /usr/bin/entrypoint
  echo '/usr/bin/crproxy &' >> /usr/bin/entrypoint
  echo 'if [ -n "$domain" ]; then' >> /usr/bin/entrypoint
  echo '  sed -i "s/server_name _;/server_name $domain;/g" /etc/nginx/conf.d/default.conf' >> /usr/bin/entrypoint
  echo 'fi' >> /usr/bin/entrypoint
  echo '/usr/sbin/nginx -g "daemon off;"' >> /usr/bin/entrypoint
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
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

if [ -n "$dockerhub" ]; then
  if ! cp -f /tmp/default.conf /etc/nginx/conf.d/default.conf; then
    echo "Failed to replace /etc/nginx/conf.d/default.conf"
    exit 1
  fi
fi

rm -rf /usr/bin/crproxy-*
generate_entrypoint
exec /usr/bin/entrypoint
