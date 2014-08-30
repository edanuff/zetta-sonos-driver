var Device = require('zetta').Device;
var util = require('util');

var SonosDriver = module.exports = function(sonos) {
  Device.call(this);
  this._sonos = sonos;
  this.track = 'unk';
};
util.inherits(SonosDriver, Device);

SonosDriver.prototype.init = function(config) {
  var self = this;
  config
    .state('online')
    .type('sonos')
    .name(this._sonos.host)
    .when('playing', { allow: ['stop', 'skip'] })
    .when('stopped', { allow: 'play' })
    .map('skip', this.skip)
    .map('play', this.play)
    .map('stop', this.stop)
    .monitor('track');
    
  //poll the track every 3 seconds
  setInterval(function() {
    self._sonos.currentTrack(function(err, track) {
      if(err) {
        return;
      } else {
        if(track) {
          self.state = 'playing';
          self.track = track.title;
        }
      }
    });

  }, 3000);
};

SonosDriver.prototype.play = function(cb) {
  var self = this;
  this._sonos.play(function(e, playing) {
    if(e) {
      console.log(e);
      if(cb) {
        cb(e);
      }
    } else {
      self.state = 'playing';
      self.track = playing.title;
    }
  });
};

SonosDriver.prototype.skip = function(cb) {
  var self = this;
  this._sonos.next(function(e, playing) {
    if(e) {
      console.log(e);
      if(cb) {
        cb(e);
      }
    } else {
      self.state = 'playing';
      self.track = playing.title;
    }
  });
};

SonosDriver.prototype.stop = function(cb) {
  var self = this;
  this._sonos.stop(function(e, stopped) {
    if(e) {
      console.log(e);
      if(cb) {
        cb(e);
      }
    } else {
      self.state = 'stopped';
      self.track = '';
    }
  });
};
