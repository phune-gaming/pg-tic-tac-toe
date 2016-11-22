# Phune Gaming Tic Tac Toe

A HTML5 implementation of the game Tic Tac Toe for [Phune Gaming](http://www.phune.com/).

## Install

This game makes heavy use of [LimeJS](http://www.limejs.com/) HTML5 Game Framework and [Grunt](http://gruntjs.com/) JavaScript Task Runner. To build it you need to have [Git](http://git-scm.com/), [SVN](http://subversion.apache.org/), [Java](https://www.java.com/), [Python 2.x](http://www.python.org/), [Node.js](http://nodejs.org/), [Bower](http://bower.io) and [PhantomJS](http://phantomjs.org/) installed.

### Install LimeJS and its dependencies

In the root folder of Tic Tac Toe create a directory `limejs`:

```
mkdir limejs
```

Clone [LimeJS Git repo](https://github.com/phune-gaming/limejs) into the `limejs` directory you just created:

```
git clone https://github.com/phune-gaming/limejs.git limejs
```

Setup LimeJS dependencies:

```
cd limejs/bin
./lime.py init
cd ..
cd ..
```

### Install Node.js dependencies

Setup Node.js modules:

```
npm install
```

### Install Bower dependencies

Setup Bower packages:

```
bower install
```

## Build

This game should be run using the Phune Gaming platform, but can be quickly tested using the command (only the initial screen will be shown, it is not possible to play without the Phune Gaming platform):

```
grunt serve
```

**Note:** If you got an error during the build, try to remove the folder `limejs/box2d/examples` and try again.

Build (production-ready version):

```
grunt build
```

**Note:** If you get the following error during build: `limejs/closure/closure/goog/base.js:236: ERROR - illegal initialization of @define variable goog.DISALLOW_TEST_ONLY_CODE`, remove or comment that line.

**Note:** [PhantomJS does not support the `bind` method](https://groups.google.com/forum/#!msg/phantomjs/r0hPOmnCUpc/uxusqsl2LNoJ). If you get the following error during the tests: `TypeError: 'undefined' is not a function (evaluating 'throwDeprecated.bind(null,"getRelativeQuality")')`, remove or comment the last lines of `limejs/lime/src/node.js` where the bind method is used.

There are many other tasks that can be run through Grunt. For the complete list of available tasks run:

```
grunt --help
```

## License

Copyright (c) 2014 Present Technologies

Licensed under the MIT license.
