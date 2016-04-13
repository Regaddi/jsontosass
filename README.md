[![Build Status](https://travis-ci.org/Regaddi/jsontosass.svg?branch=master)](https://travis-ci.org/Regaddi/jsontosass)
[![Coverage Status](https://coveralls.io/repos/github/Regaddi/jsontosass/badge.svg?branch=master)](https://coveralls.io/github/Regaddi/jsontosass?branch=master)

# jsontosass

Oh, no! Not another JSON to Sass converter! Why did you do that?

Simple answer: there was no JSON to Sass converter out there (up to this point)
that was flexible enough to suite my needs to e.g. satisfy my
[scss-lint](https://github.com/brigade/scss-lint) configuration.

This one here aims to be as flexible as possible regarding

- generation of your Sass variables
- indentation for maps
- minification
- Syntax output (Sass and SCSS)

Additionally I want this module to be well tested, that's why I'm focussing on
[TDD](https://en.wikipedia.org/wiki/Test-driven_development) here.

What you will get with this package is a well maintained, documented and tested
JSON to Sass converter that will definitely be the last one you'll ever need!

# Installation

You can easily install this package with [npm](https://www.npmjs.com):

    npm install jsontosass

After that you can access `jsontosass` easily by using `require`

    var jsontosass = require('jsontosass');
