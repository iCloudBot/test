# Docker镜像加速器 🚀

该服务的镜像，依赖开源项目 **[DaoCloud（crproxy）](https://github.com/DaoCloud/crproxy)**，持续维护的镜像源：**[crproxy（Docker Hub）](https://hub.docker.com/r/cleverest/crproxy)** 。

Render可能会封禁部署镜像，备用镜像地址： **`cleverest/docker-proxy`** 、 **`registry.cn-shanghai.aliyuncs.com/dockerip/crproxy`** 、 **`registry.cn-shanghai.aliyuncs.com/sharespace/docker-proxy`**

B站频道，请移步👉：[演示视频](https://www.bilibili.com/video/BV1QhgqeCE61/) 

部署方案1： **`Render`** 部署，请移步👉：[教程链接](https://mp.weixin.qq.com/s/dmlP_lyf6YElgnnpkOEfRw)

部署方案2： **`服务器`** 部署，请移步👉：[教程链接](dockerdeploy.html)

## 1.支持的镜像源站
|  序号  | 源站                      | 平台                              |
| :--: | ----------------------- | ------------------------------- |
|  1   | docker.io               | Docker Hub                      |
|  2   | gcr.io                  | Google Container Registry       |
|  3   | ghcr.io                 | GitHub Container Registry       |
|  4   | k8s.gcr.io              | Kubernetes Container Registry   |
|  5   | registry.k8s.io         | 新 Kubernetes Container Registry |
|  6   | quay.io                 | Red Hat Container Registry      |
|  7   | mcr.microsoft.com       | Microsoft Container Registry    |
|  8   | docker.elastic.co       | Elastic Container Registry      |
|  9   | nvcr.io                 | NVIDIA Container Registry       |
|  10  | registry.jujucharms.com | Juju Charms                     |
|  11  | cr.l5d.io               | Linkerd  Container Registry     |


## 2.加速器配置

在 **`/etc/docker/daemon.json`** 文件中， **`registry-mirrors`** 部分，请将代理地址替换为你搭建的 **实际地址** ，如果URL是 **`https://registry-proxy.onrender.com`** ，可以直接复制下列代码块内容，进行配置。

```bash
cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://registry-proxy.onrender.com"],
  "insecure-registries": ["registry-proxy.onrender.com"],
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF
```

```bash
# 重启Docker服务
systemctl daemon-reload && systemctl restart docker
```

## 3.拉取测试

📢 **注意事项：** 若配置了加速器地址，并且镜像源于 **`Docker Hub`** 时，**可以无需加上域名前缀**，其他镜像源站必须加上前缀，例如：

- 源于 **`Docker Hub`** 镜像地址： **`alpine:3.18`** 与 **`adguard/adguardhome`** ，则

```bash
docker pull alpine:3.18
docker pull adguard/adguardhome

# 当然也是可以加上前缀，如：
docker pull registry-proxy.onrender.com/docker.io/alpine:3.18
docker pull registry-proxy.onrender.com/docker.io/adguard/adguardhome
```

- 拉取非 **`Docker Hub`** 平台镜像时， **必须加域名前缀**，各个知名镜像站拉取测试，如下：

```bash
# Google
docker pull registry-proxy.onrender.com/gcr.io/kaniko-project/executor:debug
# GitHub
docker pull registry-proxy.onrender.com/ghcr.io/openfaas/queue-worker
# Kubernetes
docker pull registry-proxy.onrender.com/k8s.gcr.io/etcd:3.5.7-0
# 新Kubernetes
docker pull registry-proxy.onrender.com/registry.k8s.io/kube-apiserver:v1.30.0
# Red Hat
docker pull registry-proxy.onrender.com/quay.io/calico/cni
# Microsoft
docker pull registry-proxy.onrender.com/mcr.microsoft.com/powershell
# Elastic 
docker pull registry-proxy.onrender.com/docker.elastic.co/elasticsearch/elasticsearch:8.1.0
# NVIDIA
docker pull registry-proxy.onrender.com/nvcr.io/nvidia/cuda:12.1.0-runtime-ubuntu20.04
```


## 4.特别鸣谢 💖

- [wzshiming（crproxy）](https://github.com/wzshiming/crproxy/tree/master/examples/default)
- [DaoCloud（crproxy）](https://github.com/DaoCloud/crproxy)
- [kubesre（docker-registry-mirrors）](https://github.com/kubesre/docker-registry-mirrors)
- [dqzboy（Docker-Proxy）](https://github.com/dqzboy/Docker-Proxy/blob/main/Render/README.md)


