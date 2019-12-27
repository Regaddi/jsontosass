[![npm version](https://badge.fury.io/js/jsontosass.svg)](https://badge.fury.io/js/jsontosass)
[![Build Status](https://travis-ci.org/Regaddi/jsontosass.svg?branch=master)](https://travis-ci.org/Regaddi/jsontosass)
[![Coverage Status](https://coveralls.io/repos/github/Regaddi/jsontosass/badge.svg?branch=master)](https://coveralls.io/github/Regaddi/jsontosass?branch=master)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)

# jsontosass

Oh, no! Not another JSON to Sass converter! Why did you do that?

Short answer: there was no JSON to Sass converter out there (up to this point)
that was flexible enough to suite my needs to e.g. satisfy my
[scss-lint](https://github.com/brigade/scss-lint) configuration.

This one here aims to be as flexible as possible regarding

- generation of Sass variables
- indentation for maps
- minification
- Syntax output (Sass and SCSS)

Additionally this module should be well tested, that's why 
[Test driven development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development) has focus.

This package aims to be a well maintained, documented and tested
JSON to Sass converter that will be the last one you'll ever need!

# Installation

Install this package with [npm](https://www.npmjs.com):

    npm install jsontosass

or

    yarn install jsontosass

If all went well you should be able to access `jsontosass` by using `require`

```javascript
var jsontosass = require("jsontosass");
```

# Usage

There are 3 main functions available.

## convert()

```javascript
jsontosass.convert(/* String */ jsonInput, /* Object */ options);
```

`convert()` returns the generated Sass code as a string.

## convertFile()

```javascript
jsontosass.convertFile(
  /* String */ jsonInputFilePath,
  /* String */ sassOutputFilePath,
  /* Objects */ options,
  /* Function */ callback
);
```

`convertFile()` does not return anything. It automatically creates the output file if it's nonexistent and writes the generated Sass code into it.
This happens asynchronously. The callback is called afterwards.

## convertFileSync()

```javascript
jsontosass.convertFileSync(
  /* String */ jsonInputFilePath,
  /* String */ sassOutputFilePath,
  /* Objects */ options
);
```

Same as `convertFile()` but synchronously and without callback parameter.

# Options

## `(Int/String)` indent

default: 4

If a number greater 0 is given, jsontosass will indent using the given number of spaces. Optionally set it to `'tabs'`. This will indent using `\t`. Indentation is only made, when `prettify` is set to `true`.

## `Boolean` prettify

default: true

If set to `true` jsontosass will pretty print the generated Sass code using the `indent` setting.

## `Int` spaceAfterColon

default: 1

Sets the amount of spaces after the colon `:`.

## `Int` spaceBeforeColon

default: 0

Sets the amount of spaces before the colon `:`.

## `String` syntax

default: `'scss'`

Sets the syntax output. Possible values: `'sass'` or `'scss'`

## `Boolean` useMaps

default: true

If set to `true` jsontosass generates [Sass maps](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#maps) for inner objects.
If set to `false` jsontosass generates dashed variables.

# Example

```json
{
  "key": {
    "inner-key": [1, 2, 3],
    "some-object": {
      "color-black": "#000",
      "font-family": "'Helvetica, sans-serif'"
    }
  }
}
```

```javascript
jsontosass.convert(json, {
  indent: 2
});
```

```scss
$key: (
  inner-key: (
    1,
    2,
    3
  ),
  some-object: (
    color-black: #000,
    font-family: "Helvetica, sans-serif"
  )
);
```

# Contribution

Feel free to contribute to this project by submitting [issues](https://github.com/Regaddi/jsontosass/issues) and/or [pull requests](https://github.com/Regaddi/jsontosass/pulls). This project is test-driven, so keep in mind that every change and new feature should be covered by tests.
This project uses the [semistandard code style](https://github.com/Flet/semistandard).

# License

This project is licensed under [MIT](https://github.com/Regaddi/jsontosass/blob/master/LICENSE).
