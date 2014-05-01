var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

// Checks different sorters.

var arrays = [
    [[2, 1], [1, 2]],
    [[9, 2, 3], [2, 3, 9]],
    [[1, 2, 1], [1, 1, 2]],
    [[4, 1, 5, 2, 6, 3], [1, 2, 3, 4, 5, 6]],
    [[4, 5, 3, 2, 1, 4], [1, 2, 3, 4, 4, 5]]
];

exports['Simple Composite Sorter'] = function (test) {
    var SorterScript = fs.readFileSync('./data/test01/SorterComposite.ks').toString();
    tokenizer.init(SorterScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 103);

    var SorterParsed = parser.parse(SorterScript, 'Sorter');

    test.equal(SorterParsed.public.length, 1);
    test.equal(SorterParsed.private.length, 1);
    test.equal(SorterParsed.hash, '07fd75e36482fd42bbe9ab49');

    var SorterCompiled = compiler.compile(SorterParsed);
    var Sorter = assembler.assemble(SorterCompiled);
    // fs.writeFileSync('sorter_composite.json', JSON.stringify(SorterCompiled, null, 2));

    for (var i = 0; i < arrays.length; i++) {
        Sorter.sort(arrays[i][0]);
        test.deepEqual(arrays[i][0], arrays[i][1]);
    }

    test.done();
};

exports['Simpler Monolithic Sorter'] = function (test) {
    var SorterScript = fs.readFileSync('./data/test01/SorterMonolithic.ks').toString();
    tokenizer.init(SorterScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 85);

     var SorterParsed = parser.parse(SorterScript, 'Sorter');

    test.equal(SorterParsed.public.length, 1);
    test.equal(SorterParsed.hash, '4a615d3e564d1aeced33898f');

    var SorterCompiled = compiler.compile(SorterParsed);
    var Sorter = assembler.assemble(SorterCompiled);
    // fs.writeFileSync('sorter_monolithic.json', JSON.stringify(SorterCompiled, null, 2));

    for (var i = 0; i < arrays.length; i++) {
        Sorter.sort(arrays[i][0]);
        test.deepEqual(arrays[i][0], arrays[i][1]);
    }

    test.done();
};

exports['Bas Sorter'] = function (test) {
    var SorterScript = fs.readFileSync('./data/test01/SorterBad.ks').toString();
    tokenizer.init(SorterScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 89);

    var SorterParsed = parser.parse(SorterScript, 'Sorter');
    test.equal(SorterParsed.public.length, 1);
    test.equal(SorterParsed.hash, '01a0ddc55958538c5330e4d1');

    var SorterCompiled = compiler.compile(SorterParsed);
    var Sorter = assembler.assemble(SorterCompiled);

    for (var i = 0; i < arrays.length; i++) {
        Sorter.sort(arrays[i][0]);
        test.deepEqual(arrays[i][0], arrays[i][1]);
    }

    test.done();
};

// Sequencer only.

exports['Sequencer Processing'] = function (test) {
    var SequencerScript = fs.readFileSync('./data/test01/Sequencer.ks').toString();
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
    test.equal(SequencerParsed.hash, 'ed080f5925308b8185e99b9d');

    // compiler

    var compilation = compiler.compile.bind(compiler, SequencerParsed);
    test.doesNotThrow(compilation);
    // fs.writeFileSync('sequencer.json', JSON.stringify(SequencerCompiled, null, 2));

    test.done();
};

// Sequencer to SorterSequencer.

var sequences = [
    [5, [10, 25, 31, 39, 49]],
    [7, [8, 24, 35, 42, 43, 53, 65]],
    [11, [4, 13, 24, 43, 46, 55, 67, 70, 81, 96, 97]],
    [13, [1, 2, 24, 33, 48, 65, 67, 74, 79, 95, 102, 103, 113]]
];


exports['Fusion of Sequencer and Monolithic Sorter'] = function (test) {
    var SequencerScript = fs.readFileSync('./data/test01/Sequencer.ks').toString();
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
        test.deepEqual(SortedSequencer.sortedSequence(num), sequence);
    }

    test.done();
};

exports['Fusion of Sequencer and Composite Sorter'] = function (test) {
    var SequencerScript = fs.readFileSync('./data/test01/Sequencer.ks').toString();
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

    var SortedSequencer = Sequencer.SortedSequencer(Sorter);

    test.equal(Sequencer.hash, SortedSequencer.hash);

    for (var i = 0; i < sequences.length; i++) {
        var num = sequences[i][0];
        var sequence = sequences[i][1];
        test.deepEqual(SortedSequencer.sortedSequence(num), sequence);
    }

    test.done();
};

exports['Fusion of Sequencer and Bad Sorter'] = function (test) {
    var SequencerScript = fs.readFileSync('./data/test01/Sequencer.ks').toString();
    var SorterScript = fs.readFileSync('./data/test01/SorterBad.ks').toString()

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
        var sortedSequence = SortedSequencer.sortedSequence(num);
        if (num < 11) {
            test.deepEqual(sortedSequence, sequence);
        } else {
            test.notDeepEqual(sortedSequence, sequence);
        }
    }

    test.done();
};
