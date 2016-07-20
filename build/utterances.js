//Builds the sample utterances
//Takes parameter model object
//
//Returns an object of sample utterances
module.exports = function(model) {

  //Required modules
  const alexautterances = require('alexa-utterances');

  //Get intents from model param
  //Instantiate list of utterances
  var intents = model.intents;
  var utterances = {
    "sample_utterances":[]
  };

  //Loop through all intents
  for (var intent of intents) {
    var name = intent.intent;
    var templates = intent.templates;

    //Build and add permutations of utterances
    for (var template of templates) {
      utterances.sample_utterances = utterances.sample_utterances.concat(alexautterances(name + " " + template))
    }
  }

  //Return utterances object
  return utterances;
};