var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
  name: { type: String, unique: true },
  reminders: Array
});

var headSchema = new Schema({
  amazon_id: String,
  housemates: [userSchema]
});

var Head = mongoose.model('Head', headSchema);

module.exports = Head;