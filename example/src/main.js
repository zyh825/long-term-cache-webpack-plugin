require('./assets/style/style1.css');
require('./assets/style/style2.css');
require('file-loader?name=vendor/test.js!./lib/test.js');
require('./app/index');