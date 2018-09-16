var blockSize = 20;    
var snakeFill = 'white';
var foodFill = 'red';

var start = function() {    
    var gameOver = false;
    var canvas = $("#playArea")[0];
    var painter = canvas.getContext("2d");

    var food = {
        x: 0,
        y: 0
    }
    var snek = {
        x: 0,
        y: 0,
        speedX: 5,
        speedY: 0
    }

    // game loop
    while (!gameOver) {

        //checkCollosion()
        
        //*if still not gameOver, then
        var gameState = {
            canvas: canvas,
            painter: painter,
            snek: snek,
            food: food
        };
        draw(gameState);
    }
}

function gameLoop(gameState) {

}

// Each iteration of the game loop, redraw the canvas
//  gameState: {
//      canvas: HTML canvas
//      painter: canvas context
//      snek: {
//          x: snek curr X pos
//          y: snek curr Y pos
//          speedX: snek curr X speed/delta
//          speedY: snek curr Y speed/delta
//      }
//      food: {
//          x: food curr X pos
//          y: food curr Y pos
//      }
// }
function draw(gameState) {
    gameState.painter.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    var snekX = (gameState.snek.x + gameState.snek.speedX) > (gameState.canvas.width - blockSize) ? 
        (gameState.canvas.width - blockSize) :
        ((gameState.snek.x + gameState.snek.speedX) < 0) ? 0 : (gameState.snek.x + gameState.snek.speedX);
    var snekY = (gameState.snek.y + gameState.snek.speedY) > (gameState.canvas.height - blockSize) ? 
        (gameState.canvas.height - blockSize) :
        ((gameState.snek.y + gameState.snek.speedY) < 0) ? 0 : (gameState.snek.y + gameState.snek.speedY);

    gameState.painter.fillStyle = snakeFill;
    gameState.painter.fillRect(snekX, snekY, blockSize, blockSize);
    
    gameState.painter.fillStyle = foodFill;
    gameState.painter.fillRect(gameState.food.x, gameState.food.y, blockSize, blockSize);
}

// Check for collisions with:
//  - food
//  - wall
//  - self
function checkCollision() {

}




$('document').ready(this.start);