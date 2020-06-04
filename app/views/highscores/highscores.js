var PlayerListViewModel = require("../../shared/view-models/player-list-view-model");
const fromObject = require('tns-core-modules/data/observable').fromObject;
var frameModule = require('tns-core-modules/ui/frame');

var playerList = new PlayerListViewModel([]);
var page;
var pageData = fromObject({
    playerList: playerList
});

exports.loaded = function (args) {

    page = args.object;
    page.bindingContext = pageData;

    playerList.load();

};

exports.back = function() {
    frameModule.Frame.topmost().navigate("views/players/player");
}