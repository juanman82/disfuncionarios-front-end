/**
 * Callback para actualizar grafico
 */
function updateChart(error,data) {
	
	if (error !== null) {
		console.log("Error al cargar datos "+error);
		return;
	}

	// tamaño base de cada nodo
	var nodeBaseSize = 50;
	var relationshipBaseSize = 10;
	
	var minRelationships = 5;
	
	// filtrar solo los que tiene relaciones
	data.candidates = data.candidates.filter(function(c) {return c.relationships.length >= minRelationships});
	   
	// obtener numero mas alto de relaciones para normalizar 
	// tamaño de nodos
	var maxRelationships = data.candidates.reduce(function(prev,curr){ return curr.relationships.length > prev.relationships.length ? curr : prev});

   	// seleccionar contenedor para el grafico
	var chart = d3.select("#network-chart");

	// tamaño del contenedor
	var chartWidth = chart.node().getBoundingClientRect().width;
	var chartHeight = chart.node().getBoundingClientRect().height;
	
		
	// colores
	var color = d3.scale.category20();
		
	// layout de grafo
	var force = d3.layout.force()
		.charge(-3000)
		.linkDistance(200)
		.size([chartWidth, chartHeight])
		.friction(0.2);

    var svg = chart.append("svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight);
    
    // crear nodos y enlances
    var nodes = [];
    var links = [];
    
    var index = 0;
    
    for (var c = 0; c < data.candidates.length; c++) {
		// candidato
		var candidate = data.candidates[c];
		
		var node = {
			name: candidate.name,
			weight: candidate.relationships.length,
			group: c,
			size: relationshipBaseSize + nodeBaseSize*(candidate.relationships.length/maxRelationships.relationships.length),
			class: "candidate"
		};
		nodes.push(node);
		var candidateIndex = index++;
		
		// relaciones
		for (var r = 0; r < candidate.relationships.length; r++) {
			var relationship = candidate.relationships[r];
			var noder = {
				name: relationship.name,
				weight: 1,
				group: c,
				size: relationshipBaseSize,
				url: relationship.url,				
				class: "relationship"
			};
			nodes.push(noder);

			var relationshipIndex = index++;
			var link = {
				source: candidateIndex,
				target: relationshipIndex,
				value: 1,
				url: relationship.url,
				type: relationship.relation_type
			};

			links.push(link);
		}
		
	}
    		
    
    // empezar simulacion
	force
      .nodes(nodes)
      .links(links)
      .start();

	var link = svg.selectAll(".link")
		.data(links)
		.enter()
		.append("line")
			.attr("class", "link")
			.style("stroke-width", function(d) { return d.value; });

	var node = svg.selectAll(".node")
		.data(nodes)
		.enter().append("ellipse")
			.attr("class", "node")
			.attr("rx", function(d) { return d.size*3; } )
			.attr("ry", function(d) { return d.size; } )
			.style("fill", function(d) { return color(d.group); })
			.call(force.drag);
		
	var text = svg.append("g").selectAll(".node")
		.data(force.nodes())
		.enter().append("svg:a")
		.attr("xlink:href", function(d){return d.url;})  
			.append("text")
				.attr("class", function(d) { return d.class; })
				.attr("text-anchor","middle")
				.attr("alignment-baseline","hanging")
				.attr("dominant-baseline", "central")
				.text(function(d) { return d.name; })
				.call(force.drag);




  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
        
	text.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; });
 
  });		
  

}


/**
 * Funcion principal 
 */
(function main() {
	// variables
	var data_url = "data.json";
		
	// actualizar grafico
	d3.json(data_url,updateChart);
})()
