var fs = require('fs');
var tokenizer = require('../src/tokenizer');
var parser = require('../src/parser');

exports['Sorter tokens.'] = function (test) {
    var sorter_source = fs.readFileSync('./data/test00/sorter.ks').toString();
    tokenizer.init(sorter_source);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 85);
    test.done();
};

exports['Sequencer tokens.'] = function (test) {
    var sequencer_source = fs.readFileSync('./data/test00/sequencer.ks').toString();
    tokenizer.init(sequencer_source);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 199);
    test.done();
};

exports['Sorter parsing.'] = function (test) {
    var sorter_source = fs.readFileSync('./data/test00/sorter.ks').toString();
    var parsed = parser.parse(sorter_source);

    test.equal(parsed['public'].length, 1);
    test.done();
};

exports['Sequencer parsing.'] = function (test) {
    var sequencer_source = fs.readFileSync('./data/test00/sequencer.ks').toString();
    var parsed = parser.parse(sequencer_source);

    test.equal(parsed['public'].length, 1);
    test.equal(parsed['private'].length, 1);
    test.equal(parsed['fusion'].length, 1);
    test.done();
};