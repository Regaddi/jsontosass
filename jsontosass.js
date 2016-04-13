(function() {
    'use strict';

    var jsontosass = function() {
        this.nestLevel = 0;

        this.defaultOptions = {
            indent: 4, // or 'tabs'
            singleLine: false,
            useMaps: true
        };

        this.options = {};

        /**
         * Converts a given String json to Sass variables.
         * @param {String} json The JSON string.
         * @param {Object} options
         * @param {String} options.indent
         */
        this.convert = function(json, options) {
            var parsedJSON;

            this.mergeOptions(options);

            try {
                parsedJSON = JSON.parse(json);
            } catch(error) {
                throw new Error('invalid json');
            }
            return this.convertObject(parsedJSON);
        };
        /**
         * Converts a given JSON file represented by filename fileIn to a Sass file represented by fileOut.
         * @param {String} fileIn The filename to the input JSON file.
         * @param {String} fileOut The filename to the output Sass file.
         */
        this.convertFile = function(fileIn, fileOut, options) {
            var fs = require('fs'),
                json = fs.readFileSync(fileIn),
                sass = this.convert(json, options);

            fs.writeFileSync(fileOut, sass);
        };
        /**
         * Converts a given JSON object represented by obj to a Sass map.
         * @param {Object} obj The JSON object.
         * @return {String} The Sass map as a string.
         */
        this.convertObject = function(obj) {
            var map = [];

            for(var key in obj) {
                switch(typeof obj[key]) {
                    case 'object':
                        this.nestLevel++;
                        if(this.options.useMaps || obj[key].hasOwnProperty('length')) {
                            map.push(key + ':' + this.convertObject(obj[key]));
                        } else {
                            map.push(key + '-' + this.convertObject(obj[key]));
                        }
                        this.nestLevel--;
                        break;
                    default:
                        if(parseInt(key) == key) {
                            map.push(obj[key]);
                        } else {
                            map.push(key + ':' + obj[key]);
                        }
                        break;
                }
            }

            return this.objectToString(map);
        };

        this.createIndent = function(levelAdjustment) {
            var indent = '';

            levelAdjustment = levelAdjustment || 0;

            for(var l = 0; l < this.nestLevel + levelAdjustment; l++) {
                if(typeof this.options.indent === 'number' && this.options.indent >= 0) {
                    for(var c = 0; c < this.options.indent; c++) {
                        indent += ' ';
                    }
                }
                if(this.options.indent === 'tabs') {
                    indent += '\t';
                }
            }
            return indent;
        };

        this.objectToString = function(map) {
            var join;

            if(this.nestLevel > 0) {
                var result = '';

                if(this.options.useMaps || map.length > 1) {
                    result += '(';
                }

                join = ',';

                if(this.options.singleLine && this.options.useMaps) {
                    result += '\n' + this.createIndent();
                    join += '\n' + this.createIndent();
                }
                result += map.join(join);
                if(this.options.singleLine && this.options.useMaps) {
                    result += '\n' + this.createIndent(-1);
                }
                if(this.options.useMaps || map.length > 1) {
                    result += ')';
                }

                return result;
            } else {
                join = ';';
                if(this.options.singleLine) {
                    join += '\n';
                }
                join += '$';
                return '$' + map.join(join) + ';';
            }
        };

        this.mergeOptions = function(options) {
            options = options || {};

            for(var key in options) {
                var value = options[key];
                this.options[key] = value;
            }
        };

        this.mergeOptions(this.defaultOptions);
    };

    var exp = new jsontosass();

    module.exports = exp;
})();
