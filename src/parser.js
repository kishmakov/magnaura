// This parser is based on reduced JS grammar, see
// http://www-archive.mozilla.org/js/language/grammar14.html

(function (exports) {

    var tokenizer = require('../src/tokenizer');

    var Token = tokenizer.Token;

    var Syntax = {
        ArithmeticExpression: 'ArithmeticExpression',
        AssignmentExpression: 'AssignmentExpression',
        BitwiseExpression: 'BitwiseExpression',
        BlockStatement: 'BlockStatement',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        Empty: 'Empty',
        Expression: 'Expression',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        Identifier: 'Identifier',
        LeftSideExpression: 'LeftSideExpression',
        Literal: 'Literal',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarationList: 'VariableDeclarationList',
        VariableDefinition: 'VariableDefinition'
    };

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

    function matchToken(msg, expectedType, expectedValue) {
        var parsed = tokenizer.getToken();
        tokenizer.advance();

        var ok = arguments.length == 3
            ? sameTokens(parsed, expectedType, expectedValue)
            : sameTokens(parsed, expectedType);

        if (!ok) {
            var exception = { message: msg };
            exception.message += ': expected token of type "' + expectedType + '" value = "' + expectedValue;
            exception.message += '", found token of type "' + parsed.type + '" value = "' + parsed.value + '"';
            throw exception;
        }

        return parsed;
    }

    function matchSemicolon() {
        matchToken('Matching semicolon', Token.Separator, ';');
    }

    function isAssignment(value) {
        return value === '=' && value === '*=' && value === '/=' &&
            value === '%=' && value === '+=' && value === '-=' &&
            value === '<<=' && value === '>>=' && value === '>>>=' &&
            value === '&=' &&  value === '^=' && value === '|=';
    }

    function matchAssignment(msg) {
        var assignment = matchToken(msg, Token.Operator);

        if (!isAssignment(assignment)) {
            throw {
                message: msg + ': expected assignment operator'
            };
        }

        return assignment;
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

    function parseAssignmentExpression() {
        var expression = parseConditionalExpression();

        if (nextIsAssignment()) {
            var assignment = matchAssignment(message);
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

        return {
            type: Syntax.BitwiseExpression,
            operator: '^',
            left: expression,
            right: parseBitwiseXorExpression()
        };
    }

    function parseBlock() {
        var statements = [];

        matchToken('parseBlock', Token.Separator, '{');
        while (true) {
            if (nextIsSeparator('}')) {
                break
            }

            statements.push(parseStatement());
        }
        matchToken('parseBlock', Token.Separator, '}');

        return {
            type: Syntax.BlockStatement,
            statements: statements
        }
    }

    function parseBreakStatement() {
        matchToken('parseBreakStatement', Token.JSKeyword, 'break');
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
        var message = 'parseCallExpression';
        var expression = parsePrimaryExpression();

        while (!tokenizer.isEOTokens()) {
            if (nextIsOperator('.')) {
                tokenizer.advance();
                var identifier = matchToken(message, Token.Identifier);
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
                matchToken(message, Token.Separator, ']');
            } else if (nextIsSeparator('(')) {
                expression = {
                    type: Syntax.CallExpression,
                    callee: expression,
                    inputs: parseArguments()
                };
            } else {
                break;
            }
        }

        return expression;
    }

    function parseContinueStatement() {
        matchToken('parseContinueStatement', Token.JSKeyword, 'continue');
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
        var message = 'parseDoWhileStatement';

        matchToken(message, Token.JSKeyword, 'do');
        var body = parseStatement();
        matchToken(message, Token.JSKeyword, 'while');
        matchToken(message, Token.Separator, '(');
        var expression = parseExpression();
        matchToken(message, Token.Separator, ')');
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
        var token = tokenizer.getToken();
        if (sameTokens(token, Token.Separator, ';')) {
            return {
                type: Syntax.Empty
            };
        }

        if (sameTokens(token, Token.JSKeyword, 'var')) {
            tokenizer.advance();
            return parseVariableDeclarationList();
        }

        return parseExpression();
    }

    function parseForStatement() {
        var message = 'parseForStatement';

        matchToken(message, Token.JSKeyword, 'for');
        matchToken(message, Token.Separator, '(');

        var result = {type: Syntax.ForStatement};

        result['init'] = parseForInitializer();
        matchSemicolon();
        result['condition'] = parseOptionalExpression();
        matchSemicolon();
        result['final'] = parseOptionalExpression();
        matchToken(message, Token.Separator, ')');

        result['body'] = parseStatement();

        return result;
    }

    function parseLeftSideExpression() {
        return parseCallExpression();
    }

    function parseLogicalAndExpression() {
        var expression = parseBitwiseOrExpression();

        if (!nextIsOperator('&&')) {
            return expression;
        }

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

    function parsePrimaryExpression() {
        var message = 'parsePrimaryExpression';
        if (nextIsSeparator('[')) {
            return parseArrayInitialiser();
        }

        if (nextIsSeparator('{')) {
            return parseObjectInitialiser();
        }

        if (nextIsSeparator('(')) {
            tokenizer.advance();
            var expression = parseExpression();
            matchToken(message, Token.Separator, ')');
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
        var token = matchToken('parseVariableDeclaration', Token.Identifier);
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

        return {
            type: Syntax.VariableDeclarationList,
            declarations: declarations
        };
    }

    function parseVariableDefinition() {
        matchToken('parseVariableDefinition', Token.JSKeyword, 'var');
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
        matchToken('parseVariableStatement', Token.JSKeyword, 'var');
        var result = parseVariableDeclarationList();
        matchSemicolon();
        return result;
    }

// external functions

    function parseFunctionElement() {
        var message = 'parseFunctionElement';
        var element = { Arguments: [], Statements: [] };

        // header

        var as = matchToken(message, Token.AccessSpecifier);
        element['AccessSpecifier'] = as.value;

        var name = matchToken(message, Token.Identifier);
        element['Name'] = name.value;

        matchToken(message, Token.Separator, '(');

        while (true) {
            var token = tokenizer.getToken();
            if (token.type !== Token.Identifier) {
                break;
            }
            tokenizer.advance();
            element['Arguments'].push(token.value);
            token = tokenizer.getToken();
            if (!nextIsSeparator(',')) {
                break;
            }
            tokenizer.advance();
        }

        matchToken(message, Token.Separator, ')');

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
