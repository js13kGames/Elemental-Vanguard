define('Asteroid',

['Sprite', 'vent', 'util'],

function( Sprite, vent, util ){

    'use strict';

    var proto;


    /**
     * Asteroid constructor (extends Sprite)
     */
    function Asteroid(){
        Sprite.apply(this, arguments);
        this.size = util.random(15, 30);
        this.isCreated = false;
        this.physics = {
            speed: 2,
            friction: 2,
            velocity: 0,
            velocityGoal: util.random(-0.5, -0.25)
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
        this.angle = Math.cos(Math.random());
    }

    proto = Asteroid.prototype = Object.create(Sprite.prototype);


    /**
     * Creates object in entity space at x: xPos, fires event to let canvas know
     * that it has been added.
     * @param  {Number} xPos  x-coordinate position
     * @return {self}
     */
    proto.create = function( xPos ){
        this.position.x = xPos;
        vent.emit('laser-added', this);
        return this;
    };


    /**
     * Method which gets invoked during `update` events, changes positional
     * coordinates of the object.
     * @return {void}
     */
    proto.update = function(){
        if ( this.position.y < 0 - this.size*2 ) {
            this.destroy();
        } else {
            this.position.y = this.position.y + this.physics.velocityGoal;
        }
    };


    /**
     * Draws the asteroid to the canvas
     * @return {void}
     */
    proto.render = function(){
        util.polygon(this.ctx, this.position.x, this.position.y, this.size, 7,
            this.fillStyle[0], null, this.angle
        );
        util.polygon(this.ctx, this.position.x, this.position.y, this.size*0.8, 5,
            this.fillStyle[1], {}, this.angle
        );
        util.polygon(this.ctx, this.position.x, this.position.y, this.size*0.3, 4,
            this.fillStyle[2], {}, this.angle
        );
    };


    /**
     * Destroys the asteroid, emits event so the canvas knows not to render the
     * object
     * @return {void}
     */
    proto.destroy = function(){
        this.position.x = 0;
        this.position.y = 0;
        this.destroyed = true;
        vent.emit('laser-destroyed', this);
    };


    return Asteroid;

});
