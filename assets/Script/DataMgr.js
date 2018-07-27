function DataMgr(){
    console.log("DataMgr init");
};

DataMgr.prototype.init = function(){
    this._alpha = 1;
    if(this._alpha){
        this._http = "http://alphavsopen.matchvs.com";
    }else{
        this._http = "http://vsopen.matchvs.com";
    }
};

DataMgr.prototype.setUserData = function(url){
    var gameId = cc.vv.GLB.gameId;
    var userId = cc.vv.GLB.userInfo.userId;
    var appKey = cc.vv.GLB.appKey;
    var appSecret = cc.vv.GLB.secret;
    var dataList = JSON.stringify([
        {"key":"paddle","value":url}
    ]);
    var signParams = appKey+'&gameID='+gameId+'&userID='+userId+"&"+appSecret
    var sign = cc.md5(signParams);
    var data = {
        gameID:gameId,
        userID:userId,
        dataList:dataList,
        sign:sign
    };
    var onLogin = function(msg){
       console.log(msg);
    }
    cc.vv.http.sendRequest("/wc5/setGameData.do", data, onLogin.bind(this),this._http);

};
DataMgr.prototype.getUserData = function(){
    var gameId = cc.vv.GLB.gameId;
    var userId = cc.vv.GLB.userInfo.userId;
    var appKey = cc.vv.GLB.appKey;
    var token = cc.vv.GLB.userInfo.token;
    var keyList = JSON.stringify([
        {"key":"paddle"}
    ]);
    var signParams = appKey+'&gameID='+gameId+'&userID='+userId+"&"+token
    var sign = cc.md5(signParams);
    var data = {
        gameID:gameId,
        userID:userId,
        keyList:keyList,
        sign:sign
    };
    var onLogin = function(msg){
       console.log(msg);
    }
    cc.vv.http.sendRequest("/wc5/getUserData.do", data, onLogin.bind(this),this._http);
}

DataMgr.prototype.hashSet = function(key,value){
    var gameId = cc.vv.GLB.gameId;
    var userId = cc.vv.GLB.userInfo.userId;
    var appKey = cc.vv.GLB.appKey;
    var token = cc.vv.GLB.userInfo.token;
    var signParams = appKey+'&gameID='+gameId+"&key="+key+'&userID='+userId+"&value="+value+"&"+token
    var sign = cc.md5(signParams);
    var data = {
        gameID:gameId,
        key:key,
        userID:userId,
        value:value,
        sign:sign
    };
    var onLogin = function(msg){
       console.log(msg);
    }
    var http = "https://vsopen.matchvs.com";
    if(this._alpha){
        http = " http://alphavsopen.matchvs.com";
    }
    cc.vv.http.sendRequest("/wc5/hashSet.do", data, onLogin.bind(this),http);

};
DataMgr.prototype.hashGet = function(key){
    var gameId = cc.vv.GLB.gameId;
    var userId = cc.vv.GLB.userInfo.userId;
    var appKey = cc.vv.GLB.appKey;
    var token = cc.vv.GLB.userInfo.token;
    var signParams = appKey+'&gameID='+gameId+"&key="+key+'&userID='+userId+"&"+token
    var sign = cc.md5(signParams);
    var data = {
        gameID:gameId,
        userID:userId,
        key:key,
        sign:sign
    };
    var onLogin = function(msg){
       console.log(msg);
       if(key === "paddle" && msg["data"] !== ""){
            cc.vv.matchvsMgr._paddleUrl = msg['data'];
       }
    }
    var http = "https://vsopen.matchvs.com";
    if(this._alpha){
        http = " http://alphavsopen.matchvs.com";
    }
    cc.vv.http.sendRequest("/wc5/hashGet.do", data, onLogin.bind(this),http);
}

DataMgr.prototype.bindAccount = function(openId,sessionKey){
    var gameId = cc.vv.GLB.gameId;
    var appKey = cc.vv.GLB.appKey;
    var secretKey = cc.vv.GLB.secret;
    var thirdFlag = 1;
    var params = appKey+"&gameID="+gameId+"&openID="+openId+"&session="+sessionKey+"&thirdFlag="+thirdFlag+"&"+secretKey;
    //计算签名
    var signstr = cc.md5(params);//MD5 需要自己找方法
    //重组参数 userID 传0
    //用于post请求，不能使用get请求，如果使用get请求可能会出现签名失败，因为微信session_key有需要url编码的字符
    var jsonParam = {
        userID:0,
        gameID:gameId,
        openID:openId,
        session:sessionKey,
        thirdFlag:thirdFlag,
        sign:signstr
    };
    var onLogin = function(msg){
       console.log(msg);
       cc.vv.GLB.userInfo = msg['data'];
       cc.vv.GLB.userInfo.userId = cc.vv.GLB.userInfo.userid;
       cc.vv.matchvsMgr.login();
    }
    var http = "https://vsuser.matchvs.com";
    if(this._alpha){
        http = " http://alphavsuser.matchvs.com";
    }
    cc.vv.http.sendRequest("/wc6/thirdBind.do", jsonParam, onLogin.bind(this),http);
}

module.exports = DataMgr;
