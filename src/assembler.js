(function (exports) {

// stuff

    function assembleBody(body) {
        var result = '';
        for (var i = 0; i < body.length; i++) {
            result += body[i].trim();
        }

        return result;
    }

    function assembleFunction(compiled, prototype, specifier) {
        var name = compiled.Name;
        var params = compiled.Arguments.concat(assembleBody(compiled.Body));
        prototype[name] = Function.apply(null, params);
        prototype[specifier].push(compiled);
    }

// compilation

    exports.assemble = function (compiled) {
        function KitchenObject() {}

        var i, j, len;
        var specifiers = ['public', 'private', 'fusion'];
        var prototype = KitchenObject.prototype;
        var functions;

        prototype['Name'] = compiled['Name'];

        for (j = 0; j < 3; j++) {
            prototype[specifiers[j]] = [];
            functions = compiled[specifiers[j]];
            for (i = 0, len = functions.length; i < len; i++) {
                assembleFunction(functions[i], prototype, specifiers[j]);
            }
        }

        return new KitchenObject();
    }

}(typeof exports === 'undefined' ? (assembler = {}) : exports));
