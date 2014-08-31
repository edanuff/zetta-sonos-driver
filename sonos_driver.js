var Device = require('zetta').Device;
var util = require('util');
var setTrack = function(self, calledFromTransition) {
  self._sonos.currentTrack(function(err, track) {
    if(err) {
      return;
    } else {
      if((track && track.position > 0) || calledFromTransition) {
        self.state = 'playing';
        self.track = track.title;
        self.artist = track.artist;
      }
    }
  });
};

var setVolume = function(self) {
  self._sonos.getVolume(function(e, volume) {
    if(e) {
      return;
    } else {
      if(volume) {
        self.volume = volume;
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
  this._refreshInterval = null;
  this.track = '';
  this.artist = '';
  this.volume = 0;
};
util.inherits(SonosDriver, Device);

SonosDriver.prototype.init = function(config) {
  var self = this;
  config
    .state('stopped')
    .type('sonos')
    .name(this._sonos.host)
    .when('playing', { allow: ['stop', 'skip', 'play-uri', 'play', 'volume-up', 'volume-down'] })
    .when('stopped', { allow: 'play' })
    .when('paused', { allow: 'play'})
    .map('skip', this.skip)
    .map('play', this.play)
    .map('stop', this.stop)
    .map('volume-up', this.volumeUp)
    .map('volume-down', this.volumeDown)
    .map('play-uri', this.playUri, [{ name:'endpoint', type:'url' }])
    .monitor('artist')
    .monitor('volume')
    .monitor('track');
    
  //poll the track every 3 seconds
  self._refreshInterval = setInterval(setTrack, 1000, self, false);
  //setTimeout(setTrack, 1000, self, false);
  setTimeout(setVolume, 1000, self);
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
      setTrack(self, true);
      if(cb) {
        cb();
      }
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
      setTrack(self, true);
      if(cb) {
        cb();
      }
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
      if(self._refreshInterval) {
        clearInterval(self._refreshInterval);
      }
      if(cb) {
        cb();
      }
    }
  });
};

SonosDriver.prototype.playUri = function(url, cb) {
  var self = this;
  this._sonos.play(url, function(err, playing) {
    if(err) {
      console.log(err);
      if(cb) {
        cb(err);
      }
    } else {
      setTrack(self, true);
      if(cb) {
        cb();
      }
    }
  });
};

SonosDriver.prototype.volumeUp = function(cb) {
  var self = this;
  var newVolume = this.volume + 1;
  if(newVolume > 100) {
    newVolume = 100;
  } else if(newVolume < 0) {
    newVolume = 0;
  }
  this._sonos.setVolume(newVolume.toString(), function(e, data) {
    if(e) {
      if(cb) {
        cb(e);
      }
    } else {
      setVolume(self);
      if(cb) {
        cb();
      }
    }
  });
};

SonosDriver.prototype.volumeDown = function(cb) {
  var self = this;
  var newVolume = this.volume - 1;
  if(newVolume > 100) {
    newVolume = 100;
  } else if(newVolume < 0) {
    newVolume = 0;
  }
  this._sonos.setVolume(newVolume.toString(), function(e, data) {
    if(e) {
      if(cb) {
        cb(e);
      }
    } else {
      setVolume(self);
      if(cb) {
        cb();
      }
    }
  });
};
