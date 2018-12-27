express = require("express");
const port = process.env.PORT || 4856;
var server = express()
  .use((req, res) => res.send('HelloW plase use WS:// not HTTP://') )
  .listen(port, () => console.log(`Listening on ${ port }`));


var WebSocket = require("ws");
var WebSocketServer = WebSocket.Server;
var wss = new WebSocketServer({ server });
var Clients = {};

var Play = {};
var turn = null;

wss.on('connection', (ws, req) => {
	ws.send("Wellcome to our Game");

	var userID = req.headers['sec-websocket-key'];
	Clients[userID] = ws;
	Clients[userID]["canPlay"] = true;
	console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(Clients));
	
	ws.on('message', function incoming(data) {
	// 	  // console.log("javad");
		  data = JSON.parse(data);
		  console.dir(data);
	  if (typeof data === 'object' && typeof data.id !== 'undefined' && data.id == 51 ) 
	  {
			// console.log(JSON.stringify(data));
			// console.log("hi");

					// console.log(Clients);
					// var array1 = ['a', 'b', 'c'];
					Play[1] = ws;
					Play[1]["id"] = userID;
					Object.keys(Clients).map(function(objectKey, index) {
					    var value = Clients[objectKey];
	    				if (value["canPlay"] == true) {
	    					if (objectKey == userID) 
	    					{
	    						console.log();
	    					}
	    					else
	    					{
	    						delete value["canPlay"];
	    						Play[2] = value;
	    						Play[2]["id"] = objectKey;

	    					}
						}
					    
					});

					if (typeof Play[2] !== 'undefined') 
					{

						Play[1].send("{\"status\":\"OK\", \"type\" : \"Player1\", \"turn\" : true }");
						Play[2].send("{\"status\":\"OK\", \"type\" : \"Player2\" , \"turn\" : false }");
						turn = "One";
					}
					else
					{
						Play[1].send("please wait to find an enemy");
					}
					// Clients.forEach(function(element) {
					//   console.log(element);
					// });
			// Clients.forEach( function (value) {
				// if (value["canPlay"] == true) {
				// }
			// });
	  }
		if (typeof data === 'object' && typeof data.shoot !== 'undefined' && data.shoot == true ) 
		{
			
			var message = data;
			message.turn = true;
			var ex = JSON.stringify(message);
			// var ex = message;
			if (turn == "One" && Play[1]["id"] == userID) 
			{
				turn = "Two";
				Play["2"].send(ex);
			}
			else
			{
				turn = "One";
				Play["1"].send(ex);				
			}

		}

	  // ws.send(JSON.stringify(Clients));
	});
	
});
