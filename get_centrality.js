

function get_centrality(graph,network){
	var V = graph.nodes;

	function getNeigbor(node) {

		return network.getConnectedNodes(node);
	}


	var CB = {};				// CB[v] ← 0, v ∈ V ;
	V.map(function (node){
		CB[node.id] = 0;
	});

	V.forEach(function (node) {	// for s ∈ V do
		var s = node.id;		//  set up s as the node's id
		var S = [];				// 	S ← empty stack;
		var P = {};				// 	P [w] ← empty list, w ∈ V ; 
		var sigma = {};			// 	σ[t]←0,t∈V; σ[s]←1;
		var d = {};				// 	d[t]← −1,t∈V; d[s]←0;
		var Q =[];				// 	Q ← empty queue;
		var delta = {}
		V.map(function (node){
		 	P[node.id] = [];
		 	sigma[node.id] = 0;
		 	d[node.id] = -1;
		 	delta[node.id] = 0;
		});
		sigma[s] = 1;
		d[s] = 0;

		Q.push(s);				// 	enqueue s → Q;
		
		while (Q.length > 0){ 	// while Q not empty do
			var v = Q.shift();	// dequeue v ← Q;
			S.push(v)			// push v → S;		
			v_neighbors = getNeigbor(v,network)		// From outside the class
			v_neighbors.forEach(function (w){  		// foreach neighbor w of v do
	 			// w found for the first time? 
				if (d[w] < 0) { 					// if d[w] < 0 then
					Q.push(w)						// enqueue w → Q; 
					d[w] = d[v] + 1; 				// d[w] ← d[v] + 1;
				}; 
	 			// shortest path to w via v? 
				if (d[w] == d[v] + 1){ 				// if d[w] = d[v] + 1 then 
					sigma[w] = sigma[w] + sigma[v]; // σ[w] ← σ[w] + σ[v];
					P[w].push(v);					// append v → P [w];
				}
			})
		}
	// console.log(d);
	// console.log(s);
	// console.log(sigma);
	// console.log("s",S);


	// 	δ[v] ← 0, v ∈ V ; // defined earlier
	// S returns vertices in order of non-increasing distance from s 
		while (S.length > 0){ 	// while S not empty do
			w = S.pop(); 		// pop w ← S;
			P[w].forEach(function (v) {// 		for v ∈ P[w] do 
				delta[v] = delta[v] + sigma[v]/sigma[w]*(1+delta[w]);// δ[v] ← δ[v] + σ[v]/σ[w]·(1+δ[w]);
				// delta[v] = delta[v] + delta[w]);// δ[v] ← δ[v] + σ[v]/σ[w]·(1+δ[w]);
				// console.log(delta[v],sigma[v],sigma[w],delta[w])
			});
	 		if (w != s ) { 				// if w̸=s then //CB[w] ← CB[w]+δ[w];
	 			CB[w] = CB[w] + delta[w];
	 		}
		};
	});
	return CB;
}