function urlParse() {
    var params = {};
    if (window.location == null) {
        return params;
    }
    var name, value;
    var str = window.location.href;
    var num = str.indexOf('?');
    str = str.substr(num + 1);
    var arr = str.split('&');
    for (var i = 0; i < arr.length; i++) {
        num = arr[i].indexOf('=');
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            params[name] = value;
        }
    }
    return params;
}

function initMgr (){
    cc.vv = {};
    cc.args = urlParse();

    require('md5');

    cc.vv.mvs = require("Mvs");
    cc.vv.GLB = require("GLBConfig");

    var matchvs = require('MatchvsMgr');
    cc.vv.matchvsMgr = new matchvs();
    cc.vv.matchvsMgr.init();

    cc.vv.http = require('HTTP');

    var dataMgr = require('DataMgr');
    cc.vv.dataMgr = new dataMgr();
    cc.vv.dataMgr.init();
};
cc.Class({
    extends: cc.Component,

    properties: {
      cc_paddlePrefab:cc.Prefab,
      cc_tileMap:cc.TiledMap,
      cc_handleNode:cc.Node
    },

    // use this for initialization
    onLoad: function () {
        initMgr();
        cc.vv.matchvsMgr.setNode(this.node.getChildByName("mapNode"));
        cc.vv.matchvsMgr.setPaddlePrefab(this.cc_paddlePrefab);
        cc.vv.matchvsMgr.setHandleNode(this.cc_handleNode);
        cc.director.getPhysicsManager().enabled = true;
        this.cc_handleNode.active = false;

        this._dongNode = this.node.getChildByName("mapNode").getChildByName("dong").getComponent(cc.DistanceJoint);

        cc.vv.matchvsMgr.setDong(this._dongNode);
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //                                                 cc.PhysicsManager.DrawBits.e_pairBit |
        //                                                 cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        //                                                 cc.PhysicsManager.DrawBits.e_jointBit |
        //                                                 cc.PhysicsManager.DrawBits.e_shapeBit
                                                        ;
        // var objects = this.cc_tileMap.getObjectGroup("obstacle");
        // console.log("obstacle",objects.getObjects());
        // this.addRigidBody(objects.getObjects());
        this.addPaddle();
    },
    addRigidBody:function(objects){

        var layer = this.cc_tileMap.getLayer("ground");
        // layer.removeTileAt(cc.v2(9,10));

        // console.log(layer.getPositionAt(cc.v2(9,10)));
        // console.log(layer.getMapTileSize());

        var node = new cc.Node();
        var gidigBody = node.addComponent(cc.RigidBody);
        gidigBody.type = cc.RigidBodyType.Static;
        for(var i = objects.length-1;i>=0;i--){
            var object = objects[i];
            var physicsBoxCollier = node.addComponent(cc.PhysicsCircleCollider);
            physicsBoxCollier.radius = 40;// = new cc.Size(object.objectSize.width,object.objectSize.height);
            var tx = ~~(object.offset.x/50)+1;
            var ty = ~~(object.offset.y/50)+1;
            console.log(tx+" "+ty);
            var position = layer.getPositionAt(cc.v2(tx,ty));
            position = this.node.convertToNodeSpaceAR(position);
            position.x = position.x - 10;
            position.y = position.y + 65;
            console.log(position);
            physicsBoxCollier.offset = position;
        }
        node.parent = this.node;
    },
    getAngle:function(px1, py1, px2, py2) { 
        //两点的x、y值 
        var x = Math.abs(px1-px2); 
        var y = Math.abs(py1-py2);
        var hypotenuse = Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2)); 
        //斜边长度 
        var cos = x/hypotenuse; 
        var radian = Math.acos(cos); 
        //求出弧度 
       
        return radian;
    },
    addPaddle:function(){
        var paddle = this.node.getChildByName("paddle");
        var url = "https://ress1.xtw.new.uqee.com/koudai/paddle/p";
        for(var i =0;i<11;i++){
            var dstUrl = url+(i+1)+".png";
            var node = new cc.Node();
            node.x = i*55;
            node.width = 50;
            node.height = 50;
            node.url = dstUrl;
            node.parent = paddle;
            var pSprite = node.addComponent(cc.Sprite);
            this.setpaddleSpriteFrame(pSprite,dstUrl);
            node.addComponent(cc.Button);
            this.addClickEvent(node,this.node,'HelloWorld','onChangleClicked');
        }
    },
    setpaddleSpriteFrame:function(pSprite,dstUrl){
        pSprite.type = cc.Sprite.Type.SIMPLE;
        pSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.loader.load(dstUrl,function(err,tex){
            pSprite.spriteFrame = new cc.SpriteFrame(tex);
        });
    },
    onClicked:function(event){
        var name = event.target.name;
        if(name === "btnShow"){
            var rotation = event.target.rotation;
            rotation = (rotation+180)%360;
            this.showPaddle(rotation === 0 ? true:false);
            event.target.rotation = rotation;
        }else if(name === "joinBtn"){
            cc.vv.matchvsMgr.joinRandomRoom(1);
        }else if(name === "leaveBtn"){
            cc.vv.matchvsMgr.leaveRoom();
        }else if(name === "twoBtn"){
            cc.vv.matchvsMgr.joinRandomRoom(2);
        }else if(name === "threeBtn"){
            cc.vv.matchvsMgr.joinRandomRoom(3);
        }
    },
    showPaddle:function(show){
        var paddle = this.node.getChildByName("paddle")
        var childrens = paddle.children;
        var length = childrens.length;
        var time = 0.2;
        for(var i = 0;i<length;i++){
            var node = childrens[i];
            node.stopAllActions();
            if(show){
                node.active = true;
                node.runAction(cc.moveTo(time,i*55,0));
            }else{
                node.runAction(cc.sequence(cc.moveTo(time,-55,0),cc.callFunc(function(target){
                    target.active = false;
                })));
            }
            
        }
    },
    onChangleClicked:function(event){
        var url = event.target.url;
        cc.vv.matchvsMgr.setPaddleSprite(url);
        cc.vv.matchvsMgr.paddleUrl = url;
        cc.vv.dataMgr.hashSet("paddle",url);
    },
    addClickEvent: function (node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var button = node.getComponent(cc.Button);
        button.transition = cc.Button.Transition.COLOR;
        button.pressedColor = new cc.color(211,211,211);
        button.clickEvents.push(eventHandler);
    },
    update: function (dt) {

    },
});
