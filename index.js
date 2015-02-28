var sonos = require('sonos');
var Scout = require('zetta-scout');
var util = require('util');
var SonosDriver = require('./sonos_driver');

var SonosScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(SonosScout, Scout);

SonosScout.prototype.init = function(next) {
  var self = this;
  sonos.search(function(device) {
    self.discover(SonosDriver, device);
  });
  next();
};
