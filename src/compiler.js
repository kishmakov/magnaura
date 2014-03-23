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
        Punctuator: 'Punctuator',
        StringLiteral: 'StringLiteral'
    };

    function isEOF() {
        return index >= source.length;
    }

    function advance() {
        if (index < source.length)
            index += 1;
    }

    function retreat() {
        if (index > 0)
            index -= 1;
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

    // 0: ws
    // 1: lb
    // 2: /
    // 3: *
    // 4: ? (other)

    function inCommentCharType() {
        switch (peekChar()) {
            case '\u0009': // tab
            case '\u000B': // vertical tab
            case '\u000D': // carriage return
            case ' ':
                return 0; // whitespace but not line break
            case '\u000A': // line feed
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
    // 5 - bad token
    // 6 - start of lexeme

    function skipComment() {
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
    }


    function lex() {
        var ch, token;

        skipComment();

        if (isEOF()) {
            return {
                type: Token.EOF
            };
        }

        token = scanPunctuator();
        if (typeof token !== 'undefined') {
            return token;
        }

        ch = peekChar();

        if (ch === '\'' || ch === '"') {
            return scanStringLiteral();
        }

        if (ch === '.' || isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        token = scanIdentifier();
        if (typeof token !== 'undefined') {
            return token;
        }

        throw {
            message: 'Unknown token from character ' + nextChar()
        };
    }

    function lookahead() {
        var token,
            pos = index;

        pos = index;
        token = lex();
        index = pos;

        return token;
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

    function parseExternalFunction() {
        var functionElement = {};

        functionElement['accessSpecifier'] = parseAccessSpecifier();
        functionElement['identifier'] = parseIdentifier();

        expect('(');
        functionElement['arguments'] = parseArguments();
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
