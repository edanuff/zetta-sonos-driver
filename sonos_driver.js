var Device = require('zetta').Device;
var util = require('util');
var setTrack = function(self) {
  self._sonos.currentTrack(function(err, track) {
    if(err) {
      return;
    } else {
      if(track) {
        self.state = 'playing';
        self.track = track.title;
        self.artist = track.artist;
      }
    }
  });
};

var currentState = function(self) {
  self._sonos.getCurrentState(function(err, state) {
    self.state = state;
  });
};

var SonosDriver = module.exports = function(sonos) {
  Device.call(this);
  this._sonos = sonos;
  this.track = 'unk';
  this.artist = 'unk';
};
util.inherits(SonosDriver, Device);

SonosDriver.prototype.init = function(config) {
  var self = this;
  config
    .state('online')
    .type('sonos')
    .name(this._sonos.host)
    .when('playing', { allow: ['stop', 'skip', 'play-uri'] })
    .when('stopped', { allow: 'play' })
    .when('paused', { allow: 'play'})
    .map('skip', this.skip)
    .map('play', this.play)
    .map('stop', this.stop)
    .map('play-uri', this.playUri, [{ name:'endpoint', type:'url' }])
    .monitor('artist')
    .monitor('track');
    
  //poll the track every 3 seconds
  setInterval(setTrack, 1000, self);
//  setInterval(currentState, 1000, self);
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
      setTrack(self);
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
      setTrack(self);
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
      self.artist = '';
    }
  });
};

SonosDriver.prototype.playUri = function(url, cb) {
  var self = this;
  this._sonos.play(url, function(err, playing) {
    if(e) {
      console.log(e);
      if(cb) {
        cb(e);
      }
    } else {
      setTrack(self);
    }
  });
};
