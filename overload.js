
var pid = process.pid;
console.log ('Process PID is: ' + pid);


'use strict';
var alpabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var rand_str = function (len) {
	!len && (len = 8);
	var str = '';
	for (var i = 0; i < len; i++) {
		str += alpabet[(Math.floor(Math.random() * 62))];
	}
	return str;
};


var s = rand_str(1000);

var zs = [];
var zx = {};
var genZ = function() {
	alpabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	var name = rand_str(50);
	zs.push(name)
	// eval ( 'var ' + name + ' = {};' );
	// zx[name] = eval ( 'name' );
	zx[name] = {};
	alpabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	return zx[name];
};
var z = genZ();

var delay = 1;
var prevLen = 0;
var count = 0;

// var multipla = 1000;
var multipla = 1000000;
var calc = function () {
	var usage = process.memoryUsage();
	if ( count < multipla ){
		for (var i = 0; i < 10000; i++) {
			count++;
			z[rand_str(20)] = '' + s;
		}
		if ( count - prevLen > 99999 ) {
			prevLen = count;
			console.log ('tick : ' + count, '  Iteration : ', zs.length, '  Mem: ', Math.ceil( usage.rss/1024/1024 ));
		}
		setTimeout (calc, delay);
	} else {
		console.log ('Done zs: ', zs.length, 'starting new');
		// console.log(zx[zs[0]]);
		z = genZ();
		count = 0;
		prevLen = 0;
		calc();
		// process.exit(0);
	}
};

setTimeout (calc, 2000);


var http = require('http');
var service = function (req, res) {
	res.end('ok');
};
var server = http.createServer( service );
server.listen( 3000 );

/*
var child_process = require('child_process');
var exec = child_process.exec;
setTimeout (function () {
	exec('taskset -pc 1 ' + pid //);
		, function (error, stdout, stderr){
		console.log('taskset stdout: \n' + stdout);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
		exec = null;
		child_process = null;
		delete process.exec;
		delete process.child_process;
		setTimeout (calc, 2000);
	});
}, 5000);


// console interrupt
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('data', function (key) {

	if (key == '\u0003') {
		console.log ('Have a nice day!')
		process.exit(1);
	} else {
		console.log ('Hi!');
	}

});
*/
