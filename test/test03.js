var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');

exports['Integrators Creation'] = function (test) {
    var PreProviderScript = fs.readFileSync('./data/test03/PreProvider.ks').toString();
    var Checker2Script = fs.readFileSync('./data/test03/Checker2.ks').toString();
    var PreChecker23Script = fs.readFileSync('./data/test03/PreChecker23.ks').toString();
    var PreChecker235Script = fs.readFileSync('./data/test03/PreChecker235.ks').toString();
    var PreChecker237Script = fs.readFileSync('./data/test03/PreChecker237.ks').toString();

    // parser

    var PreProviderParsed = parser.parse(PreProviderScript, 'PreProvider');
    var Checker2Parsed = parser.parse(Checker2Script, 'Checker2');
    var PreChecker23Parsed = parser.parse(PreChecker23Script, 'PreChecker23');
    var PreChecker235Parsed = parser.parse(PreChecker235Script, 'PreChecker235');
    var PreChecker237Parsed = parser.parse(PreChecker237Script, 'PreChecker237');

    // compiler

    var PreProviderCompiled = compiler.compile(PreProviderParsed);
    var Checker2Compiled = compiler.compile(Checker2Parsed);
    var PreChecker23Compiled = compiler.compile(PreChecker23Parsed);
    var PreChecker235Compiled = compiler.compile(PreChecker235Parsed);
    var PreChecker237Compiled = compiler.compile(PreChecker237Parsed);

    // assembler & disassembler

    var PreProvider = assembler.assemble(PreProviderCompiled);
    var Checker2 = assembler.assemble(Checker2Compiled);
    var PreChecker23 = assembler.assemble(PreChecker23Compiled);
    var PreChecker235 = assembler.assemble(PreChecker235Compiled);
    var PreChecker237 = assembler.assemble(PreChecker237Compiled);

    // fusion

    var Checker23 = PreChecker23.Checker23(Checker2);

    var Checker235 = PreChecker235.Checker235(Checker23);
    var Checker237 = PreChecker237.Checker237(Checker23);

    var Provider235 = PreProvider.Provider(Checker235);
    var Provider237 = PreProvider.Provider(Checker237);

    var nums235 = Provider235.provideNumbers();
    var nums237 = Provider237.provideNumbers();

    test.deepEqual(nums235, [1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 49, 53, 59]);
    test.deepEqual(nums237, [1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31, 37, 41, 43, 47, 53, 55, 59]);

    test.done();
};
