'use strict';

try {
  require('angular-node');
  module.exports = require('./lib/lodash-decipher.ng');
}
catch (ignored) {
  module.exports = require('./lib/lodash-decipher');
}
