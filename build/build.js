//Required modules
const fs = require('fs');
const utterances = require('./utterances');
const schema = require('./schema');
const slots = require('./slots');

//Read model.json file
var model = JSON.parse(fs.readFileSync('model.json', 'utf8'));

//Write sample_utterances file
var write_utterances = fs.createWriteStream('./output/sample_utterances.txt', {'flags': 'w'});
for (var utterance of utterances(model).sample_utterances) {
  write_utterances.write(utterance + "\n")
};
write_utterances.end();

//Write intent_schema file
var write_schema = fs.createWriteStream('./output/intent_schema.json', {'flags': 'w'});
write_schema.write(JSON.stringify(schema(model)));
write_schema.end();

//Write slot_types file
var write_slots = fs.createWriteStream('./output/slot_types.txt', {'flags': 'w'});
for (var slot of slots(model).slots) {
  var name = Object.keys(slot)[0];
  write_slots.write(name + "\n\n");
  for (var option of slot[name]) {
    write_slots.write(option + "\n");
  };
  write_slots.write("================ \n")
};
write_slots.end();