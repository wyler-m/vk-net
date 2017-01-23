

function build_like_dictionary(likes_weighted_edges,graph,access_token){

	function extend(obj, src) {
	    for (var key in src) {
	        if (src.hasOwnProperty(key)) obj[key] = src[key];
	    }
	    return obj;
	}

	function build_splice_dict(test_array){
		var splice_dict = {};
		var splices = 0;
		var temp_friend_list = Object.assign([], test_array);
		while (temp_friend_list.length>0){
			splice_dict[splices] = temp_friend_list.splice(0,24);
			splices++;
		}
		console.log("splice ditc",splice_dict)
		return splice_dict;
	}

	function build_query_wall_get(friends){
		var code_block = ""
		if (friends) {
			var first = friends.pop();
				 code_block = `return[API.wall.get({"owner_id":${first}})`;
			for (var i in friends) {
				code_block += `,API.wall.get({"owner_id":${friends[i]}})`;
				};
			code_block += "];"
			return code_block
		}
	}

	function get_mass_wall_posts(splice_dict,splice_index){
			if (splice_index>-1) {
				code = build_query_wall_get(splice_dict[splice_index]);
				var query = `https://api.vk.com/method/execute?access_token=${access_token}&code=${code}`;
			$.get(query, function(data, status){ 
			 		if (data["error"]!=undefined) {
			 			setTimeout(function(){
			 				get_mass_wall_posts(splice_dict,splice_index)
			 			},300);
			 		}else{
			 			data.response.map(function (posts_array){
			 				if (posts_array) {
			 					posts_array.shift(); 
			 					posts_array.map(function (post){
			 						if (post.reposts.count in histogram.posts_to_check_reposts) {
			 							histogram.posts_to_check_reposts[post.reposts.count]++;
			 						} else{
			 							histogram.posts_to_check_reposts[post.reposts.count]=1;
			 						};
			 						if (post.likes.count in histogram.posts_to_check_likes) {
			 							histogram.posts_to_check_likes[post.likes.count]++;
			 						} else{
			 							histogram.posts_to_check_likes[post.likes.count]=1;
			 						};
			 						 
				 					if ((post.reposts.count > repost_min)&&(post.reposts.count < repost_max)) {
				 						posts_to_check_reposts.push(post)
				 					}
				 					if ((post.reposts.count > like_min)&&(post.reposts.count < like_max)) {
				 						posts_to_check_likes.push(post)
				 					}
			 					});	
			 				};
			 			;})

			 			get_mass_wall_posts(splice_dict,splice_index-1)
			 		}	
			 	
				})	
			}else{

				console.log("done posts_to_check_reposts",posts_to_check_reposts);
				var splice_dict = build_splice_dict(posts_to_check_likes)
				check_posts(splice_dict,Object.keys(splice_dict).length-1)
		}
	}

function build_query_likes_get(posts_array){
		var code_block = ""
		if (posts_array) {
			var first = posts_array.pop();
				 code_block = `return{"${first.id}":API.likes.getList({"type":"post","owner_id":${first.from_id},"item_id":${first.id},"count":1000})`;
			for (var i in posts_array) {
				code_block += `,"${posts_array[i].id}":API.likes.getList({"type":"post","owner_id":${posts_array[i].from_id},"item_id":${posts_array[i].id},"count":1000})`;
				};
			code_block += "};"
			return code_block
		}
	}


	function check_posts(splice_dict,splice_index){
			if (splice_index>-1) {
				code = build_query_likes_get(splice_dict[splice_index]);
				var query = `https://api.vk.com/method/execute?access_token=${access_token}&code=${code}`;
				$.get(query, function(data, status){ 
					console.log("data check posts",data,query)
				 		if (data["error"]!=undefined) {
							console.log("splice error",splice_index,data)
				 			setTimeout(function(){
				 				check_posts(splice_dict,splice_index)
				 			},300);
				 		}else{
				 			extend(id_to_likes, data.response)
				 			check_posts(splice_dict,splice_index-1)
				 		}
				 	});
			}else{
				console.log("done with posts");
				build_weighted_edges_graph(id_to_likes,posts_to_check_likes,test_data);
			}
		}


	function make_link(source,target,G){
		if (source in G) {
			if (target in G[source]) {
				G[source][target]++;
			} else{
				G[source][target] = 1;
			};
		} else{
			G[source] = {}
			G[source][target] = 1;
		};
	}

	function build_weighted_edges_graph(id_to_likes,posts_to_check_likes,graph){
		// node list
		so = setOps;
		posts_to_check_likes.map(function (element){
			var source = element.from_id;
			var post_id = element.id;
			var likers = id_to_likes[post_id].users;
			var likers_among_friends = so.union(likers,graph.friends);
			likers_among_friends.map( function (target){
				make_link(source,target,weighted_edges_graph);
			})
		});
		weight_edges(graph,weighted_edges_graph);
		
	}

	function weight_edges(graph,weighted_edges_graph){
		graph.edges["mutual"].map(function (edge){
			if ((edge.from in weighted_edges_graph) && (edge.to in weighted_edges_graph[edge.from])) {
				edge["value"] = weighted_edges_graph[edge.from][edge.to];
				edge["arrow"] = "to";
			} else {
				edge["value"] = 0;
			};			
		});
	}

	var repost_min = 1;
	var repost_max = 5;
	var like_min = 1;
	var like_max = 20;
	var id_to_likes = {};
	var posts_to_check_reposts = [];
	var posts_to_check_likes = [];
	var weighted_edges_graph = {}

	var histogram = {"posts_to_check_reposts":{},"posts_to_check_likes":{}}

	var splice_dict = build_splice_dict(test_data.friends);
	get_mass_wall_posts(splice_dict,Object.keys(splice_dict).length-1)
}
