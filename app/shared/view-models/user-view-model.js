var observableModule = require("tns-core-modules/data/observable");

function User(info) {
    info = info || {};

    // You can add properties to observables on creation
    var viewModel = new observableModule.fromObject({
        name: info.name || "",
        score: info.score || 0
    });

	viewModel.add = function() {
		console.log("add user");
		console.log(viewModel.get("name"));
	};

    viewModel.login = function () {
        return fetch(config.apiUrl + "user/" + config.appKey + '/login', {
            method: "POST",
            body: JSON.stringify({
                username: viewModel.get("email"),
                password: viewModel.get("password")
            }),
            headers: getCommonHeaders()
        })
            .then(handleErrors)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log('tokenL ' + data._kmd.authtoken);
                config.token = data._kmd.authtoken;
            });
    };

    return viewModel;
}

function getCommonHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": config.appUserHeader
    }
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = User;
