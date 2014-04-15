var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

exports['Sorter processing.'] = function (test) {
    // tokenizer

    var sorter_script = fs.readFileSync('./data/test00/Sorter.ks').toString();
    tokenizer.init(sorter_script);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 85);

    // parser

    var parsed_script = parser.parse(sorter_script, 'Sorter');
    test.equal(parsed_script['public'].length, 1);

    // compiler

    var compiled_script = compiler.compile(parsed_script);
    fs.writeFileSync('sorter.json', JSON.stringify(compiled_script, null, 2));

    // assembler

    var assembled_object = assembler.assemble(compiled_script);

    var array = [9, 2, 3];
    assembled_object.sort(array);
    test.deepEqual(array, [2, 3, 9]);

    test.done();
};

exports['Sequencer tokens.'] = function (test) {
    var sequencer_source = fs.readFileSync('./data/test00/Sequencer.ks').toString();
    tokenizer.init(sequencer_source);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 199);
    test.done();
};

exports['Sequencer parsing.'] = function (test) {
    var sequencer_source = fs.readFileSync('./data/test00/Sequencer.ks').toString();
    var parsed = parser.parse(sequencer_source);

    test.equal(parsed['public'].length, 1);
    test.equal(parsed['private'].length, 1);
    test.equal(parsed['fusion'].length, 1);
    test.done();
};