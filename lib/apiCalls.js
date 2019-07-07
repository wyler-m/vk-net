

function fetchDetails(id) {
    var script = document.createElement('SCRIPT');
    var y = '';
    if (access_token) {
      y = "&access_token="+access_token;
    };
    script.src = 'https://api.vk.com/method/users.get?v=5.101&user_ids='.concat(id,y,'&lang=ru&fields=first_name,last_name,city,country,universities,schools,sex,bdate,home_town,photo_200,status,photo_100&callback=api_FetchDetails');   
    document.getElementsByTagName("head")[0].appendChild(script);
    }

function api_FetchDetails(result) {
    if ('error' in result) {
      console.log("error",result);
    } 
    else {
      if (!cur_graph.first_pass) {
      var res_array = result["response"];
        cur_graph.add_details_array(res_array);
      } 
      else {
      var res = result["response"][0];
        cur_graph.first_pass = false;
        cur_graph.init_owner(res);
        document.getElementById("welcome").innerHTML = res.first_name +" "+res.last_name;
      };
    };    
}

function fetchFriendList(id) {
    if (!id) {
      var target_id;
      target_id = document.getElementById("vkId").value;
      fetchDetails(target_id);
    } else {
      target_id = id; 
      cur_graph.currentNode = id;
    }
    var script = document.createElement('SCRIPT');
    var y = '';
    script.src = `https://api.vk.com/method/execute.getFriends?v=5.74&access_token=${access_token}&userIds=${target_id}&callback=api_FetchFriendList`;
    document.getElementsByTagName("head")[0].appendChild(script);
    }

function api_FetchFriendList(result) {
//if error
    if ("execute_errors" in result) { 
        if ((result["execute_errors"]["error_code"]==6) && (cur_graph.currentNode != undefined)){
        }
      }
//check to see if there are any friends in friendlist
    if (!cur_graph.friends) { 
      
      cur_graph.init_friends(result.response[0].friends);      
      fetchFriendList(cur_graph.currentNode);

//google analytics to see if graph was started
      ga( 'send', 'event', {
          'eventCategory': 'graph interaction',
          'eventAction': 'started graph build',
          'eventLabel': cur_graph.ownerInfo["id"],
          'eventValue': cur_graph.unCheckedFriends.length
        });  
    } else {//if no friends in friendlist, then take intersection of the response and the friends
      if (!cur_graph.nodesRetrieved) { //if this the second retrieval,get all the friends details
        cur_graph.nodesRetrieved = true; //only need to retrieve once
        var nodes = Object.assign([], cur_graph.friends); // make a copy of the friends list
        while (nodes.length>0){ //iterate ver all the friends
          var node = nodes.splice(0,100); // maximum number of ids which can be queried per try is 100
          fetchDetails(node.join());  // put them all together as a string
        }
      };
      update_progress(cur_graph.friends.length,cur_graph.unCheckedFriends.length);



// are there new friends and have there been friends added
      if ("response" in result) {   
          Object.keys(result.response).forEach(function(entry) {
            var friend_map = result.response[entry];
            cur_graph.add_new_friends(friend_map.source,friend_map.friends);
            cur_graph.remove_checked(friend_map.source);
          });
      }
      
// any leftover friends from previous 

//keep recursing until all the unchecked friends are finished
      if (cur_graph.unCheckedFriends.length>0) {
      setTimeout(function(){
        fetchFriendList(cur_graph.unCheckedFriends.slice(0,25));  
      },300);

      } else { 
        cur_graph.weight_nodes_popularity();
        cur_graph.weight_nodes_popularity_deg();
        cur_graph.set_weights("degree");
        cur_graph.add_city_info()
        w3_open()
        redrawAll(); 
//google analytics to see if anyone started using it
        ga( 'send', 'event', {
            'eventCategory': 'graph interaction',
             'eventAction': 'finished graph build',
             'eventLabel': cur_graph.ownerInfo["id"],
             'eventValue': cur_graph.get_density()
           });  
         return
        };
      };
    };