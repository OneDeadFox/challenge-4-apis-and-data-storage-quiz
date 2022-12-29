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
let timerEl = document.querySelector("#timer");
let startScreenEl = document.getElementById("veil");
let formEl = document.getElementById("question-block");
let opacity = 100;
let gameTime = 300;
let questionSet = [];
let answerSet = [];

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

//change answers to objects with id, answer string, and validity properties.
let question1 = {
    id: "question",
    question: "This is a test question",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "a", validity: false}, {id: "answer-2", number: 0, answer: "b", validity: false}, {id: "answer-3", number: 0, answer: "c", validity: false}, {id: "answer-4", number: 0, answer: "d", validity: false}]
};

let question2 = {
    id: "question",
    question: "This is a another test",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: false}, {id: "answer-2", number: 0, answer: "2", validity: false}, {id: "answer-3", number: 0, answer: "3", validity: false}, {id: "answer-4", number: 0, answer: "4", validity: false}]};

let question3 = {
    id: "question",
    question: "This is the last test question",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: false}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]};
//#endregion Objects


//#region Functions
function questionPop() {
    var questionFill = document.querySelector("#question");
    var answerOptions = document.querySelectorAll('[name="answer"]');
    var questionList = [question1, question2, question3];
    var lineup = [];

    //create array of random number order
    function lineupRandomizer(...arr) {
        for(var i = 0; i <= arr.length; i++){
            var tempNum = Math.floor(Math.random()*arr.length);
            //see if array have generated value
            if(lineup.includes(tempNum)){
                i--;
            }else{
            lineup.push(tempNum);
            }

            //set numbers in questionLineup array and exit loop
            //questionList only
            if(lineup.length === arr.length && arr[0].question != undefined) {
                //fill arr object numbers with newly assigned values
                for(i = 0; i < lineup.length; i ++) {
                    arr[i].number = lineup[i];
                }
                //var ii set for following for loop
                var ii = 0;
                //set questions in new array in new order
                for(i = 0; i < arr.length; i ++) {
                    if(arr[ii].number === i) {
                        questionSet[i] = arr[ii];
                    ii = 0;
                    } else {
                        i--;
                        ii++;
                    }
                }
                //Populate question based on lineup arr.
                questionFill.textContent = questionSet[0].question;
                return;
            //set up answers in a random ordered array
            //answers only
            } else if(lineup.length === arr.length && arr[0].question === undefined) {
                //set answers in an array in a new order
                //fill arr object numbers with newly assigned values
                for(i = 0; i < lineup.length; i ++) {
                    arr[i].number = lineup[i];
        
                }
                //var ii set for following for loop
                var ii = 0;
                //set questions in new array in new order
                for(i = 0; i < arr.length; i ++) {
                    if(arr[ii].number === i) {
                        answerSet[i] = arr[ii];
                        console.log([arr[ii].number]);
                        console.log(arr[ii].id)
                    ii = 0;
                    } else {
                        i--;
                        ii++;
                    }
                }

                for(var i = 0; i < answerOptions.length; i++){
                    var label = document.createElement("label");
                    var linebreak = document.createElement("br");
                    label.setAttribute("for", `answer-${answerSet[i].number}`);
                    label.setAttribute("class", "label");
                    label.setAttribute("id", `label-${answerSet[i].number}`);
                    label.textContent = answerSet[i].answer;
                    answerOptions[i].after(label);
                    var labels = document.querySelectorAll(".label");
                    console.log(labels[i]);
                    labels[i].after(linebreak);
                    console.log(label);
                    }

                return;

            }
        }
    }

    lineupRandomizer(...questionList);
    
    lineupRandomizer(...questionSet[0].answers);
}


//#endregion Functions

questionPop();
