var fs = require('fs');
var ks2recipe = require('../src/ks2recipe');

exports['Sorter and sequencer.'] = function (test) {
    var sorter_source = fs.readFileSync('./data/test00/sorter.ks');
    var sorter = ks2recipe.parse(sorter_source);
    test.equal(sorter.sayHi('Jerry'), 'Hey, Jerry! I\'am of length 246...');

    var sequencer_source = fs.readFileSync('./data/test00/sequencer.ks');
    var sequencer = ks2recipe.parse(sequencer_source);
    test.equal(sequencer.sayHi('Job'), 'Hey, Job! I\'am of length 594...');

    test.done();
};