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

    function indent(deepness) {
        var result = '';
        for (var i = 0; i < deepness; i++) {
            result += '\t';
        }

        return result;
    }

// concatenation methods

    function concatenateAssignmentExpression(expression) {
        if (expression.type === Syntax.AssignmentExpression) {
            var result = expression.left + ' ' + expression.operator + ' ';
            result += concatenateAssignmentExpression(expression.right);
            return result;
        }

        return concatenateConditionalExpression(expression);
    }

    function concatenateBlock(blockElement, deepness) {
        expect(Syntax.BlockStatement, blockElement);
        var result = [indent(deepness) + '{'];
        result = result.concat(concatenateStatements(blockElement.statements, deepness + 1));
        result.push(indent(deepness) + '}');
        return result;
    }

    function concatenateConditionalExpression(expression) {
        if (expression.type === Syntax.ConditionalExpression) {
            var result = concatenateLogicalExpression(expression.test);
            result += ' ? ';
            result += concatenateAssignmentExpression(expression.consequent);
            result += ' : ';
            result += concatenateAssignmentExpression(expression.alternate);
            return result;
        }

        return concatenateLogicalExpression(expression);
    }

    function concatenateLogicalExpression(expression) {
        return 'TODO';
    }

    function concatenateStatement(statement, deepness) {
        if (statement.type === Syntax.VariableStatement) {
            return concatenateVariableStatement(statement, deepness);
        }

        return indent(deepness) + statement.type;
    }

    function concatenateStatements(statements, deepness) {
        var result = [];
        for (var i = 0; i < statements.length; i++) {
            result.push(concatenateStatement(statements[i], deepness));
        }

        return result;
    }

    function concatenateVariableDeclaration(declaration) {
        expect(Syntax.VariableDeclaration, declaration);
        return declaration.id + concatenateVariableInitializer(declaration.initializer);
    }

    function concatenateVariableInitializer(initializer) {
        if (initializer.type === Syntax.Empty) {
            return '';
        }

        return ' = ' + concatenateAssignmentExpression(initializer);
    }

    function concatenateVariableStatement(variableStatement, deepness) {
        expect(Syntax.VariableStatement, variableStatement);
        var declarations = variableStatement.list;
        var result = indent(deepness) + 'var ';
        for (var i = 0; i < declarations.length; i++) {
            result += concatenateVariableDeclaration(declarations[i]);
            result += i + 1 == declarations.length ? ';' : ', ';
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
