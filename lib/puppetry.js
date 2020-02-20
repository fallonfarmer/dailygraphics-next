var puppeteer = require("puppeteer-core");
var chromeLauncher = require("chrome-launcher");
var fs = require("fs");

module.exports = function(config) {
  var wait = delay =>
    new Promise(ok => {
      setTimeout(ok, delay);
    });

  var snapGraphic = async function(url, destination) {
    var chrome = await chromeLauncher.launch({
      chromeFlags: [config.argv.disableHeadless ? "" : "--headless"],
      title: "Capturing fallback..."
    });
    var graphicViewport = config.fallbackSize ? config.fallbackSize : {width: 600, height: 800};
    var puppet = await puppeteer.connect({
      browserURL: `http://localhost:${chrome.port}`,
      defaultViewport: graphicViewport
    });
    var page = await puppet.newPage();
    console.log("Chrome window ready");
    console.log("Loading: ", url);
    try {
      await page.goto(url, { timeout: 10000, waitUntil: "domcontentloaded" });
    } catch (err) {
      throw new Error(`Unable to load headless Chrome -- try running with the --disable-headless flag\n${err.message}`);
    }
    console.log("Loaded page in headless browser...");
    // give the script time to run
    await wait(1000);
    var success = false;
    var graphicSelector = config.fallbackElement ? config.fallbackElement : ".graphic";
    try {
      var clip = await page.evaluate(selector => {
        var graphic = document.querySelector(selector);
        if (!graphic) return null;
        var { x, y, width, height } = graphic.getBoundingClientRect();
        return { x, y, width, height };
      }, graphicSelector);
      if (!clip) {
        throw new Error(`Fallback element not found: ${graphicSelector}`);
      }
      console.log("Taking screenshot...");
      await page.screenshot({
        path: destination,
        clip
      });
      console.log(`Captured to ${destination}`);
      success = true;
    } catch (err) {
      console.log(`Unable to capture screenshot: "${err.message}"`);
    }
    await puppet.close();
    if (!success) throw new Error("Image capture failed.");
  };

  return {
    snapGraphic
  };
};
