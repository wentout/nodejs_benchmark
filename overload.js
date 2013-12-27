
var pid = process.pid;
console.log ('Process PID is: ' + pid);

var z = [];
var s = '';
var n = 0;
var delay = 1;
var multipla = 1000000000;
var calc = function () {
	if (n < multipla){
		for (var i = 0; i < 1000000; i++) {
			n++;
			s += n;
		}
		// console.log ('tick : ' + n);
		setTimeout (calc, delay);
	} else {
		console.log ('Done!');
		process.exit(1);
	}
};


var fs = require('fs');
var child_process = require('child_process');
var exec = child_process.exec;
setTimeout (function () {
	exec('taskset -pc 1 ' + pid //);
		, function (error, stdout, stderr){
		console.log('taskset stdout: \n' + stdout);
		// console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
		exec = null;
		child_process = null;
		delete process.exec;
		delete process.child_process;
		// console.log ('imher : ' + child_process);
		setTimeout (calc, 2000);
	});
}, 5000);

// for (; n < multipla; n++) {
// 	if (n < multipla){
// 		// z.push ( n );
// 		s += n;
// 	} else {
// 		// z.join ( n, ' ' );
// 		setTimeout (function (){
// 			console.log ('Done!');
// 			process.exit(1);
// 		}, 1000)
// 	}
// }

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