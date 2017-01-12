

function build_like_dictionary(likes_dict,graph,update_function,access_token){

function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

	so = setOps;

	function get_likes(owner_id,item_id,access_token,current_step){
		var query = "https://api.vk.com/method/likes.getList?&type=post&owner_id="+owner_id+"&item_id="+item_id+"&access_token="+access_token
		setTimeout(function(){
		$.get(query, function(data, status){ 
			mark_progress(current_step)
			// console.log("likes",data,current_step)
			var likers = data.response.users;
			var likers_from_friends = so.intersection(likers, graph.nodeToNeighbors[owner_id]);
			likes_dict.received[owner_id] += likers_from_friends.length;
			for (var i = likers_from_friends.length - 1; i >= 0; i--) {
			 	var he_who_likes = likers_from_friends[i];
			 	likes_dict.given[he_who_likes] += 1;
			 };
		})
	},current_step*340)
	}
	

	function get_posts(owner_id,access_token,current_step){
		var query = "https://api.vk.com/method/wall.get?owner_id="+owner_id+"&access_token="+access_token
		setTimeout(function(){
		$.get(query, function(data, status){ 
			// console.log("posts",data,current_step)					
			if (data.response!=undefined) {
				for (var i = data.response.length - 1; i >= 1; i--) {
					if (data.response[i].likes.count>3) {
						counter++
						// console.log("counter",counter)
						mark_progress(current_step)
						get_likes(owner_id,data.response[i].id,access_token,counter+temp_nodes.length)
					};
				};
			 }
		})
	},current_step*340)
	}
	var	progbar = document.getElementById("likesProgbar")

	function mark_progress(current_step){
			percent_completed = current_step / (counter + temp_nodes.length) * 100
			progbar.style.width = percent_completed +'%';
			progbar.innerHTML = current_step+"/"+(counter + temp_nodes.length)
			if (percent_completed >= 100){
				$("#likesProgbarContainer").hide()
				$("#givenLikes").show();
				$("#receivedLikes").show();}
	}
	
	var temp_nodes = graph.nodes.slice(0);
	// var access_token = "692c5ddc00a4567f7b166ed809f26120f1db7a3332d056819954351023a30fca167ea0d749e88b71741f0"
	var counter = 0
	for (var i = graph.nodes.length - 1; i >= 0; i--) {
		likes_dict["received"][graph.nodes[i].id] = 0;
		likes_dict["given"][graph.nodes[i].id] = 0;

		console.log(graph.nodes[i].id)
		get_posts(graph.nodes[i].id,access_token,i)
	};
}
