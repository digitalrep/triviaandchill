var dialogsModule = require('ui/dialogs');
var observableModule = require('data/observable');
var PlayerListViewModel = require("../../shared/view-models/player-list-view-model");
//var socialShare = require("nativescript-social-share");
var frameModule = require('tns-core-modules/ui/frame');

var page;

var playerList = new PlayerListViewModel([]);

playerList.load();

var pageData = observableModule.fromObject({
    playerList: playerList,
    player: ''
})

exports.loaded = function (args) {
    page = args.object;

    page.bindingContext = pageData;

    /* empty db
    const Sqlite = require("nativescript-sqlite");

    new Sqlite("PlayerScores", function(err, db) {
        if(err) {
            console.log("failed to open db ", err);
        } else {

            console.log("Are we open yet (Callback based)? ", db.isOpen() ? "Yes" : "No");
            
            db.execSQL(
                "delete from players where id > 0;", function(err, id) {
                    console.log("error: ", err);
                    console.log("id: ", id);
                } 
            );

            db.execSQL("update SQLITE_SEQUENCE set SEQ=0 where name='players'");
        }
    });
    */

};

exports.add = function() {
    
    if(pageData.get("player").trim() === "") {
        dialogsModule.alert({
            message: "Enter a player name",
            okButtonText: "OK"
        });
        
        return;
    }

    var res = playerList.exists(pageData.get("player"));

    if(res > 0) {
        dialogsModule.alert({
            message: "Name already taken!",
            okButtonText: "OK"
        });
        return;      
    }

    if(pageData.get("playerList").length == 6) {
        dialogsModule.alert({
            message: "Limit of 6 players",
            okButtonText: "OK"
        });
        page.getViewById("player").dismissSoftInput();
        return;      
    }

    page.getViewById("player").dismissSoftInput();
    playerList.add(pageData.get("player"));

    pageData.set("player", "");
}

exports.delete = function(args) {
    var item = args.view.bindingContext;
    var index = playerList.indexOf(item);
    playerList.delete(index);
};

exports.done = function() {

    if(pageData.get("playerList").length == 0) {
        dialogsModule.alert({
            message: "Add at least 1 player",
            okButtonText: "OK"
        });
        page.getViewById("player").dismissSoftInput();
        return;      
    } else {
        frameModule.Frame.topmost().navigate("views/trivia/trivia");
    } 
    
};

exports.share = function() {
    var list = [];
    var size = playerList.length;
    for(var i=0; i<size; i++) {
        list.push(playerList.getItem(i).name);
    }
    var listString = list.join(", ").trim();
    socialShare.shareText(listString);
};