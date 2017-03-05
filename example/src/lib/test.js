(function (root) {
  function test(name) {
    this.name = name;
  }
  test.prototype.getName = function () {
    return this.name;
  }
  return test;
})(this)