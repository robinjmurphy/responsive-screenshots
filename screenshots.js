#! /usr/bin/env phantomjs

var args = require('system').args,
    fs = require('fs'),
    page = require('webpage').create(),
    DEFAULT_CONFIG_FILE = 'config.json',
    DEFAULT_TIMEOUT = 1000,
    DEFAULT_HEIGHT = 1000,
    DEFAULT_COOKIES = [];

/**
 * Copy shared config options to all sets.
 */

function addSharedConfigToSets(config) {
  var all = config.all,
      sets = config.sets;

  if (all) { 
    sets.forEach(function (set) {
      for (var property in all) {
        // only copy a property over if it doesn't exist
        if (set[property] === undefined) {
          set[property] = all[property];
        }
      }
    }); 
  }

  return config;
} 

/**
 * Load a JSON config file.
 */

function loadConfig(cb) {
  var configFilename = DEFAULT_CONFIG_FILE,
      file,
      config;

  if (args.length === 2) {
    configFilename = args[1];
  }

  if (fs.exists(configFilename)) {
    config = JSON.parse(fs.read(configFilename));
    addSharedConfigToSets(config);
    cb(null, config);
  } else {
    cb(new Error('Could not load config file: ' + configFilename));
  }
}

/**
 * Take a single screnshot of a set at a given width.
 */

function takeScreenshot(set, width, cb) {
  var height = set.height || DEFAULT_HEIGHT;

  page.viewportSize = {width: width, height: height};
  console.log('Opening page: ', set.url);
  page.open(set.url, function (status) {
    if (status !== 'success') {
      cb(new Error('Failed to load page: ' + set.url));
    }

    setTimeout(function () {
      console.log('Taking screenshot at width: ', width + 'px');
      page.render('images/' + set.id + '/' + width + '.png');
      cb();
    }, set.timeout || DEFAULT_TIMEOUT);
  });
}

/**
 * Take the screenshots at all widths for a given set.
 */

function takeScreenshots(set, widths, cb) {
  var width = widths.pop();

  takeScreenshot(set, width, function (err) {
    if (err) {
      cb(err);
    } else if (widths.length > 0) {
      takeScreenshots(set, widths, cb);
    } else {
      cb();
    }
  });
}

/**
 * Processes all of the sets in the config file.
 */

function processSets(config, cb) {
  var set = config.sets.pop(),
      cookies = set.cookies || DEFAULT_COOKIES,
      widths;

  // create a clone so we don't `pop` from the original config
  widths = set.widths.slice();

  cookies.forEach(function (cookie) {
    phantom.addCookie(cookie);
  });

  takeScreenshots(set, widths, function (err) {
    if (err) {
      cb(err);
    } else if (config.sets.length > 0) {
      processSets(config, cb);
    } else {
      cb();
    }
  });
}

/**
 * Callback for when processing completes or errors.
 */

function onSetsProcessed(err) {
  if (err) {
    console.error(err.message);
    phantom.exit(1);
  } else {
    phantom.exit();
  }
}

loadConfig(function (err, config) {
  if (err) {
    console.error(err.message);
    phantom.exit(1);
  } else {
    processSets(config, onSetsProcessed);
  }
});