var newthing  = {};

var LEVEL = {
    EASY: 6,
    MEDIUM: 15,
    HARD: 30,
    INSANE: 60
};

var canvas, painter;
var food, isFoodEaten;
var snek, speedX, speedY, growFramesCounter;

var blockSize = 20;    
var snekBodyColor = 'white';
var snekHeadColor = 'pink';
var snekTailColor = 'brown';
var foodColor = 'red';
var score = 0;
var isGameOver = false;

var growSegments = 2;

var difficulty = null;
var resetGame = false;

class SnekBodySegment {
    
    constructor(intialCoordinatePosition) {
        if (!intialCoordinatePosition) {
            //TODO: throw something here
        }
        
        this.coordinatePosition = intialCoordinatePosition || null;
        this.previousSegment = null;
        this.nextSegment = null;
    }
    
}

class SnekBody {
    
    constructor(initialBodySegment) {
        this.head = null;
        this.tail = null;
        
        if (!initialBodySegment) {
            //TODO: throw something here
        }
        
        this._push(initialBodySegment);
    }
    
    updateBodySegmentCoordinates() {
        this._moveHead();
        this._moveTail();
    }

    _moveHead() {
        var newHeadCoordinates;

        newHeadCoordinates = this.getCurrentFrameHeadCoordinate();
        this._push(new SnekBodySegment(newHeadCoordinates));
    }

    getCurrentFrameHeadCoordinate() {
        var newPosX, newPosY, headCoordinates;
    
        headCoordinates = this.head.coordinatePosition;
        newPosX = headCoordinates.x + speedX;
        newPosY = headCoordinates.y + speedY;

        return { x: newPosX, y: newPosY };
    }

    _moveTail() {
        if (growFramesCounter > 0) {
            // leaves tail unmoved for growFramesCounter frames, effectively growing the size of the snek
            growFramesCounter--;
        } else {
            this._pop();
        }
    }

    _push(newBodySegment) {
        if (this.head === null) {
            this._pushToHeadOfEmptySnek(newBodySegment);
        } else {
            this._pushToHeadOfNonEmptySnek(newBodySegment);
        }
        // this.length
    }

    _pushToHeadOfEmptySnek(segment) {
        segment.previousSegment = null;
        segment.nextSegment = null;
        this.head = segment;
        this.tail = segment;
    }

    _pushToHeadOfNonEmptySnek(segment) {
        segment.previousSegment = null;
        segment.nextSegment = this.head;
        this.head.previousSegment = segment;
        this.head = segment;
    }

    _pop() {
        this.tail = this.tail.previousSegment;
        this.tail.nextSegment = null;
    }

}

function updateSnekUI() {
    snek.updateBodySegmentCoordinates();
    _drawSnek();
}

function _drawSnek() {
    var currentSegment, opts;

    currentSegment = snek.tail;
    opts = {
        blockSize: blockSize,
        lineWidth: '1'
    };

    while (currentSegment) {
        _drawSnekSegment(currentSegment, opts);
        currentSegment = currentSegment.previousSegment;
    }
}

function _drawSnekSegment(currentSegment, opts) {
    opts.fillStyle = _getSnekSegmentFillColor(currentSegment);
    _paintCanvasCell(currentSegment.coordinatePosition.x, currentSegment.coordinatePosition.y, opts);
}

function _getSnekSegmentFillColor(segment) {
    if (segment.previousSegment === null) {
        return snekHeadColor;
    } else if (segment.nextSegment === null) {
        return snekTailColor;
    } else {
        return snekBodyColor;
    }
}

function updateFood() {
    
    var opts;

    if (isFoodEaten) {
        food = {food, ..._generateNewFoodCoordinate()};
        isFoodEaten = false;
    }

    opts = {
        fillStyle: foodColor,
        blockSize: blockSize,
        lineWidth: '1'
    };

    _paintCanvasCell(food.x, food.y, opts)
}

function _generateNewFoodCoordinate() {
    var randX, randY, foodCoordinate;
    
    do {
        randX = Math.random() * (canvas.width - blockSize);
        randY = Math.random() * (canvas.height - blockSize);
        foodCoordinate = { x: (randX - (randX % blockSize)), y: (randY - (randY % blockSize)) };
    } while (_isCellOccupiedBySnek(foodCoordinate))
    return foodCoordinate;
}

function _paintCanvasCell(coordX, coordY, opts) {
    painter.fillStyle = opts.fillStyle;
    painter.fillRect(coordX, coordY, opts.blockSize, opts.blockSize);
    painter.beginPath();
    painter.lineWidth = opts.lineWidth;
    painter.rect(coordX, coordY, opts.blockSize, opts.blockSize);
    painter.stroke();
}

function updateScore() {
    $('#score').text(score);
}

function drawUI() {
    painter.clearRect(0, 0, canvas.width, canvas.height);
    if (!isGameOver) {
        updateSnekUI();
        updateFood();
        updateScore();
    } 
}

function processKeyStroke(e) {
    switch (e.key) {
        case 'Up':
        case 'ArrowUp':
        case 'w':
            _handleUpKeyStroke();
            break;
        
        case 'Down':
        case 'ArrowDown':
        case 's':
            _handleDownKeyStroke();
            break;

        case 'Left':
        case 'ArrowLeft':
        case 'a':
            _handleLeftKeyStroke();
            break;

        case 'Right':
        case 'ArrowRight':
        case 'd':
            _handleRightKeyStroke();
            break;
    }
}

function _handleUpKeyStroke() {
    if (!_isSnekMovingVertically()) {
        speedY = blockSize * -1;
        speedX = 0;
    }
}

function _handleDownKeyStroke() {
    if (!_isSnekMovingVertically()) {
        speedY = blockSize;
        speedX = 0;
    }
}

function _handleLeftKeyStroke() {
    if (!_isSnekMovingHorizontally()) {
        speedX = blockSize * -1;
        speedY = 0;
    }
}

function _handleRightKeyStroke() {
    if (!_isSnekMovingHorizontally()) {
        speedX = blockSize;
        speedY = 0;
    }
}

function _isSnekMovingVertically() {
    return speedY !== 0;
}

function _isSnekMovingHorizontally() {
    return speedX !== 0;
}

// Check for collisions with:
//  - food
//  - wall
//  - self
function handleCollisions() {
    var headCoordinates = snek.getCurrentFrameHeadCoordinate();

    handleFoodCollisions(headCoordinates);
    handleWallCollision(headCoordinates);
    handleSelfCollision(headCoordinates);
}

function handleFoodCollisions(headCoordinates) {
    if (_isSnekCollideWithFood(headCoordinates)) {
        _setBehaviorAfterFoodCollision();
    }
}

function _isSnekCollideWithFood(headCoordinates) {
    return _isSameCoordinate(headCoordinates, food);
}

function _setBehaviorAfterFoodCollision() {
    isFoodEaten = true;
    growFramesCounter = growSegments;
    _calculateNewScore();
}

function _calculateNewScore() {
    score += difficulty/3 ;
}

function handleWallCollision(headCoordinates) {
    if (_isSnekCollideWithWall(headCoordinates)) {
        _setBehaviorAfterWallCollision();
    }
}

function _isSnekCollideWithWall(headCoordinates) {
    return (headCoordinates.x < 0 ||
            headCoordinates.x === canvas.width ||
            headCoordinates.y < 0 ||
            headCoordinates.y === canvas.height);
}

function _setBehaviorAfterWallCollision() {
    _invokeEndGame();
}

function handleSelfCollision(headCoordinates) {
    if (_isCellOccupiedBySnek(headCoordinates)) {
        _setBehaviorAfterSelfCollision();
    }
}

function _isCellOccupiedBySnek(headCoordinates) {
    var segmentIter = snek.head.nextSegment;

    while (segmentIter !== null) {
        if (_isSameCoordinate(headCoordinates, segmentIter.coordinatePosition)) {
            return true;
        }

        segmentIter = segmentIter.nextSegment;
    }

    return false;
}

function _setBehaviorAfterSelfCollision() {
    _invokeEndGame();
}

function _isSameCoordinate(cell1, cell2) {
    return (cell1.x === cell2.x && cell1.y === cell2.y);
}

function _invokeEndGame() {
    isGameOver = true;
    resetGame = false;
    _getPlayAgainFromUser();
    // alert(`GAME OVER! Your score: ${score}`);
}

function _getPlayAgainFromUser() {
    _setupGameOverMenu();
    _requestPlayAgain();
}

function _setupGameOverMenu() {
    $('#final-score').text(score);
    $('#game-over-menu').show();
    difficulty = null;
    document.addEventListener('keydown', processPlayAgainKeyStroke);
}

function processPlayAgainKeyStroke(e) {
    switch (e.key) {
        case 'y':
            resetGame = true;
            break;
        case 'n':
            resetGame = false;
            break;
    }
}

function _requestPlayAgain() {

    setTimeout(function() {
        if (resetGame) {
            document.removeEventListener('keydown', processPlayAgainKeyStroke);
            init(true);
        } else {
            window.requestAnimationFrame(_requestPlayAgain);
        }
    }, 1000/120);

}

function run() {
    
    setTimeout(function() {
        if (!isGameOver) {
            handleCollisions();
            drawUI();
            window.requestAnimationFrame(run);
        } else {
            //init();
        }
    }, 1000/difficulty);

}

function init(isReset) {

    if (isReset) {
        score = 0;
        $('#game-over-menu').hide();
    }

    canvas = $("#playArea")[0];
    painter = canvas.getContext("2d");

    speedX = blockSize;
    speedY = 0;
    growSegments = 2;
    
    isFoodEaten = false;
    
    _getGameDifficultyFromUser();
}

function _getGameDifficultyFromUser() {
    this._setupDifficultyMenu();
    this._requestGameDifficulty();
}

function _setupDifficultyMenu() {
    $('#game-menu').show();
    document.addEventListener('keydown', processDifficultyKeyStroke);
}

function _requestGameDifficulty() {
    
    setTimeout(function() {
        if (difficulty === null) {
            window.requestAnimationFrame(_requestGameDifficulty);
        } else {
            document.removeEventListener('keydown', processDifficultyKeyStroke);
            startGame();
        }
    }, 1000/120);
    
}

function processDifficultyKeyStroke(e) {
    var easy = $('#difficulty-easy').text();
    var medium = $('#difficulty-medium').text();
    var hard = $('#difficulty-hard').text();
    var insane = $('#difficulty-insane').text();
    
    switch (e.key) {
        case easy:
            difficulty = LEVEL.EASY;
            break;
        case medium:
            difficulty = LEVEL.MEDIUM;
            break;
        case hard:
            difficulty = LEVEL.HARD;
            break;
        case insane:
            difficulty = LEVEL.INSANE;
            break;
    }
}

function startGame() {

    $('#game-menu').hide();
    $('#game-over-menu').hide();

    isGameOver = false;
    food = {
        x: 240,
        y: 240
    }
    snekNode = new SnekBodySegment({ x: 140, y: 240 });
    snek = new SnekBody(snekNode);

    // Register keystroke behavior
    document.addEventListener('keydown', processKeyStroke);

    run();

}
    
$(document).ready(init)