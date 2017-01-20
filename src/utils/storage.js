var depot = require('depot');

var self;

var DataBase = function (collection) {
  self=this;
  this.db = depot(collection);
  console.log(this.db);
}

DataBase.prototype.getAllLevelsCleared = function (callback) {
  var self = this;
  var defaultLevel = {level:1, unlocked:Date.now()};
  var levels = this.db.all();

  console.log(levels);

  if (levels.length === 0) {
    this.db.save(defaultLevel);
    levels.push(defaultLevel);
  }

  return levels;

};

DataBase.prototype.saveLevel = function(level) {

  this.db.save({level:level, unlocked:Date.now()});
};

DataBase.prototype.getTopScores = function () {
  var scores = this.db.all();

  scores.sort(function (score1, score2) {
    return score1.score >= score2.score ? 1: -1;
  });

  return scores.slice(0,9);
}

DataBase.prototype.saveScore = function (score) {
  this.db.save({score:score, recorded:Date.now()});
};

module.exports = DataBase;
