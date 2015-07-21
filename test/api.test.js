var crossfilter = require("crossfilter");
var expect = require("chai").expect;
var Multigroup = require("../crossfilter-multigroup");

describe("Multigroup API", function() {

  it("can be called directly or with `new`", function() {
    var collection = crossfilter();
    var getTags = function(d) { return d.tags; };
    var tags = collection.dimension(getTags);

    var withNew = Multigroup(tags, getTags);
    var withoutNew = new Multigroup(tags, getTags);

    expect(withNew).to.respondTo("all");
    expect(withNew).to.have.all.keys(Object.keys(withoutNew));
    expect(withNew.all()).to.deep.equal([]);
    expect(withoutNew.all()).to.deep.equal([]);
  });

  it("throws a TypeError when created with invalid arguments", function() {
    var collection = crossfilter();
    var tags = collection.dimension(function(d) { return d.tags; });

    expect(function() {
      Multigroup();
    }).to.throw(TypeError, null, "throws if no arguments");

    expect(function() {
      Multigroup({}, function(d) { return d.tags; });
    }).to.throw(
      TypeError, null, "throws if the first argument isn't a dimension");

    expect(function() {
      Multigroup(tags);
    }).to.throw(TypeError, null, "throws if only one argument");

    expect(function() {
      Multigroup(tags, {});
    }).to.throw(
      TypeError, null, "throws if the second argument is not a function");
  });

  it("supports the crossfilter group API", function() {
    var collection = crossfilter([
      {id: 1, tags: ["charity", "money"]},
      {id: 2, tags: ["money", "business", "environment"]},
      {id: 3, tags: ["charity", "money", "business"]},
      {id: 4, tags: ["charity", "money"]}
    ]);
    var tags = collection.dimension(function(d) { return d.tags; });
    var group = new Multigroup(tags, function(d) { return d.tags; });

    expect(group).itself.to.respondTo("size");
    expect(group).itself.to.respondTo("reduce");
    expect(group).itself.to.respondTo("reduceCount");
    expect(group).itself.to.respondTo("reduceSum");
    expect(group).itself.to.respondTo("order");
    expect(group).itself.to.respondTo("orderNatural");
    expect(group).itself.to.respondTo("all");
    expect(group).itself.to.respondTo("top");
    expect(group).itself.to.respondTo("dispose");
  });

});
