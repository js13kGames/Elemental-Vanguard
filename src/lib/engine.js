define('engine',

['vent', 'Enemy', 'spritePool', 'Laser', 'util'],

function( vent, Enemy, pool, Laser, util ){

    'use strict';

    var init,
        bindEvents,
        createEnemy,
        canvas,
        checkLaserCollisions,
        checkPlayerCollisions,
        colliders,
        enemyCache,
        currentEffect,
        waveCount,
        getSquadron,
        getWave,
        enemiesPassed,
        passedEnemy,
        player,
        currentWave,
        msg,
        gameOver,
        lastCreated;


    /**
     * Initalize the game engine module
     * @param  {Object} game - exposed game interface
     * @return {void}
     */
    init = function( game ){
        enemiesPassed = 0;
        enemyCache = [];
        colliders = [];
        waveCount = 0;
        canvas = game.canvas;
        lastCreated = Date.now();
        currentWave = getWave();
        msg = vent.emit.bind(vent, 'message');
    };


    /**
     * Bind event handlers to global event emitter
     * @return {void}
     */
    bindEvents = function(){
        vent.on('player-added', function( obj ){
            player = obj;
        });
        vent.on('start', function( game ){
            init(game);
            vent.on('start-game', function(){
                vent.on('update', createEnemy);
            });
            vent.on('update', checkLaserCollisions);
            vent.on('update', checkPlayerCollisions);
            vent.on('laser-cache-updated', function( laserCache ){
                colliders = laserCache;
            });
            vent.on('activate', function( effect ) {
                currentEffect = effect;
            });
            vent.on('deactivate', function(){
                currentEffect = null;
            });
            vent.on('start-game', function(){
                msg('Wave 1', 2000);
            });
            vent.on('enemy-passed', passedEnemy);
            vent.on('game-over', gameOver);
        });
    };


    /**
     * Bound to `upaate` event - If 3 seconds has passed, create a new batch
     * of enemies.
     * @return {void}
     */
    createEnemy = function(){
        var enemy,
            squadron;

        if ( lastCreated > Date.now() - 3000 ) {
            return;
        }

        squadron = getSquadron(currentWave);
        if ( !squadron ) {
            waveCount++;
            currentWave = getWave();
            squadron = getSquadron(currentWave);
            vent.emit('new-wave', waveCount+1);
            vent.emit('message', 'Wave ' + parseInt(waveCount + 1), 2000);
        }

        for (var i = 0; i < squadron; i++) {
            if ( currentEffect !== 'air' ) {
                enemy = pool.recycle('enemies');

                if ( !enemy ) {
                    enemy = new Enemy(canvas);
                    pool.register('enemies', enemy);
                    enemyCache.push(enemy);
                }

                enemy.create(currentEffect || null);
            }
        }

        lastCreated = Date.now();
    };


    /**
     * Check for collisions between lasers and enemies - bound to `update`
     * @return {void}
     */
    checkLaserCollisions = function() {
        var dx,
            dy,
            distance;

        enemyCache.forEach(function( enemy ){
            colliders.forEach(function( collider ){
                dx = enemy.position.x - collider.position.x;
                dy = enemy.position.y - collider.position.y;
                distance = Math.sqrt(dx * dx + dy * dy);

                if ( distance < enemy.size + collider.size) {
                    vent.emit('kaboom!', enemy.position.x, enemy.position.y);
                    if ( collider instanceof Laser && !enemy.effected ) {
                        vent.emit('enemy-down');
                    }
                    enemy.destroy();
                    collider.destroy();
                }
            });
        });
    };


    /**
     * Check for collision between player and enemies - bound to `update`
     */
    checkPlayerCollisions = function(){
        if ( !player ) {
            return;
        }
        enemyCache.forEach(function( enemy ){
            var distX = Math.abs(
                    enemy.position.x - player.position.x-player.dims.width/2
                ),
                distY = Math.abs(
                    enemy.position.y - player.position.y-player.dims.height/2
                );

            if ( distX > (player.dims.width/2 + enemy.size) ||
                distY > (player.dims.height/2 + enemy.size) ) {
                return false;
            }

             if (distX <= (player.dims.width/2) ||
                 distY <= (player.dims.height/2)) {
                 if ( !player.fireActive ) {
                     player.destroy();
                     vent.off('update', checkPlayerCollisions);
                     vent.emit('game-over', 'Your hero is dead.');
                 } else {
                     vent.emit('kaboom!', enemy.position.x, enemy.position.y);
                     enemy.destroy();
                 }
             }
        });
    };


    /**
     * Returns a function to get a new sqadron enemy formation (just number
     * N enemies) from the current wave.
     * @return {Number}    [description]
     */
    getSquadron = (function(){
        var count = 0;
        vent.on('new-wave', function(){ count = 0; });
        return function( wave ){
            return wave[++count];
        };
    })();


    /**
     * Generate a new wave of enemies
     * @return {Array}
     */
    getWave = function(){
        var wave = [],
            count = 30;

        for (var i = 0; i < count; i++) {
            wave.push(parseInt(Math.round(
                util.random(1 + waveCount, 2 + waveCount)
            )));
        }

        return wave;
    };


    /**
     * If an enemy gets by the player increment the counter and emit events
     * @return {void}
     */
    passedEnemy = function(){
        enemiesPassed++;
        if ( enemiesPassed === 10) {
            vent.emit('game-over', 'Valiant effort, but you were overrun.');
        }
    };


    /**
     * Handler for game-over event. Destroy all enemys and stop creating
     * new ones.
     * @return {void}
     */
    gameOver = function(){
        enemyCache.forEach(function( enemy ){
            enemy.destroy();
        });
        vent.off('update', createEnemy);
    };


    bindEvents();

});
