// Checks different sorters.

var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

var arrays = [
    [[2, 1], [1, 2]],
    [[9, 2, 3], [2, 3, 9]],
    [[1, 2, 1], [1, 1, 2]],
    [[4, 1, 5, 2, 6, 3], [1, 2, 3, 4, 5, 6]],
    [[4, 5, 3, 2, 1, 4], [1, 2, 3, 4, 4, 5]]
];

exports['Simple Sorter Composite'] = function (test) {
    // tokenizer

    var SorterScript = fs.readFileSync('./data/test01/SorterComposite.ks').toString();
    tokenizer.init(SorterScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 103);

    // parser

    var SorterParsed = parser.parse(SorterScript, 'Sorter');
    test.equal(SorterParsed.public.length, 1);
    test.equal(SorterParsed.private.length, 1);
    test.equal(SorterParsed.hash, '07fd75e36482fd42bbe9ab49');

    // compiler

    var SorterCompiled = compiler.compile(SorterParsed);
    fs.writeFileSync('sorter_composite.json', JSON.stringify(SorterCompiled, null, 2));

    // assembler

    var Sorter = assembler.assemble(SorterCompiled);

    for (var i = 0; i < arrays.length; i++) {
        Sorter.sort(arrays[i][0]);
        test.deepEqual(arrays[i][0], arrays[i][1]);
    }

    test.done();
};

exports['Simpler Sorter Monolithic'] = function (test) {
    // tokenizer

    var SorterScript = fs.readFileSync('./data/test01/SorterMonolithic.ks').toString();
    tokenizer.init(SorterScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 85);

    // parser

    var SorterParsed = parser.parse(SorterScript, 'Sorter');
    test.equal(SorterParsed.public.length, 1);
    test.equal(SorterParsed.hash, '4a615d3e564d1aeced33898f');

    // compiler

    var SorterCompiled = compiler.compile(SorterParsed);
    fs.writeFileSync('sorter_monolithic.json', JSON.stringify(SorterCompiled, null, 2));

    // assembler

    var Sorter = assembler.assemble(SorterCompiled);

    for (var i = 0; i < arrays.length; i++) {
        Sorter.sort(arrays[i][0]);
        test.deepEqual(arrays[i][0], arrays[i][1]);
    }

    test.done();
};
