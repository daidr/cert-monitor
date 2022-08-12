module.exports = {
    /** 
     * domains  用于配置需要被检测的域名 
     *     name     用于配置名称，会显示在结果中
     *     source   用于配置域名的源，可以是一个字符串，也可以是一个 URL 对象
     *     summary  (可选) 用于配置结果中的摘要，会显示在结果中
    */
    "domains": [
        {
            "name": "戴兜的小屋",
            "source": "https://daidr.me",
        },
        {
            "name": "DouAPI",
            "source": "https://api.daidr.me",
            "summary": "Cloudflare节点",
        },
        {
            "name": "DouAPI",
            "source": new URL("https://up.api.daidr.me"),
            "summary": "又拍云节点",
        },
        {
            "name": "Sentry 服务",
            "source": new URL("https://sentry.daidr.me"),
        },
    ],
    /**
     * footer 用于配置页脚信息
     *     copyright   用于配置页脚的版权信息
     *     links       用于配置页脚的链接信息
     */
    footer: {
        copyright: '© 戴兜的小屋',
        links: [
            {
                title: 'Blog',
                href: 'https://daidr.me',
                target: '_blank'
            },
            {
                title: 'GitHub',
                href: 'https://github.com/daidr/cert-monitor',
                target: '_blank'
            }
        ]
    },
    /**
     * scopeVariable 用于配置模板中的自定义变量
     * 
     * 此处的变量在映射到模板变量时，会添加 “EX” 前缀
     * 例如下方预定义的变量 pageTitle 将会映射到模板变量 EXpageTitle
     * 
     * 你可以打开 template.html 来查看模板变量的定义
     */
    scopeVariable: {
        pageTitle: 'DaiDR Cert Monitor',
    }
}