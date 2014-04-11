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

    function GetterFunctional(memberName) {
        return function (object) {
            return object[memberName];
        };
    }

// concatenation methods

    function concatenateArguments(arguments) {
        var result = [];
        for (var i = 0; i < arguments.length; i++) {
            result.push(concatenateAssignmentExpression(arguments[i]));
        }

        return result;
    }

    function concatenateArithmeticExpression(expression) {
        if (expression.type === Syntax.ComparisonExpression) {
            var multiplicative = expression.operator === '*'
                || expression.operator === '/' || expression.operator === '%';

            var func = multiplicative
                ? concatenateUnaryExpression
                : concatenateArithmeticExpression;

            var result = func(expression.left);
            result += ' ' + expression.operator + ' ';
            result += concatenateArithmeticExpression(expression.right);
            return result;
        }

        return concatenateUnaryExpression(expression);
    }

    function concatenateArrayInitializer(expression) {
        return 'ArrayInitializer'; // TODO
    }

    function concatenateAssignmentExpression(expression) {
        if (expression.type === Syntax.AssignmentExpression) {
            var result = expression.left + ' ' + expression.operator + ' ';
            result += concatenateAssignmentExpression(expression.right);
            return result;
        }

        return concatenateConditionalExpression(expression);
    }

    function concatenateBitwiseExpression(expression) {
        if (expression.type === Syntax.BitwiseExpression) {
            var func = expression.operator === '&'
                ? concatenateComparisonExpression
                : concatenateBitwiseExpression;

            var result = func(expression.left);
            result += ' ' + expression.operator + ' ';
            result += concatenateBitwiseExpression(expression.right);

            return result;
        }
        return concatenateComparisonExpression(expression);
    }

    function concatenateBlock(blockElement, deepness) {
        expect(Syntax.BlockStatement, blockElement);
        var result = [indent(deepness) + '{'];
        result = result.concat(concatenateStatements(blockElement.statements, deepness + 1));
        result.push(indent(deepness) + '}');
        return result;
    }

    function concatenateCallExpression(expression) {

        if (expression.type === Syntax.MemberExpression) {
            var result = concatenateCallExpression(expression.object);
            result += expression.property.type === Syntax.Identifier
                ? '.' + expression.property.name
                : '[' + concatenateExpression(expression.property) + ']';

            return result;
        }

        if (expression.type === Syntax.CallExpression) {
            var result = concatenateCallExpression(expression.callee);
            var arguments = concatenateArguments(expression.arguments);

            for (var i = 0; i < arguments.length; i++) {
                result += i == 0 ? '(' : ', ';
                result += arguments[i];
            }

            return result + ')';
        }

        return concatenatePrimaryExpression(expression);
    }

    function concatenateComparisonExpression(expression) {
        if (expression.type === Syntax.ComparisonExpression) {
            var inequality = expression.operator === '<' || expression.operator === '>'
                || expression.operator === '<=' || expression.operator === '>=';

            var func = inequality
                ? concatenateArithmeticExpression
                : concatenateComparisonExpression;

            var result = func(expression.left);
            result += ' ' + expression.operator + ' ';
            result += concatenateComparisonExpression(expression.right);
            return result;
        }

        return concatenateArithmeticExpression(expression);
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

    function concatenateFunctionExpression(expression) {
        return 'FunctionExpression'; // TODO
    }

    function concatenateExpression(expression) {
        expect(expression, Syntax.Expression);
        var result = '';
        var expressions = expression.expressions;
        for (var i = 0; i < expressions.length; i++) {
            result += i == 0 ? '' : ', ';
            result += concatenateAssignmentExpression(expressions[i]);
        }
        return result;
    }

    function concatenateForInitializer(expression) {
        return 'ForInitializer'; // TODO
    }

    function concatenateForStatement(expression, deepness) {
        expect(Syntax.ForStatement, expression);
        var result = indent(deepness) + 'for (';

        result += concatenateForInitializer(expression.init);
        result += '; ';
        result += concatenateOptionalExpression(expression.condition);
        result += '; ';
        result += concatenateOptionalExpression(expression.final);
        result += ')\n';

        result += concatenateStatement(expression.body, deepness + 1);

        return result;
    }

    function concatenateLeftSide(expression) {
        return concatenateCallExpression(expression);
    }

    function concatenateLogicalExpression(expression) {
        if (expression.type === Syntax.LogicalExpression) {
            var func = expression.operator === '&&'
                ? concatenateBitwiseExpression
                : concatenateLogicalExpression;

            var result = func(expression.left);
            result += ' ' + expression.operator + ' ';
            result += concatenateLogicalExpression(expression.right);
            return result;
        }

        return concatenateBitwiseExpression(expression);
    }

    function concatenateObjectInitializer(expression) {
        return 'ObjectInitializer'; // TODO
    }

    function concatenateOptionalExpression(expression) {
        return 'OptionalExpression'; // TODO
    }

    function concatenatePrimaryExpression(expression) {
        var processors = {
            Identifier: GetterFunctional('name'),
            Literal: GetterFunctional('value'),
            FunctionExpression: concatenateFunctionExpression,
            ObjectExpression: concatenateObjectInitializer,
            ArrayExpression: concatenateArrayInitializer
        };

        for (var type in processors) {
            if (expression.type === Syntax[type]) {
                return processors[type](expression);
            }
        }

        return '(' + concatenateExpression(expression) + ')';
    }

    function concatenateStatement(statement, deepness) {

        var processors = {
            VariableStatement: concatenateVariableStatement,
            ForStatement: concatenateForStatement
        }; // TODO add extra

        for (var type in processors) {
            if (statement.type === Syntax[type]) {
                return processors[type](statement, deepness);
            }
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

    function concatenateUnaryExpression(expression) {
        var argument;
        if (expression.type === Syntax.UpdateExpression) {
            if (expression.prefix) {
                argument = concatenateUnaryExpression(expression.argument);
                return expression.operator + argument;
            } else {
                argument = concatenateLeftSide(expression.argument);
                return argument + expression.operator;
            }
        }

        if (expression.type == Syntax.UnaryExpression) {
            argument = concatenateUnaryExpression(expression.argument);
            return expression.operator + argument;
        }

        return concatenateLeftSide(expression);
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
        compiled_public['Body'] = concatenateBlock(parsed_public['Body'], 0);

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
