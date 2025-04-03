FROM nginx:stable-alpine-slim AS builder

ARG VERSION=v0.8.0
ENV ARCH1=linux_386
ENV ARCH2=linux_amd64
ENV ARCH3=linux_arm
ENV ARCH4=linux_arm64

COPY entrypoint.sh /usr/bin/entrypoint

RUN apk upgrade --no-cache && \
    apk add tzdata wget openssl --no-cache && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime  && \
    sed -i '/default_type/a\    server_tokens off;' /etc/nginx/nginx.conf && \
    mkdir -p /etc/nginx/certs/ && \
    rm -rf /usr/share/nginx/html/* /bin/sh && \
    mkdir /usr/share/nginx/html/main && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/certs/privkey.pem -out /etc/nginx/certs/cert.pem -subj "/C=CN/ST=Chongqing/L=Chongqing/O=Organization/OU=Department/CN=0.0.0.0" && \
    wget -O /usr/bin/crproxy-386   https://github.com/DaoCloud/crproxy/releases/download/${VERSION}/crproxy_${ARCH1} && \
    wget -O /usr/bin/crproxy-amd64 https://github.com/DaoCloud/crproxy/releases/download/${VERSION}/crproxy_${ARCH2} && \
    wget -O /usr/bin/crproxy-arm   https://github.com/DaoCloud/crproxy/releases/download/${VERSION}/crproxy_${ARCH3} && \
    wget -O /usr/bin/crproxy-arm64 https://github.com/DaoCloud/crproxy/releases/download/${VERSION}/crproxy_${ARCH4} && \
    chmod +x /usr/bin/crproxy* /usr/bin/entrypoint

COPY dist/ /usr/share/nginx/html
# RUN ln -s /usr/share/nginx/html/* /usr/share/nginx/html/main/

COPY default.conf /etc/nginx/conf.d/default.conf
COPY default2.conf /tmp/default.conf
# COPY index.html /usr/share/nginx/html/index.html
COPY index.html /usr/share/nginx/html/main/index.html
# COPY favicon.ico /usr/share/nginx/html/favicon.ico
# COPY robots.txt /usr/share/nginx/html/robots.txt

FROM scratch
COPY --from=builder / /
LABEL maintainer="yanjh <hello@yjh.me>"
ARG VERSION=v0.8.0

EXPOSE 80 443

ENTRYPOINT ["entrypoint"]
