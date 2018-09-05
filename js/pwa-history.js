document.addEventListener("DOMContentLoaded", function (event) {
    var websiteTitle = document.title;
    if (window.ons.platform.isWebView() && window.history) {
        document.getElementById('Navigator').addEventListener('postpush', function (e) {
            if (e.detail.enterPage.id === 'splitter') return;
            var title = e.detail.enterPage.querySelector('.navigation-bar__title').innerText;
            document.title = websiteTitle + ' - ' + title;
            window.history.pushState(null, document.title);
        });
        var historyAPI = true;
        document.getElementById('Navigator').addEventListener('postpop', function (e) {
            historyAPI = !!e.detail.enterPage.data.historyAPI;
            if (!e.detail.enterPage.data.historyAPI) history.back();
        });
        window.addEventListener('popstate', function (e) {
            if (historyAPI) document.getElementById('Navigator').popPage({ data: { historyAPI: true } });
            historyAPI = true;
        });
    }
});