/*! lodash-decipher - v0.3.4-3
 * https://github.com/decipherinc/lodash-decipher
 * Copyright (c) 2015 Decipher, Inc.; Licensed MIT
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * lodash-decipher
 * @author Christopher Hiller <chiller@decipherinc.com>
 * @copyright Copyright 2014 Decipher, Inc.
 * @license MIT
 * @overview Provides a smattering of mixins for [LoDash](http://lodash.com).
 */

'use strict';

var _ = (window._),
  format = require('format');


/**
 * A LoDash "collection"
 * @typedef {(Array|Object)} Iterable
 */

/**
 * Applies one of two given LoDash functions to a value, depending if the
 * value is an Object or Array.
 * @param {*} value Value to apply fn to
 * @param {string} arrayFn Function name to use if value is Array
 * @param {string} objFn Function name to use if value is Non-function object
 * @param {Arguments} args Arguments from callee
 * @returns {*}
 * @private
 * @this _
 */
var _iterableApplicator = function _iterableApplicator(value, arrayFn, objFn,
    args) {
    if (_.isObject(value) && !_.isFunction(value)) {
      value = _[_.isArray(value) ? arrayFn : objFn].apply(_, args);
    }
    return value;
  },

  iterableApplicator = _.bind(_iterableApplicator, _),

  /**
   * Creates a function to be used in a {@link _.map} that extends the
   * passed value with `obj`.  If `obj` is a non-object, does nothing.
   * @param {Object} [obj]
   * @private
   * @returns {Function}
   */
  objectMapper = function objectMapper(obj) {
    if (!_.isObject(obj)) {
      return _.noop;
    }
    return function (item) {
      if (_.isObject(item)) {
        _.extend(item, obj);
      }
    };
  },

  /**
   * Creates a function to be used in a {@link _.map} that assigns `key`
   * to `value` for the passed item.  If not passed a string `key`, does
   * nothing.
   * @param {string} [key] Key
   * @param {*} [value] Value
   * @private
   * @returns {Function}
   */
  keyValueMapper = function keyValueMapper(key, value) {
    if (!_.isString(key)) {
      return _.noop;
    }
    return function (item) {
      if (_.isObject(item)) {
        item[key] = value;
      }
    };
  },

  /**
   * Non-chainable LoDash Mixins.
   * @lends _
   */
  nonChainableMixins = {

    /**
     * Well, it's a no-op.
     */
    noop: function () {
    },

    /**
     * Given an object with a non-trivial prototype chain, return its
     * flattened prototype.
     * @param {*} [value] Something with a prototype, hopefully
     * @returns {Object} A flattended prototype
     */
    flattenPrototype: function flattenPrototype(value) {
      var _ = this || _,
        proto,
        retval = {},
        getPrototypeOf = Object.getPrototypeOf;
      if (!_.isObject(value)) {
        return value;
      }
      proto = getPrototypeOf(value);
      while (proto !== null && proto !== Object.prototype) {
        _.defaults(retval, proto);
        proto = getPrototypeOf(proto);
      }
      return retval;
    },

    /**
     * Generates a function which accepts a value and returns the result of
     * executing a function against that value.
     * @param {string} func Function to call.  If a string, then will
     *     attempt to execute a function with the same name within the
     *     parameter to the return value of this function.  If omitted,
     *     will call {@link _.identity}.
     * @param {Array} [args] Any arguments to pass to `func`.
     * @param {Object} [ctx] Context to execute `func` in.  Defaults to the
     *     parameter to the return value of this function.
     * @returns {Function}
     */
    applicator: function applicator(func, args, ctx) {
      var _ = this || _;
      if (_.isString(func)) {
        return function apply(value) {
          return _.isObject(value) && _.isFunction(value[func]) ?
            value[func].apply(ctx || value, args || []) :
            value;
        };
      } else {
        return _.identity;
      }
    },

    /**
     * Returns true if the value is not `undefined`
     * @param {*} [value] Value to inspect
     * @returns {boolean}
     */
    isDefined: function isDefined(value) {
      return !(this || _).isUndefined(value);
    },

    /**
     * @see https://www.npmjs.com/package/format
     */
    format: format,

    /**
     * Like {@link format format} but returns an `Error` instead of a `string`.
     * @param {string} message Error message
     * @param {...string} [params] Any parameters to the message
     * @returns {Error}
     */
    exception: function exception(message, params) {
      var _ = this || _;
      return new Error(_.format.apply(_, arguments));
    },

    /**
     * Returns `true` if `value` is an object with its own function named
     * `fnName`.
     * @param {Object} [value] Can be anything, but to return `true` must be an
     * object (`_.isObject()` would return `true`)
     * @param {string} [fnName] Name of function.  If omitted, returns `false`.
     * @returns boolean
     */
    hasFunction: function hasFunction(value, fnName) {
      var _ = this || _;
      return _.containsFunction(value, fnName) && _.has(value, fnName);
    },

    /**
     * Returns `true` if `value` is an object containing function named
     * `fnName`. Will walk prototype tree.
     * @param {Object} [value] Can be anything, but to return `true` must be an
     * object (`_.isObject()` would return `true`)
     * @param {string} [fnName] Name of function.  If omitted, returns `false`.
     * @returns boolean
     */
    containsFunction: function containsFunction(value, fnName) {
      var _ = this || _;
      return _.isObject(value) && _.isFunction(value[fnName]);
    },

    /**
     * Returns `true` if the object has only one member.
     * @param {*} [value] Value to inspect
     * @returns boolean
     */
    isSingular: function isSingular(value) {
      return (this || _).size(value) === 1;
    }

  },

  /**
   * Chainable LoDash mixins.
   * @lends _
   */
  chainableMixins = {

    /**
     * General purpose "add this to that" function.  Will concatenate values,
     *   but only if those values are truthy.
     * @param {T} [target] Probably an Array, but anything you want to
     *   concatenate, including strings.
     * @param {...*} [value] Value(s) to concat.
     * @returns {T}
     */
    add: function add(target, value) {
      var _ = (this || _),
        args = this(arguments)
          .toArray()
          .slice(1)
          .compact()
          .value(),
        concat = function concat(ctx, args) {
          return Array.prototype.concat.apply(ctx, args);
        },
        sum,
        isBoolean = target === false || target === true;

      if (_.isUndefined(target)) {
        return;
      }
      if (_.isString(target)) {
        target = target.split('');
        return concat(target, args).join('');
      }
      if (_.isArray(target)) {
        return concat(target, args);
      }
      if (_.isFunction(target)) {
        return function adder() {
          return add.apply(_, [target.apply(null, arguments)]
            .concat(args));
        };
      }
      if (_.isObject(target)) {
        return _.extend({}, concat(target, args));
      }
      sum = _.reduce(args, function (sum, num) {
        return sum + (_.isNaN(parseInt(num, 10)) ? 0 : num);
      }, target, _);
      return isBoolean ? !!sum : sum;
    },

    /**
     * Walk an object depth-first and execute a function against each
     * member, replacing the value of that member with the value returned
     * by the function. Use {@link _.applicator} to generate a function which
     * will call a function *within* each object member, if present.  Will
     * not walk functions.
     * @param {*} [value] Object to walk.
     * @param {Function} [func=_.identity] Function to execute against each
     *     member.
     * @param {(RegExp|string)} [ignoreRx] Any key matching this RegExp
     * will not be walked.
     * @returns {*}
     * @example
     * // Given a deeply-nested object `foo`, return a deeply-nested object
     * // wherein all members are converted to strings.
     * var bar = _.transmogrify(foo, _.applicator('toString'));
     *
     * // Given a deeply-nested object `foo`, return a deeply-nested object
     * // wherein all array members are converted to objects, ignoring
     * // any arrays whose key contains `$`.
     * var bar = _.transmogrify(foo, function(value) {
       *   if (_.isArray(value)) {
       *     value = _.extend({}, value);
       *   }
       *   return value;
       * }, '$');
     */
    transmogrify: function transmogrify(value, func, ignoreRx) {
      var _ = this || _,

        /**
         * Given a value and optional key, return true or false if the
         * value should be walked.
         * @param {*} value Value to inspect
         * @param {string} [key] Key of value as relative to some
         *     parent object
         * @private
         * @returns {boolean}
         */
        isWalkable = function isWalkable(value, key) {
          //noinspection OverlyComplexBooleanExpressionJS
          return _.isObject(value) && !_.isFunction(value) &&
            (!key || ignoreRx.test(key));
        },

        /**
         * Execute `func` against the value.  If `key` and `parent` are
         * present, set the value of `key` in `parent` to be `value`.
         * Determine walkable members of `value` and execute this
         * function against each.
         * @private
         * @param {*} value Value to walk
         * @param {string} [key] Key, if any
         * @param {(Object|Array)} [parent] Parent object/array, if
         *     any.
         * @returns {*} Value as modified by `func`
         */
        walk = function walk(value, key, parent) {
          var mogrified = func(value);
          if (!_.contains(visited, value)) {
            visited.push(value);
            if (isWalkable(mogrified)) {
              _.extend(mogrified, _(mogrified)
                .sift(isWalkable)
                .morph(function (v, k) {
                  return walk(v, k, mogrified);
                })
                .value());
            }
          }

          if (key) {
            parent[key] = mogrified;
          }
          return mogrified;
        },

        /**
         * Array of variables seen already.  Keeping track of this
         * avoids "maximum call depth" errors.
         * @type {Array}
         * @private
         */
        visited = [];

      ignoreRx = ignoreRx || /^[^$]/;
      if (_.isString(ignoreRx)) {
        ignoreRx = new RegExp(ignoreRx);
      }

      func = func || _.identity;

      return walk(value);
    },

    /**
     * Calls {@link _.map} or {@link _.mapValues} as appropriately on
     * `value`. If `value` is not an Array or Object, `value` will be
     * returned.
     * @param {Iterable} value
     * @returns {Iterable}
     */
    morph: function morph(value) {
      return iterableApplicator.call(this || _, value, 'map', 'mapValues',
        arguments);
    },

    /**
     * Calls {@link _.filter} or {@link _.pick} as appropriately on `value`.
     * If `value` is not an Array or Object, `value` will be returned.
     * @param {Iterable} value
     * @returns {Iterable}
     */
    sift: function sift(value) {
      return iterableApplicator.call(this || _, value, 'filter', 'pick',
        arguments);
    },

    /**
     * Squirts some key/value pair into an {@link Iterable}.  Maybe like the
     * opposite of {@link _.pluck}?  Dunno.
     * @param {Iterable} [iterable=[]] Some thing to iterate over.
     * @param {(Object|string)} [key] If the (enumerable) item in the
     *   `collection` is object-like, use this key to set the value.
     *   Alternatively, use an object to set multiple values.
     * @param {*} [value] Value to set `key` to. Applicable only if `key`
     * is a string.
     * @returns {Iterable} The squirted `iterable`
     */
    squirt: function squirt(iterable, key, value) {
      var mapper,
        _ = this || _;
      mapper =
        _.isObject(key) ? objectMapper(key) : keyValueMapper(key, value);
      return _.each(iterable || [], mapper);
    },

    /**
     * Empties an Iterable of its enumerable contents.
     * @param {Iterable} [value] Value to empty
     * @returns {Iterable} Emptied value
     */
    empty: function empty(value) {
      var _ = this || _;
      if (_.isObject(value)) {
        if (_.isArray(value)) {
          value.length = 0;
        }
        else {
          _(value)
            .keys()
            .each(function (key) {
              delete value[key];
            });
        }
      }
      return value;
    }
  };

_.mixin(_, nonChainableMixins, {
  chain: false
});
_.mixin(_, chainableMixins);

module.exports = _;

},{"format":2}],2:[function(require,module,exports){
//
// format - printf-like string formatting for JavaScript
// github.com/samsonjs/format
// @_sjs
//
// Copyright 2010 - 2013 Sami Samhuri <sami@samhuri.net>
//
// MIT License
// http://sjs.mit-license.org
//

;(function() {

  //// Export the API
  var namespace;

  // CommonJS / Node module
  if (typeof module !== 'undefined') {
    namespace = module.exports = format;
  }

  // Browsers and other environments
  else {
    // Get the global object. Works in ES3, ES5, and ES5 strict mode.
    namespace = (function(){ return this || (1,eval)('this') }());
  }

  namespace.format = format;
  namespace.vsprintf = vsprintf;

  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    namespace.printf = printf;
  }

  function printf(/* ... */) {
    console.log(format.apply(null, arguments));
  }

  function vsprintf(fmt, replacements) {
    return format.apply(null, [fmt].concat(replacements));
  }

  function format(fmt) {
    var argIndex = 1 // skip initial format argument
      , args = [].slice.call(arguments)
      , i = 0
      , n = fmt.length
      , result = ''
      , c
      , escaped = false
      , arg
      , precision
      , nextArg = function() { return args[argIndex++]; }
      , slurpNumber = function() {
          var digits = '';
          while (fmt[i].match(/\d/))
            digits += fmt[i++];
          return digits.length > 0 ? parseInt(digits) : null;
        }
      ;
    for (; i < n; ++i) {
      c = fmt[i];
      if (escaped) {
        escaped = false;
        precision = slurpNumber();
        switch (c) {
        case 'b': // number in binary
          result += parseInt(nextArg(), 10).toString(2);
          break;
        case 'c': // character
          arg = nextArg();
          if (typeof arg === 'string' || arg instanceof String)
            result += arg;
          else
            result += String.fromCharCode(parseInt(arg, 10));
          break;
        case 'd': // number in decimal
          result += parseInt(nextArg(), 10);
          break;
        case 'f': // floating point number
          result += parseFloat(nextArg()).toFixed(precision || 6);
          break;
        case 'o': // number in octal
          result += '0' + parseInt(nextArg(), 10).toString(8);
          break;
        case 's': // string
          result += nextArg();
          break;
        case 'x': // lowercase hexadecimal
          result += '0x' + parseInt(nextArg(), 10).toString(16);
          break;
        case 'X': // uppercase hexadecimal
          result += '0x' + parseInt(nextArg(), 10).toString(16).toUpperCase();
          break;
        default:
          result += c;
          break;
        }
      } else if (c === '%') {
        escaped = true;
      } else {
        result += c;
      }
    }
    return result;
  }

}());

},{}]},{},[1]);
