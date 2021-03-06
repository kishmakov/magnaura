(function (exports) {

    var common = require('../src/common');

// proxy for other modules

    var Syntax = common.Syntax;

// global variables

    var PublicNames, PrivateNames, Hash;
    var FusionNames, FusionMode = false, FusionMethods;

    var UndefinedNames;
    var ScopedNames;

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

    function IdentifierProcessor(func) {
        return function (object) {
            var name = func(object)[0];

            if (!moduleName(name)) {
                if (undefinedName(name) || name in PublicNames) {
                    name = 'this.' + name;
                } else if (name in PrivateNames) {
                    name = 'this.' + name + '_' + Hash;
                }
            }

            return [name];
        }
    }

    function AddIndent(func, deepness) {
        return function (object) {
            var result = func(object, deepness);
            result[0] = indent(deepness) + result[0];
            return result;
        }
    }

    function QuotesWrapper(func) {
        return function (object) {
            var result = func(object);
            for (var i = 0, len = result.length; i < len; i++) {
                result[i] = '\'' + result[i] + '\'';
            }
            return result;
        }
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

        if (tail.length > 0) {
            list[list.length - 1] += separator + tail[0];
        }

        return tail.length > 1 ? list.concat(tail.slice(1)) : list;
    }

    function addBody(header, body) {
        if (body[0].trim() !== '{') {
            for (var i = 0, len = body.length; i < len; i++) {
                body[i] ='\t' + body[i];
            }
            return header.concat(body);
        } else {
            body[0] = '{';
            return concatenate(header, body, ' ');
        }
    }

    function registerName(id, value) {
        var lastScope = ScopedNames[ScopedNames.length - 1];
        lastScope[id] = arguments.length < 2 ? true : value;
    }

    function lookupName(id) {
        for (var i = ScopedNames.length - 1; i >= 0; i--) {
            if (id in ScopedNames[i]) {
                return ScopedNames[i][id];
            }
        }

        return null;
    }

    function moduleName(name) {
        return name === 'Math';
    }

    function undefinedName(name) {
        if (name in PublicNames || name in PrivateNames) {
            return false;
        }

        if (Boolean(lookupName(name))) {
            return false;
        }

        if (!(name in UndefinedNames)) {
            UndefinedNames[name] = 0;
        }

        UndefinedNames[name]++;
        return true;
    }

    function extendScope(ids) {
        var scope = {};

        if (arguments.length > 0) {
            for (var i in ids) {
                scope[ids[i]] = true;
            }
        }

        ScopedNames.push(scope);
    }

    function shrinkScope() {
        ScopedNames.pop();
    }

// concatenation methods

    function stringifyArguments(arguments, deepness) {
        var result = [], temp;
        for (var i = 0; i < arguments.length; i++) {
            temp = stringifyAssignmentExpression(arguments[i], deepness);
            result = concatenate(result, temp, ', ');
        }

        return result;
    }

    function stringifyArithmeticExpression(expression, deepness) {
        if (expression.type === Syntax.ArithmeticExpression) {
            var multiplicative = expression.operator === '*'
                || expression.operator === '/' || expression.operator === '%';

            var func = multiplicative
                ? stringifyUnaryExpression
                : stringifyArithmeticExpression;

            var result = func(expression.left, deepness);
            result = concatenate(result, [expression.operator], ' ');
            var second = stringifyArithmeticExpression(expression.right, deepness);
            result = concatenate(result, second, ' ');
            return result;
        }

        return stringifyUnaryExpression(expression, deepness);
    }

    function stringifyArrayInitializer(expression, deepness) {
        var result = ['[]'];

        if (expression.elements.length !== 0) {
            result = stringifyArguments(expression.elements, deepness);
            result[0] = '[' + result[0];
            result[result.length - 1] += ']';
        }

        return result;
    }

    function stringifyAssignmentExpression(expression, deepness) {
        if (expression.type === Syntax.AssignmentExpression) {
            var result = stringifyConditionalExpression(expression.left, deepness);
            result = concatenate(result, [expression.operator], ' ');
            var rhs = stringifyAssignmentExpression(expression.right, deepness);
            result = concatenate(result, rhs, ' ');
            return result;
        }

        return stringifyConditionalExpression(expression, deepness);
    }

    function stringifyBitwiseExpression(expression, deepness) {
        if (expression.type === Syntax.BitwiseExpression) {
            var func = expression.operator === '&'
                ? stringifyComparisonExpression
                : stringifyBitwiseExpression;

            var result = func(expression.left, deepness);
            result = concatenate(result, [expression.operator], ' ');
            var second = stringifyBitwiseExpression(expression.right, deepness);
            result = concatenate(result, second, ' ');
            return result;
        }
        return stringifyComparisonExpression(expression, deepness);
    }

    function stringifyBlockStatement(blockElement, deepness) {
        expect(Syntax.BlockStatement, blockElement);
        extendScope();
        var result = [indent(deepness) + '{'];
        result = result.concat(stringifyStatements(blockElement.statements, deepness + 1));
        result.push(indent(deepness) + '}');
        shrinkScope();
        return result;
    }

    function stringifyBreakStatement(statement, deepness) {
        var result = indent(deepness) + 'break';
        if (statement.label) {
            result += ' ' + statement.label;
        }

        return [result + ';'];
    }

    function stringifyCallExpression(expression, deepness) {
        var result;

        if (expression.type === Syntax.MemberExpression) {
            result = stringifyCallExpression(expression.object, deepness);
            if (expression.property.type === Syntax.Identifier) {
                if (FusionMode && result[0] in FusionNames) {
                    var object = result[0];
                    var method = expression.property.name;
                    if (!(object in FusionMethods)) {
                        FusionMethods[object] = {};
                    }

                    if (!(method in FusionMethods[object])) {
                        FusionMethods[object][method] = 0;
                    }

                    FusionMethods[object][method]++;
                    result = [object + '.' + expression.property.name];
                    result[0] += '.bind(' + object + ')';
                } else {
                    result = concatenate(result, [expression.property.name], '.');
                }
            } else {
                var se = stringifyExpression(expression.property, deepness);
                se[se.length - 1] += ']';
                result = concatenate(result, se, '[');
            }

            return result;
        }

        if (expression.type === Syntax.CallExpression) {
            result = stringifyCallExpression(expression.callee, deepness);
            var elements = ['()'];

            if (expression.arguments.length !== 0) {
                elements = stringifyArguments(expression.arguments, deepness);
                elements[0] = '(' + elements[0];
                elements[elements.length - 1] += ')';
            }

            return concatenate(result, elements);
        }

        return stringifyPrimaryExpression(expression, deepness);
    }

    function stringifyComparisonExpression(expression, deepness) {
        if (expression.type === Syntax.ComparisonExpression) {
            var inequality = expression.operator === '<' || expression.operator === '>'
                || expression.operator === '<=' || expression.operator === '>=';

            var func = inequality
                ? stringifyArithmeticExpression
                : stringifyComparisonExpression;

            var result = func(expression.left, deepness);
            result = concatenate(result, [expression.operator], ' ');
            var second = stringifyComparisonExpression(expression.right, deepness);
            result = concatenate(result, second, ' ');
            return result;
        }

        return stringifyArithmeticExpression(expression, deepness);
    }

    function stringifyConditionalExpression(expression, deepness) {
        if (expression.type === Syntax.ConditionalExpression) {
            var result = stringifyLogicalExpression(expression.test, deepness);
            var former = stringifyAssignmentExpression(expression.consequent, deepness);
            var latter = stringifyAssignmentExpression(expression.alternate, deepness);
            result = concatenate(result, former, ' ? ');
            result = concatenate(result, latter, ' : ');
            return result;
        }

        return stringifyLogicalExpression(expression, deepness);
    }

    function stringifyExpression(expression, deepness) {
        expect(Syntax.Expression, expression);
        var result = [];
        var expressions = expression.expressions;
        var assignment;
        for (var i = 0; i < expressions.length; i++) {
            assignment = stringifyAssignmentExpression(expressions[i], deepness);
            result = concatenate(result, assignment, ', ');
        }
        return result;
    }

    function stringifyExpressionStatement(statement, deepness) {
        expect(Syntax.ExpressionStatement, statement);
        var result = stringifyExpression(statement.expression, deepness);
        result[0] = indent(deepness) + result[0];
        result[result.length - 1] += ';';
        return result;
    }

    function stringifyForInitializer(expression) {
        if (expression.type === Syntax.VariableDefinition) {
            return stringifyVariableDefinition(expression);
        }

        if (expression.type === Syntax.Expression) {
            return stringifyExpression(expression);
        }

        expect(Syntax.Empty, expression);
        return [''];
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
        var body = stringifyStatement(expression.body, deepness);
        return addBody(result, body);
    }

    function stringifyFunctionExpression(expression, deepness) {
        var result = 'function ';

        if (expression.id) {
            result += expression.id;
            registerName(expression.id, expression.params);
        }

        extendScope(expression.params);

        result += '(';
        for (var i = 0, len = expression.params.length; i < len; i++) {
            result += i > 0 ? ', ' : '';
            result += expression.params[i];
        }
        result += ')';
        var body = stringifyBlockStatement(expression.body, deepness);
        result = [result].concat(body);

        shrinkScope();

        return result;
    }

    function stringifyIfStatement(statement, deepness) {
        expect(Syntax.IfStatement, statement);
        var result = [indent(deepness) + 'if (' + toString(stringifyExpression(statement.test)) + ')'];
        var body = stringifyStatement(statement.consequent, deepness);
        result = addBody(result, body);
        if (statement.alternate !== null) {
            body = stringifyStatement(statement.alternate, deepness);
            body = addBody(['else'], body);
            result = addBody(result, body);
        }

        return result;
    }

    function stringifyLeftSide(expression, deepness) {
        return stringifyCallExpression(expression, deepness);
    }

    function stringifyLogicalExpression(expression, deepness) {
        if (expression.type === Syntax.LogicalExpression) {
            var func = expression.operator === '&&'
                ? stringifyBitwiseExpression
                : stringifyLogicalExpression;

            var result = func(expression.left, deepness);
            result = concatenate(result, [expression.operator], ' ');
            var second = stringifyLogicalExpression(expression.right, deepness);
            result = concatenate(result, second, ' ');
            return result;
        }

        return stringifyBitwiseExpression(expression, deepness);
    }

    function stringifyObjectInitializer(expression, deepness) {
        var result = [], record, value;
        result.push('{');
        for (var i = 0, len = expression.properties.length; i < len; i++) {
            value = expression.properties[i].value;
            value = stringifyAssignmentExpression(value, deepness + 1);
            record = [indent(deepness + 1) + expression.properties[i].key];
            record = concatenate(record, value, ': ');
            if (i + 1 < len) {
                record[record.length - 1] += ','
            }
            result = result.concat(record);
        }
        result.push(indent(deepness) + '}');
        return result;
    }

    function stringifyOptionalExpression(expression, deepness) {
        if (expression.type === Syntax.Empty) {
            return [''];
        }

        return stringifyExpression(expression, deepness);
    }

    function stringifyPrimaryExpression(expression, deepness) {
        var processors = {
            ArrayExpression: stringifyArrayInitializer,
            FunctionExpression: stringifyFunctionExpression,
            Identifier: IdentifierProcessor(GetterFunctional('name')),
            ObjectExpression: stringifyObjectInitializer,
            QuotedLiteral: QuotesWrapper(GetterFunctional('value')),
            UnquotedLiteral: GetterFunctional('value')
        };

        var result;

        for (var type in processors) {
            if (expression.type === Syntax[type]) {
                return processors[type](expression, deepness);
            }
        }

        result = stringifyExpression(expression, deepness);
        result[0] = '(' + result[0];
        result[result.length - 1] += ')';
        return result;
    }

    function stringifyReturnStatement(statement, deepness) {
        var result = [indent(deepness) + 'return'], argument;
        if (statement.argument) {
            argument = stringifyExpression(statement.argument, deepness);
            result = concatenate(result, argument, ' ');
        }

        result[result.length - 1] += ';';
        return result;
    }

    function stringifyStatement(statement, deepness) {
        var processors = {
            BlockStatement: stringifyBlockStatement,
            BreakStatement: stringifyBreakStatement,
            ExpressionStatement: stringifyExpressionStatement,
            FunctionExpression: AddIndent(stringifyFunctionExpression, deepness),
            ForStatement: stringifyForStatement,
            IfStatement: stringifyIfStatement,
            ReturnStatement: stringifyReturnStatement,
            TestStatement: stringifyTestStatement,
            VariableStatement: stringifyVariableStatement
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

    function stringifyTestStatement(statement, deepness) {
        expect(Syntax.Expression, statement.test);
        expect(Syntax.CallExpression, statement.test.expressions[0]);
        var call = statement.test.expressions[0];
        var result = [];
        var offset = indent(deepness);
        var snapshot = offset + 'this.test_call';

        expect(Syntax.Identifier, call.callee);

        var callee = call.callee.name;
        var params = lookupName(callee);

        result.push(snapshot + ' = {};');
        result.push(snapshot + '[\'callee\'] = \'' + callee + '\';');

        var signature = snapshot + '[\'signature\'] = [';
        for (var i = 0, len = params.length; i < len; i++) {
            signature += i > 0 ? ', ' : '';
            signature += '\'' + params[i] + '\'';
        }
        result.push(signature + '];');

        var provided = [snapshot + '[\'params\'] = ['];
        FusionMode = false;
        params = concatenate(provided, stringifyArguments(call.arguments, 0));
        FusionMode = true;
        provided[provided.length - 1] += '];';
        result = result.concat(provided);

        result.push(offset + 'if (!' + callee + '(') ;
        result = concatenate(result, stringifyArguments(call.arguments, 0));
        result[result.length - 1] += ')) {';
        result.push(indent(deepness + 1) + 'throw this.test_call;');
        result.push(offset + '}');

        return result;
    }

    function stringifyUnaryExpression(expression, deepness) {
        var result, argument;
        if (expression.type === Syntax.UpdateExpression) {
            if (expression.prefix) {
                argument = stringifyUnaryExpression(expression.argument, deepness);
                result = [expression.operator];
                result = concatenate(result, argument);
                return result;
            } else {
                result = stringifyLeftSide(expression.argument, deepness);
                result = concatenate(result, [expression.operator]);
                return result;
            }
        }

        if (expression.type == Syntax.UnaryExpression) {
            result = [expression.operator];
            argument = stringifyUnaryExpression(expression.argument, deepness);
            result = concatenate(result, argument);
            return  result;
        }

        return stringifyLeftSide(expression, deepness);
    }

    function stringifyVariableDeclaration(declaration, deepness) {
        expect(Syntax.VariableDeclaration, declaration);
        registerName(declaration.id);
        var result = [declaration.id];
        var initializer = stringifyVariableInitializer(declaration.initializer, deepness);
        result = concatenate(result, initializer);
        return result;
    }

    function stringifyVariableDeclarationList(list, deepness) {
        var result = [], element;

        for (var i = 0; i < list.length; i++) {
            element = stringifyVariableDeclaration(list[i], deepness);
            result = concatenate(result, element, ', ');
        }

        return result;
    }

    function stringifyVariableDefinition(definition) {
        expect(Syntax.VariableDefinition, definition);
        var list = stringifyVariableDeclarationList(definition.list);
        list[0] = 'var ' + list[0];
        return list;
    }

    function stringifyVariableInitializer(initializer, deepness) {
        if (initializer.type === Syntax.Empty) {
            return [''];
        }

        var result = [' = '];
        var rhs = stringifyAssignmentExpression(initializer, deepness);
        result = concatenate(result, rhs);
        return result;
    }

    function stringifyVariableStatement(variableStatement, deepness) {
        expect(Syntax.VariableStatement, variableStatement);
        var declarations = variableStatement.list;
        var result = [indent(deepness) + 'var'];
        var declaration;
        for (var i = 0; i < declarations.length; i++) {
            declaration = stringifyVariableDeclaration(declarations[i], deepness);
            result = concatenate(result, declaration, i == 0 ? ' ' : ', ');
        }
        result[result.length - 1] += ';';
        return result;
    }

// compilation

    function collectNames(methods) {
        var result = {};
        for (var i = 0, len = methods.length; i < len; i++) {
            result[methods[i].name] = 0;
        }

        return result;
    }

    function compileFunction(parsed) {
        var compiled = {};

        extendScope(parsed.arguments);

        compiled['arguments'] = parsed.arguments;
        compiled['body'] = stringifyBlockStatement(parsed.body, 0);

        shrinkScope();
        return compiled;
    }

    function compilePublic(parsed) {
        var compiled = compileFunction(parsed);
        compiled['name'] = parsed.name;

        return compiled;
    }

    function compilePrivate(parsed) {
        var compiled = compileFunction(parsed);
        compiled['name'] = parsed.name + '_' + Hash;

        return compiled;
    }

    function compileFusion(parsed) {
        var compiled = {}, object;
        compiled['name'] = parsed.name;
        compiled['arguments'] = [];

        FusionNames = {};
        FusionMethods = {};

        for (var i in parsed.arguments) {
            var arg = parsed.arguments[i];
            if (arg[0] === '@') {
                arg = arg.substr(1);
            }
            FusionNames[arg] = arg;
            compiled.arguments.push(arg);
        }

        FusionMode = true;
        extendScope(FusionNames);
        var body = stringifyBlockStatement(parsed.body, 0);
        shrinkScope();
        FusionMode = false;

        compiled['body'] = ['{'];

        for (object in FusionMethods) {
            for (var method in FusionMethods[object]) {
                compiled.body.push('\tif (typeof ' + object + '.' + method + ' !== \'function\') {');
                compiled.body.push('\t\tthrow {');
                compiled.body.push('\t\t\tmessage: \'object ' + object + ' does not have method ' + method + '\'');
                compiled.body.push('\t\t};');
                compiled.body.push('\t}');
            }
        }

        compiled.body = compiled.body.concat(body.slice(1, body.length - 1));

        compiled.body.push('\tvar result = this.fusionCopy(\'' + parsed.name + '\');');
        for (object in FusionMethods) {
            compiled.body.push('\tthis.fusionAccumulate(result, ' + object + ');');
        }
        compiled.body.push('\tthis.fusionFinalize(result);');
        compiled.body.push('\treturn result;');
        compiled.body.push('}');

        return compiled;
    }

    exports.compile = function (parsed) {
        var compiled = { public: [], private: [], fusion: [] };
        compiled['description'] = {name: parsed.name};
        Hash = compiled['hash'] = parsed.hash;

        UndefinedNames = {};
        ScopedNames = [];

        PublicNames = collectNames(parsed.public);
        PrivateNames = collectNames(parsed.private);

        var i, len;

        for (i = 0, len = parsed.public.length; i < len; i++) {
            compiled.public.push(compilePublic(parsed.public[i]))
        }

        for (i = 0, len = parsed.private.length; i < len; i++) {
            compiled.private.push(compilePrivate(parsed.private[i]))
        }

        for (i = 0, len = parsed.fusion.length; i < len; i++) {
            compiled.fusion.push(compileFusion(parsed.fusion[i]))
        }

        compiled['undefined'] = UndefinedNames;

        return compiled;
    }

}(typeof exports === 'undefined' ? (compiler = {}) : exports));
