var crossfilter = require("crossfilter");
var expect = require("chai").expect;
var Multigroup = require("../crossfilter-multigroup");

describe("Grouping based on list items", function() {

  var reverseSort = function(a, b) { return b.value - a.value; };

  beforeEach(function() {
    this.collection = crossfilter([
      {id: 1, tags: ["charity", "money"]},
      {id: 2, tags: ["money", "business", "environment"]},
      {id: 3, tags: ["charity", "money", "business"]},
      {id: 4, tags: ["charity", "money"]},
      {id: 5, tags: []}
    ]);

    this.tags = this.collection.dimension(function(d) { return d.tags; });
    this.group = Multigroup(this.tags, function(d) { return d.tags; });

    this.allGroups = [
      {key: "business", value: 2},
      {key: "charity", value: 3},
      {key: "environment", value: 1},
      {key: "money", value: 4}
    ];
  });

  // tests

  it("all() should return groups ordered by key", function() {
    expect(this.group.all()).to.deep.equal(this.allGroups);
  });

  it("top() should return groups ordered by value", function() {
    var topGroups = this.allGroups.sort(reverseSort);

    expect(this.group.top(Infinity)).to.deep.equal(topGroups);
    expect(this.group.top(1)).to.deep.equal([topGroups[0]])
  });

  it("should return the number of unique list items for size()", function() {
    expect(this.group.size()).to.equal(4);
  });

  it("doesn't explode if groups are null for a record", function() {
    this.collection.add([
      {id: 10, tags: null},
      {id: 10, tags: undefined}
    ]);

    expect(this.group.all()).to.deep.equal(this.allGroups);
  });

  it("works when there are no records", function() {
    var collection = crossfilter();
    var tags = collection.dimension(function(d) { return d.tags; });
    var group = Multigroup(tags, function(d) { return d.tags; });

    expect(group.all()).to.deep.equal([]);
    expect(group.top(Infinity)).to.deep.equal([]);
  });

  it("includes new records added later", function() {
    var collection = crossfilter();
    var tags = collection.dimension(function(d) { return d.tags; });
    var group = Multigroup(tags, function(d) { return d.tags; });

    expect(group.all()).to.deep.equal([]);
    expect(group.top(Infinity)).to.deep.equal([]);

    collection.add([
      {id: 1, tags: ["charity", "money"]},
      {id: 2, tags: ["money", "business", "environment"]},
      {id: 3, tags: ["charity", "money", "business"]},
      {id: 4, tags: ["charity", "money"]},
      {id: 5, tags: []}
    ]);

    expect(group.all()).to.deep.equal(this.allGroups);
    expect(group.top(10)).to.deep.equal(this.allGroups.sort(reverseSort));
    expect(group.size()).to.equal(4);
  });

});
