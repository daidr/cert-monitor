const createScope = (result) => {
    const isAllCertsValid = result.data.every((cert) => {
        return new Date(cert.validTo) > new Date();
    });

    const _status = isAllCertsValid ? 'up' : 'down';
    const _statusText = isAllCertsValid ? 'All certificates are vaild.' : 'Some certificates have expired.';
    const _statusUpdateTime = new Date(result.lastUpdateTime).toLocaleString("en", {
        year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit",
        hour12: false
    });

    let _preRenderNodes = result.data.map((item) => {
        const _remainingDays = Math.floor((new Date(item.validTo) - new Date()) / (1000 * 60 * 60 * 24));
        return `<div class="card monitor has-tooltip">
                <div class="monitor-header" data-title="remain: ${_remainingDays} days">
                    <div class="monitor-header-title">${item.name}</div>
                    <div class="summary-subtitle">${item.summary || ""}</div>
                </div>
                <div class="monitor-content-wrap">
                    <div class="monitor-content">
                        <div class="monitor-progress up">
                            <div class="monitor-progress-in" style="width: ${(((new Date(item.validTo) - new Date(item.validFrom)) / 86400000) - _remainingDays) / ((new Date(item.validTo) - new Date(item.validFrom)) / 86400000) * 100}%"></div>
                        </div>
                        <div class="time-left">${new Date(item.validFrom).toLocaleString("en", { year: "numeric", month: "short", day: "numeric" })}</div>
                        <div class="time-right">${new Date(item.validTo).toLocaleString("en", { year: "numeric", month: "short", day: "numeric" })}</div>
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
    }
}

function refresh(content) {
    content = content || JSON.parse(SourceData);
    const scope = createScope(content);
    const statusEl = document.getElementById('status');
    const statusTextEl = document.querySelector('.summary-detail');
    const statusUpdateTimeEl = document.querySelector(".summary-checktime");
    const preRenderNodesEl = document.querySelector(".monitors-container");

    if (scope.status == 'up') {
        statusEl.classList.add('up');
        statusEl.classList.remove('down');
    } else {
        statusEl.classList.add('down');
        statusEl.classList.remove('up');
    }
    statusTextEl.textContent = scope.statusText;
    statusUpdateTimeEl.textContent = `Last check at ${scope.statusUpdateTime}`;
    preRenderNodesEl.innerHTML = scope.preRenderNodes;

    (function () {
        for (var e = document.querySelectorAll(".monitor"), t = 0; t < e.length; ++t) {
            e[t].addEventListener("click", function () {
                this.classList.toggle("open")
            }, false)
        }
    })()
}

refresh()