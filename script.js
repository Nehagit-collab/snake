const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highscoreElement = document.querySelector(".high-score");
const eatSound = document.getElementById("eatSound");
const wallSound = document.getElementById("wallSound");
const selfHitSound = document.getElementById("selfHitSound");

let gameOver = false;
let foodX , foodY;
let snakeX = 5,snakeY = 10;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;


let highscore = localStorage.getItem("high-score") || 0;
highscoreElement.innerText = `HighScore : ${highscore}`;

const changeDirection = (e) =>{
   if(e.key === "ArrowUp" && velocityY != 1){
      velocityX = 0;
      velocityY = -1;
   }
   else if(e.key === "ArrowDown"  && velocityY!= -1){
    velocityX = 0;
      velocityY = 1;
   }
   else if(e.key === "ArrowLeft"  && velocityX != 1){
    velocityX = -1;
      velocityY = 0;
   }
   else if(e.key === "ArrowRight"  && velocityX !=  -1){
    velocityX = 1;
      velocityY = 0;
   }
   initGame();
}


const changeFoodPosition = () =>{
    foodX = Math.floor(Math.random() * 30 )+ 1;
    foodY = Math.floor(Math.random() * 30 )+ 1;
}

const handleGameOver = () => {
    clearInterval(setIntervalId);
    wallSound.currentTime = 0;
    wallSound.play();
    document.getElementById("gameOverPopup").style.display = "flex";
   
};

document.getElementById("replayBtn").addEventListener("click", () => {
    document.getElementById("gameOverPopup").style.display = "none";
    location.reload();
});


const initGame = () =>{
    if(gameOver) return handleGameOver();

    let htmlMarkup = `<div class ="food" style="grid-area:${foodY} / ${foodX}"></div>`;
    
    if(snakeX === foodX && snakeY === foodY){
        changeFoodPosition();
        snakeBody.push([foodX,foodY]);
        score++;
        highscore = score >= highscore ? score : highscore;
        localStorage.setItem("high-score", highscore);
        scoreElement.innerText = `Score : ${score}`;
        highscoreElement.innerText = `HighScore : ${highscore}`;
        eatSound.currentTime = 0;
        eatSound.play();
        changeSnakeEmotion("happy", 2000);
       
    }
 
    for (let i = snakeBody.length - 1; i > 0; i--) {
      snakeBody[i] = snakeBody[i -1];  

    }

    snakeBody[0] = [snakeX, snakeY];

    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
       gameOver = true;
       changeSnakeEmotion("sad",2000);
    }

    for (let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class ="head" style="grid-area:${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;  
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0] ){
            gameOver = true;
            changeSnakeEmotion("surprised",3000);
          selfHitSound.currentTime = 0;
            selfHitSound.play();
        }
    }
    
    playBoard.innerHTML = htmlMarkup;
 
}

  
changeFoodPosition();
setIntervalId = setInterval(initGame, 125);
document.addEventListener("keydown",changeDirection);




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
  }


  console.log("Emotion set to:", emotion);


  emotionTimeout = setTimeout(() => {
    emotionElement.innerText = "";  
    isEmotionActive = false;  
  }, duration);  
}
