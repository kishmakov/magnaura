var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

exports['PreMesher2D Processing'] = function (test) {
    var PreMesherScript = fs.readFileSync('./data/test02/PreMesher2D.ks').toString();
    tokenizer.init(PreMesherScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

//    test.equal(tokensNumber, 416);

    // parser

    var PreMesherParsed = parser.parse(PreMesherScript, 'PreMesher');

    test.equal(PreMesherParsed.public.length, 1);
    test.equal(PreMesherParsed.fusion.length, 1);
//    test.equal(PreMesherParsed.hash, 'f70439c14fc7774e97b83b45');

    // compiler

    var PreMesherCompiled = compiler.compile(PreMesherParsed);
    fs.writeFileSync('premesher2d.json', JSON.stringify(PreMesherCompiled, null, 2));

    test.done();
};

exports['Mesher1D Processing'] = function (test) {
    var Mesher1DSimpleScript = fs.readFileSync('./data/test02/Mesher1DSimple.ks').toString();
    tokenizer.init(Mesher1DSimpleScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 100);

    // parser

    var Mesher1DSimpleParsed = parser.parse(Mesher1DSimpleScript, 'Mesher1DSimple');

    test.equal(Mesher1DSimpleParsed.public.length, 1);
    test.equal(Mesher1DSimpleParsed.hash, 'ef9ab5557ef87d9f80aeae69');

    // compiler

    var Mesher1DSimpleCompiled = compiler.compile(Mesher1DSimpleParsed);
    fs.writeFileSync('mesher1dsimple.json', JSON.stringify(Mesher1DSimpleCompiled, null, 2));

    test.done();
};

exports['Mesher2D creation'] = function (test) {
    var PreMesher2DScript = fs.readFileSync('./data/test02/PreMesher2D.ks').toString();
    var Mesher1DSimpleScript = fs.readFileSync('./data/test02/Mesher1DSimple.ks').toString();

    // parser

    var PreMesher2DParsed = parser.parse(PreMesher2DScript, 'PreMesher2D');
    var Mesher1DSimpleParsed = parser.parse(Mesher1DSimpleScript, 'Mesher1DSimple');


    // compiler

    var PreMesher2DCompiled = compiler.compile(PreMesher2DParsed);
    var Mesher1DSimpleCompiled = compiler.compile(Mesher1DSimpleParsed);

    // assembler

    var PreMesher2D = assembler.assemble(PreMesher2DCompiled);
    var Mesher1DSimple = assembler.assemble(Mesher1DSimpleCompiled);

    var Mesher2D = PreMesher2D.Mesher2D(Mesher1DSimple);

    test.equal(PreMesher2D.hash, Mesher2D.hash);

    test.done();
};

