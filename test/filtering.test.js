var crossfilter = require("crossfilter");
var expect = require("chai").expect;
var Multigroup = require("../crossfilter-multigroup");

describe("Filtering", function() {

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
  });

  describe("by the multigroup's dimension", function() {

    this.beforeEach(function() {
      this.tags.filter(function(tags) {
        return tags.indexOf("business") === -1;
      });

      this.allGroups = [
        {key: "business", value: 2},
        {key: "charity", value: 3},
        {key: "environment", value: 1},
        {key: "money", value: 4}
      ];
    });

    it("should not affect all()", function() {
      expect(this.group.all()).to.deep.equal(this.allGroups);
    });

    it("should not affect top()", function() {
      var topGroups = this.allGroups.sort(reverseSort);
      expect(this.group.top(Infinity)).to.deep.equal(topGroups);
      expect(this.group.top(1)).to.deep.equal([topGroups[0]])
    });

    it("should not affect size()", function() {
      expect(this.group.size()).to.equal(4);
    });

  });

  describe("by a different dimension", function() {

    this.beforeEach(function() {
      this.id = this.collection.dimension(function(d) { return d.id; });
      this.id.filter([3, 5]);

      this.allGroups = [
        {key: "business", value: 1},
        {key: "charity", value: 2},
        {key: "environment", value: 0},
        {key: "money", value: 2}
      ];
    });

    it("should change values but not keys for all()", function() {
      expect(this.group.all()).to.deep.equal(this.allGroups);
    });

    it("should change values but not keys for top()", function() {
      var topGroups = this.allGroups.sort(reverseSort);
      expect(this.group.top(Infinity)).to.deep.equal(topGroups);
      expect(this.group.top(1)).to.deep.equal([topGroups[0]])
    });

    it("should not affect size()", function() {
      expect(this.group.size()).to.equal(4);
    });

  });

});
