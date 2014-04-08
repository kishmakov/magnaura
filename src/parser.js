// This parser is based on reduced JS grammar, see
// http://www-archive.mozilla.org/js/language/grammar14.html

(function (exports) {

    var common = require('../src/common');
    var tokenizer = require('../src/tokenizer');

// proxy for other modules

    var Token = common.Token;
    var Syntax = common.Syntax;

// navigation at token level

    function sameTokens(have, expectedType, expectedValue) {
        var result = true;

        if (arguments.length === 2) {
            result = result && have.type === expectedType;
        }

        if (arguments.length === 3) {
            result = result && have.value === expectedValue;
        }

        return result;
    }

    function matchToken(expectedType, expectedValue) {
        var parsed = tokenizer.getToken();
        tokenizer.advance();

        var ok = arguments.length == 3
            ? sameTokens(parsed, expectedType, expectedValue)
            : sameTokens(parsed, expectedType);

        if (!ok) {
            var exception = { message: '' };
            exception.message += 'expected t="' + expectedType + '" v="' + expectedValue;
            exception.message += 'found t "' + parsed.type + '" v="' + parsed.value + '"';
            throw exception;
        }

        return parsed;
    }

    function matchSemicolon() {
        matchToken(Token.Separator, ';');
    }

    function isAssignment(value) {
        return value === '=' || value === '*=' || value === '/=' ||
            value === '%=' || value === '+=' || value === '-=' ||
            value === '<<=' || value === '>>=' || value === '>>>=' ||
            value === '&=' ||  value === '^=' || value === '|=';
    }

    function matchAssignment(msg) {
        var token = tokenizer.getToken();
        tokenizer.advance();

        if (token.type !== Token.Operator || !isAssignment(token.value)) {
            throw {
                message: msg + ': expected assignment operator'
            };
        }

        return token;
    }

    function nextIsOperator(value) {
        return sameTokens(tokenizer.getToken(), Token.Operator, value);
    }

    function nextIsSeparator(value) {
        return sameTokens(tokenizer.getToken(), Token.Separator, value);
    }

    function nextIsAssignment() {
        var token = tokenizer.getToken();
        return token.type === Token.Operator && isAssignment(token.value);
    }

// logic

    function parseAdditiveExpression() {
        var expression = parseMultiplicativeExpression();

        if (!nextIsOperator('+') && !nextIsOperator('-')) {
            return expression;
        }

        var op = tokenizer.getToken();
        tokenizer.advance();

        return {
            type: Syntax.ArithmeticExpression,
            operator: op.value,
            left: expression,
            right: parseAdditiveExpression()
        }
    }

    function parseArguments() {
        var arguments = [];

        matchToken(Token.Separator, '(');
        while (!nextIsSeparator(')')) {
            arguments.push(parseAssignmentExpression());
            if (nextIsSeparator(',')) {
                tokenizer.advance();
            }
        }
        matchToken(Token.Separator, ')');

        return arguments;
    }

    function parseArrayInitializer() {
        var elements = [];
        matchToken(Token.Separator, '[');

        while (!nextIsSeparator(']')) {
            elements.push(parseAssignmentExpression());
            if (nextIsSeparator(',')) {
                tokenizer.advance();
            }
        }

        matchToken(Token.Separator, ']');

        return {
            type: Syntax.ArrayExpression,
            elements: elements
        };

    }

    function parseAssignmentExpression() {
        var expression = parseConditionalExpression();

        if (nextIsAssignment()) {
            var assignment = matchAssignment('parseAssignmentExpression');
            return {
                type: Syntax.AssignmentExpression,
                operator: assignment.value,
                left: expression,
                right: parseAssignmentExpression()
            };
        }

        return expression;
    }

    function parseBitwiseAndExpression() {
        var expression = parseEqualityExpression();

        if (!nextIsOperator('&')) {
            return expression;
        }

        tokenizer.advance();
        return {
            type: Syntax.BitwiseExpression,
            operator: '&',
            left: expression,
            right: parseBitwiseAndExpression()
        };
    }

    function parseBitwiseOrExpression() {
        var expression = parseBitwiseXorExpression();

        if (!nextIsOperator('|')) {
            return expression;
        }

        tokenizer.advance();
        return {
            type: Syntax.BitwiseExpression,
            operator: '|',
            left: expression,
            right: parseBitwiseOrExpression()
        };
    }

    function parseBitwiseXorExpression() {
        var expression = parseBitwiseAndExpression();

        if (!nextIsOperator('^')) {
            return expression;
        }

        tokenizer.advance();
        return {
            type: Syntax.BitwiseExpression,
            operator: '^',
            left: expression,
            right: parseBitwiseXorExpression()
        };
    }

    function parseBlock() {
        var statements = [];

        matchToken(Token.Separator, '{');
        while (!nextIsSeparator('}')) {
            statements.push(parseStatement());
        }
        matchToken(Token.Separator, '}');

        return {
            type: Syntax.BlockStatement,
            statements: statements
        }
    }

    function parseBreakStatement() {
        matchToken(Token.JSKeyword, 'break');
        var token = tokenizer.getToken();
        var label = null;
        if (token.type === Token.Identifier) {
            label = token.value;
            tokenizer.advance();
        }
        matchSemicolon();

        return {
            type: Syntax.BreakStatement,
            label: label
        };
    }

    function parseConditionalExpression() {
        var expression = parseLogicalOrExpression();

        if (!nextIsOperator('?')) {
            return expression;
        }

        matchToken(Token.Operator, '?');
        var consequent = parseAssignmentExpression();
        matchToken(Token.Operator, ':');

        return {
            type: Syntax.LogicalExpression,
            test: expression,
            consequent: consequent,
            alternate: parseAssignmentExpression()
        };
    }

    function parseCallExpression() {
        var expression = parsePrimaryExpression();

        while (!tokenizer.isEOTokens()) {
            if (nextIsOperator('.')) {
                tokenizer.advance();
                var identifier = matchToken(Token.Identifier);
                var property = {
                    type: Syntax.Identifier,
                    name: identifier.value
                };
                expression = {
                    type: Syntax.MemberExpression,
                    object: expression,
                    property: property
                };
            } else if (nextIsSeparator('[')) {
                tokenizer.advance();
                var property = parseExpression();
                expresssion = {
                    type: Syntax.MemberExpression,
                    object: expression,
                    property: property
                };
                matchToken(Token.Separator, ']');
            } else if (nextIsSeparator('(')) {
                expression = {
                    type: Syntax.CallExpression,
                    callee: expression,
                    arguments: parseArguments()
                };
            } else {
                break;
            }
        }

        return expression;
    }

    function parseContinueStatement() {
        matchToken(Token.JSKeyword, 'continue');
        var token = tokenizer.getToken();
        var label = null;
        if (token.type === Token.Identifier) {
            label = token.value;
            tokenizer.advance();
        }
        matchSemicolon();

        return {
            type: Syntax.ContinueStatement,
            label: label
        };
    }

    function parseDoWhileStatement() {
        matchToken(Token.JSKeyword, 'do');
        var body = parseStatement();
        matchToken(Token.JSKeyword, 'while');
        matchToken(Token.Separator, '(');
        var expression = parseExpression();
        matchToken(Token.Separator, ')');
        matchSemicolon();

        return {
            type: Syntax.DoWhileStatement,
            body: body,
            test: expression.expression
        };
    }

    function parseExpression() {
        var expressions = [];

        while (true) {
            expressions.push(parseAssignmentExpression());
            if (nextIsSeparator(',')) {
                tokenizer.advance();
                continue;
            }
            break;
        }

        return {
            type: Syntax.Expression,
            expressions: expressions
        };
    }

    function parseEqualityExpression() {
        var expression = parseRelationalExpression();

        if (!nextIsOperator('!==') && !nextIsOperator('===')
            && !nextIsOperator('==') && !nextIsOperator('!=')) {
            return expression;
        }

        var op = tokenizer.getToken();
        tokenizer.advance();

        return {
            type: Syntax.LogicalExpression,
            operator: op.value,
            left: expression,
            right: parseEqualityExpression()
        };

    }

    function parseExpressionStatement() {
        var expression = parseExpression();
        matchSemicolon();
        return {
            type: Syntax.ExpressionStatement,
            expression: expression
        };
    }

    function parseForInitializer() {
        if (nextIsSeparator(';')) {
            return {
                type: Syntax.Empty
            };
        }

        if (sameTokens(tokenizer.getToken(), Token.JSKeyword, 'var')) {
            tokenizer.advance();
            return parseVariableDeclarationList();
        }

        return parseExpression();
    }

    function parseForStatement() {
        matchToken(Token.JSKeyword, 'for');
        matchToken(Token.Separator, '(');

        var result = {type: Syntax.ForStatement};

        result['init'] = parseForInitializer();
        matchSemicolon();
        result['condition'] = parseOptionalExpression();
        matchSemicolon();
        result['final'] = parseOptionalExpression();
        matchToken(Token.Separator, ')');

        result['body'] = parseStatement();

        return result;
    }

    function parseFunctionExpression() {
        var id = null;

        matchToken(Token.JSKeyword, 'function');
        if (!nextIsSeparator('(')) {
            var token = matchToken(Token.Identifier);
            id = token.value;
        }

        params = parseParams();

        return {
            type: Syntax.FunctionExpression,
            id: id,
            params: params,
            body: parseBlock()
        };
    }

    function parseIfStatement() {
        matchToken(Token.JSKeyword, 'if');
        matchToken(Token.Separator, '(');
        var test = parseExpression();
        matchToken(Token.Separator, ')');
        var consequent = parseStatement();
        var alternate;
        if (sameTokens(tokenizer.getToken(), Token.JSKeyword, 'else')) {
            tokenizer.advance();
            alternate = parseStatement();
        }

        return {
            type: Syntax.IfStatement,
            test: test.expressions,
            consequent: consequent,
            alternate: alternate
        };
    }

    function parseLeftSideExpression() {
        return parseCallExpression();
    }

    function parseLogicalAndExpression() {
        var expression = parseBitwiseOrExpression();

        if (!nextIsOperator('&&')) {
            return expression;
        }

        tokenizer.advance();
        return {
            type: Syntax.LogicalExpression,
            operator: '&&',
            left: expression,
            right: parseLogicalAndExpression()
        };
    }

    function parseLogicalOrExpression() {
        var expression = parseLogicalAndExpression();

        if (!nextIsOperator('||')) {
            return expression;
        }

        tokenizer.advance();
        return {
            type: Syntax.LogicalExpression,
            operator: '||',
            left: expression,
            right: parseLogicalOrExpression()
        }
    }

    function parseMultiplicativeExpression() {
        var expression = parseUnaryExpression();

        if (!nextIsOperator('*') && !nextIsOperator('/') && !nextIsOperator('%')) {
            return expression;
        }

        var op = tokenizer.getToken();
        tokenizer.advance();

        return {
            type: Syntax.ArithmeticExpression,
            operator: op.value,
            left: expression,
            right: parseMultiplicativeExpression()
        }
    }

    function parseObjectInitializer() {
        var properties = [];

        matchToken(Token.Separator, '{');
        while (!nextIsSeparator('}')) {
            var key = tokenizer.getToken();
            tokenizer.advance();
            matchToken(Token.Separator, ':');
            var value = parseAssignmentExpression();
            properties.push({
                key: key,
                value: value
            });

            if (nextIsSeparator(',')) {
                tokenizer.advance();
            }
        }
        matchToken(Token.Separator, '}');

        return {
            type: Syntax.ObjectExpression,
            properties: properties
        };
    }

    function parseParams() {
        var params = [];

        matchToken(Token.Separator, '(');
        while (!nextIsSeparator(')')) {
            var token = matchToken(Token.Identifier);
            params.push(token.value);
            if (nextIsSeparator(',')) {
                tokenizer.advance();
            }
        }
        matchToken(Token.Separator, ')');
        return params;
    }

    function parsePrimaryExpression() {
        if (nextIsSeparator('[')) {
            return parseArrayInitializer();
        }

        if (nextIsSeparator('{')) {
            return parseObjectInitializer();
        }

        if (nextIsSeparator('(')) {
            tokenizer.advance();
            var expression = parseExpression();
            matchToken(Token.Separator, ')');
            return expression;
        }

        var token = tokenizer.getToken();

        if (sameTokens(token, Token.JSKeyword, 'function')) {
            return parseFunctionExpression();
        }

        tokenizer.advance();

        if (token.type === Token.Identifier) {
            return {
                type: Syntax.Identifier,
                name: token.value
            };
        }

        if (token.type === Token.BooleanLiteral) {
            return {
                type: Syntax.Literal,
                value: (token.value === 'true')
            };
        }

        if (token.type === Token.NullLiteral) {
            return {
                type: Syntax.Literal,
                value: null
            };
        }

        if (token.type === Token.NumericLiteral) {
            return {
                type: Syntax.Literal,
                value: token.value
            };
        }

        if (token.type === Token.StringLiteral) {
            return {
                type: Syntax.Literal,
                value: token.value
            };
        }

        throw {
            message: message + ': unexpected token'
        }
    }

    function parseReturnStatement() {
        var argument = null;

        matchToken(Token.JSKeyword, 'return');
        if (!nextIsSeparator(';')) {
            var token = parseExpression();
            argument = token.value;
        }
        matchSemicolon();

        return {
            type: Syntax.ReturnStatement,
            argument: argument
        };
    }

    function parseStatement() {
        if (tokenizer.isEOTokens()) {
            throw {
                message: 'Unexpected EOTokens'
            }
        }

        var token = tokenizer.getToken();

        if (token.type === Token.Separator) {
            switch (token.value) {
                case ';':
                    tokenizer.advance();
                    return {
                        type: Syntax.Empty
                    };
                case '{':
                    return parseBlock();
                default:
                    break;
            }
        }

        if (token.type === Token.JSKeyword) {
            switch (token.value) {
                // JS
                case 'break':
                    return parseBreakStatement();
                case 'continue':
                    return parseContinueStatement();
                case 'do':
                    return parseDoWhileStatement();
                case 'for':
                    return parseForStatement();
                case 'function':
                    return parseFunctionExpression();
                case 'if':
                    return parseIfStatement();
                case 'return':
                    return parseReturnStatement();
                case 'switch':
                    return parseSwitchStatement();
                case 'var':
                    return parseVariableStatement();
                case 'while':
                    return parseWhileStatement();
                case 'with':
                    return parseWithStatement();
                // KS
                case 'control':
                    return parseControlStatement();
                default:
                    break;
            }
        }

        return parseExpressionStatement();
    }

    function parseOptionalExpression() {
        if (sameTokens(tokenizer.getToken(), Token.Separator)) {
            return {
                type: Syntax.Empty
            };
        }

        return parseExpression();
    }

    function parsePostfixExpression() {
        var expression = parseLeftSideExpression();

        if (nextIsOperator('++') || nextIsOperator('--')) {
            var op = tokenizer.getToken();
            tokenizer.advance();
            expression = {
                type: Syntax.UpdateExpression,
                operator: op.value,
                argument: expression,
                prefix: false
            };
        }

        return expression;
    }

    function parseRelationalExpression() {
        var expression = parseShiftExpression();

        if (!nextIsOperator('<=') && !nextIsOperator('>=')
            && !nextIsOperator('<') && !nextIsOperator('>')) {
            return expression;
        }

        var op = tokenizer.getToken();
        tokenizer.advance();

        return {
            type: Syntax.LogicalExpression,
            operator: op.value,
            left: expression,
            right: parseRelationalExpression()
        }
    }

    function parseShiftExpression() {
        var expression = parseAdditiveExpression();

        if (!nextIsOperator('<<') && !nextIsOperator('>>') && !nextIsOperator('>>>')) {
            return expression;
        }

        var op = tokenizer.getToken();
        tokenizer.advance();

        return {
            type: Syntax.LogicalExpression,
            operator: op.value,
            left: expression,
            right: parseShiftExpression()
        }
    }

    function parseUnaryExpression() {

        if (nextIsOperator('++') || nextIsOperator('--')) {
            var op = tokenizer.getToken();
            tokenizer.advance();
            return {
                type: Syntax.UpdateExpression,
                operator: op.value,
                argument: parseUnaryExpression(),
                prefix: true
            };
        }

        if (nextIsOperator('+') || nextIsOperator('-') ||
            nextIsOperator('~') || nextIsOperator('!')) {
            var op = tokenizer.getToken();
            tokenizer.advance();
            return {
                type: Syntax.UnaryExpression,
                operator: op.value,
                argument: parseUnaryExpression()
            };
        }

        return parsePostfixExpression();
    }

    function parseVariableDeclaration() {
        var token = matchToken(Token.Identifier);
        return {
            type: Syntax.VariableDeclaration,
            id: token.value,
            initializer: parseVariableInitializer()
        };
    }

    function parseVariableDeclarationList() {
        var declarations = [];

        while (true) {
           declarations.push(parseVariableDeclaration());
            if (nextIsSeparator(',')) {
                tokenizer.advance();
                continue;
            }
            break;
        }

        return declarations;
    }

    function parseVariableDefinition() {
        matchToken(Token.JSKeyword, 'var');
        return {
            type: Syntax.VariableDefinition,
            list: parseVariableDeclarationList()
        };
    }

    function parseVariableInitializer() {
        if (nextIsOperator('=')) {
            tokenizer.advance();
            return parseAssignmentExpression();
        }

        return {
            type: Syntax.Empty
        };
    }

    function parseVariableStatement() {
        matchToken(Token.JSKeyword, 'var');
        var declarations = parseVariableDeclarationList();
        matchSemicolon();
        return {
            type: Syntax.VariableStatement,
            list: declarations
        };
    }

// external functions

    function parseFunctionElement() {
        var element = { Arguments: [] };

        // header

        var as = matchToken(Token.AccessSpecifier);
        element['AccessSpecifier'] = as.value;

        var name = matchToken(Token.Identifier);
        element['Name'] = name.value;

        // params

        element['Arguments'] = parseParams();
        // body

        element['Body'] = parseBlock();

        return element;
    }

    function parseScript() {
        var functionElements = {
            'public': [],
            'private': [],
            'fusion': []
        };

        while (!tokenizer.isEOTokens()) {
            var element = parseFunctionElement();
            functionElements[element['AccessSpecifier']].push(element);
        }

        return functionElements;
    }

    exports.parse = function (source_string) {
        tokenizer.init(source_string);
        return parseScript();
    }


}(typeof exports === 'undefined' ? (parser = {}) : exports));
