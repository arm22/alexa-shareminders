const express = require('express');
const fs = require('fs');
const alexa_app = require('alexa-app');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shareminder');
const Head = require('./models/model');
const app = express();
const https = require('https');
const options = {
  ca: fs.readFileSync('../ssl/www_slack-riddle_xyz.ca-bundle'),
  key: fs.readFileSync('../ssl/private-key.key'),
  cert: fs.readFileSync('../ssl/www_slack-riddle_xyz.crt')
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var alexa = new alexa_app.app('shareminder');

alexa.launch(
  function(request, response) {
    var id = request.data.session.user.userId;
    Head.findOne(
        {amazon_id: id},
        function(err, account) {
          if(err) console.error(err);
          if(account) {
            response.say("Welcome back!").shouldEndSession(false).send();
          } else {
            createAccount(id);
            response.say("Welcome, I have created you a new account. Add your name and your housemates names by simply saying add Alexa to my account.").shouldEndSession(false).send();
          }
        }
    );
    return false;
  }
);

alexa.sessionEnded(
  function(request, response) {
    response.clear();
    response.clearSession();
  }
);

alexa.intent("AddUser",
  function(request, response) {
    var name = request.slot("Name").toLowerCase();
    var id = request.data.session.user.userId;
    Head.findOne(
      {amazon_id: id},
      function(err, account) {
        if(err) console.error(err);
        if(!account) createAccount(id);
        var housemates = account.housemates;
        for(var i = 0; i < account.housemates.length; i++) {
          var db_name = account.housemates[i].name;
          if(name === db_name || name == db_name || name.indexOf(db_name) !== -1) {
            response.say("Cannot add duplicate " + name + " to your account." ).shouldEndSession(false).send();
          }
        }
        account.housemates.push({name: name});
        account.save(function(err) {
          if(err) console.log(err);
        });
        response.say("I've added " + name + " to your account.").shouldEndSession(false).send();
      });
    return false;
  }
);

alexa.intent("AddReminder",
  function(request, response) {
    var reminder = request.slot("Reminder");
    var name = request.slot("Name").toLowerCase();
    var id = request.data.session.user.userId;
    Head.findOne(
      {amazon_id: id},
      function(err, account) {
        if(err) console.error(err);
        if(!account) createAccount(id);
        for(var i = 0; i < account.housemates.length; i++) {
          var db_name = account.housemates[i].name;
          if(name === db_name || name == db_name || name.indexOf(db_name) !== -1) {
            account.housemates[i].reminders.push(reminder);
            account.save(function(err) {
              if(err) console.log(err);
            });
            response.say("I've reminded " + db_name + " to " + reminder + ".").shouldEndSession(false).send();
          }
        }
      });
    return false;
  }
);

alexa.intent("CompleteReminder",
  function(request, response) {
    var reminder = request.slot("Reminder");
    var name = request.slot("Name").toLowerCase();
    var id = request.data.session.user.userId;
    Head.findOne(
      {amazon_id: id},
      function(err, account) {
        if(err) console.error(err);
        if(!account) createAccount(id);
        for(var i = 0; i < account.housemates.length; i++) {
          var db_name = account.housemates[i].name;
          if(name === db_name || name == db_name || name.indexOf(db_name) !== -1) {
            var rem_list = account.housemates[i].reminders;
            var index = rem_list.indexOf(reminder);
            if(index > -1) {
              rem_list.splice(index, 1);
              account.housemates[i].reminders = rem_list;
              account.save(function(err) {
                if(err) console.log(err);
              });
              response.say("I've removed " + reminder + " from " + name + "'s list.").shouldEndSession(false).send();
            } else {
              response.say("Sorry, I can't find " + reminder + " in " + name + "'s list.").shouldEndSession(false).send();
            }
          }
        }
      });
    return false;
  }
);

alexa.intent("ListReminders",
  function(request, response) {
    var name = request.slot("Name").toLowerCase();
    var id = request.data.session.user.userId;
    Head.findOne(
      {amazon_id: id}, 
      function(err, account) { 
        if(err) console.error(err);
        if(!account) createAccount(id);
        for(var i = 0; i < account.housemates.length; i++) {
          var db_name = account.housemates[i].name;
          if(name === db_name || name == db_name || name.indexOf(db_name) !== -1) {
            var curr_user = account.housemates[i];
            if(!curr_user.reminders || curr_user.reminders.length == 0) {
              response.say("You have no reminders, way to go!");
            } else {
              response.say("Here are " + name + " reminders:");
              for(var j = 0; j < curr_user.reminders.length; j++) {
                response.say(curr_user.reminders[j] + ".");
              }
            }
          }
        }
        response.shouldEndSession(false).send();
      });
    return false;
  }
);

function createAccount(id) {
  var account = new Head({amazon_id: id});
  account.save(function(err) {
    if(err) return console.error(err);
  });
};

https.createServer(options, app).listen(443)
alexa.express(app, "/");