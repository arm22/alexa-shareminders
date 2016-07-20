//Builds the slots object
//Takes parameter model object
//
//Returns a slots object
module.exports = function(model) {

  //Build the slots object
  var slots = {
    "slots": model.custom_slots
  };

  //Return slots object
  return slots;
};