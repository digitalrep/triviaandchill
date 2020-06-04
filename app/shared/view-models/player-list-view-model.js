var ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
var players = require("../players");

function PlayerListViewModel(items) {

    var viewModel = new ObservableArray(items);

    viewModel.load = function() {

        const Sqlite = require("nativescript-sqlite");

        var results = [];

        new Sqlite("PlayerScores", function(err, db) {
            if(err) {
                console.log("failed to open db ", err);
            } else {

                db.execSQL("create table if not exists players(id integer primary key autoincrement, name varchar not null, gameswon integer null, totalscore integer null)", function(err, id) {
                    console.log("error: ", err);
                    console.log("create table id: ", id);                    
                });
                
                db.all("select * from players where id > ? and id < ?", [0, 1000], function(err, resultSet) {
                    results = resultSet;
                    console.log("length of resultset: ", resultSet.length);
                    console.log("Loaded result set is: ", resultSet);
                });

            }
        });

        viewModel.empty();

        if(results.length > 0) {
            results.forEach((player) => {
                viewModel.push({
                    id: player[0],
                    name: player[1],
                    gameswon: player[2],
                    totalscore: player[3]
                });
            });
        }

    };

    viewModel.add = function(name) {

        const Sqlite = require("nativescript-sqlite");

        var results;

        new Sqlite("PlayerScores", function(err, db) {
            if(err) {
                console.log("failed to open db ", err);
            } else {
    
                db.execSQL(
                    "insert into players (id, name, gameswon, totalscore) values (null, ?, 0, 0);", [name], function(err, id) {
                        console.log("error: ", err);
                        console.log("insert: The new record is: ", id);
                    } 
                );
    
                db.all("select * from players where id > ? and id < ?", [0, 1000], function(err, resultSet) {
                    results = resultSet;
                    console.log("After add, Result set is: ", resultSet);
                });
    
            }
        });

        viewModel.empty();

        results.forEach((player) => {
            viewModel.push({
                id: player[0],
                name: player[1],
                gameswon: player[2],
                totalscore: player[3]
            });
        });      

    };

    viewModel.updateScore = function(name, score) {
        
        var results = [];

        const Sqlite = require("nativescript-sqlite");

        new Sqlite("PlayerScores", function(err, db) {
           if(err) {
               console.log("failed to open db ", err);
           } else {

               var lscore = 0;

               db.get("select * from players where name = ?", [name], function(err, row) {
                    console.log("db.get error: ", err);
                    lscore = row[3];
               });
   
               lscore += score;

               db.execSQL(
                   "update players set totalscore = ? where name = ?", [lscore, name], function(err, id) {
                       console.log("update sql error: ", err);
                       //console.log("The updated record is: ", id);
                   } 
               );
   
               db.all("select * from players where id > ? and id < ?", [0, 1000], function(err, resultSet) {
                   results = resultSet;
                   //console.log("Update score Result set is: ", resultSet);
               });
   
           }
       });

        viewModel.empty();

        results.forEach((player) => {
            viewModel.push({
                id: player[0],
                name: player[1],
                gameswon: player[2],
                totalscore: player[3]
            });
        });

    };

    viewModel.updateGamesWon = function(name) {
        
        var gameswon = 0;
        var results = [];

        const Sqlite = require("nativescript-sqlite");

        new Sqlite("PlayerScores", function(err, db) {
            if(err) {
                console.log("failed to open db ", err);
            } else {

                Sqlite.get("select gameswon from players where name = ?", [name], function(err, row) {
                    console.log(err);
                    console.log("Gameswon was: ", row[0]);
                    gameswon = row[0] + 1;
                });

                Sqlite.execSQL("update players set gameswon = ? where name = ?", [gameswon], [name], function(err, id) {
                    console.log("error: ", err);
                    console.log("gameswon updated id: ", id);
                }); 

                db.all("select * from players where id > ? and id < ?", [0, 1000], function(err, resultSet) {
                    results = resultSet;
                    //console.log("Update score Result set is: ", resultSet);
                });

            }
        });

        viewModel.empty();

        results.forEach((player) => {
            viewModel.push({
                id: player[0],
                name: player[1],
                gameswon: player[2],
                totalscore: player[3]
            });
        });
    };

    viewModel.exists = function(name) {

        var result = -1;
        viewModel.forEach((player) => {
            if(player.name === name) {
                result = 1;
            }
        });
        return result;

    };

    viewModel.getWinners = function() {

        var highScore = 0;
        var winner = "";
        var winners = [];

        viewModel.forEach((player) => {
            if(player.totalscore > highScore) {
                highScore = player.totalscore;
                winner = player;
            }
        });

        winners.push(winner);

        viewModel.forEach((player) => {
            if(player.totalscore == highScore) {
                if(player.name != winner.name) {
                    winners.push(player);
                }
            }
        });

        return winners;
    
    };

    viewModel.empty = function() {

        while(viewModel.length) {
            viewModel.pop();
        }

    };

    viewModel.delete = function(index) {

        //players.data.players.splice(index, 1);

        const Sqlite = require("nativescript-sqlite");

        var name = viewModel.getPlayer(index).name;
        var results = [];

        new Sqlite("PlayerScores", function(err, db) {
            if(err) {
                console.log("failed to open db ", err);
            } else {

                db.execSQL("delete from players where name = ?", [name], function(err, id) {
                    console.log("delete error: ", err);
                    console.log("id: ", id);
                });
    
                db.all("select * from players where id > ? and id < ?", [0, 1000], function(err, resultSet) {
                    results = resultSet;
                    console.log("After delete, Result set is: ", resultSet);
                });
    
            }
        });

        viewModel.empty();

        results.forEach((player) => {
            viewModel.push({
                id: player[0],
                name: player[1],
                gameswon: player[2],
                totalscore: player[3]
            });
        });   
    
    };

    viewModel.getPlayer = function(index) {
        return viewModel.getItem(index);
    };

    return viewModel;
}

module.exports = PlayerListViewModel;
