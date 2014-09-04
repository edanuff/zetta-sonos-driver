var zetta = require('zetta');
var SonosDriver = require('../');
var app = require('./app');

zetta()
  .name('local')
  .use(SonosDriver)
  .load(app)
  .listen(31337);
