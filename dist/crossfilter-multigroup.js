/*!
 * crossfilter-multigroup v0.5.0
 * Copyright (c) 2015 Open Counter Enterprises, Inc.
 * This software is free to use under the MIT license.
 * See https://github.com/opencounter/crossfilter-multigroup/blob/master/LICENSE
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.crossfilterMultigroup = mod.exports;
  }
})(this, function (exports, module) {
  /**
   * Create a specialized Crossfilter group for handling dimensions that are lists
   * of values, e.g. tags, zones, etc.
   * When you use the all/top/bottom methods, you'll get counts for each unique
   * element of the list, rather than counts for each unique list combination.
   *
   * For example, if you have a crossfilter over:
   *     {id: 1, tags: ["charity", "money"]}
   *     {id: 2, tags: ["money", "business", "environment"]}
   * and a dimension on the `tags` field. A normal group on that dimesion yields:
   *     {key: ["charity", "money"], value: 1}
   *     {key: ["money", "business", "environment"], value: 1}
   * but Multigroup will yield:
   *     {key: "charity", value: 1}
   *     {key: "money", value: 2}
   *     {key: "business", value: 1}
   *     {key: "environment", value: 1}
   *
   * @param {CrossfilterDimension} dimension  The dimension to group from
   * @param {Function} groupValues  A function that, given an item, returns a list
   *                              of values to group over.
   * @returns {CrossfilterGroup}
   */
  "use strict";

  module.exports = Multigroup;

  function Multigroup(dimension, groupValues) {
    if (!dimension || !dimension.group) {
      throw new TypeError("The first argument for multigroup must be a " + "Crossfilter dimension object.");
    }
    if (typeof groupValues !== "function") {
      throw new TypeError("The second argument for multigroup must be a " + "function that, given a record, returns an array of values to group by.");
    }

    // internally, work is done on an object since key lookup is faster/simpler
    var groupData = {};
    // and we store cached array versions ordered by key and by value
    var keyArray, valueArray;
    // indicates we need to scan for new keys that may have no records that match
    // any filters -- so they won't be seen in add()/remove()
    var shouldCheckGroups;
    // getter for a value to sort by
    var orderValue = identity;

    // create an underlying crossfilter group to manage filtering and when things
    // need recalculation for efficiency.
    var group = dimension.group().reduce(function add(memo, item) {
      keyArray = null;
      valueArray = null;
      groupsForRecord(item).forEach(function (value) {
        groupData[value] = (groupData[value] || 0) + 1;
      });
      return 0;
    }, function remove(memo, item) {
      keyArray = null;
      valueArray = null;
      groupsForRecord(item).forEach(function (value) {
        groupData[value] = (groupData[value] || 1) - 1;
      });
      return 0;
    }, function initial() {
      // if a new combined key has been seen, there could be new groups.
      shouldCheckGroups = true;
      return 0;
    });

    function identity(x) {
      return x;
    };

    function groupsForRecord(record) {
      return groupValues(record) || [];
    };

    // Ensure we have a key for every value in the dimension. This also has the
    // nice side-effect of forcing any lazy evaluations to occur (because we call
    // `group.all`).
    function ensureGroupData() {
      var combinations = group.all();
      if (!shouldCheckGroups) return;
      for (var i = combinations.length - 1; i > -1; i--) {
        var values = combinations[i].key;
        for (var j = values.length - 1; j > -1; j--) {
          if (groupData[values[j]] == null) {
            groupData[values[j]] = 0;
            // if there were new groups we haven’t seen before, we’ll need to
            // regenerate our data.
            keyArray = null;
            valueArray = null;
          }
        }
      }
      shouldCheckGroups = false;
    }

    // convert the stored dictionary to an array of {key, value} objects
    function asArray() {
      var result = [];
      for (var key in groupData) {
        result.push({ key: key, value: groupData[key] });
      }
      return result;
    }

    // get an array of the represented aggregations ordered by `key`
    function getByKey() {
      if (!keyArray) {
        keyArray = asArray().sort(function (a, b) {
          return a.key < b.key ? -1 : 1;
        });
      }
      return keyArray;
    }

    // get an array of the represented aggregations ordered by `value`
    // Note it is sorted in reverse order; we assume top() is more common than
    // bottom() and so optimize for that case.
    function getByValue() {
      if (!valueArray) {
        valueArray = asArray().sort(function (a, b) {
          var aValue = orderValue(a.value);
          var bValue = orderValue(b.value);
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        });
      }
      return valueArray;
    }

    /**
     * PUBLIC API
     */
    return {
      all: function all() {
        ensureGroupData();
        return getByKey();
      },
      top: function top(count) {
        ensureGroupData();
        return getByValue().slice(0, count);
      },
      size: function size() {
        // TODO: compute this when ensuring group data so we don't repeat work.
        ensureGroupData();
        var size = 0;
        for (var key in groupData) {
          size++;
        }
        return size;
      },
      order: function order(valueGetter) {
        valueGetter = valueGetter || identity;
        if (valueGetter !== orderValue) {
          orderValue = valueGetter;
          valueArray = null;
        }
        return this;
      },
      orderNatural: function orderNatural() {
        return this.order(identity);
      },
      dispose: function dispose() {
        group.dispose();
        return this;
      },
      reduce: function reduce() {
        throw new Error("reduce() is not implemented on multigroup!");
        return this;
      },
      reduceCount: function reduceCount() {
        // This is the built-in behavior; do nothing.
        // TODO: when reduce/reduceSum are implemented, this will have to change.
        return this;
      },
      reduceSum: function reduceSum() {
        throw new Error("reduceSum() is not implemented on multigroup!");
        return this;
      }
    };
  }
});
