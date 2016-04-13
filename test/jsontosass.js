var assert = require('chai').assert;
var fs = require('fs');
var glob = require('glob');
var jsontosass;

describe('jsontosass', function() {
    beforeEach(function() {
        jsontosass = require('../jsontosass.js');
        jsontosass.mergeOptions(jsontosass.defaultOptions);
    });
    after(function() {
        // delete generated test sass files
        glob('test/*.scss', function(er, files) {
            files.forEach(function(file) {
                fs.unlink(file);
            });
        });
    });
    describe('module', function() {
        it('is present', function() {
            assert.isDefined(jsontosass, 'jsontosass is defined');
        });
        it('is an object', function() {
            assert.isObject(jsontosass, 'jsontosass is an object');
        });
    });
    describe('convertObject()', function() {
        it('is present', function() {
            assert.isFunction(jsontosass.convertObject);
        });
        it('creates Sass variable named $key on root level', function() {
            assert.equal(jsontosass.convertObject({
                key: 'value'
            }), '$key:value;');
        });
        it('creates Sass variables named by JSON key for multiple entries', function() {
            assert.equal(jsontosass.convertObject({
                key: 'value',
                key2: 'otherValue'
            }), '$key:value;$key2:otherValue;');
        });
        it('creates Sass map for nested object', function() {
            assert.equal(jsontosass.convertObject({
                key: {
                    key2: 'value'
                }
            }), '$key:(key2:value);');
        });
        it('creates Sass list for JSON array', function() {
            assert.equal(jsontosass.convertObject({
                key: [1,2,3]
            }), '$key:(1,2,3);');
        });
    });
    describe('convertFile()', function() {
        it('is present', function() {
            assert.isFunction(jsontosass.convertFile);
        });
        it('basic file conversion', function() {
            var sass;
            jsontosass.convertFile('test/basic.json', 'test/basic.scss');
            sass = fs.readFileSync('test/basic.scss');
            assert.equal(sass, '$key:value;');
        });
    });
    describe('convert()', function() {
        it('is present', function() {
            assert.isFunction(jsontosass.convert);
        });
        it('throws an error when invalid JSON is given', function() {
            assert.throws(function() {
                jsontosass.convert('');
            }, Error);
        });
        it('returns a string', function() {
            assert.typeOf(jsontosass.convert('{}'), 'string');
        });
        it('returns Sass variables in own line when singleLine option is given', function() {
            assert.equal(jsontosass.convert('{"key":"value","key2":"otherValue"}', {
                singleLine: true
            }), '$key:value;\n$key2:otherValue;');
        });
        it('return newLines for map variables', function() {
            assert.equal(jsontosass.convert('{"key":{"key2":"value"},"key2":"otherValue"}', {
                singleLine: true
            }), '$key:(\n    key2:value\n);\n$key2:otherValue;');
        });
        it('respect default indent', function() {
            assert.equal(jsontosass.convert('{"key":{"key2":"value"}}', {
                singleLine: true
            }), '$key:(\n    key2:value\n);');
        });
        it('respect indent with tabs', function() {
            assert.equal(jsontosass.convert('{"key":{"key2":"value"}}', {
                indent: 'tabs',
                singleLine: true
            }), '$key:(\n\tkey2:value\n);');
            assert.equal(jsontosass.convert('{"key":{"key2":{"key3":"value"}}}'), '$key:(\n\tkey2:(\n\t\tkey3:value\n\t)\n);');
        });
        it('generate dashed variables instead of maps', function() {
            assert.equal(jsontosass.convert('{"key":{"key2":"value"}}', {
                indent: 'tabs',
                singleLine: true,
                useMaps: false
            }), '$key-key2:value;');
            assert.equal(jsontosass.convert('{"key":{"key2":{"key3":"value"}}}'), '$key-key2-key3:value;');
            assert.equal(jsontosass.convert('{"key":{"key2":{"key3":[1,2,3]}}}'), '$key-key2-key3:(1,2,3);');
        });
    });
});
