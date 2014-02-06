var fs = require('fs');

//////////////////// Functions ///////////////

var sequenceJSONBody = fs.readFileSync('sequence.json', 'utf8');
var sequenceJSON = JSON.parse(sequenceJSONBody);

var sequence = Function.apply(null, [sequenceJSON["generator"]]);

function demonstrate(sorterName) {
    var sorterBody = fs.readFileSync(sorterName, 'utf8');
    var sorter = Function.apply(null, ['a', sorterBody]);

    var tests = sequenceJSON["tests"];
    for (var testNum = 0; testNum < tests.length; testNum++) {
        var au = tests[testNum][0];
        var as = tests[testNum][1];

        sorter(au);

        var alen = au.length;
        var passed = true;

        for (var i = 0; i < alen; i++)
            passed &= (au[i] == as[i]);

        console.log("Test #" + testNum + (passed ? ": OK" : ": fail"));

        if (!passed)
            return;
    }

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

