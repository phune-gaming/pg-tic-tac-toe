'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        // Task configuration.
        livereload: {
            port: 35729
        },
        connect: {
            livereload: {
                options: {
                    base: 'dist',
                    port: 9000,
                    hostname: 'localhost', // Change this to '0.0.0.0' to access the server from outside.
                    middleware: function(connect, options) {
                        return [lrSnippet, mountFolder(connect, options.base)];
                    }
                }
            }
        },
        regarde: {
            all: {
                files: '**',
                tasks: ['livereload']
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.livereload.options.port %>/index.html'
            }
        },
        clean: {
            all: ['bin', 'coverage', 'dist/*', '.tmp/*']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'src/js/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ]
        },
        csslint: {
            dist: {
                options: {
                    'bulletproof-font-face': false,
                    'ids': false,
                    'known-properties': false
                },
                src: 'src/css/{,*/}*.css'
            }
        },
        cssmin: {
            dist: {
                src: 'src/css/{,*/}*.css',
                dest: 'dist/css/tictactoe.min.css'
            }
        },
        htmlmin: {
            options: {
                collapseWhitespace: false, // https://github.com/yeoman/grunt-usemin/issues/44
                collapseBooleanAttributes: true,
                removeCommentsFromCDATA: true,
                removeOptionalTags: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['{,*/}*.html'],
                    dest: 'dist'
                }]
            }
        },
        useminPrepare: {
            html: 'src/index.html'
        },
        usemin: {
            html: ['dist/index.html'],
            css: ['dist/css/{,*/}*.css'],
            options: {
                dirs: ['dist']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/img',
                    src: ['*.png', '*.jpg'],
                    dest: 'dist/img'
                }],
                options: {
                    optimizationLevel: 3
                }
            }
        },
        closureDepsWriter: {
            test: {
                options: {
                    closureLibraryPath: 'limejs/closure',
                    root_with_prefix: [
                        '"test/spec/ ../../../../test/spec"',
                        '"limejs/lime/ ../../../lime/"',
                        '"limejs/box2d/ ../../../box2d/"',
                        '"limejs/closure/ ../../"'
                    ]
                },
                dest: 'limejs/closure/closure/goog/deps.js'
            },
            all: {
                options: {
                    closureLibraryPath: 'limejs/closure',
                    root_with_prefix: [
                        '"src/js/ ../../../../src/js"',
                        '"limejs/lime/ ../../../lime/"',
                        '"limejs/box2d/ ../../../box2d/"',
                        '"limejs/closure/ ../../"'
                    ]
                },
                dest: 'limejs/closure/closure/goog/deps.js'
            }
        },
        closureBuilder: {
            options: {
                closureLibraryPath: 'limejs/closure',
                inputs: 'src/js/tictactoe.js'
            },
            test: {
                options: {
                    closureLibraryPath: 'limejs/closure',
                    inputs: 'test/spec/tictactoe-deps.js'
                },
                src: ['limejs/closure', 'limejs/box2d', 'limejs/lime', 'test/spec'],
                dest: '.tmp/js/lime.js'
            },
            dev: {
                src: ['limejs/closure', 'limejs/box2d', 'limejs/lime', 'src/js'],
                dest: 'dist/js/tictactoe.js'
            },
            dist: {
                src: ['limejs/closure', 'limejs/box2d', 'limejs/lime', 'src/js'],
                dest: '.tmp/js/tictactoe.js'
            }
        },
        closureCompiler: {
            options: {
                compilerFile: 'limejs/bin/external/compiler-20130411.jar',
                compilerOpts: {
                    // compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    // externs: ['../../server/javascript/gamerules.externs.js']
                }
            },
            all: {
                src: ['src/js/gamerules.js', '.tmp/js/tictactoe.js'],
                dest: 'dist/js/tictactoe.min.js'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            },
            coverage: {
                configFile: 'karma-coverage.conf.js'
            }
        },
        compress: {
            zip: {
                options: {
                    archive: 'bin/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [{
                    expand: true,
                    src: ['src/**', 'test/**', 'docs/**', 'dist/**', '*']
                }]
            }
        },
        copy: {
            dev: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'src',
                    dest: 'dist',
                    src: [
                        '*',
                        'bower_components/**',
                        'css/**',
                        'img/**',
                        'js/gamerules.js'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'src',
                    dest: 'dist',
                    src: [
                        '*.ico',
                        'css/fonts/{,*/}*.{svg,woff,ttf}',
                        'bower_components/**'
                    ]
                }]
            }
        }
    });

    // closureBuilder fails if the destination folder does not exist
    grunt.registerTask('makeJsOutputDir', function (target) {
        if (target === 'dist' || target === 'test') {
            grunt.file.mkdir('.tmp/js');
        }
        grunt.file.mkdir('dist/js');
    });

    grunt.registerTask('update', [
        'closureDepsWriter:all'
    ]);

    grunt.registerTask('serve', [
        'clean',
        'jshint',
        //'csslint', //TODO
        'copy:dev',
        'makeJsOutputDir:dev',
        'closureDepsWriter:all',
        'closureBuilder:dev',
        'livereload-start',
        'connect',
        'open',
        'regarde'
    ]);

    grunt.registerTask('build', [
        'useminPrepare',
        'imagemin',
        'cssmin',
        'htmlmin',
        'copy:dist',
        'usemin',
        'makeJsOutputDir:dist',
        'closureDepsWriter:all',
        'closureBuilder:dist',
        'closureCompiler'
    ]);

    grunt.registerTask('test', [
        'makeJsOutputDir:test',
        'closureDepsWriter:test',
        'closureBuilder:test',
        'karma:unit'
    ]);

    grunt.registerTask('coverage', [
        'makeJsOutputDir:test',
        'closureDepsWriter:test',
        'closureBuilder:test',
        'karma:coverage'
    ]);

    grunt.registerTask('default', ['clean', 'jshint', /* 'csslint', */ 'test', 'build']);
};
