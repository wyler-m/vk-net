class graph {
  constructor(){
    this.friends = null;
    this.nodesRetrieved = false;
    this.nodes = [];
    this.edges = [];
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
    if (res.photo_200 == undefined) {res.photo_200 = "http://vk.com/images/camera_200.png"};
    this.nodes.push( {"id": res.uid, "label": res.first_name + " " + res.last_name, title: "<img src="+ res.photo_200 +" alt="+res.first_name + " " + res.last_name + "><p>" + res.first_name + " " + res.last_name + "</p><p>", small_pic:res.photo_100, group:res.city } );
    if (!(this.unique_cities.includes(res.city))){this.unique_cities.push(res.city)}
  } 

  add_city_info(){
    for (var i = this.nodes.length - 1; i >= 0; i--) {
      if(this.city_dict[this.nodes[i].group]){
        this.nodes[i]["title"] = this.nodes[i]["title"].concat(this.city_dict[this.nodes[i].group])
      }
    };
  }
  
  add_all_connections(){
    for (var i in this.nodeToFriends){
        this.add_new_connections(i)              
      }
    }

  add_new_connections(currentNode){
    if (this.nodeToFriends[currentNode]) {
      var newLinks = so.intersection(this.friends,this.nodeToFriends[currentNode]);
      if (newLinks) {
        this.nodeToNeighbors[currentNode] = newLinks;
        for (var i = newLinks.length - 1; i >= 0; i--) {
            this.make_link(newLinks[i],currentNode);          
        };
      };
    };
  };


  make_link(source,target){
    var sum_id = target+source;
    var rev_sum_id = source+target;
    if (rev_sum_id in this.weightsDictionary.degree){
      return;
    }
    this.weightsDictionary.degree[sum_id] = 1;
    this.count_degree(source); 
    this.count_degree(target);
    this.edges.push({"from":source,"to":target});
  }

  count_degree(id){
    if (id in this.weightsDictionary.degree) {
      this.weightsDictionary.degree[id] ++ ;
    } else {this.weightsDictionary.degree[id] = 1};
  }

  get_density(){
        return this.edges.length / this.nodes.length / (this.nodes.length - 1) * 2;
    }

//generate nodes popularity 
  weight_nodes_popularity(){
    //iterate through edges, to get the "popularity" for each node
    for (var i = 0; i < this.edges.length; i++) {
      this.run_pop_dict(this.edges[i].to, this.edges[i].from);
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


    rank_weights(weight_type){
      var ranked_weights = [];
      var nodes = Object.keys(this.weightsDictionary.degree);
      for (var node in this.nodes){
        var uid = this.nodes[node].id
        var weight = this.weightsDictionary[weight_type][uid];
        if (ranked_weights.indexOf(weight) < 0){
          ranked_weights.push(weight);
        }
      }
      return ranked_weights.sort(function(a, b){return a-b});
    }


    normalize_weights(scale_type,weight_type,use_rank){
      var dict_name = scale_type+" "+weight_type
      var scaling_function = {"linear":function(rank) {return (rank)},
                              "quad":function(rank) {return Math.pow(rank,2)},
                              "log":function(rank) {return Math.round(Math.log(rank+1)*100)}  
                              }

      var ranked_weights = this.rank_weights(weight_type);
      if (!(dict_name in this.weightsDictionary)) {
        this.weightsDictionary[dict_name] = {}
        var nodes = Object.keys(this.weightsDictionary.degree);
        for (var i = 0; i < nodes.length; i++) {
          var weight = this.weightsDictionary[weight_type][nodes[i]];
          if (use_rank) {
            var node_rank = ranked_weights.indexOf(weight);
            this.weightsDictionary[dict_name][nodes[i]] = scaling_function[scale_type](node_rank);
          } else{
            this.weightsDictionary[dict_name][nodes[i]] = scaling_function[scale_type](weight);
          };
        };
      };
    }
    

    set_weights(weight_type,network_data_set){
      for (var i = this.nodes.length - 1; i >= 0; i--) {
        var deg = 0    
        if (!(this.nodes[i].small_pic=="https://vk.com/images/deactivated_100.png")){
          deg = this.weightsDictionary[weight_type][this.nodes[i]["id"]];
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