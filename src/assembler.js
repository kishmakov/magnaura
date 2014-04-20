(function (exports) {

    var Hash;

// stuff

    function assembleBody(body) {
        var result = '';
        for (var i = 0; i < body.length; i++) {
            result += body[i].trim();
        }

        return result;
    }

    function assembleMethod(compiled, prototype, specifier) {
        var name = compiled.name;

        if (specifier === 'private') {
            name += '_' + Hash
        }
        var params = compiled.arguments.concat(assembleBody(compiled.body));
        prototype[name] = Function.apply(null, params);
        prototype[specifier].push(compiled);
    }

    function assembleFusion(compiled, prototype, specifier) {
        var name = compiled.name;

        if (specifier === 'private') {
            name += '_' + Hash
        }
        var params = compiled.arguments.concat(assembleBody(compiled.body));
        prototype[name] = Function.apply(null, params);
        prototype[specifier].push(compiled);
    }


// compilation

    exports.assemble = function (compiled) {
        function KitchenObject() {}

        Hash = compiled.hash;

        var i, len;
        var prototype = KitchenObject.prototype;
        var functions;

        prototype['name'] = compiled.name;
        prototype['hash'] = compiled.hash;

        prototype['public'] = [];
        functions = compiled['public'];
        for (i = 0, len = functions.length; i < len; i++) {
            assembleMethod(functions[i], prototype, 'public');
        }

        prototype['private'] = [];
        functions = compiled['private'];
        for (i = 0, len = functions.length; i < len; i++) {
            assembleMethod(functions[i], prototype, 'private');
        }

        prototype['private'] = [];
        functions = compiled['fusion'];
        for (i = 0, len = functions.length; i < len; i++) {
            assembleFusion(functions[i], prototype);
        }

        return new KitchenObject();
    }

}(typeof exports === 'undefined' ? (assembler = {}) : exports));
