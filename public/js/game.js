/**
  * Draws a rounded rectangle using the current state of the canvas.
  * If you omit the last three params, it will draw a rectangle
  * outline with a 3 pixel border radius
  * @param {CanvasRenderingContext2D} ctx
  * @param {Number} x The top left x coordinate
  * @param {Number} y The top left y coordinate
  * @param {Number} width The width of the rectangle
  * @param {Number} height The height of the rectangle
  * @param {Number} radius The corner radius. Defaults to 3;
  * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
  * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 *
 * kudos to http://jsfiddle.net/mendesjuan/d4JJ8/5/
  */
CanvasRenderingContext2D.prototype.roundRect =

    function(x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == "undefined" ) {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 3;
        }
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        if (stroke) {
            this.stroke();
        }
        if (fill) {
            this.fill();
        }
    };


var direction = {
    left: 1,
    right: 2,
    up: 3,
    down: 4
};

var Game = {};

/**
 * Drawing context, aka pane.
 */
Game.ctx = null;

/**
 * Track players in the current game and
 * all the sockets in the queue for the
 * next game.
 */
Game.players = {};
Game.queue = {};
Game.food = [];

/**
 * The event bus to emit and listen to events.
 */
Game.bus = new EventEmitter();

/**
 * Some map and game options and data.
 */
Game.map = null;
Game.running = false;

// max x, max y, aka width/height of the matrix
Game.mx = 80;
Game.my = 50;

// width/height of a tile
Game.wx = 10;
Game.wy = 10;

Game.startTrackSize = 10;

Game.playerRectangleRadius = 4;

Game.foodImage = new Image();
Game.foodImage.src = "/img/bug.png";

/**
 * Keep track of the interval id
 * to get rid of it, if the game
 * ends.
 */
Game._animationInterval = null;
Game._roundTimeInterval = null;
Game.tickRate = 5;
Game.tick = 0;

/**
 * "start/end" represents the Start and
 * the End of an actual play-round.
 *
 * "run" is the game loop.
 */
Game.ready = function() {
    // there is already a started game
    if (Game.running) {
        return false;
    }

    if (Object.keys(Game.queue).length >= 1) {
        return true;
    }

    return false;
};

Game.start = function(ctx) {
    Game.ctx = ctx;

    // get all the players in the queue
    // and attach them to the game.

    var upDown = Game.rand(0, 1) === 1;
    var len = Object.keys(Game.queue).length;
    var i = 0;

    for (var id in Game.queue) {
        if (!Game.queue.hasOwnProperty(id)) {
            continue;
        }

        var player = Game.queue[id];

        Game.players[player.id] = Game.createPlayer(player.id, player.color, i, len, upDown);

        // and of course, remove it from the queue
        delete Game.queue[id];

        // inform possible frontends
        Game.bus.emitEvent("game.player-joined", [Game.players[player.id]]);

        i++;
    }

    Game.resetMap();
    Game.food = [];

    // Reset render ticker
    Game.tick = 0;
    Game.roundTimer = 3 * 60;

    // Everybody stand back, we start the game loop! Oh yeah,
    // and the poor mans timer.
    Game._animationInterval = requestAnimationFrame(Game.run);
    Game._roundInterval = setInterval(function() {
        Game.roundTimer--;
        Game.bus.emitEvent("game.time", [Game.roundTimer]);
    }, 1000);
    Game.running = true;

    Game.bus.emitEvent("game.started");
};

Game.end = function() {
    var winners = Game.getWinners();
    Game.bus.emitEvent("game.ended", [winners]);

    cancelAnimationFrame(Game._animationInterval);
    clearInterval(Game._roundInterval);

    Game.players = {};
    Game.queue = {};

    Game.running = false;
};

Game.run = function() {
    Game._animationInterval = requestAnimationFrame(Game.run);

    // increment tick
    Game.tick++;

    if (Game.tick < Game.tickRate) {
        return;
    }

    Game.bus.emitEvent("game.tick");

    Game.calculateState();
    Game.render();
    Game.resetMap();
    Game.checkFinishConditions();

    // reset ticker
    Game.tick = 0;
};

Game.disconnect = function(id) {
    if (id in Game.queue) {
        delete Game.queue[id];
    }

    if (id in Game.players) {
        Game.players[id].alive = false;
    }
};

/**
 * Create the new state.
 */
Game.calculateState = function() {
    Game.fillMap();
    Game.addFood();
    Game.movePlayers();
};

Game.fillMap = function() {
    for (var f = 0; f < Game.food.length; f++) {
        var food = Game.food[f];

        Game.map[food.x][food.y] = 2;
    }

    for (var idg in Game.players) {
        if (!Game.players.hasOwnProperty(idg)) {
            continue;
        }

        var player = Game.players[idg];

        for (var i = 0; i < player.track.length; i++) {
            var tile = player.track[i];

            Game.map[tile.x][tile.y] = 1;
        }
    }
};

Game.resetMap = function() {
    var map = [];

    for (var x = 0; x < Game.mx; x++) {
        map[x] = [];

        for (var y = 0; y < Game.my; y++) {
            map[x][y] = 0;
        }
    }

    Game.map = map;
};

/**
 * Do the rendering, if required.
 */
Game.render = function() {
    Game.resetPane();
    Game.drawFood();

    for (id in Game.players) {
        Game.drawPlayer(id);
    }
};

Game.resetPane = function() {
    Game.ctx.clearRect(0, 0, Game.mx * Game.wx, Game.my * Game.wy);
};

Game.drawPlayer = function(id) {
    if (!id in Game.players) {
        return;
    }

    var player = Game.players[id];

    for (var i = 0; i < player.track.length; i++) {
        var tile = player.track[i];

        Game.ctx.fillStyle = player.alive ? player.color : '#000000';
        Game.ctx.roundRect(tile.x * Game.wx, tile.y * Game.wy, Game.wx, Game.wy, Game.playerRectangleRadius, true);
    }
};

Game.drawFood = function() {
    var pattern = Game.ctx.createPattern(Game.foodImage, "repeat");

    for (var i = 0; i < Game.food.length; i++) {
        var item = Game.food[i];

        Game.ctx.fillStyle = pattern;
        Game.ctx.fillRect(item.x * Game.wx, item.y * Game.wy, Game.wx, Game.wy);
    }
};

/**
 * Game Logic!
 */
Game.checkFinishConditions = function() {
    var over = false;

    // first check if roundTime is over
    over = over || Game.roundTimer <= 0;

    var l = Object.keys(Game.players).length;
    var a = 0;
    for (var idx in Game.players) {
        if (!Game.players.hasOwnProperty(idx)) {
            continue;
        }

        if (true === Game.players[idx].alive) {
            a++;
        }
    }

    over = over || (l === 1 && a === 0);
    over = over || (l > 1 && a <= 1);

    if (true === over) {
        Game.end();
    }

    return over;
};

Game.movePlayers = function() {
    for (id in Game.players) {

        // just to be sure
        if (!Game.players.hasOwnProperty(id)) {
            return;
        }

        var player = Game.players[id];
        var head = player.track[0];

        var x = head.x;
        var y = head.y;

        // do nothing if player is dead
        if (!player.alive) {
            continue;
        }

        // first of all, remove the last part
        // of the track
        if (!player.hasEaten) {
            player.track.pop();
        }

        // reset food flag
        player.hasEaten = false;

        switch(player.nextDirection) {
            case direction.up:    y--; break;
            case direction.down:  y++; break;
            case direction.left:  x--; break;
            case direction.right: x++; break;
        }

        // store current direction
        player.direction = player.nextDirection;

        var newHead = Game.getTile(x, y);

        Game.eat(player, newHead);
        player.track.unshift(newHead);

        // check for collisions
        if (Game.collides(newHead.x, newHead.y)) {
            player.alive = false;
        }

        Game.players[id] = player;
    }
};

Game.addFood = function() {
    var foodLen = Math.max(1, Object.keys(Game.queue).length - 1);
    var dF = foodLen - Game.food.length;

    if (dF === 0) {
        // nothing to do
        return;
    }

    // TODO: Check for collisions
    for (var i = 0; i < dF; i++) {
        var x = Game.rand(0, Game.mx - 1);
        var y = Game.rand(0, Game.my - 1);

        // place new food item
        Game.food.push({x: x, y: y});
    }
};

// TODO: Test with multiple food items, can we safely splice?
Game.eat = function(player, tile) {
    for (var i = 0; i < Game.food.length; i++) {
        var food = Game.food[i];

        if (food.x === tile.x && food.y === tile.y) {
            // hit!
            player.hasEaten = true;
            player.score += 10;
            Game.food.splice(i, 1);

            Game.bus.emitEvent("game.score-changed", [player]);
        }
    }
};

/**
 * Some in-game helper functions
 * TODO check if x/y are already taken.
 */
Game.createPlayer = function(id, color, j, len, upDown) {
    var player = {
        id: id,
        alive: true,
        direction: null,
        nextDirection: null,
        hasEaten: false,
        color: color,
        score: 0,
        track: []
    };

    player.nextDirection = upDown ? Game.rand(3, 4) : Game.rand(1, 2);

    var head = {};
    (function(j, len, upDown) {
        var w = null;

        if (upDown === true) {

            w = Math.floor(Game.mx / len);

            head.y = Game.rand(0, Game.my);
            head.x = Game.rand(j * w, (j + 1) * w) - 1;
        }

        if (upDown === false) {
            w = Math.floor(Game.my / len);

            head.x = Game.rand(0, Game.mx);
            head.y = Game.rand(j * w, (j + 1) * w) - 1;
        }
    })(j, len, upDown);

    console.log(head);

    player.track.push(head);

    for (var i = 1; i < Game.startTrackSize; i++) {
        var x = head.x;
        var y = head.y;

        switch(player.direction) {
            case direction.up:    y += i; break;
            case direction.down:  y -= i; break;
            case direction.left:  x += i; break;
            case direction.right: x -= i; break;
        }

        player.track.push(Game.getTile(x, y));
    }

    return player;
};

Game.setDirection = function(playerId, dir) {
    if (playerId in Game.players) {

        var current = Game.players[playerId].direction;

        // nothing changed
        if (current === dir) {
            return;
        }

        // ugly as fuck :(
        if (current === direction.up && dir === direction.down) return;
        if (current === direction.down && dir === direction.up) return;
        if (current === direction.left && dir === direction.right) return;
        if (current === direction.right && dir === direction.left) return;

        Game.players[playerId].nextDirection = dir;
    }
};

Game.rand = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Game.getTile = function(x, y) {
    x = x % Game.mx;
    x = x < 0 ? Game.mx - 1 : x;

    y = y % Game.my;
    y = y < 0 ? Game.my - 1 : y;

    return {x: x, y: y};
};

Game.getWinners = function() {
    var winnerScore = 0;
    var winners = [];

    var playerLen = Object.keys(Game.players).length;

    for (var idx in Game.players) {
        if (!Game.players.hasOwnProperty(idx)) {
            return;
        }

        var player = Game.players[idx];

        if (playerLen === 1) {
            winners = [player];
            winnerScore = player.score;

            break;
        }

        if (!player.alive) {
            continue;
        }

        if (player.score > winnerScore) {
            winners = [player];
            winnerScore = player.score;

            continue;
        }

        if (player.score === winnerScore) {
            winners.push(player);
        }
    }

    return winners;
};

Game.collides = function(x, y) {
    return Game.map[x][y] === 1;
};

Game.createStartPositions = function(i) {

};

/**
 * EventListener
 */
Game.bus.addListener("game.queue-player", function(queued) {
    Game.queue[queued.id] = queued;
});

Game.bus.addListener("game.disconnect-player", function(data) {
    Game.disconnect(data.id);
});