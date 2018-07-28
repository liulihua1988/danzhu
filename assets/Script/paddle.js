cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    // use this for initialization
    onLoad: function () {
        this._startPoint = cc.v2(0,0);
        this._endPoint = cc.v2(0,0);
        this._prvPoint = cc.v2(0,0);
        this._nowPoint = cc.v2(0,0);
        this._startMove = false;
        this._actionMove = false;
        this._touchBegin = true;
        this._angle = 0;
        this._radian = 0;
        // this._userInfo = null;
        this._time = 1;
        this._startTime = false;
        this._ball = this.node.getChildByName("ball");
        this._arrow = this.node.getChildByName("li");
        this._rigidBody = this.node.getComponent(cc.RigidBody);
        
        if(this._userInfo.userId === cc.vv.GLB.userInfo.userId){
            var node = this.node.parent;
            var width = node.width/2;
            var height = node.height/2;
            cc.vv.matchvsMgr.on(cc.Node.EventType.TOUCH_START, function(event) {
                var location = node.convertToNodeSpace(event.getLocation());
                location.x -= width;
                location.y -= height;
                this.touchStart(location);
                if(this.isTurn()){
                    this.beginStart();
                }
                
            }.bind(this));
    
            cc.vv.matchvsMgr.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                if(this.isTurn()){
                    if(this._touchBegin){
                        this.beginStart();
                    }
                    var moveLocation = node.convertToNodeSpace(event.getLocation());
                    moveLocation.x -= width;
                    moveLocation.y -= height;
                    this.getAngle(this.node.x, this.node.y,moveLocation.x,moveLocation.y);
                }
                
            }.bind(this));
    
            cc.vv.matchvsMgr.on(cc.Node.EventType.TOUCH_END, function (event) {
                if(this.isTurn()){
                    if(this._touchBegin){
                        this.beginStart();
                    }
                    var location = node.convertToNodeSpace(event.getLocation());
                    location.x -= width;
                    location.y -= height;
                    this.action(location,this._time,true);
                }
                
            }.bind(this));
    
            cc.vv.matchvsMgr.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
                if(this.isTurn()){
                    if(this._touchBegin){
                        this.beginStart();
                    }
                    var location = node.convertToNodeSpace(event.getLocation());
                    location.x -= width;
                    location.y -= height;
                    this.action(location,this._time,true);
                }
                
            }.bind(this));
        }
        this._handleNode = cc.vv.matchvsMgr.getHandleNode();
    },
    isTurn:function(){
        return cc.vv.matchvsMgr.isTurn() && !this._actionMove && !this._startMove;
    },
    setUserInfo:function(userInfo){
        this._userInfo = userInfo;
        this.node.getChildByName("id").getComponent(cc.Label).string = userInfo.userProfile.account;
        // if(userInfo.userId !== GLB.userInfo.id){
        //     this.node.targetOff(this.node);
        // }
    },
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
        this._startMove = true;
    },
    action:function(endPoint,time,send){
        this._endPoint = endPoint;
        this._startTime  = false;
        this._arrow.width = 64; 
        this._arrow.active = false;
        // this._handleNode.active = false;
        this._rigidBody.linearDamping = 1;
        this._startMove = true;
        this._actionMove = true;
        // var join = this._handleNode.getComponent(cc.DistanceJoint)
        // join.enabled = false;
        // join.connectedBody = null;
        // join.apply();
        

        this._handleNode.getChildByName("s1").active = false;
        this._handleNode.getChildByName("s2").active = true;
        var self = this;
        this.node.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function(){
            self._handleNode.getChildByName("s1").active = true;
            self._handleNode.getChildByName("s2").active = false;
            self._handleNode.active = false;
        })));
        // this.node.rotation = 0;
        // time = time.toFixed(2);
        var detal = time;
        // // console.log("action: sx="+this._startPoint.x+" ex="+this._endPoint.x+" sy="+this._startPoint.y+" ey="+this._endPoint.y+" detal="+detal);
        // var angle = Math.sin(this._arrow.rotation);
        // var detalx = (this._startPoint.x - this._endPoint.x)*detal;
        // var detaly = (this._startPoint.y - this._endPoint.y)*detal;
        var pDistance = cc.pDistance(this._startPoint,this._endPoint)/2;
        this._rigidBody.linearVelocity = cc.v2(this._arrow.x*pDistance,this._arrow.y*pDistance);
        this._time = 1;
        if(send){
            var event = {
                position:this.node.getPosition(),
                action: cc.vv.GLB.PLAYER_ACTION,
                endPoint:endPoint,
                time:detal
            }
            cc.vv.matchvsMgr.sendEvent(event);
        }
    },
    setPosition:function(position){
        this.node.x = position.x;
        this.node.y = position.y;
    },
    getPosition:function(){
        return this.node.getPosition();
    },
    getRigidBody:function(){
        return this._rigidBody;
    },
    setArrowPosition:function(startPoint,send){
        this._startPoint = startPoint;
        var x = startPoint.x - this.node.width / 2;
        var y = startPoint.y - this.node.height / 2;
        this._arrow.active = true;
        this._arrow.x = x;
        this._arrow.y = y;
        if(send){
            var event = {
                action: cc.vv.GLB.ARROW_POSITION_EVENT,
                x:startPoint.x,
                y:startPoint.y
            }
            cc.vv.matchvsMgr.sendEvent(event);
        }
      
    },
    getAngle:function(px,py,mx,my){//获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
        
        var x = Math.abs(px-mx);
        var y = Math.abs(py-my);
        var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        var cos = y/z;
        var radina = Math.asin(cos);//用反三角函数求弧度
        var angle = 180/Math.PI*radina;//将弧度转换成角度
        // cc.log("mx="+mx+" my="+my+" px="+px+" py="+py+" angle="+angle+" radina="+radina);
        if(mx>=px&&my>=py){//鼠标在第一象限
            angle = - angle;
        }
        if(mx<=px&&my>=py){//鼠标在第二象限
            radina = Math.PI - radina;
            angle = angle - 180;
           
        }
        if(mx<=px&&my<=py){//鼠标在第三象限
            radina = Math.PI + radina;
            angle = 180 - angle;
        }
        if(mx>=px&&my<=py){//鼠标在第四象限
            radina = 2*Math.PI - radina;
            angle = angle;
        }
        this.setHandleAngle(angle,radina);
    },
    touchStart:function(location){
        this._startPoint = location;
        this._touchBegin = true;
    },
    beginStart:function(){
        this._arrow.active = true;
        this._handleNode.active = true;
        this._startTime = true;
        this._startMove = false;
        this._actionMove = false;
        this._touchBegin = false;

        this.getAngle(this.node.x, this.node.y,this._startPoint.x,this._startPoint.y);
        cc.vv.matchvsMgr.setNextTurn(false);
    },
    npcStart:function(){
        var angle = cc.random0To1() * 360;
        // cc.log("angle="+angle);
        var radian = Math.PI/180*angle;
        var startX = this.node.x+15*Math.cos(radian);
        var startY = this.node.y+15*Math.sin(radian);

        var distance = cc.random0To1()*40+15;
        var endX = this.node.x+distance*Math.cos(radian);
        var endY = this.node.y+distance*Math.sin(radian);

        // cc.log("startX="+startX+" startY="+startY+" endX="+endX+" endY="+endY+" x="+this.node.x+" y="+this.node.y);

        this.touchStart(cc.v2(startX,startY));
        this.beginStart();
        this.getAngle(this.node.x,this.node.y,endX,endY);

        var self = this;
        this.node.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function(){
            self.action(cc.v2(endX,endY),self._time,false);
        })));
        
    },
    setHandleAngle:function(angle,radian){
        this._angle = angle;
        this._radian = radian;
        this._handleNode.rotation = angle;
        this._handleNode.x = this.node.x + 15*Math.cos(radian);
        this._handleNode.y = this.node.y + 15*Math.sin(radian);

        this._arrow.rotation = 180+angle;
        this._arrow.x = 15*Math.cos(radian - Math.PI);
        this._arrow.y = 15*Math.sin(radian - Math.PI);
    },
    setPaddleSprite:function(url){
        if(!this._ball){
            this._ball = this.node.getChildByName("ball");
        }
        
        var pSprite = this._ball.getComponent(cc.Sprite);
        pSprite.type = cc.Sprite.Type.SIMPLE;
        pSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.loader.load(url,function(err,tex){
            pSprite.spriteFrame = new cc.SpriteFrame(tex);
        });
    },
    setArrow:function(angle,width){
        this._arrow.rotation = angle;
        this._arrow.width = width; 
    },
    update:function(dt){
        if(this._startTime){
            this._time+=dt;
        }
        if(this._startMove){
            var p = cc.pDistance(this._rigidBody.getLinearVelocityFromWorldPoint(cc.v2(0,0)),cc.v2(0,0))
            // cc.log(p);
            this._ball.rotation += p/50;
            var x = this.node.x;
            var y = this.node.y;
            this._nowPoint.x = x;
            this._nowPoint.y = y;
            // var p = cc.pDistance(this._prvPoint,this._nowPoint);
            if(p <= 1.0){
                this._startMove = false;
                if(this._actionMove){
                    cc.vv.matchvsMgr.setNextTurn(true);
                    this._actionMove = false;
                }
                
            }
            this._prvPoint.x = x;
            this._prvPoint.y = y;
        }
    },
    destroyBall:function(){
        cc.vv.matchvsMgr.off(cc.Node.EventType.TOUCH_START);
        cc.vv.matchvsMgr.off(cc.Node.EventType.TOUCH_MOVE);
        cc.vv.matchvsMgr.off(cc.Node.EventType.TOUCH_END);
        cc.vv.matchvsMgr.off(cc.Node.EventType.TOUCH_CANCEL);
        this.node.removeFromParent(true);
        this.node.destroy();
        this.destroy();
    }
});
