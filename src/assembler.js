(function (exports) {

    var Specifiers = {
        public: true,
        private: true,
        fusion: true
    };

// stuff

    function assembleBody(body) {
        var result = '';
        for (var i = 0; i < body.length; i++) {
            result += body[i].trim();
        }

        return result;
    }

    function assembleMethod(compiled, prototype, specifier) {
        prototype[specifier].push({
            name: compiled.name,
            arguments: compiled.arguments,
            body: compiled.body
        });
    }

    function finalize(object) {
        for (var specifier in Specifiers) {
            var functions = object[specifier];
            for (var i = 0, len = functions.length; i < len; i++) {
                var name = functions[i].name;
                var arguments = functions[i].arguments;
                var body = assembleBody(functions[i].body);
                object[name] = Function.apply(null, arguments.concat(body));
            }
        }
    }

    function accumulate(result, object) {
        var i, len, specifier, name, functions;

        result.description.fathers.push(object.description);

        var publicNames = {}, hash = object.hash;

        for (i = 0, len = object.public.length; i < len; i++) {
            publicNames[object.public[i].name] = true;
        }

        for (specifier in Specifiers) {
            functions = object[specifier];
            for (i = 0, len = functions.length; i < len; i++) {
                name = functions[i].name;
                if (name in publicNames) {
                    result.private.push({
                        name: name + '_' + hash,
                        arguments: functions[i].arguments,
                        body: functions[i].body
                    });
                } else {
                    result[specifier].push(functions[i]);
                }
            }
        }

        for (name in publicNames) {
            var pattern = new RegExp('this\\.' + name + '\\(', 'g');
            var exchange = 'this.' + name + '_' + hash + '(';
            for (specifier in Specifiers) {
                functions = result[specifier];
                for (i = 0, len = functions.length; i < len; i++) {
                    var body = functions[i].body;
                    for (var j = 0, bodyLen = body.length; j < bodyLen; j++) {
                        body[j] = body[j].replace(pattern, exchange);
                    }
                }
            }
        }
    }

    function cloneFunction(record) {
        var result = {
            arguments: [],
            body: [],
            name: record.name
        };

        var i, len;

        for (i = 0, len = record.arguments.length; i < len; i++) {
            result.arguments.push(record.arguments[i]);
        }

        for (i = 0, len = record.body.length; i < len; i++) {
            result.body.push(record.body[i]);
        }

        return result;
    }

// compilation

    exports.assemble = function (compiled) {
        function KitchenObject() {}

        var prototype = KitchenObject.prototype;
        var functions;

        prototype['description'] = compiled.description;
        prototype['hash'] = compiled.hash;

        for (var specifier in Specifiers) {
            functions = compiled[specifier];
            prototype[specifier] = [];
            for (var i = 0, len = functions.length; i < len; i++) {
                assembleMethod(functions[i], prototype, specifier);
            }
        }

        finalize(prototype);

        prototype.fusionCopy = function (fusionName) {
            var result = {
                description: {name: fusionName},
                hash: this.hash,
                fusionCopy: this.fusionCopy,
                fusionAccumulate: this.fusionAccumulate,
                fusionFinalize: this.fusionFinalize
            };
            result.description['mother'] = this.description;
            result.description['fathers'] = [];

            for (var specifier in Specifiers) {
                result[specifier] = [];
                for (var i = 0, len = this[specifier].length; i < len; i++) {
                    if (specifier === 'fusion' && this[specifier][i].name === fusionName) {
                        continue; // skip fusion through which object is created
                    }
                    result[specifier].push(cloneFunction(this[specifier][i]));
                }
            }

            return result;
        };

        prototype.fusionAccumulate = accumulate;

        prototype.fusionFinalize = finalize;

        return new KitchenObject();
    }

    exports.disassemble = function (object) {
        var compiled = {};

        compiled['description'] = object.description;
        compiled['hash'] = object.hash;

        for (var specifier in Specifiers) {
            functions = object[specifier];
            compiled[specifier] = [];
            for (var i = 0, len = functions.length; i < len; i++) {
                compiled[specifier].push(functions[i]);
            }
        }

        return compiled;
    }

}(typeof exports === 'undefined' ? (assembler = {}) : exports));
