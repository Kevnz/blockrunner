 
var minimongo = require("minimongo");
var IndexedDb = minimongo.IndexedDb; 
var LocalDb = minimongo.LocalStorageDb; 
var self;

var DataBase = function () {
	self=this;
	this.db = new LocalDb({ namespace: "game" });

	if (!this.db.levels) {
		this.db.addCollection('levels');
		this.db.levels.upsert({level:1});
	}



}

DataBase.prototype.getAllLevelsCleared = function (callback) {
	console.log(this.db);


	return this.db.levels.find({},{});
};

DataBase.prototype.saveLevel = function(level) {
	
	this.db.levels.upsert({level:level});
};

module.exports = DataBase;