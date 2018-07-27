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
        // this._userInfo = null;
        this._time = 1;
        this._startTime = false;
        this._rigidBody = this.node.getComponent(cc.RigidBody);
        this._ball = this.node.getChildByName("ball");
        this._arrow = this.node.getChildByName("li");
        if(this._userInfo.userId === cc.vv.GLB.userInfo.userId){
            this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
                var location = this.node.convertToNodeSpace(event.getLocation());
                location.x = location.x.toFixed(2);
                location.y = location.y.toFixed(2);
                this.setArrowPosition(location,true);
                this._arrow.active = true;
                this._startTime = true;
                this._startMove = false;
            });
    
            this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                var moveLocation = this.node.convertToNodeSpace(event.getLocation());
                moveLocation.x = moveLocation.x.toFixed(2);
                moveLocation.y = moveLocation.y.toFixed(2);
                this.getAngle(this._startPoint.x, this._startPoint.y,moveLocation.x,moveLocation.y);
            }.bind(this));
    
            this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
                var location = this.node.convertToNodeSpace(event.getLocation());
                location.x = location.x.toFixed(2);
                location.y = location.y.toFixed(2);
                this.action(location,this._time.toFixed(2),true);
            }.bind(this));
    
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
                var location = this.node.convertToNodeSpace(event.getLocation());
                location.x = location.x.toFixed(2);
                location.y = location.y.toFixed(2);
                this.action(location,this._time.toFixed(2),true);
            }.bind(this));
        }
       
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
        this._rigidBody.linearDamping = 1;
        this._startMove = true;
        // this.node.rotation = 0;
        // time = time.toFixed(2);
        var detal = time;
        // console.log("action: sx="+this._startPoint.x+" ex="+this._endPoint.x+" sy="+this._startPoint.y+" ey="+this._endPoint.y+" detal="+detal);
        var angle = Math.sin(this.node.rotation);
        var detalx = (this._startPoint.x - this._endPoint.x)*detal;
        var detaly = (this._startPoint.y - this._endPoint.y)*detal;
        this._rigidBody.linearVelocity = cc.v2(detalx,detaly);
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
        return this.node.getComponent(cc.RigidBody);
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
    getAngle:function(px1, py1, px2, py2) { 
        //两点的x、y值 
        var x = px2-px1; 
        var y = py2-py1;
        var hypotenuse = Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2)); 
        if(hypotenuse === 0){
            return;
        }
        //斜边长度 
        var cos = x/hypotenuse; 
        var radian = Math.acos(cos); 
        //求出弧度 
        var angle = 180/(Math.PI/radian); 
        //用弧度算出角度 
        if (y<0) { 
            angle = -angle; 
        } else if ((y == 0) && (x<0)) { 
            angle = 180; 
        } 

        // this._arrow.rotation =180 -angle;
        angle = 180 -angle;

        this._arrow.width += 5; 
        this.setArrow(angle.toFixed(2),this._arrow.width);
        // cc.log("angle="+angle);
        var event = {
            action: cc.vv.GLB.PLAYER_MOVE_EVENT,
            angle: this._arrow.rotation,
            width:this._arrow.width
        }
        cc.vv.matchvsMgr.sendEvent(event);
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
            }
            this._prvPoint.x = x;
            this._prvPoint.y = y;
        }
    },
    destroyBall:function(){
        this.destroy();
        this.node.removeFromParent(true);
    }
});
