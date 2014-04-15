var fs = require('fs');
var parser = require('../src/parser');

exports['Check for-cycle statement parsing.'] = function (test) {
    var source = fs.readFileSync('./data/test01/Fors.ks').toString();
    var result = parser.parse(source);

    // test.equal(tokensNumber, 84);
    test.done();
};