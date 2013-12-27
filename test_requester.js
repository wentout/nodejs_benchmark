
var http = require('http');

http.maxSockets = 4096*4096;
http.globalAgent.maxSockets = 4096*4096;

var req = require ('request');

var options = {

	// my node.js
	url: 'http://localhost:8000/',
	// my nginx
	// url: 'http://localhost/',
	method: 'GET',
	encoding: 'utf8',

	headers: {
		"Pragma": "no-cache",
		"Cache-Control": "no-cache",
		"Connection": "keep-alive"
	}

};

var len = 10000;

var count = 0;
var scount = 0;
var runlevel = 0;
var lastrunlevel = 0;
var mscount = 0;

var last_response = '';

var task = function (worker) {
	count++;
	
	worker.req = req (options, function (e, res, body) {
		count--;
		scount++;
		if (body) {
			worker.run++;
			if (runlevel < worker.run) {
				runlevel = worker.run;
				
				mscount = ( (new Date()).getTime() - lastrunlevel ) / 1000;

				lastrunlevel = (new Date()).getTime();

			}
			last_response = worker.name + ' : ' + body.slice (0, 50);
			// console.log ('worker [' + worker.name + '] ' + worker.run);
			setTimeout ( function () {
				scount--;
				worker.task (worker);
			}, 300);
		}
		worker.req = null;
	});
};


var workers = [];
for (var i = 0; i < len; i++) {

	workers.push ( {
		name: ['w_' + i],
		task: task,
		run: -1
	} );

}


var run = function () {
	for (var i = len - 1; i >= 0; i--){
		(function (num) {
			var el = workers[num];
			setTimeout (function () {
				el.task (el);
			}, 1000);
		}(i));
	}
	setInterval (function () {
		if (count > 0) {
			var n = mscount ? parseInt (len/mscount, 10) : 0;
			console.log ('Requests count: ' + count + ' | ' + scount + ' | ' + runlevel + ' | ' + mscount + ' | ' + n);
			console.log ( last_response );
		} else {
			run ();
		}
	}, 3000);
}

console.log (workers.length);

// console interrupt
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('data', function (key) {

	if (key == '\u0003') {
		for (var i = 0; i < len; i++) {
			var el = workers[i];
			if (el && el.req){
				if (el.req.abort) {
					el.req.abort();
				}
			}
		}
		console.log ('Have a nice day!')
		setTimeout (function () {
			process.exit(1);
		}, 1000);
		setTimeout (function () {
			process.exit(0);
		}, 3000);

	} else {
		if ( (count == 0) && (count < len) ) {
			run ();
			lastrunlevel = (new Date()).getTime();
		}
	}

});


var pid = process.pid;
console.log ('Process PID is: ' + pid);

var exec = require('child_process').exec;
setTimeout (function () {
	exec('taskset -pc 1 ' + pid //);
		, function (error, stdout, stderr){
		console.log('taskset stdout: \n' + stdout);
		// log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}, 1000);
