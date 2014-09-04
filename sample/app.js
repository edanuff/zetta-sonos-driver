module.exports = function(server) {
  var sonosQuery = server.where({ type: 'sonos' });

  server.observe(sonosQuery, function(sonos) {
    sonos.streams.track.on('data', function(message) {
      console.log('Current track:', message.data);
    });
  });
};
