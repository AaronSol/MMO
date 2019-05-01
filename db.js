const sqlite3 = require('sqlite3').verbose();

//db.run("CREATE TABLE IF NOT EXISTS highscore (name VARCHAR, score INT, id INT);");

let updateHighScore = (name, score) => {
    let db = new sqlite3.Database('./highscore.db');
    db.run("UPDATE highscore SET name = ?, score = ? WHERE id = 0", [name, score], err => {
        if(err) throw err;
    });
    db.close();
};

let getHighScoreObject = callback => {
    let db = new sqlite3.Database('./highscore.db');
    let sql = "SELECT * FROM highscore WHERE id = 0";
    db.get(sql, (err, row) => {
        if (err) throw err;
        console.log(row);
        callback({name: row.name, score: row.score});
    });
    db.close();
};

module.exports.updateHighScore = updateHighScore;
module.exports.getHighScoreObject = getHighScoreObject;

