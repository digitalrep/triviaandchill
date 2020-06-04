var ObservableArray = require('tns-core-modules/data/observable-array').ObservableArray;

function Questions(questions) {
   
    var viewModel = new ObservableArray(questions);
   
    viewModel.load = function (numPlayers) {

        let apiUrl = "https://opentdb.com/api.php?amount=10";

        return fetch(apiUrl, {
            headers: getCommonHeaders()
        })
        .then(handleErrors)
        .then(function (response) {
            return response.json();
        })
        .then(function (results) {
            //console.log("results", results);
            
            results.results.forEach((result) => {
                decodedQuestion = result.question.replace(/&quot;/g, '"');
                decodedQuestion = decodedQuestion.replace(/&amp;/g, '&');
                decodedQuestion = decodedQuestion.replace(/&#039;/g, "'");
                decodedQuestion = decodedQuestion.replace(/&eacute;/g, "é");
                viewModel.push({
                    category: result.category,
                    type: result.type,
                    difficulty: result.difficulty,
                    question: decodedQuestion,
                    correct_answer: result.correct_answer,
                    incorrect_answers: result.incorrect_answers
                });
            });
            
            //console.log("question viewModel", viewModel);
        
        });

    };

    viewModel.getQuestion = function(index) {
        return viewModel.getItem(index);
    };

    viewModel.empty = function() {
        while(viewModel.length) {
            viewModel.pop();
        }
    };

    return viewModel;
}

function getCommonHeaders() {
    return {
        "Content-Type": "application/json"
    }
}

function handleErrors(response) {
    if (!response.ok) {
        console.log("json.stringify(response)");
        console.log(JSON.stringify(response));
        console.log("response not ok");
        throw Error(response.statusText);
    }
    return response;
}

module.exports = Questions;
