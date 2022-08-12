const https = require('https');
// 引入 config.js，不存在则引入 config.example.js
let config;
try {
    config = require('../config.js');
} catch (err) {
    if (err.code == 'MODULE_NOT_FOUND') {
        config = require('../config.example.js');
    } else {
        throw err;
    }
}
const fs = require("fs");

const Cert = (cert) => {
    const valid_from = new Date(cert.valid_from);
    const valid_to = new Date(cert.valid_to);
    return {
        subject: { ...cert.subject },
        issuer: { ...cert.issuer },
        validFrom: valid_from,
        validTo: valid_to,
        fingerprint: cert.fingerprint,
    }
}

const parseVariable = (str) => {
    const _re1 = /^{{([\w]*)}}$/g;
    const _re2 = /^__([\w]*)__$/g;
    if (str.match(_re1)) {
        // {{xxx}} 形式
        return { name: str.slice(2, -2), type: 1 };
    } else if (str.match(_re2)) {
        // __xxx__ 形式
        return { name: str.slice(2, -2), type: 2 };
    } else {
        return { type: 0 };
    }
}

const render = (template, scope = {}) => {
    const _re = /(__[\w]*__)|({{[\w]*}})/g;
    return template.replace(_re, (match) => {
        const _result = parseVariable(match);
        if (_result.type === 1) {
            // {{xxx}} 形式
            return scope[_result.name];
        } else if (_result.type === 2) {
            // __xxx__ 形式
            return JSON.stringify(scope[_result.name]);
        } else {
            return match;
        }
    })
}

const createScope = (result) => {
    const isAllCertsValid = result.data.every((cert) => {
        return cert.validTo > new Date();
    });

    const _status = isAllCertsValid ? 'up' : 'down';
    const _statusText = isAllCertsValid ? 'All certificates are vaild.' : 'Some certificates have expired.';
    const _statusUpdateTime = result.lastUpdateTime.toLocaleString("en", {
        year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit",
        hour12: false
    });
    let _footerLinkNodes = '<a href="https://github.com/daidr/cert-monitor" target="blank" rel="noopener">GitHub</a>';
    if (config.footer && config.footer.links && config.footer.links.length > 0) {
        _footerLinkNodes = config.footer.links.map((link) => {
            return `<a href="${link.href}" target="${link.target || 'blank'}" rel="noopener">${link.title}</a>`;
        }).join('');
    }

    const _footerCopyright = config.footer && config.footer.copyright ? config.footer.copyright : '© 戴兜的小屋';
    const _sourceData = JSON.stringify(result);
    let _preRenderNodes = result.data.map((item) => {
        const _remainingDays = Math.floor((item.validTo - new Date()) / (1000 * 60 * 60 * 24));
        return `<div class="card monitor has-tooltip">
                <div class="monitor-header" data-title="remain: ${_remainingDays} days">
                    <div class="monitor-header-title">${item.name}</div>
                    <div class="summary-subtitle">${item.summary || ""}</div>
                </div>
                <div class="monitor-content-wrap">
                    <div class="monitor-content">
                        <div class="monitor-progress up">
                            <div class="monitor-progress-in" style="width: ${(((item.validTo - item.validFrom) / 86400000) - _remainingDays) / ((item.validTo - item.validFrom) / 86400000) * 100}%"></div>
                        </div>
                        <div class="time-left">${item.validFrom.toLocaleString("en", { year: "numeric", month: "short", day: "numeric" })}</div>
                        <div class="time-right">${item.validTo.toLocaleString("en", { year: "numeric", month: "short", day: "numeric" })}</div>
                        <div class="more-info">Issuer: ${item.issuer['CN']}</div>
                        <div class="more-info">Subject: ${item.subject['CN']}</div>
                    </div>
                </div>
            </div>`
    }).join('');

    return {
        status: _status,
        statusText: _statusText,
        statusUpdateTime: _statusUpdateTime,
        preRenderNodes: _preRenderNodes,
        footerLinkNodes: _footerLinkNodes,
        footerCopyright: _footerCopyright,
        sourceData: _sourceData,
    }
}

const getCertInfo = (source, chain = false) => {
    return new Promise((resolve) => {
        try {
            const req = https.request(source, { agent: false }, function (res) {
                let cert = res.socket.getPeerCertificate(chain);
                res.on('data', () => { });
                let list = new Set();
                do {
                    list.add(Cert(cert));
                    cert = cert.issuerCertificate;
                } while (cert && typeof cert === "object" && !list.has(cert));
                resolve({ certs: [...list], err: undefined });
            });
            req.on('error', function (err) {
                resolve({ certs: undefined, err });
            })

            req.end();
        } catch (err) {
            resolve({ certs: undefined, err });
        }
    })
}

const getUniformPath = (source) => {
    if (typeof source === "string") {
        // string
        return source;
    } else if (source.origin) {
        // url
        return source.origin;
    }
    return 'unknown';
}

const customVariableHandler = (customVariables) => {
    // 添加变量前缀 'EX'
    const _customVariables = {};
    Object.keys(customVariables).forEach((key) => {
        if (!key.startsWith('EX')) {
            _customVariables[`EX${key}`] = customVariables[key];
        } else {
            _customVariables[key] = customVariables[key];
        }

    });
    return _customVariables;
}

let finalData = {};

async function mainLoop(i) {
    if (i == 0) {
        finalData["data"] = [];
        finalData["err"] = [];
    }
    if (i < config.domains.length) {
        const _result = await getCertInfo(config.domains[i].source);
        if (_result.err || !_result.certs) {
            // 有错误，推入 err 数组
            finalData["err"].push(getUniformPath(config.domains[i].source));
            // 输出错误
            console.log(getUniformPath(config.domains[i].source), _result.err);
        } else {
            // 没有错误，推入 data 数组
            finalData["data"].push({
                ..._result.certs[0],
                summary: config.domains[i].summary || '',
                name: config.domains[i].name || '',
                source: getUniformPath(config.domains[i].source),
            });
        }
        // 获取下一个 source 的证书信息
        setTimeout(() => {
            mainLoop(i + 1);
        }, 100);
    } else {
        // 此时所有的证书信息都已经获取完毕

        // 更新时间
        finalData["lastUpdateTime"] = new Date();

        // 写入文件 START

        // [TODO] data.json: 用于提供前端实时刷新的功能
        fs.writeFile("./static/data.json",
            JSON.stringify(finalData),
            { encoding: 'utf8', flag: 'w' },
            function (_err, _data) { });

        // index.html: 前端 html 文件
        fs.readFile("./src/template.html", function (_err, data) {
            const _template = data.toString();
            const scope = createScope(finalData);
            const _html = render(_template, {
                ...scope,
                ...customVariableHandler(config.scopeVariable || {})
            });
            fs.writeFile("./static/index.html",
                _html,
                { encoding: 'utf8', flag: 'w' },
                function (_err, _data) { });
        })

        // 写入文件 END

        // 计时 5 分钟后再次执行
        setTimeout(() => {
            mainLoop(0);
        }, 1000 * 60 * 5);
    }
}

async function main() {
    mainLoop(0);
}

main();