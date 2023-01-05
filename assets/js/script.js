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

//Additional Tasks:
//todo: loop when last question is answered in the middle

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
let gameTimeLeft;
let score = 0;
let finalScore = 0;
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
    //animation for start screen and leaderboard screen disappearing
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
    //fades to endscreen
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
        gameTimeLeft = setInterval(function() {
            gameTime--
            //Count down time on screen
            timerEl.textContent = gameTime + " sec";
            if(gameTime <= 0) {
                clearInterval(gameTimeLeft);
                gameTime = 0;
                gameOver();
            }
        }, 1000);
    }
    
    //skip current questtion with time penalty
    function skipQuestion() {
        var _tempIndex = null;
        //penalty for wrong answer
        gameTime -= 20;
        
        //prevent negative game time and end game
        if(gameTime <= 0){
            clearInterval(gameTimeLeft);
            gameTime = 0;
            gameOver();
        }

        //print updated game time
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
    
    //navbar options
    function navToQuestion(el) {
        //navnode blinks on click
        if(el.dataset.state === "right" || el.dataset.state === "wrong") {
            blink(el);
        }else if(el.dataset.number == questionQueue) {
            blink(el);
        //navigate to clicked question
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
        //got it to work but do know why
        var letterNumber = /^[0-9a-zA-Z]+$/;

        //ensure proper inital values
        if(initials.value.length > 3) {
            alert("Your string cannot exceed 3 alphanumeric characters");
        } else if(initials.value === "") {
            alert("Please submit upto 3 alphanumeric characters")
        } else if (!initials.value.match(letterNumber)){
            alert("Your initials cannot contain special characters");
        } else {
            var newEntry = {
                storedInitials: initials.value,
                storedScore: finalScore
            };

            //set initial variables values
            initials.setAttribute("style", "display: none");
            intSubButton.setAttribute("style", "display: none");

            entry.setAttribute("class", "int-entry");
            entry.textContent = initials.value + "  " + finalScore;
            leaderboard.appendChild(entry);
            addEntry();

            //add new initials and score
            function addEntry(){
                leaderboardHistory.push(newEntry);
                localStorage.setItem("lbEntries", JSON.stringify(leaderboardHistory));
            }
            //select and delete cuurent leaderboard
            var oldEntries = document.querySelectorAll(".int-entry");
            for (let i = 0; i < oldEntries.length; i++) {
                oldEntries[i].remove();
            }
            //sort and print leaderboard with new entries
            leaderboardSort();
        }
    }

    //restart the game
    function restart() {
        var leaderboardEntries = document.querySelectorAll(".int-entry");

        screenTimer(goScreenEl);
        gameTime = 200;
        timerEl.textContent = gameTime + " sec";
        score = 0;
        finalScore = 0;
        questionQueue = 0;
        tempLoc = 0;
        questionSet = [];
        answerSet = [];
        answered = 0;
        initials.setAttribute("style", "display: flex");
        intSubButton.setAttribute("style", "display: flex");
        
        //remove nav bar nodes
        for(var i = 0; i < navNodes.length; i++){
            navNodes[i].remove();
        }
        //remove leaderboard entries
        for(var i = 0; i < leaderboardEntries.length; i++){
            leaderboardEntries[i].remove();
        }
        //uncheck answer buttons
        for(var i = 0; i < answerOptions.length; i++) {
            answerOptions[i].checked = false;
        }
        questionPop();
        
    }

//Allow user to press enter to submit answer
initials.addEventListener('keydown', (event) => {
    var keyName = event.key;

    if (keyName === "Enter") {
        leaderboardAdd();
    }
});

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
        return;
    }

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

        //prevent negative game time and end game
        if(gameTime <= 0){
            clearInterval(gameTimeLeft);
            gameTime = 0;
            gameOver();
        }

        //print updated game time
        timerEl.textContent = gameTime + " sec";

        //paint wrong answer node
        paintNode(navNodes[questionQueue], "wrong");
        navNodes[questionQueue].setAttribute("data-state", "wrong");

        //change question and answers
        questionQueue++;
    }

    if(rspValidity != null) {
        //have questonQueue loop around if at last available question
        if (questionQueue >= questionSet.length) {
            var i = -1;
            
            do {
                i++;
                if(i >= questionSet.length) {
                    return;
                }
            } while (navNodes[i].dataset.state != "inactive");
            questionQueue = navNodes[i].dataset.number;
            i = 0;
        }

        //move current question to next unanswered question point
        if (navNodes[questionQueue].dataset.state != "inactive"){
            var i = questionQueue;

            do{
                i++;
                if(i >= questionQueue) {
                    i = 0;
                }
            } while (navNodes[i].dataset.state != "inactive");
            questionQueue = navNodes[i].dataset.number;
            i = 0;
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
    }
});

document.getElementById('int-submit').onkeydown = function(event) {
    if(event.keycode == 13) {

    }
}

//--------------------------------------------------------------------
//#region Objects Questions
//JavaScript Questions
let question1 = {
    id: "question",
    question: "Which of the follow is the proper structure of a for loop?",
    number: 0,
    //is my ture/false value a boolean when declared here because it is not upon being recieved in above function.
    answers: [{id: "answer-1", number: 0, answer: "for(var i = 0; i < foo; i++){}", validity: true}, {id: "answer-2", number: 0, answer: "follow your nose wherever it goes!", validity: false}, {id: "answer-3", number: 0, answer: "for(i = 0; i < foo; i++){}", validity: false}, {id: "answer-4", number: 0, answer: "for(i; i < foo; i++){}", validity: false}]
};

let question2 = {
    id: "question",
    question: "What does a do...while do?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Executes a section of code, while a condition is true", validity: true}, {id: "answer-2", number: 0, answer: "Executes a section of code a set number of times", validity: false}, {id: "answer-3", number: 0, answer: "Crashes your browser, if you're not careful", validity: true}, {id: "answer-4", number: 0, answer: "Keeps a condition ture until event is triggered", validity: false}]
};

let question3 = {
    id: "question",
    question: "Which of the following is a read-only property of the window that allows you to access a JavaScript storage object for the document's origin?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "local.storage", validity: true}, {id: "answer-2", number: 0, answer: "Object", validity: false}, {id: "answer-3", number: 0, answer: "brief.case()", validity: false}, {id: "answer-4", number: 0, answer: "pull-data.origin", validity: false}]
};

let question4 = {
    id: "question",
    question: "which of the following JavaScript functions will prevent the page from refreshing from a buttons click event?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "preventDefault()", validity: true}, {id: "answer-2", number: 0, answer: "unshift()", validity: false}, {id: "answer-3", number: 0, answer: "defresh()", validity: false}, {id: "answer-4", number: 0, answer: "stop.refresh", validity: false}]
};

let question5 = {
    id: "question",
    question: "what are the 7 data types used in JavaScript?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "null, undefined, string, object, number, boolean, bigInt, symbol", validity: true}, {id: "answer-2", number: 0, answer: "null, undefined, string, object, number, boolean, element, tag", validity: false}, {id: "answer-3", number: 0, answer: "01100100, 01100001, 01110100, 01100001, 01110100, 01111001, 01110000", validity: false}, {id: "answer-4", number: 0, answer: "undefined, string, object, number, true, false, binary", validity: false}]
};

let question6 = {
    id: "question",
    question: "What are the two ways of creating a JavaScript function?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Function expression and Function delcaration", validity: true}, {id: "answer-2", number: 0, answer: "Function creation and Function delineation", validity: false}, {id: "answer-3", number: 0, answer: "When two parent functions love each other very much.", validity: false}, {id: "answer-4", number: 0, answer: "Funtion exposition and Function deligation", validity: false}]
};

let question7 = {
    id: "question",
    question: "Data stored in JavaScript objects are refered to as?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Keys", validity: true}, {id: "answer-2", number: 0, answer: "Variables", validity: false}, {id: "answer-3", number: 0, answer: "Children", validity: false}, {id: "answer-4", number: 0, answer: "Attributes", validity: false}]
};

//CSS Questions
let question8 = {
    id: "question",
    question: "Which of the following CSS declarations will center a flex-direction:column container's children along the x axis?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "align-items: center", validity: true}, {id: "answer-2", number: 0, answer: "justify-content: center", validity: false}, {id: "answer-3", number: 0, answer: "text-align: center", validity: false}, {id: "answer-4", number: 0, answer: "justify-self: center", validity: false}]
};

let question9 = {
    id: "question",
    question: "What does the CSS display declaration do?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Sets wether an element is treated as a block or inline element", validity: true}, {id: "answer-2", number: 0, answer: "Determines wether or not an element is visible", validity: false}, {id: "answer-3", number: 0, answer: "Puts on a grand performance regarding disrespectful comments", validity: false}, {id: "answer-4", number: 0, answer: "Adjusts the users display settings", validity: false}]
};

let question10 = {
    id: "question",
    question: "In CSS, vh and vw are what type of units?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Viewport units", validity: true}, {id: "answer-2", number: 0, answer: "Vector units", validity: false}, {id: "answer-3", number: 0, answer: "Victory points", validity: false}, {id: "answer-4", number: 0, answer: "Vital-height and Vital-width, respectively", validity: false}]
};

let question11 = {
    id: "question",
    question: "@media is known as a CSS _____?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "CSS rule", validity: true}, {id: "answer-2", number: 0, answer: "CSS selector", validity: false}, {id: "answer-3", number: 0, answer: "CSS domain name", validity: false}, {id: "answer-4", number: 0, answer: "CSS tag", validity: false}]
};

let question12 = {
    id: "question",
    question: "The second S in CSS stands for",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Style", validity: true}, {id: "answer-2", number: 0, answer: "Sheets", validity: false}, {id: "answer-3", number: 0, answer: "Superfluity", validity: false}, {id: "answer-4", number: 0, answer: "Superimposed", validity: false}]
};

let question13 = {
    id: "question",
    question: "Which of the following has greater specificity?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "!important", validity: true}, {id: "answer-2", number: 0, answer: ".sel", validity: false}, {id: "answer-3", number: 0, answer: "#sel", validity: false}, {id: "answer-4", number: 0, answer: "sel", validity: false}]
};

let question14 = {
    id: "question",
    question: "What 4 areas make up the CSS box model?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Margin, border, padding, content", validity: true}, {id: "answer-2", number: 0, answer: "Top, right, bottom, left", validity: false}, {id: "answer-3", number: 0, answer: "Margarine, butter, pudding, croissant", validity: false}, {id: "answer-4", number: 0, answer: "Margin, border, padding, background", validity: false}]
};

//HTML Qustions
let question15 = {
    id: "question",
    question: "Which of the following best describes a HTML element?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "An HTML element is defined by a start tag, some content, and an end tag.", validity: true}, {id: "answer-2", number: 0, answer: "a tag enclosed in angle brackets <data>", validity: false}, {id: "answer-3", number: 0, answer: "Fire, earth, water, and air.", validity: false}, {id: "answer-4", number: 0, answer: "An identifier that must be unique in the whole document", validity: false}]
};

let question16 = {
    id: "question",
    question: "Which of these is not a semantic tag in HTML",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "<region>", validity: true}, {id: "answer-2", number: 0, answer: "<section>", validity: false}, {id: "answer-3", number: 0, answer: "<nav>", validity: false}, {id: "answer-4", number: 0, answer: "<mark>", validity: false}]
};

let question17 = {
    id: "question",
    question: "What aspect of HTML provides additional information about HTML elements?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Attributes", validity: true}, {id: "answer-2", number: 0, answer: "Tags", validity: false}, {id: "answer-3", number: 0, answer: "Links/Refrences", validity: false}, {id: "answer-4", number: 0, answer: "Forms", validity: false}]
};

let question18 = {
    id: "question",
    question: "Which of the following attributes specifies which form element a label is bound to?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "For", validity: true}, {id: "answer-2", number: 0, answer: "Type", validity: false}, {id: "answer-3", number: 0, answer: "Input", validity: false}, {id: "answer-4", number: 0, answer: "Name", validity: false}]
};

let question19 = {
    id: "question",
    question: `What is the maximum number of elements in a singel HTML document that have the id "main"`,
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "1", validity: true}, {id: "answer-2", number: 0, answer: "10", validity: false}, {id: "answer-3", number: 0, answer: "Each document needs at least 1", validity: false}, {id: "answer-4", number: 0, answer: "Infinitely many", validity: false}]
};

let question20 = {
    id: "question",
    question: "In HTML can you combine multiple stylesheets into one stylesheet? If so, how?",
    number: 0,
    answers: [{id: "answer-1", number: 0, answer: "Yes. Give all the stylesheets the value for the title attribute", validity: true}, {id: "answer-2", number: 0, answer: "Yes. Add each file destination to the href using +'s", validity: false}, {id: "answer-3", number: 0, answer: "No. There can only be one stylesheet per HTML document", validity: false}, {id: "answer-4", number: 0, answer: "No. but you will be able to in HTML6", validity: false}]
};


let questionList = [question1, question2, question3, question4, question5, question6, question7, question8, question9, question10, question11, question12, question13, question14, question15, question16, question17, question18, question19, question20];
//#endregion Objects Questions


//--------------------------------------------------------------------
//#region Functions

//populated quiz with questions and answers and sets nav buttons
function questionPop() {   
    lineupRandomizer(...questionList);
    //generate navNodes
    for(var i = 0; i < questionSet.length; i++) {
        navNode = document.createElement("button");
        navNode.setAttribute("id", `q${i}`);
        navNode.setAttribute("class", `q-nav`);
        navNode.setAttribute("data-number", `${i}`);
        navNode.setAttribute("data-state", "inactive");
        qNavBar[0].appendChild(navNode);
        
    }
    navNodeList = document.querySelectorAll(".q-nav");
    //turn node list into array to use navNodes[x].dataset method in the navNode section of the submit event listener
    navNodes = Array.from(navNodeList);
    paintNode(navNodes[0], "active");
    navNodes[0].setAttribute("data-state", "active");
    questionQueue = 0;
}

//create array of random number order
function lineupRandomizer(...arr) {
    var lineup = [];
    var answerSheet = [];

    //initialize random line-up
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

            //set answers to radio buttons
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

function blink(node) {
    _tempStyle = node.getAttribute('style');
    _tempSize = node.offsetWidth;
    nodeSize = node.offsetWidth;
    marginSize = 0;
    scaleDown();

    //Shrink node
    function scaleDown(){
        var scaleDownTimer = setInterval(function() {
            nodeSize--;
            marginSize++
            node.setAttribute('style', `${_tempStyle};` + `width: ${nodeSize}px;` + `height: ${nodeSize}px;` + `margin: ${marginSize/2}px;` + `box-shadow: 0px 0px 4px white`);

            if(nodeSize <= 0) {
                scaleUp();
                clearInterval(scaleDownTimer);
            }
        }, 1);
    }
    //Resize node
    function scaleUp(){
        var scaleUpTimer = setInterval(function() {
            nodeSize++;
            marginSize--;
            node.setAttribute('style', `${_tempStyle};` + `width: ${nodeSize}px;` + `height: ${nodeSize}px;` + `margin: ${marginSize/2}px;` + `box-shadow: 0px 0px 4px white`);

            if(nodeSize >= _tempSize) {
                node.setAttribute('style', _tempStyle);
                clearInterval(scaleUpTimer);
            }
        }, 10);
    }
}

function leaderboardSort() {
    //sirt leaderboard
    leaderboardHistory.sort((a,b) => b.storedScore - a.storedScore);
    //print sorted leaderboard
    for (var i = 0; i < leaderboardHistory.length; i++) {
        var oldEntry = document.createElement("li");
        oldEntry.setAttribute("class", "int-entry");
        oldEntry.textContent = leaderboardHistory[i].storedInitials + "  " + leaderboardHistory[i].storedScore;
        leaderboard.appendChild(oldEntry);
    }
}

function gameOver() {
    //clear timer
    clearInterval(gameTimeLeft);
    //set scoring
    finalScore = ((score * 20) + gameTime);

    //display your current score at bottom of screen
    var yourScore = document.querySelector("#yourScore");
    yourScore.textContent = "Your Score " + finalScore;
    
    //bring up end screen
    endScreenTimer();
    if (leaderboardHistory === null) {
        leaderboardHistory = [];
    } else {
        //sort and print leaderboard
        leaderboardSort();
    }
}
//#endregion Functions