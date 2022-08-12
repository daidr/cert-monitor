# Cert Monitor

Cert Monitor 能够监控不同网站的证书，并将结果输出为 html 文件

[demo](https://cert.daidr.me/)

## 安装

1. 克隆本仓库
2. 进入项目目录
3. 复制一份 `config.example.js` 并重命名为 `config.js`
4. 打开 `config.js` 并根据需要进行修改
5. 启动 index.js
6. 使用 Nginx 代理 `./static` 目录

## 注意事项

* Cert Monitor 会每隔 5 分钟对配置的域名证书进行检测，并将结果输出到 `./static/index.html`，但是 Cert Monitor 自身并不提供静态资源服务，请使用 nginx 或类似软件为 `./static` 目录提供静态资源服务

* 建议使用 pm2 或类似程序来作为 Cert Monitor 的守护进程

## 协议

MIT License