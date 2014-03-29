var fs = require('fs');
var parser = require('../src/parser');

exports['Sorter and sequencer.'] = function (test) {
    var sorter_source = fs.readFileSync('./data/test00/sorter.ks').toString();
    var sorter = parser.parse(sorter_source);
    test.equal(sorter.length, 84);

    var sequencer_source = fs.readFileSync('./data/test00/sequencer.ks').toString();
    var sequencer = parser.parse(sequencer_source);
    test.equal(sequencer.length, 199);

    test.done();
};