//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'public')));

router.set('view engine', 'ejs');


var CronJob = require('cron').CronJob;

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '********',
  database: "db_final_app"
});

router.get('/', function(req, res){ 
 	res.render('index');
});

connection.connect(function(err) {
	if (err) throw err;
		
		
		var sql = "truncate TABLE angular_rate;";
		connection.query(sql, function (err, result) {
			if (err) throw err;
			console.log("Table truncate angular");
		});
		var sql = "truncate TABLE temperature;";
		connection.query(sql, function (err, result) {
			if (err) throw err;
			console.log("Table truncate temp");
		});
		var sql = "truncate TABLE distance;";
		connection.query(sql, function (err, result) {
			if (err) throw err;
			console.log("Table truncate distance");
		});
});

// db state
// router.use(function(req, res, next) {
//     req.connection = connection;
//     next();
// });

function get_temp_data(test_data){
	return new Promise(function(resolve, reject){
		connection.query('SELECT * FROM temperature order by temp_time DESC;' , function(err, data){
			// console.log(data[0].temp_time);
			// console.log(typeof data[0].temp_value);
			// console.log(JSON.stringify(data[0]));
			// console.log(data.length);

			if(data.length != 0){
				console.log(data[0].temp_value ,test_data['temperature'] );
				if( Math.round(data[0].temp_value) == test_data['temperature']){
				test_data['change'] = false;
				console.log('test1');
				}
				else{
					test_data['change'] = true;
					console.log('test');
				}
			}
			else{
				console.log(test_data.temperature);
				if(test_data['temperature'] == 0){
					test_data['change'] = false;
				}
				if(test_data['temperature'] == 0){
					test_data['change'] = false;
				}
				else if (test_data['temperature'] == 1){
					test_data['change'] = true;
				}
			}
			
			
			

			if(data.length == 0 ){
				test_data['temperature'] = 0;
			}
			else
				test_data['temperature'] = Math.round(data[0].temp_value);


			resolve(test_data);
		});
	});
}

function get_dist_data(test_data){
	return new Promise(function(resolve, reject){
		connection.query('SELECT * FROM distance order by dist_time DESC;' , function(err, data){
			// console.log(data[0]);
			if(data.length == 0)
				test_data['distance'] = 0;
			else
				test_data['distance'] = data[0].dist_value;
			resolve(test_data);
		});
	});
}

function get_light_data(test_data){
	return new Promise(function(resolve, reject){
		connection.query('SELECT * FROM light order by ts DESC;' , function(err, data){
			// console.log(data[0]);
			test_data['light'] = data[0]
			resolve(test_data);
		});
	});
}

function get_angular_data(test_data){
	return new Promise(function(resolve, reject){
		connection.query('select * from angular_rate order by angular_time DESC' , function(err, data){
			if(data.length == 0)
				test_data['angulardata'] = 0 + test_data['angulardata'];
			else{
				// console.log(data[0].angular_value);
				test_data['angulardata']= test_data['angulardata'] + data[0].angular_value;
			}
			resolve(test_data);
		});
	});
}

function get_clothes_data(test_data){
	return new Promise(function(resolve, reject){

		// console.log('test');
		if(test_data.temperature >= 26 ){

			connection.query('select * from clothes where warm <= 0.9 and part = "body"', function(err, data){
				var item = data[Math.floor(Math.random()*data.length)];
				test_data['clothes'] = [item];
			});
		}
		else if(test_data.temperature  >= 22){
			connection.query('select * from clothes where warm <= 1 and warm >= 0.9;' ,function(err, data){
				var item = data[Math.floor(Math.random()*data.length)];
				test_data['clothes'] = [item];
			});
		}
		else if(test_data.temperature  >= 18){
			connection.query('select * from clothes where warm <= 1 and warm >= 0.9;' ,function(err, data){
				var item = data[Math.floor(Math.random()*data.length)];
				test_data['clothes'] = [item];
				connection.query('select * from clothes where warm >1 and warm <= 2;', function(err, data){
					var item = data[Math.floor(Math.random()*data.length)];
					test_data['clothes'].push(item);
					console.log(test_data);
				});
			});
		}
		else if (test_data.temperature >= 14){
			connection.query('select * from clothes where warm <= 1 and warm >= 0.9;' ,function(err, data){
				var item = data[Math.floor(Math.random()*data.length)];
				test_data['clothes'] = [item];
				connection.query('select * from clothes where warm >2 and warm <= 3;', function(err, data){
					var item = data[Math.floor(Math.random()*data.length)];
					test_data['clothes'].push(item);
					console.log(test_data);
				});
			});
		}
		else{
			connection.query('select * from clothes where warm <= 1 and warm >= 0.9;' ,function(err, data){
				var item = data[Math.floor(Math.random()*data.length)];
				test_data['clothes'] = [item];
				connection.query('select * from clothes where warm >2 and warm <= 3;', function(err, data){
					var item = data[Math.floor(Math.random()*data.length)];
					test_data['clothes'].push(item);
					connection.query('select * from clothes where warm = 6;' , function(err, data){
						var item = data[Math.floor(Math.random()*data.length)];
						test_data['clothes'].push(item);
					})
				});
			});
		}
		resolve(test_data);

	});
}



io.on('connection', function (socket) {


    // socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
	// socket.emit('news' , {test:'test'});
	var test_data = {};
	test_data['angulardata'] = 0;
	test_data['temperature'] = 1;
	test_data['distance'] = 200;

	new CronJob('* * * * * *', function() {
		
 		get_temp_data(test_data).then(function(test_data){

			return get_dist_data(test_data);
		}).then(function(test_data){

			return get_angular_data(test_data);
		}).then(function(test_data){
			console.log(test_data);
			if(test_data.change == false)
				socket.emit('news' , test_data)
			else
				return get_clothes_data(test_data);
		}).then(function(test_data){
			socket.emit('news' ,test_data);
		});

		
	}, null, true);


});




server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
