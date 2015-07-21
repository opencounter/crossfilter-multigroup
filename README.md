# Crossfilter-Multigroup

Multigroup is designed to be used with Square’s [Crossfilter](https://square.github.io/crossfilter/) library, a highly performant tool for filtering and sorting across multiple dimensions of a dataset. It works just as you’d use a normal Crossfilter *group,* but allows you to treat fields that are arrays as a set of groups, rather than a single group.

## Setup

Multigroup can be loaded via CommonJS (for Node or Browserify), ES6 import, AMD (for Require.js), or as a simple browser global:

```javascript
// ES6
import Multigroup from "crossfilter-multigroup";
// CommonJS
var Multigroup = require("crossfilter-multigroup");
// Require.js
define(["crossfilter-multigroup"], function(Multigroup) {
  // your code
});
// Global
crossfilterMultigroup;
```

## Usage

You might have some Crossfilter code like the following:

```javascript
var data = crossfilter([
  {id: 1, tags: ["charity", "money"]},
  {id: 2, tags: ["money", "business", "environment"]}
]);
var tags = data.dimension(function(d) { return d.tags; });
var tagGroups = tags.group();
```

Calling `tagGroups.all()` would then yield you the following set:

```javascript
[{key: ["charity", "money"], value: 1},
{key: ["money", "business", "environment"], value: 1}]
```

Even though what you really wanted was probably:

```javascript
[{key: "charity", value: 1},
{key: "money", value: 2},
{key: "business", value: 1},
{key: "environment", value: 1}]
```

Multigroup lets you do that. Instead of `tags.group()`, you’d simply do:

```javascript
var tagGroups = Multigroup(tags, function(d) { return d.tags; });
tagGroups.all();
```

The rest of the normal group API works as you might expect, reporting results as if groups were formed from each of the items *in* the dimension value, rather than the dimension value itself.

Note, however, the `reduce()`, `reduceSum()`, and `reduceCount()` don’t currently work. (We’d welcome any help there, of course :)

## Copyright

Copyright (c) 2015 Open Counter Enterprises, Inc. and made freely available under the MIT license. See [LICENSE][] for details.

[license]: https://github.com/opencounter/crossfilter-multigroup/blob/master/LICENSE
