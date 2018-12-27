
/**
 * 
 */
class KnifeHitGame
{

	/**
	 * 
	 */
	constructor(Port) 
	{

		this.Clients ={};
		this.Play = {};
		this.turn = null;


		this.WebSocket = require("ws");
		this.WebSocketServer = this.WebSocket.Server;
		this.wss = new this.WebSocketServer({ port: Port });
		console.log(`Listening on ${ Port }`);
		this.wss.on('connection', (ws, req) => {
			this.ws = ws;
			this.req = req;

			this.ws.isAlive = true;
			this.ws.on('pong', this.heartbeat);

			// this.ws.send(`{"type":"find_match","turn":"js"}`)
			this.wellcome();

			this.ws.on('message', (data) => {
				this.onMessage(data);
			});
		});


		// const interval = setInterval(function ping() 
		// {
		// 	this.wss.clients.forEach(function each(ws) 
		// 	{
		// 		if (ws.isAlive === false)
		// 		{
		// 			return ws.terminate();
		// 		}

		// 		ws.isAlive = false;
		// 		ws.ping(this.noop);
		// 	});
		// }, 30000);
	}


	/**
	 * 
	 */
	wellcome()
	{
		var send_array 		= {};
		var send_json 		= "";
		send_array.status 	= "ok";
		send_array.type 	= "connected";
		send_json = JSON.stringify(send_array);
		console.log("one player connecter");
		this.ws.send(send_json);

	}


	/**
	 * 
	 */
	onMessage(_data)
	{
		console.log(_data);
		var send_array 	= {};
		var send_json 	= "";
		if (this.isJson(_data) === false) 
		{
			send_array.status	 = "no";
			send_array.type		 = "fail";
			send_array.message	 = "your message is not json";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json);
			return false;
		}
		var data = JSON.parse(_data);
		if (typeof data === 'object' && typeof data.type !== 'undefined' && data.type == "check_name")
		{
			this.check_name(data.name);
		}
		else if (typeof data === 'object' && typeof data.type !== 'undefined' && data.type == "find_match")
		{
			this.find_match(data);
		} 
		else if (typeof data === 'object' && typeof data.type !== 'undefined' && data.type == "shoot")
		{
			this.shoot(data);
		}
		else if (typeof data === 'object' && typeof data.type !== 'undefined' && data.type == "finish")
		{
			this.finish(data);
		}
	}


	/**
	 * 
	 */
	find_match(_data)
	{
		var send_array 		= {};
		var send_array1		= {};
		var send_json 		= "";
		var send_json1 		= "";
		if (typeof _data === 'undefined') 
		{
			send_array.status 	= "error";
			send_array.type 	= "find_match";
			send_array.message 	= "nothing recevie";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		}
		var data = _data;
		if (typeof data.name === 'undefined') 
		{
			send_array.status	 = "error";
			send_array.type		 = "find_match";
			send_array.message	 = "name is not set";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		}

		this.Clients[data.name] 			= this.ws;
		this.Clients[data.name]["can_play"] = true;

		for (var objectKey in this.Clients) 
		{
		    var value = this.Clients[objectKey];
			if (value["can_play"] == true) 
			{
				if (objectKey != data.name) 
				{
					console.log(data.name+" VS "+objectKey);
					this.Clients[objectKey]["can_play"] 	= false;
					this.Clients[objectKey]["enemy_name"] 	= data.name;
					
					this.Clients[data.name]["can_play"] 	= false;
					this.Clients[data.name]["enemy_name"] 	= objectKey;
					break;
				}
			}
		    
		}
		if (typeof this.Clients[data.name]["enemy_name"] !== 'undefined') 
		{
			send_array.status = "ok";
			send_array.type = "find_match";
			send_array.player_type = "Player1";
			send_array.turn = true;
			send_array.enemy_name = this.Clients[data.name]["enemy_name"];
			send_json = JSON.stringify(send_array); 
			this.Clients[data.name].send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close(data.name, this.Clients[data.name]["enemy_name"]);
				}
			});

			send_array1.status = "ok";
			send_array1.type = "find_match";
			send_array1.player_type = "Player2";
			send_array1.turn = false;
			send_array1.enemy_name =data.name;
			send_json1 = JSON.stringify(send_array1); 
			this.Clients[this.Clients[data.name]["enemy_name"]].send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close(this.Clients[data.name]["enemy_name"], data.name);
				}
			});

			this.Clients[data.name]["turn"] 							= true;
			this.Clients[this.Clients[data.name]["enemy_name"]]["turn"] = false;
		}
		else
		{
			send_array.status = "finding";
			send_array.type = "find_match";
			send_json = JSON.stringify(send_array); 
			this.Clients[data.name].send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close(data.name);
				}
			});
		}

		return true;
	}


	/**
	 * 
	 */
	check_name(_name)
	{
		var send_array 		= {};
		var send_json 		= "";
		if (typeof _name === 'undefined') 
		{
			send_array.status 	= "error";
			send_array.type 	= "check_name";
			send_array.message 	= "please enter a name";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		}
		var name = _name;
		if (name in this.Clients) 
		{
			send_array.status 	= "no";
			send_array.type 	= "check_name";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});

			return false;
		}
		// console.log(name);
		send_array.status 	= "ok";
		send_array.type 	= "check_name";
		send_json = JSON.stringify(send_array);
		// console.log("one player connecter");
		this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});

		return true;
	}

	/**
	 * 
	 */
	finish(_data)
	{
		var send_array 		= {};
		var send_json 		= "";
		if (typeof _data === 'undefined') 
		{
			send_array.status 	= "error";
			send_array.type 	= "finish";
			send_array.message 	= "nothing recevie";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		}
		if (typeof _data.enemy_name === 'undefined' || typeof _data.self_name === 'undefined' || typeof _data.winner_name === 'undefined')
		{
			send_array.status 	= "error";
			send_array.type 	= "finish";
			send_array.message 	= "please give up all key... enemy_name | self_name | winner_name";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		} 		

		delete this.Clients[_data.self_name];
	}


	/**
	 * 
	 */
	shoot(_data)
	{
		var send_array 		= {};
		var send_json 		= "";
		if (typeof _data === 'undefined') 
		{
			send_array.status 	= "error";
			send_array.type 	= "shoot";
			send_array.message 	= "nothing recevie";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		}
		if (typeof _data.enemy_name === 'undefined' || typeof _data.self_name === 'undefined' || typeof _data.location === 'undefined' || typeof _data.unix_time === 'undefined')
		{
			send_array.status 	= "error";
			send_array.type 	= "shoot";
			send_array.message 	= "please give up all key... enemy_name | self_name | location | unix_time";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		} 
		send_array 		= _data;
		send_array.turn = true;
		send_array.status = "ok";
		delete send_array.enemy_name;
		send_json = JSON.stringify(send_array);

		if (typeof this.Clients[_data.self_name] === 'undefined' || typeof this.Clients[_data.enemy_name] === 'undefined' || this.Clients[_data.self_name]["enemy_name"] !== _data.enemy_name) 
		{
			send_array.status 	= "error";
			send_array.type 	= "shoot";
			send_array.message 	= "no enemy is set or this enemy is not your enemy or your self name is incorrect";
			send_json = JSON.stringify(send_array);
			this.ws.send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close();
				}
			});
			return false;
		} 
		this.Clients[_data.self_name]["turn"] = false;
		this.Clients[_data.enemy_name]["turn"] = true;
		this.Clients[_data.enemy_name].send(send_json, (error) => {
				if (typeof error !== 'undefined') 
				{
					this.game_close(_data.enemy_name, _data.self_name);
				}
			});

		return true;
	}


	/**
	 * 
	 */
	isJson(item) 
	{
		item = typeof item !== "string" ? JSON.stringify(item) : item;

	    try 
	    {
			item = JSON.parse(item);
	    } 
	    catch (e) 
	    {
	        return false;
	    }

	    if (typeof item === "object" && item !== null) 
	    {
	        return true;
	    }

	    return false;
	}


	/**
	 * 
	 */
	noop() 
	{

	}


	/**
	 * 
	 */
	heartbeat() 
	{
		this.isAlive = true;
	}


	/**
	 * [self_name description]
	 * @type {[type]}
	 */
	game_close(self_name = null, enemy_name = null)
	{

	}

}

/**
 * [knife_game description]
 * @type {KnifeHitGame}
 */
const knife_game = new KnifeHitGame(4856);



////////////////////////
// geeksesi::javad(); //
// /////////////////////
