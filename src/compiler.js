(function (exports) {

    var common = require('../src/common');

// proxy for other modules

    var Syntax = common.Syntax;

// stuff

    function expect(expectedType, element) {
        if (element.type !== expectedType) {
            throw {
                message: 'expected t="' + expectedType + '" found t="' + element.type + '"'
            };
        }
    }

// concatenation methods

    function concatenateBlock(blockElement, deepness) {
        expect(Syntax.BlockStatement, blockElement);
        var result = [{o: deepness, v: '{'}];
        result = result.concat(concatenateStatements(blockElement.statements, deepness + 1));
        result.push({o: deepness, v: '}'});
        return result;
    }

    function concatenateStatement(statement, deepness) {
        return {o: deepness, v: statement.type};
    }

    function concatenateStatements(statements, deepness) {
        var result = [];
        for (var i = 0; i < statements.length; i++) {
            result.push(concatenateStatement(statements[i], deepness));
        }

        return result;
    }

// compilation

    function compile_public(parsed_public) {
        var compiled_public = {};

        compiled_public['Name'] = parsed_public['Name'];
        compiled_public['Arguments'] = parsed_public['Arguments'];
        compiled_public['Body'] = concatenateBlock(parsed_public['Body'], 0)

        return compiled_public;
    }

    exports.compile = function (parsed_script) {
        var compiled_script = { public: [], private: [], fusion: [] };

        for (var i = 0; i < parsed_script['public'].length; i++) {
            compiled_script['public'].push(compile_public(parsed_script['public'][i]));
        }

        return compiled_script;
    }

}(typeof exports === 'undefined' ? (compiler = {}) : exports));
