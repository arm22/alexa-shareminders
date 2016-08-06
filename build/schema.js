//Builds the intent schema
//Takes parameter model object
//
//Returns a schema object
module.exports = function(model) {

  //Get intents from model param
  //Instatiate schema object
  var intents = model.intents;
  var intent_schema = {
    "intents": []
  };

  //Loop through all intents
  for (var intent of intents) {
    //Initiate intent
    var sample_intent = {
      "intent": intent.intent
    }

    //Check if the intent has slots
    if(intent.slots) {
      sample_intent.slots = [];

      //Loop through all slots
      for (var slot in intent.slots) {
        var name = slot;
        var type = "AMAZON." + intent.slots[slot];

        //Build and add slots to intent
        sample_intent.slots.push({"name": name, "type": type});
      }
    }

    //Push the intent on the schema object
    intent_schema.intents.push(sample_intent);
  }

  //Return schema object
  return intent_schema;
};