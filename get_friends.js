

function get_friends(graph,access_token){

	function mass_friend_list(splice_dict,splice_index){
		code = build_query(splice_dict[splice_index]);
		var query = `https://api.vk.com/method/execute?access_token=${access_token}&code=${code}`;
		
			$.get(query, function(data, status){ 
				update_progress(Object.keys(splice_dict).length-1, splice_index-1) // from index
				if (splice_index>=0) {
			 		if (data["error"]!=undefined) {
						console.log("splice error",splice_index,data)
			 			setTimeout(function(){
			 			mass_friend_list(splice_dict,splice_index)
			 		},300);
			 		}else{
			 			$.extend(graph.nodeToFriends, data.response)
			 			mass_friend_list(splice_dict,splice_index-1)
			 		}	
			 	}else{
			 		$.extend(graph.nodeToFriends, data.response);
			 		init_graph(); // from index
			 		construct_like_dict() //from index
				}	
			})
	}

	function build_query(friends){
		var code_block = ""
		if (friends) {
			var first = friends.pop();
				 code_block = `return{"${first}": API.friends.get({"uid":${first}})`
			for (var i in friends) {
				code_block += `,"${friends[i]}": API.friends.get({"uid":${friends[i]}})`
				};
			code_block += "};"
		}	
		return code_block
	}

	var splice_dict = {};
	var splices = 0;
	var temp_friend_list = Object.assign([], graph.friends);
	while (temp_friend_list.length>0){
		splice_dict[splices] = temp_friend_list.splice(0,25);
		splices++;
	}
	mass_friend_list(splice_dict,Object.keys(splice_dict).length-1)



}