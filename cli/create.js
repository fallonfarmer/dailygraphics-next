var path = require("path");

var createGraphic = require("../lib/createGraphic");
var readJSON = require("../lib/readJSON");

module.exports = async function(config, argv, [type, slug]) {
  var created = await createGraphic(config, type, slug);
  console.log(`Created graphic: ${created}`);
}