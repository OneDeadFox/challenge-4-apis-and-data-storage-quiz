//TODO: create event listener to detect clicks
    //1. create event delegator
    //2. listen for clicks on specified items
        //a. start button
            //i. have id-veil disappear
            //ii. have timer begin after veil disappears
            //iii. load first question
        //b. submit button
            //i. submit user response to database
            //ii. move on to next question
            //iii. mark question as answered on q-nav
        //c. question navigation
            //i. load the question associated with that nav button
//TODO: create timer
    //1. have timer begin after veil disappears
    //2. have game end after timer runs out
//TODO: create array of questions
    //1. create an array of objects that will represent the questions in quiz. they should contain the following vars:
        //a. question: string with actual question
        //b. number: a int that is randomly assigned to each question upon onload or refresh
            //i. create an external array of numbers for each question in quiz
            //ii. use a randomizer to assign a number to each question.
        //c. answers 1-4: objects.
            //i. answer: sting with answer.
            //ii. validity: boolean true for correct, false for inncorrect.
//TODO: add questions to the main form element
    //1. load questions upon onload or refresh
//TODO: have submit button add correct or incorrect response to database
    //1. submit questions to database with correct or incorrect properties, objQuestion.objAnswer.validity
//TODO: have incorrect responses reduce the amount of time on timer by some amount.
//TODO: end game when timer runs out
    //1. create leaderboard
    //2. display leaderboard
//TODO: end game when all questions are answered
//TODO: allow player to save initials and score to leader board
    //1. have a submit button that addes users initials and score to a database that wont be erased on refresh or esc

//Global Variables
let pageEl = document.body;
let timerEl = document.querySelector("#timer")
let startScreenEl = document.getElementById("veil")
let opacity = 100;
let gameTime = 300;



//#region Event Delegator
//Delegator

pageEl.addEventListener("click", function(event){
    var element = event.target;

    if(element.matches("#start")){
        //function that will reduce id-veil opacity in 1% increments over a period of time until it reaches 100%
        screenTimer();
    }

});

    //Delegator Functions
    function screenTimer(){
        var screenTimeLeft = setInterval(function() {
            opacity--;
            //make startScreen disappear
            startScreenEl.setAttribute("style", `opacity: ${opacity}%`);
            //clear timer and display upon endtime
            if(opacity <= 0) {
                clearInterval(screenTimeLeft);
                startScreenEl.setAttribute("style", "display: none");
                gameTimer();
            }
        },2);
    }
    function gameTimer(){
        var gameTimeLeft = setInterval(function() {
            gameTime--
            //Count down time on screen
            timerEl.textContent = gameTime + " sec";
            if(gameTime <= 0) {
                //TODO: make this function
                //endGame();
                clearInterval(gameTimeLeft);
            }
        }, 1000);
    }

//#endregion Event Delegator


//#region Objects
let question1 = {
    question: "this is a test question",
    number: 1,
    answers: {answer1: "a",
            answer2: "b",
            answer3: "c",
            answer: "d"
            }
};
//#endregion Objects


//#region Functions
function questionPop(){
    
}
//#endregion Functions