/**
 * ng-lodash-decipher: lodash-decipher + AngularJS goodies
 * @author Christopher Hiller <chiller@decipherinc.com>
 * @copyright Copyright 2014 Decipher, Inc.
 * @license MIT
 * @overview Provides a smattering of mixins for [LoDash](http://lodash.com).
 */

'use strict';

var _ = require('./lodash-decipher'),
  angular = require('angular-node'),

  decipherLodash = function ($injector) {

    /**
     * Evaluates truthiness of context of AngularJS expression
     *   in a context object.  If `exp` is omitted, returns the result of
     *   casting `ctx` to a boolean.
     * @param {Object} [ctx] Context in which to evaluate `exp`
     * @param {string} [exp] AngularJS expression
     * @this _
     * @returns {boolean}
     * @example
     * var foo = {bar: {baz: {quux: true}}};
     * (foo.bar && foo.bar.baz && foo.bar.baz.quux) // true
     * _.truthy(foo, 'bar.baz.quux') // true
     */
    var truthy = function truthy(ctx, exp) {
        var _truthy = function _truthy($parse) {
          return !!$parse(exp)(ctx)
        };
        _truthy.$inject = ['$parse'];
        return this.isString(exp) ?
        this.isObject(ctx) && $injector.invoke(_truthy) : !!ctx;
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
       * @param {(Object|Function|Array|string)} [ctx={}] If an object-like
       *   value, get or set the value of path `exp` against it.  If a string,
       *   assign the `value` to the path `exp` within a new object.
       * @param {(*|string)} exp If a string, then an AngularJS expression path
       * to be evaluated within `ctx`.  Otherwise, assumed to be the `value` in
       * "setter" mode.
       * @param {*} [value] If present, sets the value of path `exp`.
       * @todo split into two functions?
       * @throws If AngularJS expression not parseable by `$parse`
       * @throws If `value` present and keypath is not assignable by `$parse`
       * @returns {(*|undefined)} The value of the expression `exp` if in
       *   "getter" mode if `exp` is a string; otherwise `ctx`.
       * @this _
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
      },

      /**
       * Returns `true` if `value` is a {@link ng.$rootScope.Scope}.
       * @param {*} [value]
       * @this _
       * @returns {boolean}
       */
      isScope = function isScope(value) {
        return !!(this.isObject(value) && this.isFunction(value.$apply));
      },

      /**
       * Returns a Function which evaluates an expression or executes a
       * Function within an AngularJS context.
       *
       * If any parameters are incorrect, {@link _.noop} will be returned.
       * @this _
       * @param {(ng.$rootScope.Scope|Function|string)} scope If a Scope
       *   object, then `$apply()` will be called with this Scope.  Otherwise,
       *   `$apply()` will be called against `$rootScope()`.  *Note*:  if
       *   `expr` is a Function, a Scope is unneccessary, because the
       *   Scope has no bearing on what the Function does.
       * @param {(string|Function)} [expr] If a string, expected to be a valid
       *   AngularJS expression.  If a Function, then this Function will be
       *   passed to `$rootScope.$apply()`.
       * @see https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply
       * @param {Object} [ctx] Context to run `expr` in, if a Function.
       * @param {Array} [args] Args to pass to `expr`, if `expr` is a Function.
       * @returns {Function}
       */
      angularize = function angularize(scope, expr, ctx, args) {
        var proxy,
          bind = this.bind,
          func;

        // ignore if passed no args
        if (this.isUndefined(scope)) {
          return this.noop;
        }

        // get `$rootScope` if passed no Scope
        if (!this.isScope(scope)) {
          args = ctx;
          ctx = expr;
          expr = scope;
          scope = $injector.get('$rootScope');
        }

        // check rest of args
        if (!(this.isString(expr) || this.isFunction(expr)) ||
          (this.isDefined(args) && !this.isArray(args)) ||
          this.isDefined(ctx) && !(this.isObject(ctx))) {
          return this.noop;
        }

        // note that we have a function if `expr` is a function
        if (this.isFunction(expr)) {
          func = expr;
        }

        return (function (scope, expr, func, args, ctx) {
          return function proxy() {
            var innerArgs = arguments, retval;
            if (func) {
              scope.$apply(function (/* scope */) {
                retval = func.apply(ctx, args || innerArgs)
              });
            }
            else {
              retval = scope.$apply(expr);
            }
            return retval;
          };
        })(scope, expr, func, args, ctx);
      },

      /**
       * Convenience function to bind an event to an element, and wrap the
       * callback in an AngularJS context.  If any params are omitted,
       * `element` is returned.  If `scope` is passed, automatically
       * unbinds upon `$destroy` event.
       * @param {(angular.element|T)} [element] Element Object
       * @param {string} [eventName] Name of event
       * @param {Function} [callback] Callback function
       * @param {ng.$rootScope.Scope} [scope] AngularJS Scope object
       * @returns {T}
       * @example
       * element.on('click', function() {
       *   scope.foo = 'bar';
       *   scope.$apply();
       * });
       * scope.$on('$destroy', function() {
       *   element.off('click');
       * });
       *
       * // is equivalent to:
       *
       * _.handle(element, 'click', function() {
       *   scope.foo = 'bar';
       * }, scope);
       */
      handle = function handle(element, eventName, callback, scope) {
        var retval;
        if (!angular.isElement(element) || !eventName || !callback) {
          return element;
        }
        retval = element.on(eventName, this.angularize(callback));
        if (this.isScope(scope)) {
          scope.$on('$destroy', (function (element, eventName) {
            return function $destroy() {
              element.off(eventName)
            };
          })(element, eventName));
        }
        return retval;
      },

      /**
       * @lends _
       */
      mixins = {
        truthy: truthy,
        falsy: falsy,
        keypath: keypath,
        isScope: isScope,
        angularize: angularize,
        handle: handle
      };

    _.mixin(mixins, {
      chain: false
    });
  };
decipherLodash.$inject = ['$injector'];

angular.module('decipher.lodash', [])
  .run(decipherLodash);
