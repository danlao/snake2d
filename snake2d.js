var blockSize = 20;    
var snakeFill = 'white';
var foodFill = 'red';
var timeNow = 0;

//  canvas: HTML canvas
//  painter: canvas context
//  snek: {
//      x: snek curr X pos
//      y: snek curr Y pos
//      speedX: snek curr X speed/delta
//      speedY: snek curr Y speed/delta
//  }
//  food: {
//      x: food curr X pos
//      y: food curr Y pos
//  }
var canvas, painter, food, snek;

function draw() {
    painter.clearRect(0, 0, canvas.width, canvas.height);

    var snekX = (snek.x + snek.speedX) > (canvas.width - blockSize) ? 
        (canvas.width - blockSize) :
        ((snek.x + snek.speedX) < 0) ? 0 : (snek.x + snek.speedX);
    var snekY = (snek.y + snek.speedY) > (canvas.height - blockSize) ? 
        (canvas.height - blockSize) :
        ((snek.y + snek.speedY) < 0) ? 0 : (snek.y + snek.speedY);

    snek.x = snekX;
    snek.y = snekY;

    painter.fillStyle = snakeFill;
    painter.fillRect(snekX, snekY, blockSize, blockSize);
    painter.beginPath();
    painter.lineWidth = '1';
    painter.rect(snekX, snekY, blockSize, blockSize);
    painter.stroke();
    
    painter.fillStyle = foodFill;
    painter.fillRect(food.x, food.y, blockSize, blockSize);
    painter.beginPath();
    painter.lineWidth = '1';
    painter.rect(food.x, food.y, blockSize, blockSize);
    painter.stroke();
}

function processKeyStroke(e) {

    switch (e.key) {
        case 'Up':
        case 'ArrowUp':
        case 'w':
            if (snek.speedY === 0) {
                snek.speedY = blockSize * -1;
                snek.speedX = 0;
            }
            break;
        
        case 'Down':
        case 'ArrowDown':
        case 's':
            if (snek.speedY === 0) {
                snek.speedY = blockSize;
                snek.speedX = 0;
            }
            break;

        case 'Left':
        case 'ArrowLeft':
        case 'a':
            if (snek.speedX === 0) {
                snek.speedX = blockSize * -1;
                snek.speedY = 0;
            }
            break;

        case 'Right':
        case 'ArrowRight':
        case 'd':
            if (snek.speedX === 0) {
                snek.speedX = blockSize;
                snek.speedY = 0;
            }
            break;
    }

}

// Check for collisions with:
//  - food
//  - wall
//  - self
function checkCollision() {
    
    //food
    if (snek.x === food.x && snek.y === food.y) {
        // newfood
        var rawX = Math.random() * (canvas.scrollWidth - blockSize);
        food.x = rawX - (rawX % blockSize);

        var rawY = Math.floor(Math.random() * (canvas.scrollHeight - blockSize));
        food.y = rawY - (rawY % blockSize);
    }

    // wall

    // self

}

function run(timestamp) {
    
    setTimeout(function() {
        draw();
        checkCollision();
        window.requestAnimationFrame(run);
    }, 1000/24);

}

function init() {

    gameOver = false;
    canvas = $("#playArea")[0];
    painter = canvas.getContext("2d");

    food = {
        x: 180,
        y: 240
    }

    snek = {
        x: 140,
        y: 240,
        speedX: blockSize,
        speedY: 0
    }

    // Register keystroke behavior
    document.addEventListener('keydown', processKeyStroke);

    run();

}

$(document).ready(init)