var fs = require('fs');
var compiler = require('../src/compiler');

exports['Sorter and sequencer.'] = function (test) {
    var sorter_source = fs.readFileSync('./data/test00/sorter.ks');
    var sorter = compiler.parse(sorter_source);
    test.equal(sorter.sayHi('Jerry'), 'Hey, Jerry! Hash is \'a6e1ccf2021b9c57c5497de04696f1ee352b9c049918b80673e45825c9cf2f08\'');

    var sequencer_source = fs.readFileSync('./data/test00/sequencer.ks');
    var sequencer = compiler.parse(sequencer_source);
    test.equal(sequencer.sayHi('Job'), 'Hey, Job! Hash is \'9ed2955ad6bda23ada430a700fc7c094f33b78deab58195f34af7df4f5ba8c47\'');

    test.done();
};