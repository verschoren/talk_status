// 0a721e7afdf7f944a73b108334a618810e1d9ccb3924ac8822c61543f3c2cfa6
//global variables
access_token = "";
subdomain = "";
user_id = "";
client = "";

function init() {
	$('#login_text').hide("fade","",500,"");
	if (localStorage.getItem('zauth')) {
		access_token = localStorage.getItem('zauth');
		subdomain = localStorage.getItem('zdomain');
		console.log("there_is_a_token");
		checkClient(subdomain);
		getUser(access_token,subdomain);
	} else {
		console.log("needs_a_token");
		subdomain = $('#subdomain').val().toLowerCase();
		$('#login_text').show("fade","",500,"");
		if (subdomain != ""){	
			console.log(subdomain);
			popup = window.open ("auth.html?subdomain="+subdomain,"mywindow", "width=350,height=550");
			window.addEventListener('message',  updateAuthInfo);
			function  updateAuthInfo(e){
				console.log(e.data);
				access_token = e.data;
				subdomain = subdomain
				localStorage.setItem('zauth', access_token);
				localStorage.setItem('zdomain', subdomain);
				window.location.hash = "";
				console.log("got_token_back");
				popup.close();
				checkClient(subdomain);
				getUser(access_token,subdomain);
			}
		}
		else {
			$('#login_text').show();
			console.log('needs domain');
		}
	}
}

window.addEventListener('load', init, false);

function checkClient(subdomain){
	client = true;
	$.getJSON('clients.json', function (data) {
		//console.log(data);
		for (i in data.clients) {
			if (data.clients[i] == subdomain.toLowerCase()){
				client = true;
				console.log("client is: " + client);
			}
		}
	});
}

function getUser(access_token,subdomain) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var currentUser = JSON.parse(request.responseText);
		user_id = currentUser.user.id;
		var user_name = currentUser.user.name;
 		var first_name = user_name.split(' ')[0];
 		$('#user_name').html(first_name);
	 	getAvailability(user_id,access_token);
      } else {
		console.log("error");
      }
    }
  };

  var url = 'https://' + subdomain + '.zendesk.com/api/v2/users/me.json';
  request.open('GET', url, true);
  request.setRequestHeader("Authorization", "Bearer " + access_token);
  request.send();
}

function setColors(status_talk) {
	if (status_talk == 'online'){
		var color1 = "#78A300";
		var color2 = "#457000";
	}
	if (status_talk == 'offline'){
		var color1 = "#EB4962";
		var color2 = "#B8162F";		
	}
	if (status_talk == 'away'){
		var color1 = "#F79A3E"
		var color2 = "#C4670B"
	}
	if (status_talk == 'reset'){
		var color1 = "#1F73B7";
		var color2 = "004084";
	}
	if (status_talk == 'info'){
		var color1 = "#4d4d4d";
		var color2 = "#000";
	}
	if (status_talk == 'login'){
		var color1 = "#1F73B7";
		var color2 = "#004084";
	}
	$('body').css('background', 'linear-gradient(-45deg, ' + color1 + ', ' + color1 + ', ' + color2 + ', ' + color2 + ')');
}

function resetViews(){
	$('#offline').hide();
	$('#away').hide();
	$('#client_change').hide();
	$('#phone_change').hide();
	$('#client_online').hide();
	$('#phone_online').hide();
	$('#login').hide();
	$('#loginform').hide();
	$('#reset').hide();
	$('#buy').hide();
	$('#logout').hide();
	$('#resetLogin').hide();

	$('#status_text').hide("fade","",500,"");
	$('#login_text').hide("fade","",500,"");
	$('#buy_text').hide("fade","",500,"");
	$('#info_text').hide("fade","",500,"");
}

function setButtons(status_talk,via_talk){
	resetViews();
	if (status_talk == "offline"){
		$('#status_text').show("fade","",500,"");
		$('#away').css('display', 'block');
		$('#client_online').css('display', 'block');
		$('#phone_online').css('display', 'block');
	}
	if (status_talk == "online" && via_talk == "phone"){
		$('#status_text').show("fade","",500,"");
		$('#away').css('display', 'block');
		$('#offline').css('display', 'block');
		$('#client_change').css('display', 'block');
	}
	if (status_talk == "online" && via_talk == "client"){
		$('#status_text').show("fade","",500,"");
		$('#away').css('display', 'block');
		$('#offline').css('display', 'block');
		$('#phone_change').css('display', 'block');
	}
	if (status_talk == "away"){
		$('#status_text').show("fade","",500,"");
		$('#offline').css('display', 'block');
		$('#client_online').css('display', 'block');
		$('#phone_online').css('display', 'block');
	}
	if (status_talk == "reset"){
		$('#buy_text').show("fade","",500,"");
		$('#reset').css('display', 'block');
		$('#buy').css('display', 'block');
	}
	if (status_talk == "info"){
		$('#info_text').show("fade","",500,"");
		$('#logout').css('display', 'block');
		$('#resetLogin').css('display', 'block');
		setColors("info");
	}
	if (status_talk == "login"){
		$('#login_text').show("fade","",500,"");
		$('#login').css('display', 'block');
		$('#loginform').css('display', 'block');
		setColors('login');
		init();
	}
	if (status_talk == "status"){
		$('#info_text').show("fade","",500,"");
		$('#logout').css('display', 'block');
		$('#reset').css('display', 'block');
		setColors("info");
	}
}		

function toggle(status){
	event.preventDefault();
	console.log(client);
	//set payloads	
	if (status == "offline"){var payload = JSON.stringify({"availability":{"available":false,"via":"phone","agent_state":"offline"}});}
	if (status == "away"){var payload = JSON.stringify({"availability":{"available":false,"via":"phone","agent_state":"away"}});}
	if (status == "client"){var payload = JSON.stringify({"availability":{"available":true,"via":"client","agent_state":"online"}});}
	if (status == "phone"){var payload = JSON.stringify({"availability":{"available":true,"via":"phone","agent_state":"online"}});}


	if (client == true){
		setAvailability(user_id,payload);
	} else {
		if (status == "offline"){
			setAvailability(user_id,payload);
		} else {
			setColors("reset");
			setButtons("reset","");
			console.log("not a client");
		}
	}
}

function getAvailability(user_id,access_token) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (request.readyState === 4) {
			if (request.status === 200) {
				var availability = JSON.parse(request.responseText);
				var status_talk = availability.availability.agent_state;
				var via_talk = availability.availability.via;
				
				$('#status_talk').html('<strong>' + status_talk + '</strong>').fadeIn(500);
				if( status_talk == "online"){$('#via_talk').html('via ' + via_talk).fadeIn(500);};
				
				setColors(status_talk);
				setButtons(status_talk,via_talk);
			} else {
				console.log("error");
			}
		}
	};

	var url = 'https://' + subdomain + '.zendesk.com/api/v2/channels/voice/availabilities/'+ user_id + '.json';
	request.open('GET', url, true);
	request.setRequestHeader("Authorization", "Bearer " + access_token);
	request.send();
}

function setAvailability(user_id,payload) {	
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === 4) {
		  if (request.status === 200) {
			getUser(access_token,subdomain);
		  } else {
			getUser(access_token,subdomain);
			console.log('cannot change status');
		  }
		}
	};

	var url = 'https://' + subdomain + '.zendesk.com/api/v2/channels/voice/availabilities/'+ user_id + '.json';
	request.open('PUT', url, true);
	request.setRequestHeader("Authorization", "Bearer " + access_token);
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.send(payload);
}

function getInfo(){
	$('#token_info').html(localStorage.getItem('zauth').slice(0,10)+ '...');
	$('#domain_info').html(localStorage.getItem('zdomain'));
	if (localStorage.getItem('zauth') != ""){
		setButtons('info','');
	} else {
		setButtons('reset','');
	}
}

function deleteToken(){
	localStorage.removeItem('zauth');
	localStorage.removeItem('zdomain');
	console.log("logged out");
	setButtons('login','');
	init();
}
