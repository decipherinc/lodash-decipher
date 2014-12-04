'use strict';

var chai = require('chai'),
  _ = require('../lib/lodash-decipher'),
  expect = chai.expect;

describe('add()', function () {
  it('should concatenate truthy values only', function () {
    expect(_.add([1, 2, 3], null, 4)).to.eql([1, 2, 3, 4]);
  });

  it('should work on a string', function () {
    expect(_.add('foo', 0, 'bar')).to.eql('foobar');
  });

  it('should return an object if given an object', function () {
    expect(_.add({herp: 'derp'}, null, 'bar')).to.eql({
      0: {herp: 'derp'}, 1: 'bar'
    });
  });

  it('should return a function which adds the value to the return value of ' +
  'the target', function () {
    var foo = function () {
        return 1;
      },
      bar = _.add(foo, 2);
    expect(bar).to.be.a('function');
    expect(bar()).to.equal(3);
  });

  it('should add numbers', function () {
    expect(_.add(1, 2, 3)).to.equal(6);
    expect(_.add(1, 'stuff', 'things', 2)).to.equal(3);
  });

  it('should consider NaN', function () {
    expect(_.add(Infinity, 1, 2, 3)).to.equal(Infinity);
  });

  it('should work as an "or" operator if given a boolean...I guess', function () {
    expect(_.add(true, false)).to.equal(true);
    expect(_.add(true, true)).to.equal(true);
    expect(_.add(false, 1)).to.equal(true);
    expect(_.add(false, 0)).to.equal(false);
  });
});
