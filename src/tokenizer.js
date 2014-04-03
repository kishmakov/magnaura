(function (exports) {

    var source, index;
    var tokens, tokenIndex;

    var Token = {
        AccessSpecifier: 'AccessSpecifier',
        BooleanLiteral: 'BooleanLiteral',
        EOF: 'EOF',
        Identifier: 'Identifier',
        JSKeyword: 'JSKeyword',
        KSKeyword: 'KSKeyword',
        NullLiteral: 'NullLiteral',
        NumericLiteral: 'NumericLiteral',
        Operator: 'Operator',
        Separator: 'Separator',
        StringLiteral: 'StringLiteral'
    };

// character detection

    function isLetter(ch) {
        return ('A' <= ch && ch <= 'Z') || ('a' <= ch && ch <= 'z');
    }

    function isDigit(ch) {
        return '0' <= ch && ch <= '9';
    }

    function isSeparator(ch) {
        return "(){}[],;".indexOf(ch) >= 0;
    }

    function isOperatorChar(ch) {
        return "=><!~?:.&|+-*/^%".indexOf(ch) >= 0;
    }

// keywords detection

    function isJSKeyword(id) {
        switch (id) {
            case 'break':
            case 'case':
            case 'continue':
            case 'default':
            case 'do':
            case 'else':
            case 'for':
            case 'function':
            case 'if':
            case 'return':
            case 'switch':
            case 'this':
            case 'var':
            case 'void':
            case 'while':
            case 'with':
                return true;
        }
        return false;
    }

    function isKSKeyword(id) {
        switch (id) {
            case 'control':
                return true;
        }

        return false;
    }

    function isAccessSpecifier(id) {
        switch (id) {
            case 'public':
            case 'private':
            case 'fusion':
                return true;
        }

        return false;
    }

// navigation at character level

    function isEOF() {
        return index >= source.length;
    }

    function advance(length) {
        index += (arguments.length > 0) ? length : 1;
    }

    function retreat(length) {
        index -= (arguments.length > 0) ? length : 1;
    }

    function lookAhead(length) {
        if (arguments.length == 0)
            return source.charAt(index);

        var start = Math.min(index, source.length);
        var found = source.substr(start, length);
        var realLength = found.length;
        for (var i = 0; i + source.length < length + start; i++)
            found += '\x00';

        return found;
    }

    function expect(need) {
        var found = lookAhead(need.length);
        if (found !== need) {
            throw {
                message: 'Expected "' + need + '" found "' + found + '"'
            };
        }

        index += need.length;
    }

// functions related to token parsing

    // 0: ws
    // 1: lb
    // 2: /
    // 3: *
    // 4: ? (other)

    function inCommentCharType() {
        switch (lookAhead()) {
            case '\u0009': // tab
            case '\u000B': // vertical tab
            case ' ':
                return 0; // whitespace but not line break
            case '\u000A': // line feed
            case '\u000D': // carriage return
                return 1; // line break
            case '/':
                return 2; // slash
            case '*':
                return 3; // star
            default:
                return 4; // else
        }
    }

    var CommentStates = [
        (0 << 0) + (0 << 3) + (1 << 6) + (6 << 9) + (6 << 12), // 0 - before comment
        (5 << 0) + (5 << 3) + (2 << 6) + (3 << 9) + (5 << 12), // 1 - after /
        (2 << 0) + (0 << 3) + (2 << 6) + (2 << 9) + (2 << 12), // 2 - line
        (3 << 0) + (3 << 3) + (3 << 6) + (4 << 9) + (3 << 12), // 3 - plain
        (3 << 0) + (3 << 3) + (0 << 6) + (4 << 9) + (3 << 12)  // 4 - plain after *
    ];
    // 5 - token starting from /
    // 6 - token

    function parseComment() {
        var charType, state = 0;

        while (!isEOF() && (state < 5)) {
            charType = inCommentCharType();
            state = (CommentStates[state] >> (3 * charType)) & 7;

            if (state < 5) {
                advance();
            } else if (state == 5) {
                retreat();
            }
        }

        if (isEOF() && state != 0)
            throwUnexpected(Token.EOF);
    }

    function parseOperator() {
        var ahead = lookAhead(4)

        var options = {
            4: ['>>>='],
            3: ['===', '!==', '>>>', '<<=', '>>='],
            2: ['<=', '>=', '==', '!=', '++', '--', '<<', '>>',
                '&&', '||', '+=', '-=', '*=', '%=', '&=', '|=', '^=', '/='],
            1 : ['.', '<', '>', '+', '-', '*', '%', '&', '|', '^', '!', '~', '?', ':', '=', '/']
        };

        for (var i = 4; i > 0; i--) {
            var prefix = ahead.substr(0, i);
            for (var j = 0; j < options[i].length; j++)
                if (prefix === options[i][j]) {
                    advance(i);

                    return {
                        type: Token.Operator,
                        value: prefix
                    };

                }
        }

        throw {
            message: 'Unexpected operator form ' + ahead
        };
    }

    function parseStringLiteral() {
        var str = '', ch;
        var quote = lookAhead();
        advance();

        if (quote !== '\'' && quote !== '"') {
            throw {
                message: 'Unexpected start of string literal: ' + quote
            };
        }

        while (index < source.length) {
            ch = lookAhead(); advance();

            if (ch === quote) {
                break;
            } else if (ch === '\\') {
                str += ch; str += lookAhead(); advance();
            } else {
                str += ch;
            }
        }

        return {
            type: Token.StringLiteral,
            value: str
        };
    }

    function parseNumericLiteral() {
        var ch = lookAhead(); advance();

        if (!isDigit(ch) && (ch !== '.')) {
            throw {
                message: 'Unexpected start of numeric literal: ' + ch
            }
        }

        var number = ch;
        if (ch === '.') {
            number = '0' + number;
        }

        while (true) {
            ch = lookAhead();
            if (!isDigit(ch)) {
                break;
            }
            number += ch; advance();
        }

        if (number === '0.') {
            throw {
                message: 'Expecting decimal digits after the dot sign'
            };
        }

        if (ch === 'e' || ch === 'E') {
            number += ch; advance();
            ch = lookAhead();

            if (ch === '+' || ch === '-') {
                number += ch; advance();
                ch = lookAhead();
            }

            if (!isDigit(ch)) {
                throw {
                    message: 'Expecting decimal digits after the exponent sign'
                };
            }

            while (true) {
                ch = lookAhead();
                if (!isDigit(ch)) {
                    break;
                }
                number += ch; advance();
            }
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number)
        };
    }

    function parseIdentifier() {
        var ch = lookAhead(); advance();

        if (!isLetter(ch) && ch !== '_' && ch !== '@') {
            throw {
                message: 'Unexpected first char \'' + ch + '\' in identifier scan'
            };
        }

        var id = ch;

        while (true) {
            ch = lookAhead();
            if (isLetter(ch) || isDigit(ch) || ch === '_') {
                id += ch;
                advance();
            } else {
                break;
            }
        }

        if (isJSKeyword(id)) {
            return {
                type: Token.JSKeyword,
                value: id
            };
        }

        if (isKSKeyword(id)) {
            return {
                type: Token.KSKeyword,
                value: id
            }
        }

        if (isAccessSpecifier(id)) {
            return {
                type: Token.AccessSpecifier,
                value: id
            }
        }

        if (id === 'null') {
            return {
                type: Token.NullLiteral
            };
        }

        if (id === 'true' || id === 'false') {
            return {
                type: Token.BooleanLiteral,
                value: id
            };
        }

        return {
            type: Token.Identifier,
            value: id
        };
    }

    function parseToken() {
        parseComment();

        if (isEOF()) {
            return {
                type: Token.EOF
            };
        }

        var ch = lookAhead();

        if (isSeparator(ch)) {
            advance();
            return {
                type: Token.Separator,
                value: ch
            }
        }

        if (isOperatorChar(ch)) {
            return parseOperator();
        }

        if (ch === '\'' || ch === '"') {
            return parseStringLiteral();
        }

        if (ch === '.' || isDigit(ch)) {
            return parseNumericLiteral();
        }

        return parseIdentifier();
    }

// visible part

    exports.Token = Token;

    exports.init = function (source_string) {
        source = source_string;
        index = 0;
        tokens = [];

        while (!isEOF()) {
            tokens.push(parseToken());
        }

        tokenIndex = 0;
    };

    exports.getToken = function () {
        return tokens[tokenIndex];
    };

    exports.advance = function () {
        if (tokenIndex < tokens.length) {
            tokenIndex++;
        }
    };

    exports.retreat = function () {
        if (tokenIndex > 0) {
            tokenIndex--;
        }
    };

    exports.isEOTokens = function () {
        return tokenIndex >= tokens.length;
    };

}(typeof exports === 'undefined' ? (tokenizer = {}) : exports));
