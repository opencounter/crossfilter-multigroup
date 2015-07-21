var crossfilter = require("crossfilter");
var expect = require("chai").expect;
var Multigroup = require("../crossfilter-multigroup");

describe("Ordering", function() {

  var reverseSort = function(a, b) { return b.value - a.value; };

  beforeEach(function() {
    this.collection = crossfilter([
      {id: 1, tags: ["charity", "money"]},
      {id: 2, tags: ["money", "business", "environment"]},
      {id: 3, tags: ["charity", "money", "business"]},
      {id: 4, tags: ["charity", "money"]}
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

  it("all() should not be affected by order", function() {
    this.group.order(function(tagCount) { return -tagCount; });
    expect(this.group.all()).to.deep.equal(this.allGroups);
  });

  it("top() should return groups ordered by value", function() {
    this.group.order(function(tagCount) { return -tagCount; });
    var topGroups = this.allGroups.sort(reverseSort).reverse();
    expect(this.group.top(Infinity)).to.deep.equal(topGroups);
  });

  it("orderNatural() should sort the same as no set order", function() {
    this.group.orderNatural();
    var topGroups = this.allGroups.sort(reverseSort);
    expect(this.group.top(Infinity)).to.deep.equal(topGroups);
  });

});
