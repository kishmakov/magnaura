var fs = require('fs');

function censor(key, value) {
    // if deal with function, we export it

    if (typeof(value) != 'object' || typeof(key) != 'number')
        return value;

    var keys = Object.keys(value);
    var res = "";

    for (var i in keys)
        res += keys[i] + ": " + value[keys[i]] + ";";

    console.log("res = " + res + "\n");

    return res;
}

//////////////////// Functions ///////////////

var sequenceJSONBody = fs.readFileSync('sequence.json', 'utf8');
var sequenceJSON = JSON.parse(sequenceJSONBody);
sequenceJSON['school'] = 'SPbSU';
var str = JSON.stringify(sequenceJSON, censor, 4);
fs.writeFileSync('sequence2.json', str);
