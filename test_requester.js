
// how many workers to start
var workersCount = 2000;
// how many requests to do
var maxReqestsCount = 1000000;
// delay between requests for a worker
var workerDelay = 1;
// in Linux you coud use that option for running affinity index per this process
// var useAffinityForCore = false;
var useAffinityForCore = true;



var http = require('http');

http.maxSockets = 4096*4096;
http.globalAgent.maxSockets = 4096*4096;


// how many requests passed through the test at all
var completedRequests = 0;

// current running workers requests count
var runningRequestsCount = 0;

var statusErrCount = 0;
var reqErrCount = 0;

// last milliseconds spent for request proceed
var msCount = 0;

// last moment when request completed
var lastRequestCompletitionTime = 0;

// how many circles workers done
var runlevel = 0;
var lastResponseInfo = '';


var startedAt = 0;
var lastStatInfoTime = 0;
// statistics
var stat = function() {
	if (!stopped) {
		var sec = Math.ceil( (Date.now() - startedAt) / 1000 );
		console.log([
			'Stat Data: ',
			completedRequests + ' | ', runningRequestsCount + ' | ', runlevel,
			' || sec: ' + sec,
			' || RPS: ' + Math.ceil(completedRequests/sec)  + ' || ',
			'serr: ' + statusErrCount + ' | ',
			'rerr: ' + reqErrCount + ' | ',
			lastResponseInfo 
		].join(''));
	}
};



// options for request.js, cause they are the same
var options = {
	// my test_httpserver.js url & port
	method: 'GET',
	port: 8000,
	hostname: 'localhost',
	path: '/',
	// cause of a a bug
	agent: false
};

var task = function (worker) {
	
	// when everything started
	if (startedAt == 0) {
		startedAt = Date.now();
	}
	
	var body = '';
	var status = 0;
	worker.lastStart = Date.now();
	runningRequestsCount++;
	worker.req = http.request(options, function(res){
		status = 0 + res.statusCode;
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			body += chunk.toString();
		});
		res.on('end', function() {
			
			runningRequestsCount--;
			completedRequests++;
			
			if (status == 200) {
				
				worker.run++;
				
				if (runlevel < worker.run) {
					runlevel = 0 + worker.run;
				}
				
				var dn = 0 + Date.now();
				msCount = dn - worker.lastStart;
				
				lastRequestCompletitionTime = 0 + dn;
				lastResponseInfo = worker.name + ' : ' + body.slice (0, 20);
				
				// to show stat with 1 second interval
				if ( lastRequestCompletitionTime - lastStatInfoTime > 999 ) {
					lastStatInfoTime = 0 + lastRequestCompletitionTime;
					stat();
				}
				
			} else {
				statusErrCount++;
			}
			if (maxReqestsCount > completedRequests) {
				setTimeout (function () {
					worker.task( worker );
				}, workerDelay);
			} else {
				if (!stopped) {
					fin();
				}
			}
		});
	});
	worker.req.on('error', function(err){
		if (!stopped) {
			reqErrCount++;
			console.log('error', err);
			process.exit(0);
		}
	});
	worker.req.end();
	
};



// starter
var started = 0;
var ztarted = 0;
var base = workersCount/10;
var start = function () {
	var startDT = Date.now();
	console.log ('\nRunning...\n');
	for (var i = workersCount - 1; i >= 0; i--) {
		
		(function (num) {
			
			// approx calculation for timeout, becaue of a lot workers
			var fnDT = Date.now() - startDT;
			var tOut = base - fnDT;
			if (tOut < 1) { tOut = 1; }
			
			// worker starter
			var el = workers[num];
			setTimeout (function () {
				el.task (el);
				started++;
				if ( started - ztarted  > 999 ) {
					ztarted = 0 + started;
					console.log('started: ', started);
				}
				if (started == workersCount) {
					console.log('Started All: ', workersCount, '\n');
				}
			}, tOut);
			
		}(i));
	}
};




var workers = [];
for (var i = 0; i < workersCount; i++) {
	workers.push ( {
		// worker name
		name: ['w_' + i],
		// the task for worker to run
		task: task,
		// amount of worker was runned a task
		run: -1,
		lastStart: 0
	} );
}
console.log ('\nAvailiable Workers Count:', workers.length, '\n');




var stopped = false;
var fin = function() {
	
		stopped = true;
		// to stop everything on Ctrl + c
		for (var i = 0; i < workersCount; i++) {
			var el = workers[i];
			if (el && el.req) {
				if (el.req.abort) {
					el.req.abort();
				}
			}
		}
		
		console.log ('Have a nice day!');
		setTimeout (function () {
			process.exit(1);
		}, 1000);
		setTimeout (function () {
			process.exit(0);
		}, 3000);
};

// console interrupt
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', function (key) {

	if (key == '\u0003') {
		fin();
	} else {
		// to run workers if nothing is running
		if ( startedAt == 0 && workers.length == workersCount ) {
			start();
		}
	}

});

if (useAffinityForCore) {
	var pid = process.pid;
	console.log ('Process PID is: ' + pid);
	var exec = require('child_process').exec;
	setTimeout (function () {
		exec('taskset -pc 1 ' + pid , function (error, stdout, stderr){
			console.log('taskset stdout: \n' + stdout);
			if (error !== null) {
				console.log('exec error: ' + error);
			} else {
				console.log('press any key to continue');
			}
		});
	}, 1000);
} else {
	console.log('press any key to continue');
}
