## 👉 [自动化镜像构建](https://github.com/iCloudBot/test/issues/new?assignees=&labels=sync+image&projects=&template=docker-build.yml)

## 手动构建

### 1 版本号

```bash
docker buildx build \
  --build-arg VERSION=v0.8.0 \
  --platform linux/amd64,linux/386,linux/arm/v6,linux/arm/v7,linux/arm64 \
  -t cleverest/crproxy:v0.8.0 --push .
```

### 2 latest

```bash
docker buildx build \
  --build-arg VERSION=v0.8.0 \
  --platform linux/amd64,linux/386,linux/arm/v6,linux/arm/v7,linux/arm64 \
  -t cleverest/crproxy --push .
```

### 3 开发版本

```bash
docker buildx build \
    --build-arg VERSION=v0.8.0 \
    --platform linux/amd64 \
    -t cleverest/crproxy:dev --push .
```

### 4 本地构建不上传测试

```bash
docker buildx build \
      --build-arg VERSION=v0.8.0 \
      --load --platform linux/amd64 \
      -t crproxy:test .
```



### 5 运行容器

```bash
docker run -d --name crproxy \
    --restart always \
    -p 6443:443 \
    crproxy:test
```

