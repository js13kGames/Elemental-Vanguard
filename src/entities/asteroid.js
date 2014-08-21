define('Asteroid',

['Sprite', 'vent', 'util'],

function( Sprite, vent, util ){

    'use strict';

    var proto;

    function Asteroid(){
        Sprite.apply(this, arguments);
        this.ctx = this.canvas.ctx;
        this.size = util.random(30, 50);
        this.isCreated = false;
        this.physics = {
            speed: 2,
            friction: 2,
            velocity: 0,
            velocityGoal: util.random(-1, -0.5)
         };
        this.fillStyle = [
            '#372720',
            'rgba(73, 52, 42, 0.5)',
            'rgba(104, 74, 59, 0.3)'
        ];
        this.position = {
            x: 0,
            y: this.canvas.height + this.size
        };
        this.displayProps = {
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 40,
            shadowColor: '#684a3b'
        };
        this.angle = Math.cos(Math.random());
    }

    proto = Asteroid.prototype = Object.create(Sprite.prototype);


    proto.create = function( xPos ){
        this.position.x = xPos;
        vent.emit('laser-added', this);
        return this;
    };


    proto.update = function(){
        this.physics.velocity = util.approach(
          this.physics.velocityGoal, this.physics.velocity, this.physics.friction
        );
        if ( this.position.y < 0 - this.size*2 ) {
            this.destroy();
        } else {
            this.position.y = this.position.y + this.physics.velocity;
        }
    };


    proto.render = function(){
        util.polygon(this.ctx, this.position.x, this.position.y, this.size, 7,
            this.fillStyle[0], this.displayProps, this.angle
        );
        util.polygon(this.ctx, this.position.x, this.position.y, this.size*0.8, 5,
            this.fillStyle[1], {}, this.angle
        );
        util.polygon(this.ctx, this.position.x, this.position.y, this.size*0.3, 4,
            this.fillStyle[2], {}, this.angle
        );
    };


    proto.destroy = function(){
        this.position.x = 0;
        this.position.y = 0;
        this.destroyed = true;
        vent.emit('laser-destroyed', this);
    };


    return Asteroid;

});