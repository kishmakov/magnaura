(function (exports) {

    var tokenizer = require('../src/tokenizer');
    var Token = tokenizer.Token;

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
