chrome.browserAction.onClicked.addListener(onClick);

function doInCurrentTab(tabCallback) {
    chrome.tabs.query({ currentWindow: true, active: true },
        function(tabArray) { tabCallback(tabArray[0]); }
    );
}

function onClick(tab) {
    const apiUrl = "http://localhost:8080/api/main/setCookies/";
    doInCurrentTab(function(tab) {
        chrome.cookies.getAll({ url: tab.url }, function(cookies) {
            // console.info(cookies);
            if (cookies == null)
                return;
            // cookies.forEach(function(item, index) {
            // chrome.cookies.remove({ "url": apiUrl, "name": item.name });
            // chrome.cookies.set({
            //     "url": apiUrl,
            //     "name": item.name,
            //     "value": item.value,
            //     // "domain": "test.com",
            //     "path": item.path,
            //     "secure": item.secure
            // });
            // });
            $.ajax({
                type: "POST",
                data: JSON.stringify(cookies),
                url: apiUrl,
                contentType: "application/json",
                success: function success(server_response) {
                    // alert(server_response);
                }
            });
        });
    });
}