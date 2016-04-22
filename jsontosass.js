var extend = require('extend');
var fs = require('fs');
var repeat = require('repeat-string');

var JsonToSass = function () {
  this.nestLevel = 0;

  this.defaultOptions = {
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

    this.mergeOptions(this.defaultOptions);
    this.mergeOptions(options);

    parsedJSON = JSON.parse(json);

    return this.convertObject(parsedJSON);
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
  this.convertObject = function (obj) {
    var map = [];

    for (var key in obj) {
      switch (typeof obj[key]) {
        case 'object':
          this.nestLevel++;
          if (this.options.useMaps || obj[key].hasOwnProperty('length')) {
            map.push(key + this.createColon() + this.convertObject(obj[key]));
          } else {
            map.push(key + '-' + this.convertObject(obj[key]));
          }
          this.nestLevel--;
          break;
        default:
          if (key.match(/^[0-9]+$/)) {
            map.push(obj[key]);
          } else {
            map.push(key + this.createColon() + obj[key]);
          }
          break;
      }
    }

    return this.objectToString(map);
  };

  /**
   * Generates the leading spaces/tabs to indent the code
   * @private
   * @param {int} Indentation amount
   * @return {String} The spaces
   */
  this.createIndent = function (indentation) {
    return this.options.indent === 'tabs'
      ? repeat('\t', indentation)
      : repeat(' ', indentation * this.options.indent);
  };

  this.createColon = function () {
    if (!this.shouldPrettify()) {
      return ':';
    }
    return repeat(' ', this.options.spaceBeforeColon) +
      ':' + repeat(' ', this.options.spaceAfterColon);
  };

  this.createLineSplit = function () {
    var join;

    if (this.nestLevel > 0) {
      join = ',';

      if (this.shouldPrettifyMap()) {
        join += '\n' + this.createIndent(this.nestLevel);
      }
    } else {
      join = ';';
      if (this.shouldPrettify()) {
        join += '\n';
      }
      join += '$';
    }
    return join;
  };

  this.createStatementTerminator = function () {
    return this.options.syntax === 'scss' ? ';' : '';
  };

  this.createObjectAfter = function (map) {
    if (this.nestLevel === 0) {
      return this.createStatementTerminator();
    }
    var after = '';
    if (this.shouldPrettifyMap()) {
      after += '\n' + this.createIndent(this.nestLevel - 1);
    }
    if (this.options.useMaps || map.length > 1) {
      after += ')';
    }
    return after;
  };

  this.createObjectBefore = function (map) {
    if (this.nestLevel === 0) {
      return '$';
    }
    var before = '';
    if (this.options.useMaps || map.length > 1) {
      before += '(';
    }
    if (this.shouldPrettifyMap()) {
      before += '\n' + this.createIndent(this.nestLevel);
    }
    return before;
  };

  this.objectToString = function (map) {
    return this.createObjectBefore(map) + map.join(this.createLineSplit()) + this.createObjectAfter(map);
  };

  this.mergeOptions = function (options) {
    options = options || {};

    Object.keys(options).forEach(function (key) {
      this.validateOption(key, options[key]);
    }.bind(this));

    this.options = extend({}, this.defaultOptions, options);
  };

  this.shouldPrettify = function () {
    return (this.options.prettify || this.options.syntax === 'sass');
  };

  this.shouldPrettifyMap = function () {
    return (this.options.prettify && this.options.useMaps) || this.options.syntax === 'sass';
  };

  this.validateOption = function (key, value) {
    switch (key) {
      case 'syntax':
        if (['sass', 'scss'].indexOf(value.toLowerCase()) === -1) {
          throw new Error('invalid value `' + value + '` for option syntax');
        }
        return value.toLowerCase();
      default:
        return value;
    }
  };

  this.mergeOptions(this.defaultOptions);
};

module.exports = new JsonToSass();
