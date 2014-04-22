var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

exports['Sorter Processing'] = function (test) {
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

    var sorter_parsed = parser.parse(sorter_script, 'Sorter');
    test.equal(sorter_parsed.public.length, 1);
    test.equal(sorter_parsed.hash, '4a615d3e564d1aeced33898f');

    // compiler

    var sorter_compiled = compiler.compile(sorter_parsed);
    fs.writeFileSync('sorter.json', JSON.stringify(sorter_compiled, null, 2));

    // assembler

    var sorter_assembled = assembler.assemble(sorter_compiled);

    var array = [9, 2, 3];
    sorter_assembled.sort(array);
    test.deepEqual(array, [2, 3, 9]);

    test.done();
};

exports['Sequencer Processing'] = function (test) {
    var sequencer_script = fs.readFileSync('./data/test00/Sequencer.ks').toString();
    tokenizer.init(sequencer_script);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 199);

    // parser

    var sequencer_parsed = parser.parse(sequencer_script, 'Sequencer');

    test.equal(sequencer_parsed.public.length, 1);
    test.equal(sequencer_parsed.private.length, 1);
    test.equal(sequencer_parsed.fusion.length, 1);
    test.equal(sequencer_parsed.hash, 'e6aa32b729d8b922e2668b68');

    // compiler

    var sequencer_compiled = compiler.compile(sequencer_parsed);
    fs.writeFileSync('sequencer.json', JSON.stringify(sequencer_compiled, null, 2));

    test.done();
};

exports['Fusion of Sequencer and Sorter'] = function (test) {
    var sequencer_script = fs.readFileSync('./data/test00/Sequencer.ks').toString();
    var sorter_script = fs.readFileSync('./data/test00/Sorter.ks').toString()

    // parser

    var sequencer_parsed = parser.parse(sequencer_script, 'Sequencer');
    var sorter_parsed = parser.parse(sorter_script, 'Sorter');


    // compiler

    var sequencer_compiled = compiler.compile(sequencer_parsed);
    var sorter_compiled = compiler.compile(sorter_parsed);

    // assembler

    var sequencer_assembled = assembler.assemble(sequencer_compiled);
    var sorter_assembled = assembler.assemble(sorter_compiled);

    test.done();
};