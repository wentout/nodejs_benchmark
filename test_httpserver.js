
var http = require('http');

var count = 0;
var max = 0;

var HTTPServerReqListener = function (req, res) {
	count++;
	( function (rq, rs) {

		if (rq) {
			setTimeout (function () {
				rs.setHeader('Content-Type', 'text/html; charset=UTF-8');
				rs.writeHead(200);
				
				var str = ['success : ' + count];
				if (max < count) {
					max = count;
				}
				str.push ('max : ' + max);
				rs.end (str.join ('\n'));

				count--;
			}, 3000);
		} else {
			rs.end ();
		}

	} (req, res) );

};

var server = http.createServer( HTTPServerReqListener );
server.listen( 8000 );

// console interrupt
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('data', function (key) {

	if (key == '\u0003') {
		console.log ('Have a nice day!')
		process.exit(1);
	}

});

var pid = process.pid;
console.log ('Process PID is: ' + pid);

var exec = require('child_process').exec;
setTimeout (function () {
	exec('taskset -pc 0 ' + pid //);
		, function (error, stdout, stderr){
		console.log('taskset stdout: \n' + stdout);
		// log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}, 1000);
