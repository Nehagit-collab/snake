const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highscoreElement = document.querySelector(".high-score");
const eatSound = document.getElementById("eatSound");
const wallSound = document.getElementById("wallSound");
const selfHitSound = document.getElementById("selfHitSound");
const controls = document.querySelectorAll(".controls i");
const startGameBtn = document.getElementById("startGameBtn");
const replayBtn = document.getElementById("replayBtn");
const exitBtn = document.getElementById('exit');
const settingsBtn = document.getElementById('settings');

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let specialFoodX, specialFoodY;
let isSpecialFoodActive = false;
let specialFoodTimer;
let doubleFoodActive = false;
let gameStarted = false;
let specialFoodDuration = 6000;
let gameSpeed = 125;

let highscore = parseInt(localStorage.getItem("high-score")) || 0;
highscoreElement.innerText = `HighScore : ${highscore}`;
console.log("Initial High Score:", highscore);

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const difficulty = getQueryParam('difficulty');
const snakeColor = getQueryParam('snakeColor') || 'green';

switch (difficulty) {
    case 'easy':
        gameSpeed = 200;
        break;
    case 'normal':
        gameSpeed = 125;
        break;
    case 'hard':
        gameSpeed = 75;
        break;
    case 'insane':
        gameSpeed = 40;
        break;
    default:
        gameSpeed = 125;
}

const changeDirection = (e) => {
    if (!gameStarted) return;
    if (e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

const changeFoodPosition = () => {
    const spawnSpecialFood = Math.random() < 0.2;

    if (spawnSpecialFood && !isSpecialFoodActive) {
        specialFoodX = Math.floor(Math.random() * 35) + 1;
        specialFoodY = Math.floor(Math.random() * 35) + 1;
        isSpecialFoodActive = true;
        specialFoodSpawnTime = Date.now();
        console.log("Special food spawned at:", specialFoodX, specialFoodY, "at:", specialFoodSpawnTime);
        startSpecialFoodTimer();
    } else if (!isSpecialFoodActive) {
        foodX = Math.floor(Math.random() * 35) + 1;
        foodY = Math.floor(Math.random() * 35) + 1;
    }
};

const updateScore = () => {
    scoreElement.innerText = `Score : ${score}`;
    // High score is updated only on game over if a new high score is achieved
};

const checkHighScore = () => {
    const storedHighScore = parseInt(localStorage.getItem("high-score")) || 0;
    console.log("Current Score:", score, "Stored High Score:", storedHighScore);
    if (score > storedHighScore) {
        console.log("New High Score Detected!");
        return true;
    }
    console.log("No New High Score!");
    return false;
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    wallSound.currentTime = 0;
    wallSound.play();

    const isNewHighScore = checkHighScore();
    console.log("isNewHighScore:", isNewHighScore);

    const gameOverPopup = document.getElementById("gameOverPopup");
    const gameOverMessage = document.getElementById("gameOverMessage");

    let message = `Game Over! Your score: ${score}`;

    if (isNewHighScore) {
        message += "\nNew High Score! 🎉";
        console.log("New High Score Message:", message);
        gameOverPopup.style.display = "flex";
        gameOverPopup.classList.add("glow");
        console.log("Glow class added to gameOverPopup");
        setTimeout(() => {
            gameOverPopup.classList.remove("glow");
        }, 2000);
        localStorage.setItem("high-score", score);
        highscoreElement.innerText = `HighScore : ${score}`; // Update main display
    } else {
        message += `\nHigh Score: ${parseInt(localStorage.getItem("high-score")) || 0}`;
        gameOverPopup.style.display = "flex";
    }

    console.log("glow ended");
    gameOverMessage.innerText = message;
};

replayBtn.addEventListener("click", () => {
    document.getElementById("gameOverPopup").style.display = "none";
    resetGame();
    startGame();
});

controls.forEach(key => {
    key.addEventListener("click", () => changeDirection({ key: key.dataset.key }))
});

const initGame = () => {
    if (!gameStarted) return;
    if (gameOver) return handleGameOver();

    let htmlMarkup = `<div class ="food" style="grid-area:${foodY} / ${foodX}"></div>`;

    if (isSpecialFoodActive) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - specialFoodSpawnTime;
        const remainingTime = Math.max(0, specialFoodDuration - elapsedTime);
        const remainingSeconds = Math.ceil(remainingTime / 1000);
        htmlMarkup += `<div class ="special-food" style="grid-area:${specialFoodY} / ${specialFoodX}">⭐</div>`;
    }
    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([snakeX, snakeY]);
        score += 10;
        updateScore();
        eatSound.currentTime = 0;
        eatSound.play();
        changeSnakeEmotion("happy", 2000);
        if (doubleFoodActive) {
            changeFoodPosition();
        }
        console.log("Score after eating regular food:", score);
    }

    if (isSpecialFoodActive && snakeX === specialFoodX && snakeY === specialFoodY) {
        isSpecialFoodActive = false;
        doubleFoodActive = true;
        for (let i = 0; i < 1; i++) {
            snakeBody.push([snakeX, snakeY]);
        }
        eatSound.currentTime = 0;
        eatSound.play();
        changeSnakeEmotion("excited", 3000);
        score += 50;
        updateScore();
        if (specialFoodTimer) {
            clearTimeout(specialFoodTimer);
        }
        specialFoodTimer = setTimeout(() => {
            doubleFoodActive = false;
            console.log("Double food effect ended.");
        }, specialFoodDuration);
        changeFoodPosition();
        console.log("Score after eating special food:", score);
    }

    const currentSnakeLength = snakeBody.length;
    for (let i = currentSnakeLength - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY];

    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 35 || snakeY <= 0 || snakeY > 35) {
        gameOver = true;
        changeSnakeEmotion("sad", 2000);
        triggerFlash();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        const isHead = i === 0;
        htmlMarkup += `<div class ="${isHead ? 'head' : 'snake-body-segment'}" style="grid-area:${snakeBody[i][1]} / ${snakeBody[i][0]}; background-color: ${snakeColor};"></div>`;
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
            changeSnakeEmotion("surprised", 3000);
            selfHitSound.currentTime = 0;
            selfHitSound.play();
            shakeBoard();
        }
    }
    playBoard.innerHTML = htmlMarkup;
};

changeFoodPosition();

const startGame = () => {
    if (!gameStarted) {
        resetGame();
        gameStarted = true;
        setIntervalId = setInterval(initGame, gameSpeed);
        if (startGameBtn) {
            startGameBtn.style.display = "none";
            startGameBtn.removeEventListener("click", startGame);
        }
        document.addEventListener("keydown", changeDirection);
    }
};

if (startGameBtn) {
    startGameBtn.addEventListener("click", startGame);
}

let isEmotionActive = false;
let emotionTimeout;

function changeSnakeEmotion(emotion, duration = 1000) {
    const emotionElement = document.getElementById("snakeEmotion");
    isEmotionActive = true;
    if (emotionTimeout) {
        clearTimeout(emotionTimeout);
    }
    if (emotion === "happy") {
        emotionElement.innerText = "😊";
    } else if (emotion === "sad") {
        emotionElement.innerText = "😞";
    } else if (emotion === "surprised") {
        emotionElement.innerText = "😲";
    } else if (emotion === "excited") {
        emotionElement.innerText = "🤩";
    }
    console.log("Emotion set to:", emotion);
    emotionTimeout = setTimeout(() => {
        emotionElement.innerText = "";
        isEmotionActive = false;
    }, duration);
}

function triggerFlash() {
    const board = document.querySelector('.play-board');
    board.classList.add('flash');
    setTimeout(() => {
        board.classList.remove('flash');
    }, 1000);
}

function shakeBoard() {
    const board = document.querySelector(".play-board");
    board.classList.add("shake");
    setTimeout(() => {
        board.classList.remove("shake");
    }, 400);
}

const muteToggleBtn = document.getElementById("muteToggleBtn");
let isMuted = false;

muteToggleBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    eatSound.muted = isMuted;
    wallSound.muted = isMuted;
    selfHitSound.muted = isMuted;
    muteToggleBtn.innerHTML = isMuted ? "<i class='bx bx-volume-mute'></i>" : "<i class='bx bx-volume-full'></i>";
});

const pauseBtn = document.getElementById("pauseBtn");
let isPaused = false;

pauseBtn.addEventListener("click", () => {
    if (!gameStarted) return;
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(setIntervalId);
        pauseBtn.innerHTML = "<i class='bx bx-play'></i>";
    } else {
        setIntervalId = setInterval(initGame, gameSpeed);
        pauseBtn.innerHTML = "<i class='bx bx-pause'></i>";
    }
});

const resetGame = () => {
    gameOver = false;
    snakeX = 5;
    snakeY = 10;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    score = 0;
    specialFoodX = undefined;
    specialFoodY = undefined;
    isSpecialFoodActive = false;
    doubleFoodActive = false;
    updateScore(); // Reset displayed score
    changeFoodPosition();
    playBoard.innerHTML = `<div class ="food" style="grid-area:${foodY} / ${foodX}"></div>`;
    if (setIntervalId) {
        clearInterval(setIntervalId);
    }
    isPaused = false;
    pauseBtn.innerHTML = "<i class='bx bx-pause'></i>";
    gameStarted = false;
    console.log("Game reset. High Score:", parseInt(localStorage.getItem("high-score")) || 0);
};

if (exitBtn) {
    exitBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}
if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
        window.location.href = 'settings.html';
    });
}

function startSpecialFoodTimer() {
    if (specialFoodTimer) {
        clearTimeout(specialFoodTimer);
    }
    specialFoodTimer = setTimeout(() => {
        isSpecialFoodActive = false;
        specialFoodX = undefined;
        specialFoodY = undefined;
        console.log("Special food timed out and disappeared.");
    }, specialFoodDuration);
}