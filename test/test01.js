var fs = require('fs');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

exports['Check for-cycle statement parsing.'] = function (test) {
    var fors_script = fs.readFileSync('./data/test01/Fors.ks').toString();
    tokenizer.init(fors_script);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 140);

    // parser

    var parsed_script = parser.parse(fors_script, 'Fors');
    test.equal(parsed_script.public.length, 1);
    test.equal(parsed_script.hash, '1197de201aa8be6bf5a56b19');

    // compiler

    var compiled_script = compiler.compile(parsed_script);
    fs.writeFileSync('fors.json', JSON.stringify(compiled_script, null, 2));


    test.done();
};