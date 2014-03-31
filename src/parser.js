(function (exports) {

    var tokenizer = require('../src/tokenizer');

    var Token = tokenizer.Token;

    var Syntax = {
        BreakStatement: 'BreakStatement',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForInStatement: 'ForInStatement',
        ForStatement: 'ForStatement',
        SequenceExpression: 'SequenceExpression'
    };

// navigation at token level

    function sameTokens(need, have) {
        if (need.type !== have.type) {
            return false
        }

        return (typeof need.value !== 'undefined')
            ? (need.value === have.value)
            : true;
    }

    function matchToken(msg, expectedType, expectedValue) {
        var parsed = tokenizer.getToken();
        tokenizer.advance();

        var expected = { type: expectedType };
        if (arguments.length == 3) {
            expected.value = expectedValue;
        }

        if (sameTokens(expected, parsed)) {
            var exception = { message: msg };
            exception.message += ': expected token of type "' + expected.type + '" value = "' + expected.value;
            exception.message += '", found token of type "' + found.type + '" value = "' + found.value + '"';
            throw exception;
        }

        return parsed;
    }

// logic

    function matchSemicolon() {
        matchToken('Matching semicolon', Token.Separator, ';');
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
            if (sameTokens({ type: Token.Separator, value: ',' }, tokenizer.getToken())) {
                tokenizer.advance();
                continue;
            }
            break;
        }

        var expression = expressions.length > 1
            ? { type: Syntax.SequenceExpression, expressions: expressions }
            : expressions[0];

        return {
            type: Syntax.ExpressionStatement,
            expression: expression
        }
    }


    function parseExpressionStatement() {
        var expr = parseExpression();
        matchSemicolon();
        return expr;
    }

    function parseForControl() {
        var control = { init: null, condition: null, final: null };
        control['init'] = parseExpression();
        matchSemicolon();
        control['condition'] = parseConditionalExpression();
        matchSemicolon();
        control['final'] = parseExpression();

        return control;
    }

    function parseForInControl() {
        var message = 'parseForInControl';
        var control = { variable: null, expression: null };
        var variable = tokenizer.getToken();
        matchToken(message, { type: Token.Identifier });
        matchToken(message, { type: Token.JSKeyword, value: 'in' });
        control['variable'] = variable.value;
        control['expression'] = parseExpression();

        return control;
    }

    function parseForStatement() {
        var message = 'parseForStatement';

        matchToken(message, Token.JSKeyword, 'for');
        matchToken(message, Token.Separator, '(');

        var token0 = tokenizer.getToken(); tokenizer.advance();
        var token1 = tokenizer.getToken(); tokenizer.advance();
        var token2 = tokenizer.getToken();
        tokenizer.retreat(); tokenizer.retreat();

        if (sameToken(token0, { type: Token.EOF }) ||
            sameToken(token1, { type: Token.EOF }) ||
            sameToken(token2, { type: Token.EOF })) {
            throw {
                message: 'Unexpected end of file in ' + message
            };
        }

        var declaration = sameTokens(token0, { type: Token.JSKeyword, value: 'var' });
        var forIn = sameTokens(token1, { type: Token.JSKeyword, value: 'in' }) ||
            sameTokens(token2, { type: Token.JSKeyword, value: 'in' });

        if (declaration) {
            tokenizer.advance();
        }

        var control = forIn ? parseForInControl() : parseForControl();

        matchToken(message, Token.Separator, ')');
        var body = parseStatement();

        var result = {body: body, declaration: declaration, control: control};
        result['type'] = forIn ? Syntax.ForInStatement : Syntax.ForStatement;

        return result;
    }

    function parseStatement() {
        if (tokenizer.isEOTokens()) {
            throw {
                message: 'Unexpected EOTokens'
            }
        }

        var token = tokenizer.getToken();

        if (token.type === Token.Punctuator) {
            switch (token.value) {
                case ';':
                    return parseEmptyStatement();
                case '{':
                    return parseBlock();
                default:
                    break;
            }
        }

        if (token.type === Token.Keyword) {
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
            if (token.type !== Token.Separator || token.value !== ';') {
                break;
            }
            tokenizer.advance();
        }

        matchToken(message, Token.Separator, ')');

        // body

        matchToken(message, Token.Separator, '{');

        while (true) {
            if (sameTokens({ type: Token.Separator, value: '}' }, tokenizer.getToken())) {
                break
            }

            element['Statement'].push(parseStatement());
        }

        matchToken(message, Token.Separator, '}');

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
