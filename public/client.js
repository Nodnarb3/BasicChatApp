(function(){
	let socket = io();
	socket.on("connect", connected);
	socket.on("token", (data) => {setToken(data);});
	socket.on("join", (data) => {userJoined(data);});
	socket.on("leave", (data) => {userLeft(data);});
	socket.on("user-list", (data) => {updateUserList(data);});
	socket.on("message", (data) => {appendMessage(data);});
	socket.on("message-history", (data) => {chatHistory(data);});
	socket.on("update-nick", (data) => {setToken(data);});
	socket.on("nickname-change", (data) => {updateNickname(data);});
	socket.on("update-color", (data) => {updateColor(data);});
	socket.on("color-change", (data) => {colorChange(data);});
	
	
	$('#msg-input').on("keypress", (event)=>{
		if(event.which == 13) 
		{
        	sendMsg();
    	}
	});
	
	$("#send-btn").on('click', (event)=>{
		sendMsg();
	});
	
	function sendMsg()
	{
		let msg = $('#msg-input').val();
		if(msg.length > 0)
		{
			socket.emit("message", msg);
			$('#msg-input').val(null);
		}
	}
	
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
		
		let u = JSON.parse(Cookies.get("token"));
		
		$(".your-nick").html(u.nick);
		$(".your-nick.your-color").css('background-color', u.color+"4f");
		
	}
	
	function userJoined(data)
	{
		let newUser = JSON.parse(data);
		//Add to users list
		let html = ejs.render("<div data-uuid='<%=user.uuid%>' class='user' style='color:<%=user.color%>;'><%=user.nick%></div>", {user: newUser});
		
		$("#user-list").append(html);
	}
	
	function userLeft(data)
	{
		let leftUser = JSON.parse(data);
		$("#user-list").find("[data-uuid='"+ leftUser.uuid +"']").remove();
	}
	
	function addChatMessage(auth, msg, timestamp)
	{	
		let d = new Date(timestamp);
		let time = `${d.getHours()}:${d.getMinutes()}`;
		
		let html = ejs.render(		
		`<div data-uuid="<%=auth.uuid%>" class="message-wrapper">
			<div class="message-inner" style="background-color: <%=auth.color%>4F">
				<div class="message-user"><%=auth.nick%>:</div>
				<div class="message-body"><%-msg%></div>
				<div class="timestamp"><%=time%></div>
			</div>
		</div>`,{auth: auth, msg: msg, time:time});
		
		if(isMe(auth.uuid))
		{
			html = $(html).addClass("mine");
		}
		
		$("#message-list").append(html);
		$("#message-list").animate({scrollTop: $("#message-list")[0].scrollHeight}, 1);
		
		
	}
	
	function updateNickname(data)
	{
		let user = JSON.parse(data);
		$("#user-list").find(`[data-uuid='${user.uuid}']`).html(user.nick);
	}
	
	function updateColor(data)
	{
		setToken(data);
	}
	
	function colorChange(data)
	{
		let user = JSON.parse(data);
		
		$("#user-list").find(`[data-uuid='${user.uuid}']`).css("color", user.color);
	}
	
	function updateUserList(data)
	{
		let users = JSON.parse(data);
		
		$("#user-list").html(null);
		
		users.forEach(function(user){
			let html = ejs.render("<div data-uuid='<%=user.uuid%>' class='user' style='color:<%=user.color%>;'><%=user.nick%></div>", {user: JSON.parse(user)});
		
			$("#user-list").append(html);
					
		});
		
		makeMeBold();
	}
	
	function appendMessage(data)
	{
		let msgData = JSON.parse(data);
		
		addChatMessage(JSON.parse(msgData.user), msgData.msg, msgData.timestamp);
	}
	
	function chatHistory(data)
	{
		let chat = JSON.parse(data);
		
		$("#message-list").html(null);
		
		chat.forEach((msg)=>{			
			addChatMessage(JSON.parse(msg.user), msg.msg, msg.timestamp);
		});
				
	}
	
	function isMe(id)
	{
		let myUuid = JSON.parse(Cookies.get("token")).uuid;

		return id === myUuid;
		
	}
		
	function makeMeBold()
	{
		let myUuid = JSON.parse(Cookies.get("token")).uuid;
		
		$('[data-uuid="'+ myUuid +'"]').addClass('bold');
	}
	
})();