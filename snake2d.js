
/***************************** VARIABLE DECLARATION/INITIALIZATION *****************************/

//  canvas: HTML canvas
//  painter: canvas context
//  snek: array of positions IN REVERSE ORDER
//        mainly pop-tail and push-head operations, so reverse array has better optimized oprn's
//          [ {x: x_, y: y_}
//           ...  
//          {x: x0, y: y0} ]
//  food: {
//      x: food X pos
//      y: food Y pos
//  }
var canvas, painter;
var food, foodEaten;
var snek, snek_len, speedX, speedY, growSize, growCnt;

var blockSize = 20;    
var snakeFill = 'white';
var snakeFillHead = 'pink';
var snakeFillTail = 'brown';
var foodFill = 'red';
var timeNow = 0;
var gameOver = false;

/************************************** CLASS DEFINITIONS **************************************/

class SlistNode {
    
    constructor(val) {
        this.value = val || null;
        this.prev = null;
        this.next = null;
    }

}

class SlinkedSlist {
    
    constructor(node) {
        
        this.head = null;
        this.tail = null;
        
        if (node) {
            this.head = node;
            this.tail = node;
            node.prev = null;
            node.next = null;
        }
    }

    // state when empty
    // add to 0, 1, 1+
    pushHead(node) {

        if (this.head === null) {
            node.prev = null;
            node.next = null;
            this.head = node;
            this.tail = node;
        } else {
            node.prev = null;
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }

    }

    pushTail(node) {

        // don't call this on an empty slist - use pushHead
        node.prev = this.tail;
        node.next = null;
        this.tail.next = node;
        this.tail = node;

    }

    popTail() {

        this.tail = this.tail.prev;
        this.tail.next = null;
        
    }
}

/******************************************** CODE *********************************************/

function _growSnake() {

}

function drawSnek() {

    var snekX, snekY, snekHead, snekIter;
    
    snekHead = snek.head.value;
    
    // The checks below will need to move once we start to add in gameOver phase
    snekX = (snekHead.x + speedX) > (canvas.width - blockSize) ? 
        (canvas.width - blockSize) :
        ((snekHead.x + speedX) < 0) ? 0 : (snekHead.x + speedX);
    snekY = (snekHead.y + speedY) > (canvas.height - blockSize) ? 
        (canvas.height - blockSize) :
        ((snekHead.y + speedY) < 0) ? 0 : (snekHead.y + speedY);

    //var snekX = snekHead.x + speedX;
    //var snekY = snekHead.y + speedY;
    snek.pushHead(new SlistNode( { x: snekX, y: snekY } ))

    if (!growCnt) {
        snek.popTail();
    } else {
        growCnt--;
    }

    snekIter = snek.tail;
    while (snekIter) {
        //TODO: refactor/reuse
        painter.fillStyle = snekIter.prev === null ? snakeFillHead : snekIter.next === null ? snakeFillTail : snakeFill;
        painter.fillRect(snekIter.value.x, snekIter.value.y, blockSize, blockSize);
        painter.beginPath();
        painter.lineWidth = '1';
        painter.rect(snekIter.value.x, snekIter.value.y, blockSize, blockSize);
        painter.stroke();

        snekIter = snekIter.prev;
    }

}

function drawFood() {

    var rawX, rawY;
    if (foodEaten) {
        rawX = Math.random() * (canvas.width - blockSize);
        food.x = rawX - (rawX % blockSize);

        rawY = Math.floor(Math.random() * (canvas.height - blockSize));
        food.y = rawY - (rawY % blockSize);

        foodEaten = false;
    }

    painter.fillStyle = foodFill;
    painter.fillRect(food.x, food.y, blockSize, blockSize);
    painter.beginPath();
    painter.lineWidth = '1';
    painter.rect(food.x, food.y, blockSize, blockSize);
    painter.stroke();

}

function draw() {
    
    painter.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameOver) {
        drawSnek();
        drawFood();
    }
    
}

function processKeyStroke(e) {

    switch (e.key) {
        case 'Up':
        case 'ArrowUp':
        case 'w':
            if (speedY === 0) {
                speedY = blockSize * -1;
                speedX = 0;
            }
            break;
        
        case 'Down':
        case 'ArrowDown':
        case 's':
            if (speedY === 0) {
                speedY = blockSize;
                speedX = 0;
            }
            break;

        case 'Left':
        case 'ArrowLeft':
        case 'a':
            if (speedX === 0) {
                speedX = blockSize * -1;
                speedY = 0;
            }
            break;

        case 'Right':
        case 'ArrowRight':
        case 'd':
            if (speedX === 0) {
                speedX = blockSize;
                speedY = 0;
            }
            break;
    }

}

// Check for collisions with:
//  - food
//  - wall
//  - self
function handleCollisions() {
    //food
    if (snek.head.value.x === food.x && snek.head.value.y === food.y) {
        // newfood
        foodEaten = true;
        growCnt = growSize;
    }

    // wall

    // self

}

function run(timestamp) {
    
    setTimeout(function() {
        handleCollisions();
        draw();
        window.requestAnimationFrame(run);
    }, 1000/24);

}

function init() {

    var snekNode;

    gameOver = false;
    canvas = $("#playArea")[0];
    painter = canvas.getContext("2d");

    food = {
        x: 180,
        y: 240
    }
    foodEaten = false;

    snekNode = new SlistNode( {x: 140, y: 240} );
    snek = new SlinkedSlist(snekNode);
    speedX = blockSize;
    speedY = 0;
    growSize = 2;

    // Register keystroke behavior
    document.addEventListener('keydown', processKeyStroke);

    run();

}

$(document).ready(init)