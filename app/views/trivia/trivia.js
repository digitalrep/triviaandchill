var PlayerListViewModel = require("../../shared/view-models/player-list-view-model");
var QuestionsViewModel = require("../../shared/view-models/questions-view-model");
var dialogsModule = require('ui/dialogs');
const Observable = require("tns-core-modules/data/observable").Observable;
const fromObjectRecursive = require('tns-core-modules/data/observable').fromObjectRecursive;
const Sqlite = require("nativescript-sqlite");
var frameModule = require('tns-core-modules/ui/frame');

var playerList = new PlayerListViewModel([]);
var questions = new QuestionsViewModel([]);

var questionNum = 1;

var page;

var pageData = fromObjectRecursive({
    playerList: playerList,
    questions: questions,
    currentQuestionIndex: 0,
    currentPlayerIndex: 0,
    answers: [],
    currentPlayer: {},
    currentQuestion: {},
    questionNum,
    isLoading: true
});

exports.loaded = function (args) {

    page = args.object;
    page.bindingContext = pageData;

    playerList.load();
    pageData.set("currentPlayer", playerList.getPlayer(pageData.currentPlayerIndex));

    questions.load(playerList.length)
    .catch(function(error) {
        console.log(error);
        dialogsModule.alert({
            message: "Something went wrong",
            okButtonText: "OK"
        });
        return Promise.reject();
    })
    .then(function() {
        pageData.set("currentQuestion", questions.getQuestion(pageData.currentQuestionIndex));  
        answers = getAnswers(pageData.currentQuestion);
        pageData.set("answers", answers);
        changeBg(pageData.get("currentQuestion"));
        pageData.set("isLoading", false);
        var listView = page.getViewById('answers');
        listView.animate({
            opacity: 1,
            duration: 1000
        });
        var listView2 = page.getViewById('players');
        listView2.animate({
            opacity: 1,
            duration: 1000
        });
        var label = page.getViewById('heading');
        label.animate({
            opacity: 1,
            duration: 1000
        });
        var question = page.getViewById('question');
        question.animate({
            opacity: 1,
            duration: 1000
        });
    });
    
};

function getAnswers(question) {
    let answers = [];

    for(i=0; i<(question.incorrect_answers.length); i++) {
        decodedAnswer = question.incorrect_answers[i].replace(/&quot;/g, '"');
        decodedAnswer = decodedAnswer.replace(/&amp;/g, '&');
        decodedAnswer = decodedAnswer.replace(/&#039;/g, "'");
        decodedAnswer = decodedAnswer.replace(/&eacute;/g, "é");
        //decodedAnswer = decodedAnswer.replace(/&sup2;/g, "²");
        //decodedAnswer = decodedAnswer.replace(/&sup3;/g, "³");
        answers.push({
            text: decodedAnswer,
            isCorrect: false
        });
    };

    decodedAnswer = question.correct_answer.replace(/&quot;/g, '"');
    decodedAnswer = decodedAnswer.replace(/&amp;/g, '&');
    decodedAnswer = decodedAnswer.replace(/&#039;/g, "'"); 
    decodedAnswer = decodedAnswer.replace(/&eacute;/g, "é");  
    //decodedAnswer = decodedAnswer.replace(/&sup2;/g, "²");
    //decodedAnswer = decoddeAnswer.replace(/&sup3;/g, "³");
    let rand = Math.floor(Math.random()*(0-question.incorrect_answers.length+1))+question.incorrect_answers.length;
    answers.splice(rand, 0, { text: decodedAnswer, isCorrect: true });

    return answers;
};

function changeBg(question) {
    var category = question.category.toLowerCase();

    if(category.includes("animals")) {
       page.className = "pink";
    }
    
    if(category.includes("entertainment")) {
        page.className = "skin";         
    }

    if(category.includes("science")) {
        page.className = "lightblue";       
    }

    if(category.includes("history")) {
        page.className = "green1";
    }

    if(category.includes("sport")) {
        page.className = "orange";
    }

    if(category.includes("celebrities")) {
        page.className = "darkred";
    }

    if(category.includes("general")) {
        page.className = "purple";
    }   

    if(category.includes("vehicles")) {
        page.className = "brown";
    }

    if(category.includes("geography")) {
        page.className = "green2";
    }
    
};

exports.submit = function(args) {

    var pageData = page.bindingContext;

    var answer = args.view.bindingContext;
    var isCorrect = answer.isCorrect;

    if(isCorrect) {

        playerList.updateScore(pageData.currentPlayer.name, 10);

        if(pageData.get("currentQuestionIndex")+1 == questions.length) {

            if(playerList.getWinners().length > 1) {
                    
                var str = "";
        
                playerList.getWinners().forEach((player) => {

                    str += player.name + " and ";
                    score = player.totalscore;
                    playerList.updateGamesWon(player.name);

                }); 
        
                str = str.slice(0, -5);
        
                dialogsModule.alert({
                    message: "End of game! It's a draw! The winners are " + str + " with a score of " + score,
                    okButtonText: "View High Scores"
                }); 

                frameModule.Frame.topmost().navigate("views/highscores/highscores");
        
            } else {
                    
                dialogsModule.alert({
                    message: "End of game! The winner is " + playerList.getWinners()[0].name + " with a score of " + playerList.getWinners()[0].totalscore,
                    okButtonText: "OK"
                }); 

                playerList.updateGamesWon(playerList.getWinners()[0]);
                frameModule.Frame.topmost().navigate("views/highscores/highscores");
        
            }    
        
        } else {
        
            pageData.set("currentQuestionIndex", pageData.get("currentQuestionIndex")+1);
        
            if(pageData.get("currentPlayerIndex")+1 == playerList.length) {
                pageData.set("currentPlayerIndex", 0);
            } else {
                pageData.set("currentPlayerIndex", pageData.get("currentPlayerIndex")+1);
            }
            
            pageData.set("questionNum", pageData.get("questionNum")+1);
            pageData.set("currentPlayer", playerList.getPlayer(pageData.currentPlayerIndex));
            pageData.set("currentQuestion", questions.getQuestion(pageData.currentQuestionIndex));
            
            changeBg(pageData.get("currentQuestion"));
            
            let answers = getAnswers(pageData.currentQuestion);
            pageData.set("answers", answers);
            
        }

        dialogsModule.alert({
            message: "You got it!",
            okButtonText: "OK"
        });

// is not correct answer

    } else {

        if(pageData.get("currentQuestionIndex")+1 == questions.length) {

            console.log("at the last question");
            console.log("getWinners: ", playerList.getWinners());
            console.log("getWinners[0]: ", playerList.getWinners()[0]);

            if(playerList.getWinners().length > 1) {
                    
                var str = "";
        
                playerList.getWinners().forEach((player) => {

                    str += player.name + " and ";
                    score = player.totalscore;
                    playerList.updateGamesWon(player.name);

                }); 
        
                str = str.slice(0, -5);
        
                dialogsModule.alert({
                    message: "End of game! It's a draw! The winners are " + str + " with a score of " + score,
                    okButtonText: "View High Scores"
                }); 

                frameModule.Frame.topmost().navigate("views/highscores/highscores");
        
            } else {
                    
                dialogsModule.alert({
                    message: "End of game! The winner is " + playerList.getWinners()[0].name + " with a score of " + playerList.getWinners()[0].totalscore,
                    okButtonText: "OK"
                }); 

                playerList.updateGamesWon(playerList.getWinners()[0]);
                frameModule.Frame.topmost().navigate("views/highscores/highscores");
        
            }    
    
        } else {

            dialogsModule.alert({
                message: `Incorrect answer. The correct answer was ${pageData.currentQuestion.correct_answer}.`,
                okButtonText: "OK"
            });
    
            pageData.set("currentQuestionIndex", pageData.get("currentQuestionIndex")+1);
    
            if(pageData.get("currentPlayerIndex")+1 == playerList.length) {
                pageData.set("currentPlayerIndex", 0);
            } else {
                pageData.set("currentPlayerIndex", pageData.get("currentPlayerIndex")+1);
            }
        
            pageData.set("questionNum", pageData.get("questionNum")+1);
            pageData.set("currentPlayer", playerList.getPlayer(pageData.currentPlayerIndex));
            pageData.set("currentQuestion", questions.getQuestion(pageData.currentQuestionIndex));
        
            changeBg(pageData.get("currentQuestion"));
        
            let answers = getAnswers(pageData.currentQuestion);
            pageData.set("answers", answers);
        
        }
    
    }

};