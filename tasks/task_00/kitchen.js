var fs = require('fs');

//////////////////// Functions ///////////////

var sequenceBody = fs.readFileSync('sequence.js', 'utf8');
var sequence = Function.apply(null, [sequenceBody]);

function demonstrate(sorterName) {
    var sorterBody = fs.readFileSync(sorterName, 'utf8');
    var sorter = Function.apply(null, ['a', sorterBody]);

    var a = sequence();
    fs.writeFileSync('before.txt', a.toString());
    sorter(a);
    fs.writeFileSync('after.txt', a.toString());
}

//////////////////// Body ////////////////////

process.stdin.resume();
process.stdin.setEncoding('utf8');
var util = require('util');

console.log('Enter sorter file name:');

process.stdin.on('data', function (text) {
    var input = util.inspect(text);
    var len = input.length;
    var sorterName = input.substring(1, len - 3)
    try {
        demonstrate(sorterName);
    } catch (e) {
        console.log('Couldn\'t open sorter "' + sorterName + '", reason: ' + e.toString());
    }

    process.exit();
});

