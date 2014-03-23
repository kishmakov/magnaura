(function (exports) {

// tools

    var tools = require('../src/tools')

// compiler

    var source, index;
    var nextToken;

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

    function peekChar() {
        return (index < source.length) ? source.charAt(index) : '\x00';
    }

    function advance() {
        if (index < source.length)
            index += 1;
    }

    function retreat() {
        if (index > 0)
            index -= 1;
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
    // 5 - bullshit
    // 6 - start of lexeme

    function skipComment() {
        var charType, state = 0;

        while ((index < source.length) && (state < 5)) {
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

        if (index >= source.length) {
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


    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throw {
                message: 'Unexpected <EOF>'
            };
        }

        var s = token.value;

        if (s.length > 10)
            s = s.substr(0, 10) + '...';

        throw {
            message: 'Unexpected token ' + s
        };
    }

    function parseExternalFunction() {
        var token = lookahead();

        if (token.type === Token.EOF)
            return;

        if (token.type !== Token.AccessSpecifier)
            throwUnexpected(token);

        var functionElement = { accessSpecifier: parseAccessSpecifier() };

        token = lex();
        if (token.type !== 'Identifier') {
            throwUnexpected(token);
        }
        id = token.value;


        return parseStatement();
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

        return new ParsedObject(source_string.length);

//    return parseScript();
    }


}(typeof exports === 'undefined' ? (compiler = {}) : exports));

// var fs = require('fs');

// var textSorter = fs.readFileSync('sorter.ks', 'utf8');
// var hashSorter = SHA256(textSorter);

// console.log("hash of sorter.ks:     " + hashSorter);

// var textSequencer = fs.readFileSync('sequencer.ks', 'utf8');
// var hashSequencer = SHA256(textSequencer);

// console.log("hash of sequencer.ks:  " + hashSequencer);
