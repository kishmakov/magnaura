(function (exports) {

    var common = require('../src/common');

// stuff

// compilation

    exports.assemble = function (compiled) {
        function Sorter() {};
        Sorter.prototype.sum = function(a, b) { return a + b; }
        return new Sorter();
    }

}(typeof exports === 'undefined' ? (assembler = {}) : exports));
