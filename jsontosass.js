var extend = require('extend');
var fs = require('fs');
var repeat = require('repeat-string');
var { paramCase } = require('param-case');

var JsonToSass = function () {
  var nestLevel = 0;

  var defaultOptions = {
    indent: 4, // or 'tabs'
    prettify: true,
    spaceAfterColon: 1,
    spaceBeforeColon: 0,
    syntax: 'scss',
    useMaps: true
  };

  this.options = {};

  /**
   * Converts a given String json to Sass variables.
   * @param {String} json The JSON string.
   * @param {Object} options
   * @param {String} options.indent
   */
  this.convert = function (json, options) {
    var parsedJSON;

    mergeOptions(defaultOptions);
    mergeOptions(options);

    parsedJSON = JSON.parse(json);

    return convertObject(parsedJSON);
  };
  /**
   * Converts a given JSON file represented by filename fileIn to a Sass file represented by fileOut.
   * @param {String} fileIn The filename to the input JSON file.
   * @param {String} fileOut The filename to the output Sass file.
   */
  this.convertFile = function (fileIn, fileOut, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    var json = fs.readFileSync(fileIn);
    var sass = this.convert(json, options);
    fs.writeFile(fileOut, sass, cb);
  };
  /**
   * Converts a given JSON file represented by filename fileIn to a Sass file represented by fileOut.
   * @param {String} fileIn The filename to the input JSON file.
   * @param {String} fileOut The filename to the output Sass file.
   */
  this.convertFileSync = function (fileIn, fileOut, options) {
    var json = fs.readFileSync(fileIn);
    var sass = this.convert(json, options);
    fs.writeFileSync(fileOut, sass);
  };
  /**
   * Converts a given JSON object represented by obj to a Sass map.
   * @param {Object} obj The JSON object.
   * @return {String} The Sass map as a string.
   */
  function convertObject (obj) {
    var map = [];

    for (var key in obj) {
      const sassKey = /^[a-zA-Z0-9]+$/.test(key) ? paramCase(key) : key;
      switch (typeof obj[key]) {
        case 'object':
          nestLevel++;
          if (this.options.useMaps || obj[key].length) {
            map.push(sassKey + createColon() + convertObject(obj[key]));
          } else {
            map.push(sassKey + '-' + convertObject(obj[key]));
          }
          nestLevel--;
          break;
        default:
          if (key.match(/^[0-9]+$/)) {
            map.push(obj[key]);
          } else {
            map.push(sassKey + createColon() + obj[key]);
          }
          break;
      }
    }

    return objectToString(map);
  }

  /**
   * Generates the leading spaces/tabs to indent the code
   * @private
   * @param {int} Indentation amount
   * @return {String} The spaces
   */
  function createIndent (indentation) {
    return this.options.indent === 'tabs'
      ? repeat('\t', indentation)
      : repeat(' ', indentation * this.options.indent);
  }

  function createColon () {
    if (!shouldPrettify()) {
      return ':';
    }
    return repeat(' ', this.options.spaceBeforeColon) +
      ':' + repeat(' ', this.options.spaceAfterColon);
  }

  function createLineSplit () {
    var join;

    if (nestLevel > 0) {
      join = ',';

      if (shouldPrettifyMap()) {
        join += '\n' + createIndent(nestLevel);
      }
    } else {
      join = ';';
      if (shouldPrettify()) {
        join += '\n';
      }
      join += '$';
    }
    return join;
  }

  function createStatementTerminator () {
    return this.options.syntax === 'scss' ? ';' : '';
  }

  function createObjectAfter (map) {
    if (nestLevel === 0) {
      return createStatementTerminator();
    }
    var after = '';
    if (shouldPrettifyMap()) {
      after += '\n' + createIndent(nestLevel - 1);
    }
    if (this.options.useMaps || map.length > 1) {
      after += ')';
    }
    return after;
  }

  function createObjectBefore (map) {
    if (nestLevel === 0) {
      return '$';
    }
    var before = '';
    if (this.options.useMaps || map.length > 1) {
      before += '(';
    }
    if (shouldPrettifyMap()) {
      before += '\n' + createIndent(nestLevel);
    }
    return before;
  }

  function objectToString (map) {
    return createObjectBefore(map) + map.join(createLineSplit()) + createObjectAfter(map);
  }

  function mergeOptions (options) {
    options = options || {};

    Object.keys(options).forEach(function (key) {
      validateOption(key, options[key]);
    });

    this.options = extend({}, defaultOptions, options);
  }

  function shouldPrettify () {
    return (this.options.prettify || this.options.syntax === 'sass');
  }

  function shouldPrettifyMap () {
    return (this.options.prettify && this.options.useMaps) || this.options.syntax === 'sass';
  }

  function validateOption (key, value) {
    switch (key) {
      case 'syntax':
        if (['sass', 'scss'].indexOf(value.toLowerCase()) === -1) {
          throw new Error('invalid value `' + value + '` for option syntax');
        }
        return value.toLowerCase();
      default:
        return value;
    }
  }

  mergeOptions(defaultOptions);
};

module.exports = new JsonToSass();
