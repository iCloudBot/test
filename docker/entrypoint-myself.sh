#!/bin/sh

/usr/bin/crproxy &

if [ -n "$domain" ]; then
  sed -i "s/server_name _;/server_name $domain;/g" /etc/nginx/conf.d/default.conf
fi

if [ -n "$dockerhub" ]; then
  if ! cp -f /tmp/default.conf /etc/nginx/conf.d/default.conf; then
    echo "Failed to replace /etc/nginx/conf.d/default.conf"
  fi
fi

/usr/sbin/nginx -g "daemon off;"
