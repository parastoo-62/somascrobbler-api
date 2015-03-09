var config = require('./config');
var assign = require('object-assign');
var bole = require('bole');
var log = bole('server');
var getStations = require('./get-stations');
var state = require('./state');

bole.output({
	level: config.logLevel,
	stream: process.stdout
});

getStations(setup); 

function setup (err, stations) {
	if (err) {
		log.error(err);
		process.exit(1);
	}

	var stats = require('./stats');
	var server = require('./http-server.js');
	var io = require('./socketio-api')(server.listener, { stations: stations });
	var tracks = require('./station-streams.js')({ stations: stations });

	tracks.on('track', function (stationId, track) {
		track = assign({}, { stationId: stationId }, track);
		log.debug('track', track);
		state.setNowPlaying(stationId, track);
		io.sendTrack(stationId, track);
		io.sendStats();
	});
}
