# Phune Gaming Tic-Tac-Toe

A HTML5 implementation of the game Tic-Tac-Toe for [Phune Gaming](http://www.phune.com/).

## Install

This game makes heavy use of [LimeJS](http://www.limejs.com/) HTML5 Game Framework and [Grunt](http://gruntjs.com/) JavaScript Task Runner. To build it you need to have [Git](http://git-scm.com/), [SVN](http://subversion.apache.org/), [Java](https://www.java.com/), [Python 2.x](http://www.python.org/), [Node.js](http://nodejs.org/) and [Bower](http://bower.io) installed.

### Install LimeJS and its dependencies

In the root folder of Tic-Tac-Toe create a directory `limejs`:

```
mkdir limejs
```

Clone [LimeJS Git repo](https://github.com/digitalfruit/limejs) into the `limejs` directory you just created:

```
git clone https://github.com/digitalfruit/limejs.git limejs
```

Setup LimeJS dependencies:

```
limejs/bin/lime.py init
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

Build Tic-Tac-Toe (production-ready version):

```
grunt build
```

**Note:** If the error `depstree.MultipleProvideError: Namespace "DemoHost" provided more than once in sources` appears during the build, remove the folder `limejs/box2d/examples` and try again.

There are many other tasks that can be run through Grunt. For the complete list of available tasks run:

```
grunt --help
```

## License

Copyright (c) 2014 Present Technologies

Licensed under the MIT license.
