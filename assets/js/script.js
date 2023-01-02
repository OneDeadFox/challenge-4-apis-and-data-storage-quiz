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

//Additional TODO:'s, no particular order
//have navnodes blink on click if current, wrong, or right
//change border color of right and wrong



//Global Variables----------------------------------------------------
let pageEl = document.body;
let timerEl = document.querySelector("#timer");
let startScreenEl = document.getElementById("veil");
let goScreenEl = document.getElementById("go-screen")
let formEl = document.getElementById("question-block");
let questionFill = document.querySelector("#question");
let answerOptions = document.querySelectorAll('[name="answer"]');
let qNavBar = document.getElementsByClassName("question-select");
let navNode;
let navNodes;
let initials = document.getElementById("initials");
let intSubButton = document.getElementById("int-submit")
let leaderboard = document.getElementById("lbList");
let entry = document.createElement("li");
let leaderboardHistory = JSON.parse(localStorage.getItem("lbEntries"));
let opacity = 100;
let gameTime = 200;
let score = 0;
let questionQueue = 0;
let tempLoc = 0;
let initQs = [];
let questionSet = [];
let additionalQs = [];
let answerSet = [];
let answered = 0;


//--------------------------------------------------------------------
//#region Event Delegator
//Delegator

pageEl.addEventListener("click", function(event) {
    var element = event.target;

    if(element.matches("#start")) {
        //function that will reduce id-veil opacity in 1% increments over a period of time until it reaches 100%
        screenTimer(startScreenEl);
        questionPop();
    } else if(element.matches("#skip")) {
        skipQuestion();
    } else if(element.matches(".q-nav")) {
        navToQuestion(element);
    } else if(element.matches("#int-submit")) {
        leaderboardAdd();
    } else if (element. matches("#play-again")){
        restart();
    }

});

    //Delegator Functions---------------------------------------------
    //animation for start screen disappearing
    function screenTimer(screen){
        var screenTimeLeft = setInterval(function() {
            opacity--;
            //make startScreen disappear
            screen.setAttribute("style", `opacity: ${opacity}%`);
            //clear timer and display upon endtime
            if(opacity <= 0) {
                clearInterval(screenTimeLeft);
                screen.setAttribute("style", "display: none");
                gameTimer();
            }
        },2);
    }

    function endScreenTimer(){
        opacity = 0;
        var screenTimeLeft = setInterval(function() {
            opacity++;
            goScreenEl.setAttribute("style", "display: flex;" + `opacity: ${opacity}%;`);
            //clear timer and display upon endtime
            if(opacity >= 100) {
                clearInterval(screenTimeLeft);
            }
        }, 5);
    }
    
    //in-game timer
    function gameTimer(){
        var gameTimeLeft = setInterval(function() {
            gameTime--
            //Count down time on screen
            timerEl.textContent = gameTime + " sec";
            if(gameTime <= 0) {
                gameOver();
                clearInterval(gameTimeLeft);
            }
        }, 1000);
    }
    
    //skip current questtion with time penalty
    function skipQuestion() {
        var _tempIndex = null;
        gameTime -= 20;
        timerEl.textContent = gameTime + " sec";
        //store original question
        _tempIndex = questionSet[questionQueue];

        //switch positions of skipped question with the begining of additional questions. skipped question pushed to end of additional questions.
        questionSet[questionQueue] = additionalQs.shift();
        additionalQs.push(_tempIndex);

        //set contents to new Q&A
        questionFill.textContent = questionSet[questionQueue].question;
        lineupRandomizer(...questionSet[questionQueue].answers);
    }
    
    //navigate to clicked question
    function navToQuestion(el) {
        
        if(el.dataset.state === "right" || el.dataset.state === "wrong") {
            alert("question already answered");
        }else if(el.dataset.number === questionQueue) {
            alert("current question");
        } else {   
            questionQueue = el.dataset.number;
            for(var i = 0; i < navNodes.length; i++) {
                if(navNodes[i] === el) {
                    paintNode(el, "active");
                    el.setAttribute("data-state", "active");
                } else if (navNodes[i].dataset.state === "active") {
                    paintNode(navNodes[i], "inactive");
                    navNodes[i].setAttribute("data-state", "inactive")
                }
            }
            //change contents of Q&A
            questionFill.textContent = questionSet[el.dataset.number].question;
            lineupRandomizer(...questionSet[el.dataset.number].answers);
        }

    }

    //submit initials and score to leaderboard
    function leaderboardAdd() {
        //how do I use /^[0-9a-zA-Z]+$/
        var letterNumber = /^[0-9a-zA-Z]+$/;

        if(initials.value.length > 3) {
            alert("Your string cannot exceed 3 alphanumeric characters");
        } else if(initials.value === "") {
            alert("Please submit upto 3 alphanumeric characters")
        } else if (!initials.value.match(letterNumber)){
            alert("Your initials cannot contain special characters");
        } else {
            var newEntry = {
                newInitials: initials.value,
                newScore: score
            };

            initials.setAttribute("style", "display: none");
            intSubButton.setAttribute("style", "display: none");

            entry.setAttribute("class", "int-entry");
            entry.textContent = initials.value + "  " + score;
            leaderboard.appendChild(entry);
            addEntry();


            function addEntry(){
                leaderboardHistory.push(newEntry);
                localStorage.setItem("lbEntries", JSON.stringify(leaderboardHistory));
                console.log(leaderboardHistory);
                
            }
        }
    }

    //restart the game
    function restart() {
        var lis = document.querySelectorAll(".int-entry");

        screenTimer(goScreenEl);
        gameTime = 200;
        score = 0;
        questionQueue = 0;
        tempLoc = 0;
        questionSet = [];
        answerSet = [];
        answered = 0;
        initials.setAttribute("style", "display: flex");
        intSubButton.setAttribute("style", "display: flex");
        for(var i = 0; i < navNodes.length; i++){
            navNodes[i].remove();
        }
        for(var i = 0; i < lis.length; i++){
            lis[i].remove();
        }
        questionPop();
        
    }

//#endregion Event Delegator



//Form Submition------------------------------------------------------
formEl.addEventListener("submit", function(event) {
    event.preventDefault();

    var formData = new FormData(formEl);
    var rspValidity = formData.get("answer");
    answered++;
    
    //end quiz if out of questions
    if(answered >= questionSet.length){
        gameOver();
    }

    console.log(questionQueue);

    //check answers validity
    if(rspValidity === null) {
        alert('Please select an answer before pressing submit');
    } else if(rspValidity === "true") {
        //increase score
        score++;

        //paint right answer node
        paintNode(navNodes[questionQueue], "right");
        navNodes[questionQueue].setAttribute("data-state", "right");


        //change question and answers var
        questionQueue++;
    } else {
        //decrease time remove upon completion of navigation
        gameTime -= 30;
        timerEl.textContent = gameTime + " sec";

        //paint wrong answer node
        paintNode(navNodes[questionQueue], "wrong");
        navNodes[questionQueue].setAttribute("data-state", "wrong");

        //change question and answers
        questionQueue++;
    }

    //move current question to next unanswered question point
    if (navNodes[questionQueue].dataset.state != "inactive"){
        var i = questionQueue;
        do{
            i++;
        } while (navNodes[i].dataset.state != "inactive");
        questionQueue = navNodes[i].dataset.number;
        i = 0;
    } else if (questionQueue >= questionSet.length) {
        console.log(navNodes);
        var i = -1;
        do {
            i++;
        } while (navNodes[i].dataset.state != "inactive");
        questionQueue = navNodes[i].dataset.number;
        i = 0;
        console.log(questionQueue);
    }



    //change question and answers content
    questionFill.textContent = questionSet[questionQueue].question;
    lineupRandomizer(...questionSet[questionQueue].answers);

    //light up current node
    paintNode(navNodes[questionQueue], "active");
    navNodes[questionQueue].dataset.state = "active";

    for(var i = 0; i < answerOptions.length; i++) {
        answerOptions[i].checked = false;
    }

});

//--------------------------------------------------------------------
//#region Objects

let question1 = {
    id: "question",
    question: "question-a",
    number: 0,
    //is my ture/false value a boolean when declared here because it is not upon being recieved in above function.
    answers: [{id: "answer-1", number: 0, answer: "a", validity: true}, {id: "answer-2", number: 0, answer: "b", validity: false}, {id: "answer-3", number: 0, answer: "c", validity: false}, {id: "answer-4", number: 0, answer: "d", validity: false}]
};

let question2 = {
    id: "question",
    question: "question-1",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: true}, {id: "answer-2", number: 0, answer: "2", validity: false}, {id: "answer-3", number: 0, answer: "3", validity: false}, {id: "answer-4", number: 0, answer: "4", validity: false}]
};

let question3 = {
    id: "question",
    question: "question-i",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question4 = {
    id: "question",
    question: "question-d",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "a", validity: true}, {id: "answer-2", number: 0, answer: "b", validity: false}, {id: "answer-3", number: 0, answer: "c", validity: false}, {id: "answer-4", number: 0, answer: "d", validity: false}]
};

let question5 = {
    id: "question",
    question: "question-5",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: true}, {id: "answer-2", number: 0, answer: "2", validity: false}, {id: "answer-3", number: 0, answer: "3", validity: false}, {id: "answer-4", number: 0, answer: "4", validity: false}]
};

let question6 = {
    id: "question",
    question: "question-vi",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question7 = {
    id: "question",
    question: "question-7",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question8 = {
    id: "question",
    question: "question-8",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "a", validity: true}, {id: "answer-2", number: 0, answer: "b", validity: false}, {id: "answer-3", number: 0, answer: "c", validity: false}, {id: "answer-4", number: 0, answer: "d", validity: false}]
};

let question9 = {
    id: "question",
    question: "question-9",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: true}, {id: "answer-2", number: 0, answer: "2", validity: false}, {id: "answer-3", number: 0, answer: "3", validity: false}, {id: "answer-4", number: 0, answer: "4", validity: false}]
};

let question10 = {
    id: "question",
    question: "question-10",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question11 = {
    id: "question",
    question: "question-11",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question12 = {
    id: "question",
    question: "question-12",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: true}, {id: "answer-2", number: 0, answer: "2", validity: false}, {id: "answer-3", number: 0, answer: "3", validity: false}, {id: "answer-4", number: 0, answer: "4", validity: false}]
};

let question13 = {
    id: "question",
    question: "question-13",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question14 = {
    id: "question",
    question: "question-14",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "a", validity: true}, {id: "answer-2", number: 0, answer: "b", validity: false}, {id: "answer-3", number: 0, answer: "c", validity: false}, {id: "answer-4", number: 0, answer: "d", validity: false}]
};

let question15 = {
    id: "question",
    question: "question-15",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: true}, {id: "answer-2", number: 0, answer: "2", validity: false}, {id: "answer-3", number: 0, answer: "3", validity: false}, {id: "answer-4", number: 0, answer: "4", validity: false}]
};

let question16 = {
    id: "question",
    question: "question-16",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question17 = {
    id: "question",
    question: "question-17",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};

let question18 = {
    id: "question",
    question: "question-18",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "a", validity: true}, {id: "answer-2", number: 0, answer: "b", validity: false}, {id: "answer-3", number: 0, answer: "c", validity: false}, {id: "answer-4", number: 0, answer: "d", validity: false}]
};

let question19 = {
    id: "question",
    question: "question-19",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: true}, {id: "answer-2", number: 0, answer: "2", validity: false}, {id: "answer-3", number: 0, answer: "3", validity: false}, {id: "answer-4", number: 0, answer: "4", validity: false}]
};

let question20 = {
    id: "question",
    question: "question-20",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "i", validity: true}, {id: "answer-2", number: 0, answer: "ii", validity: false}, {id: "answer-3", number: 0, answer: "iii", validity: false}, {id: "answer-4", number: 0, answer: "iv", validity: false}]
};


let questionList = [question1, question2, question3, question4, question5, question6, question7, question8, question9, question10, question11, question12, question13, question14, question15, question16, question17, question18, question19, question20];
//#endregion Objects


//--------------------------------------------------------------------
//#region Functions

//populated quiz with questions and answers and sets nav buttons
function questionPop() {   
    lineupRandomizer(...questionList);
    //generate navNodes
    for(var i = 0; i < questionSet.length; i++) {
        //might need to move outside the loop
        navNode = document.createElement("button");
        navNode.setAttribute("id", `q${i}`);
        navNode.setAttribute("class", `q-nav`);
        navNode.setAttribute("data-number", `${i}`);
        navNode.setAttribute("data-state", "inactive");
        qNavBar[0].appendChild(navNode);
        
    }
    navNodeList = document.querySelectorAll(".q-nav");
    navNodes = Array.from(navNodeList);
    paintNode(navNodes[0], "active");
    navNodes[0].setAttribute("data-state", "active");
}

//create array of random number order
function lineupRandomizer(...arr) {
    var lineup = [];
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
            var cutLength = Math.round(lineup.length/2);
            
            //fill arr object numbers with newly assigned values
            for(i = 0; i < lineup.length; i ++) {
                arr[i].number = lineup[i];
            }
            //var ii set for following for loop
            var ii = 0;
            //set questions in new array in new order
            for(i = 0; i < arr.length; i ++) {
                if(arr[ii].number === i) {
                    initQs[i] = arr[ii];
                ii = 0;
                } else {
                    i--;
                    ii++;
                }
            }

            //divide aquestions into two arrays: intial quiz and extra 
            questionSet = initQs.splice(0, cutLength);
            for(var i = 0; i < questionSet.length; i++){    
            }

            additionalQs = initQs.splice(-cutLength);
            for(var i = 0; i < questionSet.length; i++){    
            }
            
            //Populate question based on lineup arr.
            questionFill.textContent = questionSet[0].question;

            //populate answers for first question
            lineupRandomizer(...questionSet[0].answers);

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
                ii = 0;
                } else {
                    i--;
                    ii++;
                }
            }

            for(var i = 0; i < answerOptions.length; i++){
                var labels = document.querySelectorAll(".label");
                var radios = document.querySelectorAll("input[type=radio]");
                
                radios[i].setAttribute("value", `${answerSet[i].validity}`)
                labels[answerSet[i].number].textContent = answerSet[i].answer;
                }

                
            return;

        }
    }
}

function paintNode(node, state) {
    //set navnode color and size based on its state
    if(state === "inactive") {
        node.setAttribute("style", `background-color: var(--header-color);` + `width: 11px;` + `height: 11px;`);
    } else if(state === "active") {
        node.setAttribute("style", `background-color: var(--bg-color);` + `width: 13px;` + `height: 13px;`);
    } else if(state === "wrong") {
        node.setAttribute("style", `background-color: var(--wrong-color);` + `width: 11px;` + `height: 11px;`);
    } else if(state === "right") {
        node.setAttribute("style", `background-color: var(--right-color);` + `width: 11px;` + `height: 11px;`);
    }
}

function gameOver() {
    //set scoring
    score = (score * 20 + gameTime);
    //bring up end screen
    endScreenTimer();
    if (leaderboardHistory === null) {
        leaderboardHistory = [];
    } else {
        for (var i = 0; i < leaderboardHistory.length; i++) {
            var oldEntry = document.createElement("li");
            oldEntry.setAttribute("class", "int-entry");
            oldEntry.textContent = leaderboardHistory[i].newInitials + "  " + leaderboardHistory[i].newScore;
            leaderboard.appendChild(oldEntry);
        }
    }
}
//#endregion Functions

questionPop();
//localStorage.clear("lbEntries");
