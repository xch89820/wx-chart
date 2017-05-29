// Karma configuration
// Generated on Sun Jan 15 2017 17:58:26 GMT+0800 (中国标准时间)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify','mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
        {pattern: 'test/**/*.css', included: false},
        'src/**',
        'test/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
        'src/react/**',
        'src/wx-chart.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors: {
          'src/**': ['browserify'],
          'test/*Spec.js': ['browserify']
      },

      browserify: {
          debug: true,
          transform: [
              ['babelify'],
              ['browserify-replace', {
                  replace: [
                      { from: /__GLOBAL__DEBUG__WX__/, to: true }
                  ]
              }]
          ]
      },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    //reporters: ['progress'],
      reporters: [ 'mocha' ],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
