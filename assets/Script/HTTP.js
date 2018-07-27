var HTTP = cc.Class({
    extends: cc.Component,

    statics: {
        sessionId: 0,
        userId: 0,
        master_url: URL,
        url: URL,
        sendRequest: function (path, data, handler, extraUrl,method) {
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;
            var str = '?';
            for (var k in data) {
                if (str != '?') {
                    str += '&';
                }
                str += k + '=' + data[k];
            }
            if (extraUrl == null) {
                extraUrl = HTTP.url;
            }
            var requestURL = extraUrl + path + encodeURI(str);
            cc.log('RequestURL:' + requestURL);
            xhr.open((method ? method :'POST'), requestURL, true);
            // if(json){
            //     xhr.setRequestHeader('content-type', 'application/json');
            // }
            
            // xhr.setRequestHeader('Content-Type', 'gzip,deflate', 'application/json; charset=utf-8');
            // if (cc.sys.isNative) {
            //     xhr.setRequestHeader('Accept-Encoding', 'gzip,deflate', 'text/html;charset=UTF-8');
            // }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    cc.log('http res(' + xhr.responseText.length + '):' + xhr.responseText);
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if (handler !== null) {
                            handler(ret);
                        }
                    } catch (e) {
                        cc.log('err:' + e);
                    } finally {

                    }
                }else if(xhr.status === 0){

                }
            };

            xhr.onerror = function(){
                setTimeout(function(){
                    cc.vv.http.sendRequest(path, data, handler, extraUrl,method);
                },2000);
            };

            xhr.send();
            return xhr;
        },
    },
});