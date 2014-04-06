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
                        return [lrSnippet, mountFolder(connect, options.base[0])];
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
            all: ['bin', 'dist', '.tmp']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
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
            css: ['dist/css/tictactoe.css', 'dist/css/tictactoe.min.css'],
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
            options: {
                closureLibraryPath: 'limejs/closure',
                root_with_prefix: [
                    '"src/js/ ../../../../src/js"',
                    '"limejs/lime/ ../../../lime/"',
                    '"limejs/closure/ ../../"',
                    '"limejs/box2d/ ../../../box2d/"'
                ]
            },
            all: {
                dest: 'limejs/closure/closure/goog/deps.js'
            }
        },
        closureBuilder: {
            options: {
                closureLibraryPath: 'limejs/closure',
                inputs: 'src/js/tictactoe.js'
            },
            dev: {
                src: ['limejs/closure', 'limejs/lime', 'limejs/box2d', 'src/js'],
                dest: 'dist/js/tictactoe.js'
            },
            dist: {
                src: ['limejs/closure', 'limejs/lime', 'limejs/box2d', 'src/js'],
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
                src: ['src/js/gameRules.js', '.tmp/js/tictactoe.js'],
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
                    archive: 'bin/tictactoe-<%= pkg.version %>.zip'
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
                        'js/gameRules.js'
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
                        'css/fonts/**',
                        'bower_components/**'
                    ]
                }]
            }
        }
    });

    // closureBuilder fails if the destination folder does not exist
    grunt.registerTask('makeJsOutputDir', function (target) {
        if (target === 'dist') {
            grunt.file.mkdir('.tmp/js');
        }
        grunt.file.mkdir('dist/js');
    });

    grunt.registerTask('update', [
        'closureDepsWriter'
    ]);

    grunt.registerTask('serve', [
        'clean',
        'jshint',
        'copy:dev',
        'makeJsOutputDir:dev',
        'closureDepsWriter',
        'closureBuilder:dev',
        'livereload-start',
        'connect',
        'open',
        'regarde'
    ]);

    grunt.registerTask('build', [
        'clean',
        'jshint',
        //'csslint', //TODO
        'useminPrepare',
        'imagemin',
        'cssmin',
        'htmlmin',
        'copy:dist',
        'usemin',
        'makeJsOutputDir:dist',
        'closureDepsWriter',
        'closureBuilder:dist',
        'closureCompiler',
        'karma:unit'
    ]);

    grunt.registerTask('test', [
        'makeJsOutputDir',
        'closureDepsWriter',
        'closureBuilder',
        'karma:coverage'
    ]);

    grunt.registerTask('default', ['build']);
};
