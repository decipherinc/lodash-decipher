/**
 * ng-lodash-decipher: lodash-decipher + AngularJS goodies
 * @author Christopher Hiller <chiller@decipherinc.com>
 * @copyright Copyright 2014 Decipher, Inc.
 * @license MIT
 * @overview Provides a smattering of mixins for [LoDash](http://lodash.com).
 */

'use strict';

var decipherLodash = function ($parse) {

  /**
   * Evaluates truthiness of context of AngularJS expression
   *   in a context object.  If `exp` is omitted, returns the result of
   *   casting `ctx` to a boolean.
   * @param {Object} [ctx] Context in which to evaluate `exp`
   * @param {string} [exp] AngularJS expression
   * @returns {boolean}
   * @example
   * var foo = {bar: {baz: {quux: true}}};
   * (foo.bar && foo.bar.baz && foo.bar.baz.quux) // true
   * _.truthy(foo, 'bar.baz.quux') // true
   */
  var truthy = function truthy(ctx, exp) {
      return this.isString(exp) ?
      this.isObject(ctx) && !!$parse(exp)(ctx) : !!ctx;
    },

    /**
     * @description Evaluates falsiness of context of AngularJS expression in
     *   a context object.  If `exp` is omitted, returns the result of
     *   casting `ctx` to a boolean.
     * @param {Object} [ctx] Context in which to evaluate `exp`
     * @param {string} [exp] AngularJS expression
     * @this _
     * @returns {boolean}
     */
    falsy = function falsy(ctx, exp) {
      return !this.truthy(ctx, exp);
    },

    /**
     * Using dot-notation, get or set a value within an object-like `ctx`.
     * @param {(Object|Function|Array|string)} [ctx={}] If an object-like value,
     * get or set the value of path `exp` against it.  If a string, assign
     * the `value` to the path `exp` within a new object.
     * @param {(*|string)} exp If a string, then an AngularJS expression path
     * to be evaluated within `ctx`.  Otherwise, assumed to be the `value` in
     * "setter" mode.
     * @param {*} [value] If present, sets the value of path `exp`.
     * @todo split into two functions?
     * @throws If AngularJS expression not parseable by `$parse`
     * @throws If `value` present and keypath is not assignable by `$parse`
     * @returns {(*|undefined)} The value of the expression `exp` if in "getter"
     * mode if `exp` is a string; otherwise `ctx`.
     * @example
     * var foo = {bar: baz: {quux: true}};
     * keypath(foo, 'bar.baz.quux'); // true
     * keypath(foo, 'bar.baz.spam', false); // foo
     * foo.bar.baz.spam; // false
     * keypath('herp', 'derp') // {herp: 'derp'}
     */
    keypath = function keypath(ctx, exp, value) {
      var compiled;
      if (this.isString(ctx)) {
        value = exp;
        exp = ctx;
        ctx = {};
      }
      if (this.isUndefined(exp)) {
        return ctx;
      }
      if (this.isObject(ctx)) {
        compiled = $parse(exp);
        if (this.isDefined(value)) {
          compiled.assign(ctx, value);
          return ctx;
        }
        return compiled(ctx);
      }
    };

  _.mixin({
    truthy: truthy,
    falsy: falsy,
    keypath : keypath
  });
};
decipherLodash.$inject = ['$parse'];

angular.module('decipher.lodash', [])
  .run(decipherLodash);
