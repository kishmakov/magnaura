// This parser is based on reduced JS grammar, see
// http://www-archive.mozilla.org/js/language/grammar14.html

(function (exports) {

    var tokenizer = require('../src/tokenizer');

    var Token = tokenizer.Token;

    var Syntax = {
        BreakStatement: 'BreakStatement',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        Empty: 'Empty',
        Expression: 'Expression',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
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

// logic

    function matchSemicolon() {
        matchToken('Matching semicolon', Token.Separator, ';');
    }

//    function parseAssignmentExpression() {
//
//    }

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
            if (sameTokens(tokenizer.getToken(), Token.Separator, ',')) {
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

    function parseExpressionStatement() {
        var expr = parseExpression();
        matchSemicolon();
        return {
            type: Syntax.ExpressionStatement,
            expression: expr
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

        resul['body'] = parseStatement();

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

    function parseVariableDeclaration() {
        var token = tokenizer.getToken();
        matchToken('parseVariableDeclaration', Token.Identifier);
        return {
            type: Syntax.VariableDeclaration,
            id: token.value,
            initializer:  parseVariableInitializer()
        };
    }

    function parseVariableDeclarationList() {
        var declarations = [];

        while (true) {
           declarations.push(parseVariableDeclaration());
            if (sameTokens(tokenizer.getToken(), Token.Separator, ',')) {
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
        if (sameTokens(tokenizer.getToken(), Token.Operator, '=')) {
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
            if (token.type !== Token.Separator || token.value !== ';') {
                break;
            }
            tokenizer.advance();
        }

        matchToken(message, Token.Separator, ')');

        // body

        matchToken(message, Token.Separator, '{');

        while (true) {
            if (sameTokens(tokenizer.getToken(), Token.Separator, '}')) {
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
