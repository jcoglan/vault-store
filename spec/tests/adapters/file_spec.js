var storeroom = require("../../../"),
    jstest    = require("jstest").Test,
    path      = require("path"),
    rm_rf     = require("rimraf")

var storagePath = path.resolve(__dirname, "..", "..", ".store")

jstest.describe("FileAdapter", function() { with(this) {
  this.define("createAdapter", function() {
    return storeroom.createFileAdapter(storagePath)
  })

  this.define("clearAdapter", function(resume) {
    rm_rf(storagePath, resume)
  })

  itShouldBehaveLike("storage adapter")
}})
