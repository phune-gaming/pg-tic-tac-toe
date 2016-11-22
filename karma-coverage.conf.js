// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = '';

// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  '.tmp/js/tictactoe-test.js',
  'src/js/**/*.js',
  'test/spec/**/*.js'
];

// list of files to exclude
exclude = ['**/tictactoe-deps.js'];

// test results reporter to use
reporters = ['coverage'];

preprocessors = {
  'src/js/tictactoe.js': 'coverage',
  'src/js/gameview.js': 'coverage',
  'src/js/gamecontroller.js': 'coverage',
  'src/js/gamerules.js': 'coverage'
};

coverageReporter = {
  type: 'html',
  dir: 'coverage'
};

// web server port
port = 8080;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
