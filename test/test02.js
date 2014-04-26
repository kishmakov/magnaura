var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

exports['Sequencer Processing'] = function (test) {
    var SequencerScript = fs.readFileSync('./data/test02/Sequencer.ks').toString();
    tokenizer.init(SequencerScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 204);

    // parser

    var SequencerParsed = parser.parse(SequencerScript, 'Sequencer');

    test.equal(SequencerParsed.public.length, 1);
    test.equal(SequencerParsed.private.length, 1);
    test.equal(SequencerParsed.fusion.length, 1);
    test.equal(SequencerParsed.hash, '20b902a9ab518fefa9f5bed9');

    // compiler

    var SequencerCompiled = compiler.compile(SequencerParsed);
    fs.writeFileSync('sequencer.json', JSON.stringify(SequencerCompiled, null, 2));

    test.done();
};

var sequences = [
    [5, [10, 25, 31, 39, 49]],
    [7, [8, 24, 35, 42, 43, 53, 65]],
    [11, [4, 13, 24, 43, 46, 55, 67, 70, 81, 96, 97]],
    [13, [1, 2, 24, 33, 48, 65, 67, 74, 79, 95, 102, 103, 113]]
];


exports['Fusion of Sequencer and Sorter'] = function (test) {
    var SequencerScript = fs.readFileSync('./data/test02/Sequencer.ks').toString();
    var SorterScript = fs.readFileSync('./data/test01/SorterMonolithic.ks').toString()

    // parser

    var SequencerParsed = parser.parse(SequencerScript, 'Sequencer');
    var SorterParsed = parser.parse(SorterScript, 'Sorter');


    // compiler

    var SequencerCompiled = compiler.compile(SequencerParsed);
    var SorterCompiled = compiler.compile(SorterParsed);

    // assembler

    var Sequencer = assembler.assemble(SequencerCompiled);
    var Sorter = assembler.assemble(SorterCompiled);

    var SortedSequencer = Sequencer.SortedSequencer(Sorter);

    test.equal(Sequencer.hash, SortedSequencer.hash);

    for (var i = 0; i < sequences.length; i++) {
        var num = sequences[i][0];
        var sequence = sequences[i][1];
        test.deepEqual(SortedSequencer.sorted_sequence(num), sequence);
    }

    test.done();
};

exports['Fusion of Sequencer and Combined Sorter'] = function (test) {
    var SequencerScript = fs.readFileSync('./data/test02/Sequencer.ks').toString();
    var SorterScript = fs.readFileSync('./data/test01/SorterComposite.ks').toString()

    // parser

    var SequencerParsed = parser.parse(SequencerScript, 'Sequencer');
    var SorterParsed = parser.parse(SorterScript, 'Sorter');


    // compiler

    var SequencerCompiled = compiler.compile(SequencerParsed);
    var SorterCompiled = compiler.compile(SorterParsed);

    // assembler

    var Sequencer = assembler.assemble(SequencerCompiled);
    var Sorter = assembler.assemble(SorterCompiled);

//    var SortedSequencer = Sequencer.SortedSequencer(Sorter);
//
//    test.equal(Sequencer.hash, SortedSequencer.hash);
//
//    for (var i = 0; i < sequences.length; i++) {
//        var num = sequences[i][0];
//        var sequence = sequences[i][1];
//        test.deepEqual(SortedSequencer.sorted_sequence(num), sequence);
//    }

    test.done();
};
