var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

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

exports['PreMesher2D Processing'] = function (test) {
    var PreMesherScript = fs.readFileSync('./data/test02/PreMesher2D.ks').toString();
    tokenizer.init(PreMesherScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 398);

    // parser

    var PreMesherParsed = parser.parse(PreMesherScript, 'PreMesher');

    test.equal(PreMesherParsed.public.length, 1);
    test.equal(PreMesherParsed.fusion.length, 1);
    test.equal(PreMesherParsed.hash, '70b079198762c9ed8fd7ac88');

    // compiler

    var PreMesherCompiled = compiler.compile(PreMesherParsed);
    fs.writeFileSync('premesher2d.json', JSON.stringify(PreMesherCompiled, null, 2));

    test.done();
};

exports['PreIntegrator Processing'] = function (test) {
    var PreIntegratorScript = fs.readFileSync('./data/test02/PreIntegrator.ks').toString();
    tokenizer.init(PreIntegratorScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 391);

    // parser

    var PreIntegratorParsed = parser.parse(PreIntegratorScript, 'PreIntegrator');

    test.equal(PreIntegratorParsed.public.length, 1);
    test.equal(PreIntegratorParsed.fusion.length, 1);
    test.equal(PreIntegratorParsed.hash, 'eee4ac64715b8d20c965132c');

    // compiler

    var PreIntegratorCompiled = compiler.compile(PreIntegratorParsed);
    fs.writeFileSync('preintegrator.json', JSON.stringify(PreIntegratorCompiled, null, 2));

    test.done();
};

exports['Mesher2D creation'] = function (test) {
    var Mesher1DSimpleScript = fs.readFileSync('./data/test02/Mesher1DSimple.ks').toString();
    var PreMesher2DScript = fs.readFileSync('./data/test02/PreMesher2D.ks').toString();
    var PreIntegratorScript = fs.readFileSync('./data/test02/PreIntegrator.ks').toString();

    // parser

    var Mesher1DSimpleParsed = parser.parse(Mesher1DSimpleScript, 'Mesher1DSimple');
    var PreMesher2DParsed = parser.parse(PreMesher2DScript, 'PreMesher2D');
    var PreIntegratorParsed = parser.parse(PreIntegratorScript, 'PreIntegrator');


    // compiler

    var Mesher1DSimpleCompiled = compiler.compile(Mesher1DSimpleParsed);
    var PreMesher2DCompiled = compiler.compile(PreMesher2DParsed);
    var PreIntegratorCompiled = compiler.compile(PreIntegratorParsed);

    // assembler

    var Mesher1DSimple = assembler.assemble(Mesher1DSimpleCompiled);
    var PreMesher2D = assembler.assemble(PreMesher2DCompiled);
    var PreIntegrator = assembler.assemble(PreIntegratorCompiled);

    var Mesher2D = PreMesher2D.Mesher2D(Mesher1DSimple);
    test.equal(PreMesher2D.hash, Mesher2D.hash);

    var Integrator = PreIntegrator.Integrator(Mesher2D);
    test.equal(PreIntegrator.hash, Integrator.hash);

    test.done();
};

