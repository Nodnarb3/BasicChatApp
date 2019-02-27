(function(){
	let socket = io();
	socket.on("connect", connected);
	socket.on("token", (data) => {setToken(data);});
	socket.on("join", (data) => {userJoined(data);});
	socket.on("leave", (data) => {userLeft(data);});
	
	
	function connected()
	{
		if(!!Cookies.get("token"))
		{
			//Reset expiry date
			let currentToken = Cookies.get("token");
			setToken(currentToken);
		}
		
	}
	
	function setToken(data)
	{
		console.log("Token: " + data);
		Cookies.set("token", data, {expires: 1});
		
		$(".your-nick").html(JSON.parse(Cookies.get("token")).nick);
		
	}
	
	function userJoined(data)
	{
		let newUser = JSON.parse(data);
		//Show msg in chat
		//Add to users list
		$("#user-list").append("<div data-uuid='"+ newUser.uuid +"' class='message'>"+ newUser.nick +"</div>");
	}
	
	function userLeft(data)
	{
		let leftUser = JSON.parse(data);
		console.log(leftUser.uuid);
		$("#user-list").find("[data-uuid='"+ leftUser.uuid +"']").remove();
	}
	
})();