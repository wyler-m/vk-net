class graph {
  constructor(){
    this.friends = null;
    this.nodesRetrieved = false;
    this.nodes = [];
    this.edges = {"mutual":[],"one_way":[],"complete":[],"checked":{}};
    this.weightsDictionary = {
                    "degree":{},
                    "popularity":{},
                    "popularityDeg":{}
                  };
    this.nodeToFriends = {};
    this.nodeToNeighbors = {};
    this.currentNode = null;
    this.nodeToInfo = {};  
    this.ownerInfo = {};
    this.first_pass = true;
    this.city_dict = {};
    this.unique_cities = [];
    this.node_weight_type = 'degree';
    this.node_normalization = 'linear';
    this.node_use_rank = 'false';
    this.weight_dict_name = 'degree';
    this.current_edges_dict = 'complete';
    this.new_edge_dict = true;
  }

  init_owner(res){
    this.ownerInfo = res
  }

  init_friends(res){
    this.friends = res["response"];
  }

  add_details_array(res_array){
    for (var i = 0; i < res_array.length; i++) {
      this.add_details(res_array[i])
    };
  }

  add_details(res){
    if (!(res.deactivated)){
      if (res.photo_200 == undefined) {res.photo_200 = "http://vk.com/images/camera_200.png"};
      if (!(this.unique_cities.includes(res.city))){this.unique_cities.push(res.city)}
      this.nodes.push( {"id": res.uid, "label": res.first_name + " " + res.last_name, title: "<img src="+ res.photo_200 +" alt="+res.first_name + " " + res.last_name + "><p>" + res.first_name + " " + res.last_name + "</p><p>", small_pic:res.photo_100, group:res.city } );
    } else {console.log(res)}
  } 

  add_city_info(){
    for (var i = this.nodes.length - 1; i >= 0; i--) {
      if(this.city_dict[this.nodes[i].group]){
        this.nodes[i]["title"] = this.nodes[i]["title"].concat(this.city_dict[this.nodes[i].group])
      }
    };
  }
  
  add_all_connections(){
    //build mutual friends edges
    for (var i in this.nodeToFriends){
        this.add_new_connections(i)              
      }
    //build subscribers dictionary
    for (var sum_id in this.edges.checked){
      this.edges.one_way.push(this.edges.checked[sum_id])
      this.edges.complete.push(this.edges.checked[sum_id])
    }
  }

  add_new_connections(currentNode){
    if (this.nodeToFriends[currentNode]) {
      var newLinks = so.intersection(this.friends,this.nodeToFriends[currentNode]);
      if (newLinks) {
        this.nodeToNeighbors[currentNode] = newLinks;
        for (var i = newLinks.length - 1; i >= 0; i--) {
            this.make_link(parseInt(currentNode),parseInt(newLinks[i]));          
        };
      };
    };
  };


  make_link(source,target){
    var sum_id = target+source;
    if (sum_id in this.edges.checked){
      this.edges.mutual.push({"from":source,"to":target,"hidden":false, "physics":true});
      this.edges.mutual.push({"from":target,"to":source,"hidden":true, "physics":false});
      this.edges.complete.push({"from":target,"to":source,"hidden":false, "physics":true});
      this.count_degree(target);
      this.count_degree(source);      

      delete this.edges.checked[sum_id];
    } else {
      this.edges.checked[sum_id] = {"from":source,"to":target,"hidden":false, "physics":true,"arrows":"middle"};
    }
  }

  count_degree(id){
    if (id in this.weightsDictionary.degree) {
      this.weightsDictionary.degree[id] ++ ;
    } else {this.weightsDictionary.degree[id] = 1};
  }

//generate nodes popularity 
  weight_nodes_popularity(){
    //iterate through edges, to get the "popularity" for each node
    for (var i = 0; i < this.edges.mutual.length; i++) {
      this.run_pop_dict(this.edges.mutual[i].to, this.edges.mutual[i].from);
    };

  }
    
    run_pop_dict(nodeA, nodeB){
      this.add_to_pop_dict(nodeB, this.get_popularity(nodeA, nodeB));
      this.add_to_pop_dict(nodeA, this.get_popularity(nodeB, nodeA));
    }

    get_popularity(source, target){
      var source_friends = (this.nodeToFriends[source] != undefined)  ? this.nodeToFriends[source]: [] ;

      if (target && source_friends) {
        var location = source_friends.indexOf(target); // find location of the node in queue
        var len = source_friends.length; 
        if ((location!=-1) && (len!=0)) {
          return Math.round(1000/(1 + location));
        };
      };
      return 0;
    }

    add_to_pop_dict(source,rank){
      if (source in this.weightsDictionary.popularity) {
        this.weightsDictionary.popularity[source] += rank ;
      } else {
        this.weightsDictionary.popularity[source] = 0
      };
    }

//generate popularity averaged over degree
    weight_nodes_popularity_deg(){
      var nodes = Object.keys(this.weightsDictionary.degree);
      for (var i = 0; i < nodes.length; i++) {
        var deg = this.weightsDictionary.degree[nodes[i]];
        this.weightsDictionary.popularityDeg[nodes[i]] = Math.round(this.weightsDictionary.popularity[nodes[i]]/deg);
      };
    }


    rank_weights(){
      var ranked_weights = [];
      var nodes = Object.keys(this.weightsDictionary.degree);
      for (var node in this.nodes){
        var uid = this.nodes[node].id
        var weight = this.weightsDictionary[this.node_weight_type][uid];
        if (ranked_weights.indexOf(weight) < 0){
          ranked_weights.push(weight);
        }
      }
      return ranked_weights.sort(function(a, b){return a-b});
    }


    normalize_weights(){
      console.log("inside normailze weights",this.weight_dict_name)
      var scaling_function = {"linear":function(rank) {return (rank)},
                              "quad":function(rank) {return Math.pow(rank,2)},
                              "log":function(rank) {return Math.round(Math.log(rank+1)*100)}  
                              }

      if (!(this.weight_dict_name in this.weightsDictionary)) {
        this.weightsDictionary[this.weight_dict_name] = {}
        var nodes = Object.keys(this.weightsDictionary.degree);
        if (this.node_use_rank == "true") {
          var ranked_weights = this.rank_weights();          
        };
        console.log(ranked_weights)
        for (var i = 0; i < nodes.length; i++) {
          var weight = this.weightsDictionary[this.node_weight_type][nodes[i]];
          
          if (this.node_use_rank == "true") {
            var node_rank = ranked_weights.indexOf(weight);
            this.weightsDictionary[this.weight_dict_name][nodes[i]] = scaling_function[this.node_normalization](node_rank);
          } else{
            this.weightsDictionary[this.weight_dict_name][nodes[i]] = scaling_function[this.node_normalization](weight);
          };
        };
      };
    }
    
    update_weight_dict_name(){
      this.weight_dict_name = this.node_normalization+" "+this.node_weight_type +" "+this.node_use_rank;        
 }

    set_weights(network_data_set){
      for (var i = this.nodes.length - 1; i >= 0; i--) {
        var deg = 0    
        if (!(this.nodes[i].small_pic=="https://vk.com/images/deactivated_100.png")){
          deg = this.weightsDictionary[this.weight_dict_name][this.nodes[i]["id"]];
          deg = deg ? deg : 0
        }
          this.nodes[i].value = deg
          this.nodeToInfo[this.nodes[i].id] = this.nodes[i];
      }

      if (network_data_set) {
          network_data_set.update(this.nodes);          
        }
    }
}