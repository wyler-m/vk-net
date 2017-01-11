

function build_like_dictionary(likes_dict,graph,update_function){

function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

	so = setOps;

	function get_likes(owner_id,item_id,access_token){
		var query = "https://api.vk.com/method/likes.getList?&type=post&owner_id="+owner_id+"&item_id="+item_id+"&access_token="+access_token
		$.get(query, function(data, status){ 
			 var likers = data.response.users;
			 var likers_from_friends = so.intersection(likers, graph.nodeToNeighbors[owner_id]);
			 likes_dict.received[owner_id] += likers_from_friends.length;
			 
			 for (var i = likers_from_friends.length - 1; i >= 0; i--) {
			 	var he_who_likes = likers_from_friends[i];
			 	likes_dict.given[he_who_likes] += 1;
			 };
		})
	}
	

	function get_posts(owner_id,access_token,time_left){
		var query = "https://api.vk.com/method/wall.get?owner_id="+owner_id+"&access_token="+access_token
		$.get(query, function(data, status){ 
			if (data.response!=undefined) {
				for (var i = data.response.length - 1; i >= 1; i--) {
					console.log("remaining",time_left[0],time_left[1])					
					if (data.response[i].likes.count>3) {
						pausecomp(200);
						get_likes(owner_id,data.response[i].id,access_token)
					};
				};
			 }
		})
	}

	
	var temp_nodes = graph.nodes.slice(0);
	var access_token = "9e24fde54e519b3d507a8b7513e5d6fa35e27bb634559e81195853ec5a713530a1cefeb663ce315fcfb61"
	for (var i = graph.nodes.length - 1; i >= 0; i--) {
		var time_left = [graph.nodes.length,i];
		likes_dict["received"][graph.nodes[i].id] = 0;
		likes_dict["given"][graph.nodes[i].id] = 0;
		pausecomp(200);
		get_posts(graph.nodes[i].id,access_token,time_left)
	};
}
