# Global





* * *

### flattenPrototype(value) 

Given an object with a non-trivial prototype chain, return its
flattened prototype.

**Parameters**

**value**: `*`, Something with a prototype, hopefully

**Returns**: `Object`, A flattended prototype


### applicator(func, args, ctx) 

Generates a function which accepts a value and returns the result of
executing a function against that value.

**Parameters**

**func**: `string`, Function to call.  If a string, then will
    attempt to execute a function with the same name within the
    parameter to the return value of this function.  If omitted,
    will call {@link _.identity}.

**args**: `Array`, Any arguments to pass to `func`.

**ctx**: `Object`, Context to execute `func` in.  Defaults to the
    parameter to the return value of this function.

**Returns**: `function`


### isDefined(value) 

Returns true if the value is not `undefined`

**Parameters**

**value**: `*`, Value to inspect

**Returns**: `boolean`


### format(value, params) 

Formats a string value, sprintf-style, sort of.  Is pretty forgiving.
Valid replacements:
  - `%s`: String replacement
  - `%d`: Integer replacement
  - `%f`: Float replacement
  - `%j`: JSON replacement

**Parameters**

**value**: `string`, String to format, which can contain any number
    of the above replacement variables

**params**: `string`, Any parameters to your formatting string

**Returns**: `string`


### transmogrify(value, func, ignoreRx) 

Walk an object depth-first and execute a function against each
member, replacing the value of that member with the value returned
by the function. Use {@link _.applicator} to generate a function which
will call a function *within* each object member, if present.  Will
not walk functions.

**Parameters**

**value**: `*`, Object to walk.

**func**: `function`, Function to execute against each
    member.

**ignoreRx**: `RegExp | string`, Any key matching this RegExp
will not be walked.

**Returns**: `*`

**Example**:
```js
// Given a deeply-nested object `foo`, return a deeply-nested object
// wherein all members are converted to strings.
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


### morph(value) 

Calls {@link _.map} or {@link _.mapValues} as appropriately on
`value`. If `value` is not an Array or Object, `value` will be
returned.

**Parameters**

**value**: `Iterable`, Calls {@link _.map} or {@link _.mapValues} as appropriately on
`value`. If `value` is not an Array or Object, `value` will be
returned.

**Returns**: `Iterable`


### sift(value) 

Calls {@link _.filter} or {@link _.pick} as appropriately on `value`.
If `value` is not an Array or Object, `value` will be returned.

**Parameters**

**value**: `Iterable`, Calls {@link _.filter} or {@link _.pick} as appropriately on `value`.
If `value` is not an Array or Object, `value` will be returned.

**Returns**: `Iterable`


### squirt(iterable, key, value) 

Squirts some key/value pair into an {@link Iterable}.  Maybe like the
opposite of {@link _.pluck}?  Dunno.

**Parameters**

**iterable**: `Iterable`, Some thing to iterate over.

**key**: `Object | string`, If the (enumerable) item in the
  `collection` is object-like, use this key to set the value.
  Alternatively, use an object to set multiple values.

**value**: `*`, Value to set `key` to. Applicable only if `key`
is a string.

**Returns**: `Iterable`, The squirted `iterable`


### empty(value) 

Empties an Iterable of its enumerable contents.

**Parameters**

**value**: `Iterable`, Value to empty

**Returns**: `Iterable`, Emptied value



* * *







**Overview:** lodash-decipher.js


