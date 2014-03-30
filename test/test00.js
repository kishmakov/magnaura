var fs = require('fs');
var tokenizer = require('../src/tokenizer');

exports['Sorter tokens.'] = function (test) {
    var sorter_source = fs.readFileSync('./data/test00/sorter.ks').toString();
    tokenizer.init(sorter_source);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 84);
    test.done();
};

exports['Sequencer tokens.'] = function (test) {
    var sorter_source = fs.readFileSync('./data/test00/sequencer.ks').toString();
    tokenizer.init(sorter_source);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 199);
    test.done();
};