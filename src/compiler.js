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
            return [object[memberName]];
        };
    }

    function toString(result) {
        if (!(result instanceof Array)) {
            throw {
                message: 'unexpected object provided'
            };
        }

        if (result.length != 1) {
            throw {
                message: 'array of size ' + result.length + ' provided instead of one-element array'
            };
        }

        return result[0];
    }

    function concatenate(list, tail, separator) {
        if (list.length == 0) {
            return list.concat(tail);
        }

        if (arguments.length < 3) {
            separator = '';
        }

        list[list.length - 1] += separator + tail[0];
        return tail.length > 1 ? list.concat(tail.slice(1)) : list;

    }

// concatenation methods

    function stringifyArguments(arguments) {
        var result = [];
        for (var i = 0; i < arguments.length; i++) {
            result.push(stringifyAssignmentExpression(arguments[i]));
        }

        return result;
    }

    function stringifyArithmeticExpression(expression) {
        if (expression.type === Syntax.ArithmeticExpression) {
            var multiplicative = expression.operator === '*'
                || expression.operator === '/' || expression.operator === '%';

            var func = multiplicative
                ? stringifyUnaryExpression
                : stringifyArithmeticExpression;

            var result = func(expression.left);
            result = concatenate(result, [expression.operator], ' ');
            result = concatenate(result, stringifyArithmeticExpression(expression.right), ' ');
            return result;
        }

        return stringifyUnaryExpression(expression);
    }

    function stringifyArrayInitializer(expression) {
        return 'ArrayInitializer'; // TODO
    }

    function stringifyAssignmentExpression(expression) {
        if (expression.type === Syntax.AssignmentExpression) {
            var result = [expression.left + ' ' + expression.operator + ' '];
            result = concatenate(result, stringifyAssignmentExpression(expression.right))
            return result;
        }

        return stringifyConditionalExpression(expression);
    }

    function stringifyBitwiseExpression(expression) {
        if (expression.type === Syntax.BitwiseExpression) {
            var func = expression.operator === '&'
                ? stringifyComparisonExpression
                : stringifyBitwiseExpression;

            var result = func(expression.left);
            result = concatenate(result, [expression.operator], ' ');
            result = concatenate(result, stringifyBitwiseExpression(expression.right), ' ');
            return result;
        }
        return stringifyComparisonExpression(expression);
    }

    function stringifyBlock(blockElement, deepness) {
        expect(Syntax.BlockStatement, blockElement);
        var result = [indent(deepness) + '{'];
        result = result.concat(stringifyStatements(blockElement.statements, deepness + 1));
        result.push(indent(deepness) + '}');
        return result;
    }

    function stringifyCallExpression(expression) {
        var result;

        if (expression.type === Syntax.MemberExpression) {
            result = stringifyCallExpression(expression.object);
            if (expression.property.type === Syntax.Identifier) {
                result = concatenate(result, [expression.property.name], '.');
            } else {
                var se = stringifyExpression(expression.property);
                se[se.length - 1] += ']';
                result = concatenate(result, se, '[');
            }

            return result;
        }

        if (expression.type === Syntax.CallExpression) {
            result = stringifyCallExpression(expression.callee);
            result = concatenate(result, stringifyArguments(expression.arguments), '(');
            result[result.length - 1] += ')';
            return result;
        }

        return stringifyPrimaryExpression(expression);
    }

    function stringifyComparisonExpression(expression) {
        if (expression.type === Syntax.ComparisonExpression) {
            var inequality = expression.operator === '<' || expression.operator === '>'
                || expression.operator === '<=' || expression.operator === '>=';

            var func = inequality
                ? stringifyArithmeticExpression
                : stringifyComparisonExpression;

            var result = func(expression.left);
            result = concatenate(result, [expression.operator], ' ');
            result = concatenate(result, stringifyComparisonExpression(expression.right), ' ');
            return result;
        }

        return stringifyArithmeticExpression(expression);
    }

    function stringifyConditionalExpression(expression) {
        if (expression.type === Syntax.ConditionalExpression) {
            var result = stringifyLogicalExpression(expression.test);
            result = concatenate(result, stringifyAssignmentExpression(expression.consequent), ' ? ');
            result = concatenate(result, stringifyAssignmentExpression(expression.alternate), ' : ');
            return result;
        }

        return stringifyLogicalExpression(expression);
    }

    function stringifyFunctionExpression(expression) {
        return 'FunctionExpression'; // TODO
    }

    function stringifyExpression(expression) {
        expect(Syntax.Expression, expression);
        var result = [];
        var expressions = expression.expressions;
        for (var i = 0; i < expressions.length; i++) {
            result = concatenate(result, stringifyAssignmentExpression(expressions[i]), ', ');
        }
        return result;
    }

    function stringifyForInitializer(expression) {
        if (expression.type === Syntax.VariableDefinition) {
            return stringifyVariableDefinition(expression);
        }
        return ['ForInitializer']; // TODO
    }

    function stringifyForStatement(expression, deepness) {
        expect(Syntax.ForStatement, expression);
        var first = indent(deepness) + 'for (';

        first += toString(stringifyForInitializer(expression.init));
        first += '; ';
        first += toString(stringifyOptionalExpression(expression.condition));
        first += '; ';
        first += toString(stringifyOptionalExpression(expression.final));
        first += ')';

        var result = [first];
        result = result.concat(stringifyStatement(expression.body, deepness + 1));

        return result;
    }

    function stringifyLeftSide(expression) {
        return stringifyCallExpression(expression);
    }

    function stringifyLogicalExpression(expression) {
        if (expression.type === Syntax.LogicalExpression) {
            var func = expression.operator === '&&'
                ? stringifyBitwiseExpression
                : stringifyLogicalExpression;

            var result = func(expression.left);
            result = concatenate(result, [expression.operator], ' ');
            result = concatenate(result, stringifyLogicalExpression(expression.right), ' ');
            return result;
        }

        return stringifyBitwiseExpression(expression);
    }

    function stringifyObjectInitializer(expression) {
        return 'ObjectInitializer'; // TODO
    }

    function stringifyOptionalExpression(expression) {
        if (expression.type === Syntax.Empty) {
            return [''];
        }

        return stringifyExpression(expression);
    }

    function stringifyPrimaryExpression(expression) {
        var processors = {
            Identifier: GetterFunctional('name'),
            Literal: GetterFunctional('value'),
            FunctionExpression: stringifyFunctionExpression,
            ObjectExpression: stringifyObjectInitializer,
            ArrayExpression: stringifyArrayInitializer
        };

        for (var type in processors) {
            if (expression.type === Syntax[type]) {
                return processors[type](expression);
            }
        }

        var result = stringifyExpression(expression);
        result[0] = '(' + result[0];
        result[result.length - 1] += ')';
        return result;
    }

    function stringifyStatement(statement, deepness) {
        var processors = {
            VariableStatement: stringifyVariableStatement,
            ForStatement: stringifyForStatement
        }; // TODO add extra

        for (var type in processors) {
            if (statement.type === Syntax[type]) {
                return processors[type](statement, deepness);
            }
        }

        return [indent(deepness) + statement.type];
    }

    function stringifyStatements(statements, deepness) {
        var result = [];
        for (var i = 0; i < statements.length; i++) {
            result = result.concat(stringifyStatement(statements[i], deepness));
        }

        return result;
    }

    function stringifyUnaryExpression(expression) {
        var result;
        if (expression.type === Syntax.UpdateExpression) {
            if (expression.prefix) {
                result = [expression.operator];
                resutl = concatenate(result, stringifyUnaryExpression(expression.argument));
                return result;
            } else {
                result = stringifyLeftSide(expression.argument);
                result = concatenate(result, [expression.operator]);
                return result;
            }
        }

        if (expression.type == Syntax.UnaryExpression) {
            result = [expression.operator];
            result = concatenate(result, stringifyUnaryExpression(expression.argument))
            return  result;
        }

        return stringifyLeftSide(expression);
    }

    function stringifyVariableDeclaration(declaration) {
        expect(Syntax.VariableDeclaration, declaration);
        var result = [declaration.id];
        result = concatenate(result, stringifyVariableInitializer(declaration.initializer));
        return result;
    }

    function stringifyVariableDeclarationList(list) {
        var result = [];

        for (var i = 0; i < list.length; i++) {
            result = concatenate(result, stringifyVariableDeclaration(list[i]), ', ');
        }

        return result;
    }

    function stringifyVariableDefinition(definition) {
        expect(Syntax.VariableDefinition, definition);
        var list = stringifyVariableDeclarationList(definition.list);
        list[0] = 'var ' + list[0];
        return list;
    }

    function stringifyVariableInitializer(initializer) {
        if (initializer.type === Syntax.Empty) {
            return [''];
        }

        var result = [' = '];
        result = concatenate(result, stringifyAssignmentExpression(initializer));
        return result;
    }

    function stringifyVariableStatement(variableStatement, deepness) {
        expect(Syntax.VariableStatement, variableStatement);
        var declarations = variableStatement.list;
        var result = indent(deepness) + 'var ';
        for (var i = 0; i < declarations.length; i++) {
            result += stringifyVariableDeclaration(declarations[i]);
            result += i + 1 == declarations.length ? ';' : ', ';
        }

        return [result];
    }

// compilation

    function compilePublic(parsed) {
        var compiled = {};

        compiled['Name'] = parsed['Name'];
        compiled['Arguments'] = parsed['Arguments'];
        compiled['Body'] = stringifyBlock(parsed['Body'], 0);

        return compiled;
    }

    exports.compile = function (parsed) {
        var compiled = { public: [], private: [], fusion: [] };

        for (var i = 0; i < parsed['public'].length; i++) {
            compiled['public'].push(compilePublic(parsed['public'][i]));
        }


        return compiled;
    }

}(typeof exports === 'undefined' ? (compiler = {}) : exports));
