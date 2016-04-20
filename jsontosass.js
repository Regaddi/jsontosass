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

    this.mergeOptions(options);

    parsedJSON = JSON.parse(json);

    return this.convertObject(parsedJSON);
  };
  /**
   * Converts a given JSON file represented by filename fileIn to a Sass file represented by fileOut.
   * @param {String} fileIn The filename to the input JSON file.
   * @param {String} fileOut The filename to the output Sass file.
   */
  this.convertFile = function (fileIn, fileOut, options) {
    var fs = require('fs');
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

  this.createIndent = function (levelAdjustment) {
    var indent = '';

    levelAdjustment = levelAdjustment || 0;

    for (var l = 0; l < this.nestLevel + levelAdjustment; l++) {
      if (typeof this.options.indent === 'number' && this.options.indent >= 0) {
        indent = repeat(' ', this.options.indent);
      }
      if (this.options.indent === 'tabs') {
        indent += '\t';
      }
    }
    return indent;
  };

  this.createColon = function () {
    var spaceBeforeColon = '';
    var spaceAfterColon = '';

    if (this.shouldPrettify()) {
      spaceBeforeColon = repeat(' ', this.options.spaceBeforeColon);
      spaceAfterColon = repeat(' ', this.options.spaceAfterColon);
    }
    return spaceBeforeColon + ':' + spaceAfterColon;
  };

  this.createLineSplit = function () {
    var join;

    if (this.nestLevel > 0) {
      join = ',';

      if (this.shouldPrettifyMap()) {
        join += '\n' + this.createIndent();
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

  this.createObjectAfter = function (map) {
    if (this.nestLevel > 0) {
      var after = '';

      if (this.shouldPrettifyMap()) {
        after += '\n' + this.createIndent(-1);
      }
      if (this.options.useMaps || map.length > 1) {
        after += ')';
      }
      return after;
    } else {
      if (this.options.syntax === 'scss') {
        return ';';
      } else {
        return '';
      }
    }
  };

  this.createObjectBefore = function (map) {
    if (this.nestLevel > 0) {
      var before = '';
      if (this.options.useMaps || map.length > 1) {
        before += '(';
      }
      if (this.shouldPrettifyMap()) {
        before += '\n' + this.createIndent();
      }
      return before;
    } else {
      return '$';
    }
  };

  this.objectToString = function (map) {
    return this.createObjectBefore(map) + map.join(this.createLineSplit()) + this.createObjectAfter(map);
  };

  this.mergeOptions = function (options) {
    options = options || {};

    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        var value = this.validateOption(key, options[key]);
        this.options[key] = value;
      }
    }
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
