const express = require('express');
const alexa_app = require('alexa-app');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shareminder');
const Head = require('./models/schema');
const app = express();
const https = require('https');
const options = {
  ca: fs.readFileSync('ssl/www_slack-riddle_xyz.ca-bundle'),
  key: fs.readFileSync('ssl/private-key.key'),
  cert: fs.readFileSync('ssl/www_slack-riddle_xyz.crt')
}

var PORT = process.env.port || 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var alexa = new alexa_app.app('shareminder');

alexa.launch(function(request,response) {
  //Get the amazon ID, primary DB key
  console.log(request.data.session.user.userId);
  var admin = new Head({amazon_id: request.data.session.user.userId, housemates: [{name:"austin"}, {name:"candace"},{name:"nick"}]});
  admin.save(function(err) {
    if(err) return console.error(err);
  });
  // if (ID in database) {
  //   response.say("Welcome back!");
  // } else {
  //   add id to db
  //   reprompt for name

  // }
  response.say("You launched the app!");
});


alexa.intent("AddReminder",
  function(request, response) {
    var reminder = request.slot("Reminder");
    var name = request.slot("Name");
    var id = request.data.session.user.userId;
    Head.findOne(
      {amazon_id: id},
      function(err, account) {
        if(err) console.error(err);
        for(var i = 0; i < account.housemates.length; i++) {
          var db_name = account.housemates[i].name;
          if(name === db_name || name == db_name || name.indexOf(db_name) !== -1) {
            account.housemates[i].reminders.push(reminder);
            account.save(function(err) {
              if(err) console.log(err);
            });
            response.say("I've reminded " + db_name + " to " + reminder + ".");
            response.send();
          }
        }
      });
    return false;
  }
);

alexa.intent("ListReminders",
  function(request, response) {
    var name = request.slot("Name");
    var id = request.data.session.user.userId;
    Head.findOne(
      {amazon_id: id}, 
      function(err, account) { 
        if(err) console.error(err);
        for(var i = 0; i < account.housemates.length; i++) {
          var db_name = account.housemates[i].name;
          if(name === db_name || name == db_name || name.indexOf(db_name) !== -1) {
            var curr_user = account.housemates[i];
            if(!curr_user.reminders || curr_user.reminders.length == 0) {
              response.say("You have no reminders, way to go!");
            } else {
              for(var j = 0; j < curr_user.reminders.length; j++) {
                response.say(curr_user.reminders[j] + ".");
              }
            }
          }
        }
        response.send();
      });
    return false;
  }
);


alexa.express(app, "/");
https.createServer(options, app).listen(443)