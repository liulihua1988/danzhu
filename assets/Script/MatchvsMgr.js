
cc.Class({
    extends: cc.Component,

    properties: {
      
    },
    init:function(){
        this._userId = 0;
        this._token = "";
        this._notify = [];
        this._paddles = {};
        this._paddleUrl = "https://ress1.xtw.new.uqee.com/koudai/paddle/p1.png";
        this._dong = null;

        this._account = cc.args['account'];
        if (this._account == null) {
            this._account = cc.sys.localStorage.getItem('account');
        }
        if (this._account == null) {
            this._account = Date.now();
            cc.sys.localStorage.setItem('account', this._account);
        }


        cc.vv.mvs.response.initResponse = this.initResponse.bind(this);
        cc.vv.mvs.response.registerUserResponse = this.registerUserResponse.bind(this); // 用户注册之后的回调
        cc.vv.mvs.response.loginResponse = this.loginResponse.bind(this); // 用户登录之后的回调
        cc.vv.mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        cc.vv.mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        cc.vv.mvs.response.joinOverResponse = this.joinOverResponse.bind(this); // 关闭房间之后的回调
        cc.vv.mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
        cc.vv.mvs.response.leaveRoomResponse = this.leaveRoomResponse.bind(this);
        cc.vv.mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);

        var result = cc.vv.mvs.engine.init(cc.vv.mvs.response, cc.vv.GLB.channel, cc.vv.GLB.platform, cc.vv.GLB.gameId)
        this._account += "";
    },
    setDong:function(dong){
        this._dong = dong;
    },
    initResponse: function(status) {
        if(status === 200){
            cc.vv.dataMgr.bindAccount(this._account,cc.md5(this._account));
            // var result = cc.vv.mvs.engine.registerUser();
            // if (result !== 0)
            //     console.log('注册用户失败，错误码:' + result);
            // else
            // console.log('注册用户成功');
        }else{
            console.log('初始化matchvs失败');
        }
        
    },
    registerUserResponse:function(userInfo){
        var deviceId = 'abcdef';
        var gatewayId = 0;

        cc.vv.GLB.userInfo = userInfo;

        console.log('开始登录,用户Id:' + userInfo.id)
        var result = cc.vv.mvs.engine.login(userInfo.id, userInfo.token,
            cc.vv.GLB.gameId, cc.vv.GLB.gameVersion,
            cc.vv.GLB.appKey, cc.vv.GLB.secret,
            deviceId, gatewayId);

        if (result !== 0)
            return console.log('登录失败,错误码:' + status);


        // cc.vv.dataMgr.setUserData(this._account);
    },
    login:function(){
        var deviceId = 'abcdef';
        var gatewayId = 0;
        var result = cc.vv.mvs.engine.login(cc.vv.GLB.userInfo.userId, cc.vv.GLB.userInfo.token,
            cc.vv.GLB.gameId, cc.vv.GLB.gameVersion,
            cc.vv.GLB.appKey, cc.vv.GLB.secret,
            deviceId, gatewayId);

        if (result !== 0)
            return console.log('登录失败,错误码:' + status);
    },
    loginResponse:function(info){
        if (info.status !== 200)
            return console.log('登录失败,异步回调错误码:' + info.status)
        else
            console.log('登录成功')

        // this.joinRandomRoom();

        cc.vv.dataMgr.hashGet("paddle");
    },
    createRoom:function(createRoomInfo, userProfile){
        // createRoomInfo	object	创建房间的信息	
        // userProfile	string	玩家简介	""
        //     roomName	string	房间名称	“MatchvsRoom”
        //     maxPlayer	number	最大玩家数	3
        //     mode	number	模式	1
        //     canWatch	number	是否可以观战 1-可以 2-不可以	2
        //     visibility	number	是否可见默认 0不可见 1可见	1
        //     roomProperty	string	房间属性	“roomProperty”


    },
    createRoomResponse:function(CreateRoomRsp){
        // status	number	状态返回，200表示成功
        // 400 客户端参数错误 
        // 500 服务器内部错误	200
        // roomID	number	房间号	210039
        // owner	number	房主	210000
    },
    joinRandomRoom:function(count){
        cc.vv.GLB.MAX_PLAYER_COUNT = count;
        var position = this.getPaddlePosition();
        var userProfile = JSON.stringify({position:position,account:this._account,paddleUrl:this._paddleUrl});
        var result = cc.vv.mvs.engine.joinRandomRoom(cc.vv.GLB.MAX_PLAYER_COUNT, userProfile)
        if (result !== 0)
            return console.log('进入房间失败,错误码:' + result)

        this.addPaddle({userId:cc.vv.GLB.userInfo.userId,userProfile:{account:this._account,position:position,paddleUrl:this._paddleUrl}},position);

        // this._dong.connectedBody = this._paddles[cc.vv.GLB.userInfo.userId].getRigidBody();
        // this._dong.apply();

        // cc.log("22222");
    },
    
    joinRoom:function(roomID,userProfile){
        var result = cc.vv.mvs.engine.joinRoom(roomID, userProfile)
        if (result !== 0)
            return console.log('进入房间失败,错误码:' + result)
    },
    joinRoomResponse: function (status, userInfoList, roomInfo) {
        if (status !== 200) {
            return console.log('进入房间失败,异步回调错误码: ' + status);
        } else {
            console.log('进入房间成功');
            console.log('房间号: ' + roomInfo.roomID);
       }

        var userIds = [cc.vv.GLB.userInfo.userId]
        
        console.log('房间用户: ' + userIds);

        if (userInfoList.length + 1 >= cc.vv.GLB.MAX_PLAYER_COUNT) {
            var result = cc.vv.mvs.engine.joinOver("");
            console.log("发出关闭房间的通知");
            if (result !== 0) {
                console.log("关闭房间失败，错误码：", result);
            }

            cc.vv.GLB.playerUserIds = userIds;
        }
        // var position = this.getPaddlePosition();
        // this.notifyPosition(position);
       

        userInfoList.forEach(function(item) {
            if(item.userProfile === ""){
                this.kickPlayer(item.userId);
            }else{
                item.userProfile = JSON.parse(item.userProfile);
                this.addPaddle(item,item.userProfile.position);
            }
            
        }.bind(this));
    },
    notifyPosition:function(position){
        this.sendEvent({
            action: cc.vv.GLB.PLAYER_POSITION_EVENT,
            x: position.x,
            y: position.y
        });
    },
    joinRoomNotify:function(roomUserInfo){
        console.log("房间新加的用户的信息："+JSON.stringify(roomUserInfo));
        if(roomUserInfo.userProfile === ""){
            this.kickPlayer(roomUserInfo.userId);
        }else{
            roomUserInfo.userProfile = JSON.parse(roomUserInfo.userProfile);
            this.addPaddle(roomUserInfo,roomUserInfo.userProfile.position);
        }
        this.notifyPosition(this._paddles[cc.vv.GLB.userInfo.userId].getPosition());
    },
    joinOverResponse: function(joinOverRsp) {
        if (joinOverRsp.status === 200) {
            console.log("关闭房间成功");
        } else {
            console.log("关闭房间失败，回调通知错误码：", joinOverRsp.status);
        }
    },
    sendEvent:function(msg){
        var info  = JSON.stringify(msg)
        // console.log("send="+info);
        cc.vv.mvs.engine.sendEvent(info);
    },
    sendEventNotify: function (info) {
        // console.log("rev",info);
        if (info&& info.cpProto){
            if(info.cpProto.indexOf(cc.vv.GLB.PLAYER_MOVE_EVENT) >= 0) {
                var cpProto =  JSON.parse(info.cpProto);
                this._paddles[info.srcUserId].setArrow(cpProto.angle,cpProto.width); 
            }else if(info.cpProto.indexOf(cc.vv.GLB.ARROW_POSITION_EVENT) >= 0){
                var cpProto =  JSON.parse(info.cpProto);
                this._paddles[info.srcUserId].setArrowPosition(cc.v2(cpProto.x,cpProto.y));
            }else if(info.cpProto.indexOf(cc.vv.GLB.PLAYER_ACTION) >= 0){
                var cpProto =  JSON.parse(info.cpProto);
                this._paddles[info.srcUserId].setPosition(cpProto.position);
                this._paddles[info.srcUserId].action(cpProto.endPoint,cpProto.time,false);
            }else if(info.cpProto.indexOf(cc.vv.GLB.PLAYER_POSITION_EVENT) >= 0){
                var cpProto =  JSON.parse(info.cpProto);
                this._paddles[info.srcUserId].setPosition(cc.v2(cpProto.x,cpProto.y));
            }else if(info.cpProto.indexOf(cc.vv.GLB.PLAYER_CHANGE_SKIN) >= 0){
                var cpProto =  JSON.parse(info.cpProto);
                this._paddles[info.srcUserId].setPaddleSprite(cpProto.url);
            }
        }
    },
    leaveRoom:function(){
        var cpProto = "";
        cc.vv.mvs.engine.leaveRoom(cpProto);
    },
    leaveRoomResponse:function(leaveRoomRsp){
            // status	number	状态返回，200表示成功
            // 400 客户端参数错误 
            // 404 房间不存在 
            // 500 服务器内部错误	200
            // roomID	string	房间号	317288
            // userId	number	用户ID	317288
            // cpProto	string	负载信息
        this._dong.connectedBody = null;
        this._dong.apply();
        if(leaveRoomRsp.status === 200){
            for(var i in this._paddles){
                this._paddles[i].destroyBall();
            }
        }
        this._paddles = {};
        
    },
    leaveRoomNotify:function(roomUserInfo){
        // userId	number	房间号	200
        // roomID	string	刚刚离开房间的用户的信息	
        // owner	number	房主	
        // cpProto	string	附加信息
        var paddlejs = this._paddles[roomUserInfo.userId];
        if(paddlejs){
            paddlejs.destroyBall();
            if(this._dong.connectedBody === paddlejs.getRigidBody()){
                this._dong.connectedBody = null;
                this._dong.apply();
            }
            delete this._paddles[roomUserInfo.userId];
        }
        
    },
    addPaddle:function(userInfo,position){
        if(!this._paddles[userInfo.userId]){
            var paddle = cc.instantiate(this.paddlePrefab)
            paddle.x = position.x;
            paddle.y = position.y;
            var paddlejs = paddle.getComponent("paddle");
            paddlejs.setUserInfo(userInfo);
            paddlejs.setPaddleSprite(userInfo.userProfile.paddleUrl);
            this._paddles[userInfo.userId] = paddlejs;
            this.node.addChild(paddle)
        }else{
            this._paddles[userInfo.userId].setPosition(position);
        }
       
    },
    kickPlayer:function(userId){
        cc.vv.mvs.engine.kickPlayer(userId);
    },
    netWorkStateNotify:function(netnotify){
        // roomID	string	房间ID	
        // userID	number	断开网络的玩家ID	
        // state	number	网络断开状态 1-网络异常，正在重连 2-重连成功 3-重连失败，退出房间	
        // owner	number	房主ID
    },
    gameServerNotify:function(){
            // srcUserId	number	gameServer推送时 这个值为0	0
            // cpProto	string	推送的消息内容	“gameServer”
    },
    setNode:function(node){
        this.node = node;
    },
    setPaddleSprite:function(url){
        var paddleJs = this._paddles[cc.vv.GLB.userInfo.userId];
        if(paddleJs){
            paddleJs.setPaddleSprite(url);
            var event = {
                action: cc.vv.GLB.PLAYER_CHANGE_SKIN,
                url: url,
            }
            cc.vv.matchvsMgr.sendEvent(event);
        }
    },
    setPaddlePrefab:function(prefab){
        this.paddlePrefab = prefab;
    },
    getPaddlePosition: function () {
        var randX = cc.randomMinus1To1() * 450;
        var randY = cc.randomMinus1To1() * 270;
        return cc.p(randX, randY)
    },
    registerNotify:function(func){
        this._notify.push(func);
    },
    generateUUID:function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
     },
});
