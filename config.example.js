module.exports = {
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
    scopeVariable: {
        pageTitle: 'DaiDR Cert Monitor',
    }
}