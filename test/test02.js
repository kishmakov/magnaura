var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

exports['Sorter processing.'] = function (test) {
    // tokenizer

    var sorter_script = fs.readFileSync('./data/test02/Sorter.ks').toString();
    tokenizer.init(sorter_script);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 103);

    // parser

    var parsed_script = parser.parse(sorter_script, 'Sorter');
    test.equal(parsed_script['public'].length, 1);
    test.equal(parsed_script['private'].length, 1);
    test.equal(parsed_script['Hash'], '07fd75e36482fd42bbe9ab49');

    // compiler

    var compiled_script = compiler.compile(parsed_script);
    fs.writeFileSync('sorter2.json', JSON.stringify(compiled_script, null, 2));

    // assembler

    var assembled_object = assembler.assemble(compiled_script);

    var b = [2, 1];
    assembled_object.swap(b, 0, 1);
    test.deepEqual(b, [1, 2]);

    var array = [9, 2, 3];
    assembled_object.sort(array);
    test.deepEqual(array, [2, 3, 9]);

    test.done();
};