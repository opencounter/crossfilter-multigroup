var crossfilter = require("crossfilter");
var expect = require("chai").expect;
var Multigroup = require("../crossfilter-multigroup");

describe.skip("Custom reducers", function() {

  var reverseSort = function(a, b) { return b.value - a.value; };

  beforeEach(function() {
    this.collection = crossfilter([
      {id: 1, amount: 10, tags: ["charity", "money"]},
      {id: 2, amount: 15, tags: ["money", "business", "environment"]},
      {id: 3, amount: 12, tags: ["charity", "money", "business"]},
      {id: 4, amount: 17, tags: ["charity", "money"]}
    ]);

    this.tags = this.collection.dimension(function(d) { return d.tags; });
    this.group = Multigroup(this.tags, function(d) { return d.tags; });
  });

  it("should be settable with reduce()", function() {
    this.group.reduce(
      function add(total, record) {
        return total + record.amount;
      },
      function remove(total, record) {
        return total - record.value;
      },
      function initial() {
        return 0;
      }
    );

    expect(this.group.all()).to.deep.equal([
      {key: "business", value: 27},
      {key: "charity", value: 39},
      {key: "environment", value: 15},
      {key: "money", value: 54}
    ]);
  });

  it("should be settable with reduceSum()", function() {
    this.group.reduceSum(function(record) {
      return record.amount;
    });

    expect(this.group.all()).to.deep.equal([
      {key: "business", value: 27},
      {key: "charity", value: 39},
      {key: "environment", value: 15},
      {key: "money", value: 54}
    ]);
  });

  it("reduceCount() should be the same as the built-in reduce", function() {
    this.group.reduceCount();
    expect(this.group.all()).to.deep.equal([
      {key: "business", value: 2},
      {key: "charity", value: 3},
      {key: "environment", value: 1},
      {key: "money", value: 4}
    ]);
  });

  it("should be ok to change reducers multiple times", function() {
    this.group.reduceSum(function(record) { return record.amount; });

    // call all() just to ensure any lazy calculation occurs; we don't want
    // laziness to accidentally look like success here.
    this.group.all();

    this.group.reduceCount();
    expect(this.group.all()).to.deep.equal([
      {key: "business", value: 2},
      {key: "charity", value: 3},
      {key: "environment", value: 1},
      {key: "money", value: 4}
    ]);
  });

});
