var zetta = require('zetta');
var SonosDriver = require('../');

zetta()
  .name('local')
  .use(SonosDriver)
  .listen(31337);
