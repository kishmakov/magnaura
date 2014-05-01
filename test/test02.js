var fs = require('fs');

var assembler = require('../src/assembler');
var compiler = require('../src/compiler');
var parser = require('../src/parser');
var tokenizer = require('../src/tokenizer');

var ns = [
    [50, 0.1],
    [100, 0.05],
    [200, 0.025]
];

var settings = [
    {
        func: function (x, y) { return x * Math.sin(x + y); },
        minX: 0,
        maxX: Math.PI,
        minY: 0,
        maxY: Math.PI,
        need: -4
    },
    {
        func: function (x, y) { return x * y * Math.sin(x + y); },
        minX: 0,
        maxX: 0.5 * Math.PI,
        minY: 0,
        maxY: 0.5 * Math.PI,
        need: Math.PI - 2
    }
];

function check(Integrator, Integrator2, test) {
    for (var i = 0; i < settings.length; i++) {
        var setting = settings[i];
        for (var j = 0; j < ns.length; j++) {
            var have = Integrator.integrate(
                setting.func,
                ns[j][0],
                setting.minX,
                setting.maxX,
                setting.minY,
                setting.maxY
            );

            var have2 = Integrator2.integrate(
                setting.func,
                ns[j][0],
                setting.minX,
                setting.maxX,
                setting.minY,
                setting.maxY
            );

            test.ok(Math.abs(have - setting.need) < ns[j][1], 'Error is not acceptable.');
            test.ok(Math.abs(have2 - setting.need) < ns[j][1], 'Error is not acceptable.');
            test.ok(Math.abs(have - have2) < 1e-12, 'Assembler does not work.');
        }
    }
}

exports['Mesher1DSimple Processing'] = function (test) {
    var Mesher1DSimpleScript = fs.readFileSync('./data/test02/Mesher1DSimple.ks').toString();
    tokenizer.init(Mesher1DSimpleScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 114);

    // parser

    var Mesher1DSimpleParsed = parser.parse(Mesher1DSimpleScript, 'Mesher1DSimple');

    test.equal(Mesher1DSimpleParsed.public.length, 1);
    test.equal(Mesher1DSimpleParsed.hash, '915b75e53daafb387d681012');

    // compiler

    var compilation = compiler.compile.bind(compiler, Mesher1DSimpleParsed);
    test.doesNotThrow(compilation);
//    fs.writeFileSync('Mesher1DSimple.json', JSON.stringify(Mesher1DSimpleCompiled, null, 2));

    test.done();
};

exports['Mesher1DSimpson Processing'] = function (test) {
    var Mesher1DSimpsonScript = fs.readFileSync('./data/test02/Mesher1DSimpson.ks').toString();
    tokenizer.init(Mesher1DSimpsonScript);

    var tokensNumber = 0;
    while (!tokenizer.isEOTokens()) {
        tokensNumber++;
        tokenizer.advance();
    }

    test.equal(tokensNumber, 170);

    // parser

    var Mesher1DSimpsonParsed = parser.parse(Mesher1DSimpsonScript, 'Mesher1DSimpson');

    test.equal(Mesher1DSimpsonParsed.public.length, 1);
    test.equal(Mesher1DSimpsonParsed.hash, 'e484b672118605a4a7c39ab1');

    // compiler

    var compilation = compiler.compile.bind(compiler, Mesher1DSimpsonParsed);
    test.doesNotThrow(compilation);
//    var Mesher1DSimpsonCompiled = compiler.compile(Mesher1DSimpsonParsed);
//    fs.writeFileSync('Mesher1DSimpson.json', JSON.stringify(Mesher1DSimpsonCompiled, null, 2));

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

    test.equal(tokensNumber, 416);

    // parser

    var PreMesherParsed = parser.parse(PreMesherScript, 'PreMesher');

    test.equal(PreMesherParsed.public.length, 1);
    test.equal(PreMesherParsed.fusion.length, 1);
    test.equal(PreMesherParsed.hash, 'c2bbec747410bfdf5e4f4ca4');

    // compiler

    var compilation = compiler.compile.bind(compiler, PreMesherParsed);
    test.doesNotThrow(compilation);
//    var PreMesherCompiled = compiler.compile(PreMesherParsed);
//    fs.writeFileSync('PreMesher2D.json', JSON.stringify(PreMesherCompiled, null, 2));

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

    var compilation = compiler.compile.bind(compiler, PreIntegratorParsed);
    test.doesNotThrow(compilation);

    test.done();
};

exports['Integrators Simple creation'] = function (test) {
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

    // assembler & disassembler

    var Mesher1DSimple = assembler.assemble(Mesher1DSimpleCompiled);
    var PreMesher2D = assembler.assemble(PreMesher2DCompiled);
    var PreIntegrator = assembler.assemble(PreIntegratorCompiled);

    var Mesher2D = PreMesher2D.Mesher2D(Mesher1DSimple);
    test.equal(PreMesher2D.hash, Mesher2D.hash);

    var Integrator = PreIntegrator.Integrator(Mesher2D);
    test.equal(PreIntegrator.hash, Integrator.hash);

    var IntegratorCompiled = assembler.disassemble(Integrator);
    test.equal(IntegratorCompiled.public.length, 1);
    test.equal(IntegratorCompiled.private.length, 2);
    fs.writeFileSync('IntegratorSimple.json', JSON.stringify(IntegratorCompiled, null, 2));

    var Integrator2 = assembler.assemble(IntegratorCompiled);

    // integrators test

    check(Integrator, Integrator2, test);

    test.done();
};

exports['Integrators Simpson creation'] = function (test) {
    var Mesher1DSimpsonScript = fs.readFileSync('./data/test02/Mesher1DSimpson.ks').toString();
    var PreMesher2DScript = fs.readFileSync('./data/test02/PreMesher2D.ks').toString();
    var PreIntegratorScript = fs.readFileSync('./data/test02/PreIntegrator.ks').toString();

    // parser

    var Mesher1DSimpsonParsed = parser.parse(Mesher1DSimpsonScript, 'Mesher1DSimpson');
    var PreMesher2DParsed = parser.parse(PreMesher2DScript, 'PreMesher2D');
    var PreIntegratorParsed = parser.parse(PreIntegratorScript, 'PreIntegrator');

    // compiler

    var Mesher1DSimpsonCompiled = compiler.compile(Mesher1DSimpsonParsed);
    var PreMesher2DCompiled = compiler.compile(PreMesher2DParsed);
    var PreIntegratorCompiled = compiler.compile(PreIntegratorParsed);

    // assembler & disassembler

    var Mesher1DSimpson = assembler.assemble(Mesher1DSimpsonCompiled);
    var PreMesher2D = assembler.assemble(PreMesher2DCompiled);
    var PreIntegrator = assembler.assemble(PreIntegratorCompiled);

    var Mesher2D = PreMesher2D.Mesher2D(Mesher1DSimpson);
    test.equal(PreMesher2D.hash, Mesher2D.hash);

    var Integrator = PreIntegrator.Integrator(Mesher2D);
    test.equal(PreIntegrator.hash, Integrator.hash);

    var IntegratorCompiled = assembler.disassemble(Integrator);
    test.equal(IntegratorCompiled.public.length, 1);
    test.equal(IntegratorCompiled.private.length, 2);
    fs.writeFileSync('IntegratorSimpson.json', JSON.stringify(IntegratorCompiled, null, 2));

    var Integrator2 = assembler.assemble(IntegratorCompiled);

    // integrators test

    check(Integrator, Integrator2, test);

    test.done();
};

