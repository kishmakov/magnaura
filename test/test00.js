var fs = require('fs');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

exports['For Statements'] = function (test) {
    var ForStatementsScript = fs.readFileSync('./data/test00/ForStatements.ks').toString();
    tokenizer.init(ForStatementsScript);

//    var tokensNumber = 0;
//    while (!tokenizer.isEOTokens()) {
//        tokensNumber++;
//        tokenizer.advance();
//    }
//
//    test.equal(tokensNumber, 210);

    // parser

    var ForStatementsParsed = parser.parse(ForStatementsScript, 'ForStatements');
    test.equal(ForStatementsParsed.public.length, 5);
    test.equal(ForStatementsParsed.hash, '44bab1e647fb7b0d33b8921c');

    // compiler

    var ForStatementCompiled = compiler.compile(ForStatementsParsed);
    fs.writeFileSync('ForStatements.json', JSON.stringify(ForStatementCompiled, null, 2));


    test.done();
};