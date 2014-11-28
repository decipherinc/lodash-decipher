# lodash-decipher

A smattering of mixins for [LoDash](http://lodash.com), by [Decipher, Inc.]
(http://decipherinc.com). 

## Install

```shell
$ bower install lodash-decipher
```

or

```shell
$ npm install lodash-decipher
```

## Usage

### AngularJS Goodies

This module distributes a separate set of file(s) that will mixin [several more functions](#angularjs-api) to LoDash that rely on AngularJS' API.
  
Is that a good idea?  I don't know.  Anyway...

If you want access to these functions, simply require `decipher.lodash` from your main module, and it will mix itself into LoDash's `_` object.

> **Note**: These functions are *not* available during AngularJS' configuration phase, as they rely on services instead of providers.

In general, this will give you the extra functions:

```js
angular.module('myModule', ['decipher.lodash']);
```

Read on for specifics.

### NodeJS

```js
var _ = require('lodash-decipher');

_.morph([1, 2, 3], function(value) {
  return value + 1;
}); // [2, 3, 4]
```

**lodash-decipher** has a peer dependency upon LoDash, so if you install it, you get LoDash too.  It exports the same object as returned by `require('lodash')`.

### NodeJS + AngularJS

If you have [angular-node](https://www.npmjs.org/package/angular-node) installed, the AngularJS `Module` (`decipher.lodash`) will automatically be registered when this module is required.  Example:

```js
var angular = require('angular-node'),
  _ = require('lodash-decipher');
  
angular.module('myModule', ['decipher.lodash'])
  .run(function() {
    var foo = {bar: {baz: {quux: true}}};
    _.keypath(bar, 'baz.quux', false);
    bar.baz.quux === false; // true
  });
```

### Browser

```html
<script src="/path/to/lodash.js"></script>
<script src="/path/to/lodash-decipher.js"></script>
```

For production usage:

```html
<script src="/path/to/lodash.min.js"></script>
<script src="/path/to/lodash-decipher.min.js"></script>
```

LoDash *must* be loaded before **lodash-decipher**.

### Browser + AngularJS

If you're using [AngularJS](http://angularjs.org), you may wish to use the `lodash-decipher.ng*.js` files instead.

```html
<script src="/path/to/lodash.js"></script>
<script src="/path/to/angular.js"></script>
<script src="/path/to/lodash-decipher.ng.js"></script>
```

For production usage:

```html
<script src="/path/to/lodash.min.js"></script>
<script src="/path/to/angular.min.js"></script>
<script src="/path/to/lodash-decipher.ng.min.js"></script>
```

> **Note**: `lodash-decipher.js` proper is included within `lodash-decipher.ng.js`.

## Core API

### Chainable Methods

#### _.transmogrify(value, func, [ignoreRx]) 

Walk an object depth-first and execute a function against each member, replacing the value of that member with the value returned by the function. Use <a href="#_.applicator">_.applicator</a> to generate a function which will call a function *within* each object member, if present.  *Will not walk functions.*

**Parameters**

**value**: `Object`, Object to walk.

**func**: `Function`, Function to execute against each member.

**ignoreRx**: `RegExp | string`, Any key matching this will not be walked.

**Returns**: `*`, Transmogrified copy of your object.

**Example**:
```js
// Given a deeply-nested object `foo`, return a deeply-nested object
// wherein all members are converted to strings via their `toString()` methods.
var bar = _.transmogrify(foo, _.applicator('toString'));

// Given a deeply-nested object `foo`, return a deeply-nested object
// wherein all array members are converted to objects, ignoring
// any arrays whose key contains `$`.
var bar = _.transmogrify(foo, function(value) {
  if (_.isArray(value)) {
    value = _.extend({}, value);
  }
  return value;
}, '$');
```

#### _.morph(value, [callback], [thisArg]) 

Convenience method.  Calls `_.map` or `_.mapValues` as appropriate on `value`. If `value` is not an Array or Object, `value` will be returned.

**Parameters**

**value**: `Object | Array`, Value to `map` or `mapValues` against.

**[callback]**: `Function | Object`, Function to execute, or `_.pluck`-style clause.

**[thisArg]**: `Object`, Value of `this` in the `callback`.

**Returns**: `*`, The morphed `value`


### _.sift(value, [callback], [thisArg]) 

Convenience method.  Calls `_.filter` or `_.pick` as appropriate on `value`.  If `value` is not an Array or Object, `value` will be returned.

**Parameters**

**value**: `Object | Array`, Value to `filter` or `pick` against.

**[callback]**: `Function | Object`, Function to execute, or `_.pluck`-style clause.

**[thisArg]**: `Object`, Value of `this` in the `callback`.

**Returns**: `*`, The sifted `value`

#### _.squirt(collection, key, [value]) 

"Squirts" some key/value pair into each member of an Object or Array.  Maybe like the opposite of `_.pluck`?  Dunno.

**Parameters**

**collection**: `Object | Array`, Some thing to iterate over.  If not an iterable value, `collection` will be returned.

**key**: `Object | string`, If the (enumerable) item in `collection` is object-like, use this key to set the value.   Alternatively, use an object to set multiple values.

**[value]**: `*`, Value to set `key` to. Applicable only if `key` is a string.

**Returns**: `*`, The squirted `collection`

**Example**:
```js
var foo = [{}, {}, {}];
_.squirt(foo, {bar: true}) // [{bar: true}, {bar: true}, {bar: true}]

// equivalent:
var baz = [{}, {}, {}];
_.squirt(foo, 'bar', true) // [{bar: true}, {bar: true}, {bar: true}]
```

### _.empty([value]) 

Empties a value of its enumerable contents.

**Parameters**

**[value]**: `Object | Array`, Value to empty

**Returns**: `*`, Emptied value, if it's empty-able.

**Example**:

```js
var foo = {a: 1, b: 2, c: 3};
_.empty(foo); // {}
var bar = [1, 2, 3];
_.empty(bar); // []
```

#### _.flattenPrototype(value) 

Given an object with a non-trivial prototype chain, return its flattened prototype.

**Parameters**

**value**: `*`, Something with a prototype, hopefully

**Returns**: `Object`, A flattened prototype

### Non-Chainable Methods

#### _.applicator([func], [args], [ctx]) 

Generates a function which accepts a value and returns the result of executing a function against that value.

**Parameters**

**[func]**: `Function | string`, Function to call.  If a string, then will atempt to execute a function with the same name within the parameter to the returned function of this function.  If omitted, will call `_.identity`.

**[args]**: `Array`, Any arguments to pass to `func`.

**[ctx]**: `Object`, Context to execute `func` in.  Defaults to the parameter to the returned function of this function.

**Returns**: `Function`

**Example**:

```js
var foo = _.applicator('toString');
var bar = 1;
foo(bar); // '1'
```

#### _.isDefined([value]) 

Returns `true` if the value is not `undefined`.

**Parameters**

**value**: `*`, Value to inspect

**Returns**: `boolean`

#### _.format(value, [params]) 

Formats a string value, `sprintf`-style, sort of.  Is pretty forgiving.  Does not currently support things like decimal places and padding.  Valid replacements:

  - `%s`: String replacement
  - `%d`: Integer replacement
  - `%f`: Float replacement
  - `%j`: JSON replacement

**Parameters**

**value**: `string`, String to format, which can contain any number of the above replacement variables

**params**: `[string]`, Any parameters to your formatting string

**Returns**: `string`, Formatted string

#### _.noop() 

It's a no-op.

**Example**:

```js
// nothing happens.
_.noop(); 

// nothing happens a second later.
setTimeout(function() {
  _.noop();
}, 1000);
```

## AngularJS API

The following are only available if you are using AngularJS and have followed the "usage" directions:

### Non-Chainable Methods

#### _.truthy([ctx], [exp]) 

Evaluates [AngularJS expression](https://docs.angularjs.org/guide/expression) `exp` in context of "object" `ctx` for truthiness.  The purpose of this is to avoid code like:

```js
if (foo && foo.bar && foo.bar.baz && foo.bar.baz.quux) {
  // ...
}
```

*"Object" means one of: `Array`, `Function`, `Object`, `RegEx`, `new Number(0)`, and `new String('')`.*

**Parameters**

**ctx**: `Object`, Context in which to evaluate `exp`.  

**exp**: `String`, Valid AngularJS path expression.  *Assignments not allowed*.

**Returns**: `boolean`

**Example**:

```js
var foo = {bar: {baz: {quux: true}}};
_.truthy(foo, 'bar.baz.quux') // true
```

#### _.falsy([ctx], [exp]) 

Evaluates [AngularJS expression](https://docs.angularjs.org/guide/expression) `exp` in context of "object" `ctx` for falsiness.  The purpose of this is to avoid code like:

```js
if (foo && foo.bar && foo.bar.baz && foo.bar.baz.quux) {
  // ...
}
```

*"Object" means one of: `Array`, `Function`, `Object`, `RegEx`, `new Number(0)`, and `new String('')`.*

**Parameters**

**ctx**: `Object`, Context in which to evaluate `exp`.  

**exp**: `String`, Valid AngularJS path expression.  *Assignments not allowed*.

**Returns**: `boolean`

**Example**:

```js
var foo = {bar: {baz: {quux: false}}};
_.falsy(foo, 'bar.baz.quux') // true
```

#### _.keypath([ctx={}], exp, [value])

Using dot-notation, get or set a value within an object `ctx`.  Can also be used to create objects. 

*"Object" means one of: `Array`, `Function`, `Object`, `RegEx`, `new Number(0)`, and `new String('')`.*
 
**Parameters**

**ctx**: `Object | String`, Context in which to evaluate `exp`.  If a string, then considered to be a path, and `exp` is considered to be the value.  Defaults to `{}`.

**exp**: `String | *`, If a string, then an AngularJS expression path to be evaluated within `ctx`.  Otherwise, assumed to be the `value` in "setter" mode.

**value**: `*`, If present, sets the value of path `exp`.

**Returns**: `* | undefined`, The value of the expression `exp` if in "getter" mode, *if* `exp` is a `String`; otherwise `ctx`.  

**Throws**: If AngularJS expression not parseable by `$parse`.

**Throws**: If `value present and keypath is not assignable by `$parse`.

**Example**:

```js
var foo = {bar: baz: {quux: true}};
// get a value
_.keypath(foo, 'bar.baz.quux'); // true

// set a value
_.keypath(foo, 'bar.baz.spam', false); // foo
foo.bar.baz.spam; // false

// create an object dynamically
_.keypath('herp', 'derp') // {herp: 'derp'}
_.zipObject(['herp'], ['derp']) // equivalent
```     

## Developing

Clone this module, then execute `npm install` within it.

### Building

To build, execute:

```shell
$ npm run-script build
```

The created files are placed in the `dist/` directory.

### Custom Builds

If you have a custom build of LoDash, you can create a build against it; assuming everything *this* module uses from LoDash is in your build.

Clone this repo, `cd` into it, then:

```shell
$ npm install
$ ./node_modules/.bin/grunt custom --lodash /path/to/custom/lodash.js
```

> You can just use `grunt` if you have installed `grunt-cli` globally.

This will create `lodash-decipher.custom.js`, `lodash-decipher.custom.min.js`, and `lodash-decipher.custom.min.js.map` in the `dist/` directory.  These files are not under version control.  

The Grunt task `custom-ng` will create a custom build in the same manner, with the AngularJS extensions included.

### Tests

```shell
$ npm test
```

If there were any tests, they'd be executed.  TODO: Get on that.

## Maintainer

[Christopher Hiller](mailto:chiller@decipherinc.com)

## License

Copyright (c) 2014 Decipher, Inc.; Licensed MIT
