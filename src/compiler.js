(function (exports) {

// tools

    var tools = require('../src/tools')

// compiler

    var source, index;

    var Token = {
        AccessSpecifier: 'AccessSpecifier',
        BooleanLiteral: 'BooleanLiteral',
        EOF: 'EOF',
        FutureReservedWord: 'FutureReservedWord',
        Identifier: 'Identifier',
        Keyword: 'Keyword',
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

// cursor control

    function isEOF() {
        return index >= source.length;
    }

    function advance(howMuch) {
        var length = 1;

        if (arguments.length > 0) {
            length = howMuch;
        }

        if (index < source.length) {
            index += length;
        }
    }

    function retreat() {
        var length = 1;

        if (arguments.length > 0) {
            length = howMuch;
        }

        if (index < source.length) {
            index -= length;
        }
    }

    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throw {
                message: 'Unexpected <EOF>'
            };
        }

        var s = token.value;

        if (s.length > 10) {
            s = s.substr(0, 10) + '...';
        }

        throw {
            message: 'Unexpected token ' + s
        };
    }

    function lookAhead(howMuch) {
        var length = 1;

        if (arguments.length > 0) {
            length = howMuch;
        }

        var start = Math.min(index, source.length - 1);
        var found = source.substr(start, length);

        for (var i = 0; i + found.length < length; i++)
            found += '\x00';

        return found;
    }

    function expect(need) {
        var start = Math.min(index, source.length - 1);

        var found = source.substr(start, need.length);

        if (found !== need) {
            throw {
                message: 'Expected "' + need + '" found "' + found + '"'
            };
        }

        index += need.length;
    }

// parse functions

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
        (0 << 0) + (0 << 3) + (1 << 6) + (5 << 9) + (6 << 12), // 0 - before comment
        (5 << 0) + (5 << 3) + (2 << 6) + (3 << 9) + (5 << 12), // 1 - after /
        (2 << 0) + (0 << 3) + (2 << 6) + (2 << 9) + (2 << 12), // 2 - line
        (3 << 0) + (3 << 3) + (3 << 6) + (4 << 9) + (3 << 12), // 3 - plain
        (3 << 0) + (3 << 3) + (0 << 6) + (4 << 9) + (3 << 12)  // 4 - plain after *
    ];
    // 5 - token starting from /
    // 6 - start of lexeme

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
        }

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


    function parseToken() {
        var token;

        parseComment();

        if (isEOF()) {
            return {
                type: Token.EOF
            };
        }

        var ch = lookAhead(1);

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

        if (ch === '.' || isDecimalDigit(ch)) {
            return parseNumericLiteral();
        }

        token = parseIdentifier();
        if (typeof token !== 'undefined') {
            return token;
        }

        throw {
            message: 'Unknown token from character ' + ch
        };
    }


    function parseAccessSpecifier() {
        var ch = lookAhead(2);

        switch (ch) {
            case 'pu':
                expect('public');
                return 'public';
            case 'pr':
                expect('private');
                return 'private';
            case 'fu':
                expect('fusion');
                return 'fusion';
            default: throw {
                message: 'Unexpected Access Specifier'
            }
        }
    }

    function parseEFIdentifier() {

    }

    function parseExternalFunction() {
        var functionElement = {};

        functionElement['AccessSpecifier'] = parseAccessSpecifier();
        functionElement['Identifier'] = parseEFIdentifier();

        expect('(');
        functionElement['Arguments'] = parseEFArguments();
        expect(')');

        parseBlock();

        return functionElement;
    }

    function parseScript() {
        var functionElements = {
            'public': [],
            'private': [],
            'fusion': []
        };

        var functionElement;

        while (!isEOF()) {
            functionElement = parseExternalFunction();
            if (typeof functionElement === 'undefined')
                break;

            functionElements[functionElement['accessSpecifier']].push(functionElement);
        }

        return functionElements;
    }

    exports.parse = function (source_string) {
        source = source_string;
        index = 0;

        function ParsedObject(len) {
            this.len = len;
        }

        ParsedObject.prototype.sayHi = function (name) {
            return 'Hey, ' + name + '! Hash is \'' + tools.SHA256('H' + this.len) + '\'';
        };

//        return new ParsedObject(source_string.length);

    return parseScript();
    }


}(typeof exports === 'undefined' ? (compiler = {}) : exports));

// var fs = require('fs');

// var textSorter = fs.readFileSync('sorter.ks', 'utf8');
// var hashSorter = SHA256(textSorter);

// console.log("hash of sorter.ks:     " + hashSorter);

// var textSequencer = fs.readFileSync('sequencer.ks', 'utf8');
// var hashSequencer = SHA256(textSequencer);

// console.log("hash of sequencer.ks:  " + hashSequencer);
