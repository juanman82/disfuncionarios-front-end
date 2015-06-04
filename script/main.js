/**
 * Callback para actualizar grafico
 */

function tooltipCandidate(name,bio) {
	if (bio == undefined) bio = "";
	return '<div class="tooltip2"><h1>'+name+'</h1><p>'+bio+'</p></div>';
}

function tooltipRelationship(name,urls,bio) {
	var html = '<div class="tooltip2"><h1>'+name+'</h1>'
	if (bio == undefined) bio = "";

	if (urls != null) {
		for (var c = 0; c < urls.length; c++) {
			var url = "";
			for(var propertyName in urls[c]) {
				console.log(propertyName); 
				url = urls[c][propertyName];
			}

			html += '<p><a target="_blank" href="'+url+'">'+url+'</p>'		
		}
	}

	return html+'</div>';
}
function getColor(key, colors) {

	obj = _.find(colors, function(obj) { return obj.name == key })
	if (typeof obj === "undefined") {
		return "#999999";
	}
	if (typeof obj.color === "undefined") {
		return "#999999";
	}

	return "#"+obj.color;

}

function updateChart(error,data) {
	
	if (error !== null) {
		console.log("Error al cargar datos "+error);
		return;
	}

	// imagen generica
	var genericImage = "user-man-circle-512.png";

	// tamaÃ±o base de cada nodo
	var nodeBaseSize = 100;
	var relationshipBaseSize = 50;
	var linkSize = 450;
	var linkWeight = 3;
	
	var minRelationships = 5;
	
	// filtrar solo los que tiene relaciones
	//data.candidates = data.candidates.filter(function(c) {return c.relationships.length >= minRelationships});
	   
	// obtener numero mas alto de relaciones para normalizar 
	// tamaÃ±o de nodos
	var maxRelationships = data.candidates.reduce(function(prev,curr){ return curr.relationships.length > prev.relationships.length ? curr : prev});

   	// seleccionar contenedor para el grafico
   	$("#network-chart").empty();
	var chart = d3.select("#network-chart");

	// tamaÃ±o del contenedor
	var chartWidth = chart.node().getBoundingClientRect().width;
	var chartHeight = chart.node().getBoundingClientRect().height;
	
	// colores
	//var color = d3.scale.category20();
		
	// layout de grafo
	var force = d3.layout.force()
		.gravity(0.05)
		.charge(-1000)
		.linkDistance(linkSize)
		.size([chartWidth, chartHeight])
		.friction(0.2);

    var svg = chart.append("svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight);
    
    // crear nodos y enlances
    var nodes = [];
    var links = [];
    
    var index = 0;
    
	// relleno generico
	var defs = svg.append('defs')

    for (var c = 0; c < data.candidates.length; c++) {
		// candidato
		var candidate = data.candidates[c];

		if(candidate.photo == "/avatars/original/missing.png"){
			candidate.photo = null;
		}else if(!(candidate.photo === null))
		{
				photo = "http://disfuncionarios.org:3000" + candidate.photo;
		}


		
		var node = {
			type: "candidate",
			name: candidate.name,
			weight: candidate.relationships.length,
			group: c,
			size: nodeBaseSize,
			class: "candidate",
			photo: (candidate.photo === null ? genericImage : photo),
			genericPhoto: candidate.photo === null,
			x : chartWidth/2,
			y : chartHeight/2,
			index: index,
			pattern: "pattern"+index,
			fixed: true
		};
		// relleno

		nodes.push(node);
		var candidateIndex = index++;
		
		// relaciones
		for (var r = 0; r < candidate.relationships.length; r++) {
			var relationship = candidate.relationships[r];

			var photo;

			if(relationship.photo == "/avatars/original/missing.png"){
				relationship.photo = null;
			}else if(!(relationship.photo === null) )
			{
				photo = "http://disfuncionarios.org:3000" + relationship.photo;
			}

			var noder = {
				type: "relationship",
				name: relationship.name,
				weight: relationship.urls.length,
				group: c,
				size: relationshipBaseSize,
				urls: relationship.urls,				
				class: "relationship",
				photo: (relationship.photo === null ? genericImage : photo),
				genericPhoto: relationship.photo === null,
				index: index,
				pattern: "pattern"+index,
			};
			nodes.push(noder);

			var relationshipIndex = index++;
			var link = {
				source: candidateIndex,
				target: relationshipIndex,
				value: relationship.urls.length,
				url: "url",
				type: "tipo",
				color: getColor(relationship.relation_type,window.colors)
			};

			links.push(link);
		}
		
	}
    		
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([30, 10])
		.html(function (d) {
			if (d.type == "candidate") return tooltipCandidate(d.name,d.bio);
			else return tooltipRelationship(d.name,d.urls,d.bio);
		})
	svg.call(tip);

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
			.attr("stroke",function(d){return d.color;})
			.style("stroke-width", function(d) { return d.value * linkWeight; });


	var node = svg.selectAll(".node")
		.data(nodes)
		.enter().append("g")
			.attr("class", "node")
			.call(force.drag)
			.on('click', tip.show) 



	node.append("image")
		.attr('xlink:href', function(d) { return d.photo })
		.attr('x',function(d) { return -d.size/2; })
		.attr('y',function(d) { return -d.size/2; })
		.attr("width", function(d) { return d.size; })
		.attr("height", function(d) { return d.size; });

	node.append('div')
		.attr('class','tooltip2')
		.append

/*
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });
*/
/*
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
*/

  	force.on("tick", function() {

		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	//	text.attr("x", function(d) { return d.x; }).attr("y", function(d) { return d.y; });
 
  });		
  

}
$( "#candidatos" ).change(function(){
	 $('#carousel-example-generic').carousel(0);
	 $('.tooltip2').remove();
	var data_url = "http://disfuncionarios.org:3000/pretty_api_2/candidate/" + $(this).val();
	console.log("candidate" + $(this).val() );
	// actualizar grafico
	d3.json(data_url,updateChart);
});

$( "#municipios" ).change(function(){
	var zone = $(this).val();
	$("#candidatos").empty();
    $.ajax({
        url: 'http://disfuncionarios.org:3000/api/all_candidates',
        dataType: 'json',
        type: 'get',
        cache: false,
        success: function(data){
           	
           	$("#candidatos").append('<option value="" selected>Candidat@</option>');
            $(data).each(function(index, value){
                var name = JSON.parse(value).name;
                var id = JSON.parse(value).id;

                if (JSON.parse(value).zone == zone){
                	
                	$("#candidatos").append('<option value="'+ id +'">'+ name +'</option>');
                }
                //console.log(name);
            });
        }
    });

});

/**
 * Funcion principal 
 */
(function main() {
	// variables
	var colors_url = "colors.json";
	var data_url = "http://disfuncionarios.org:3000/pretty_api_2/candidate/1";
		
	// actualizar grafico
	
	d3.json(colors_url, function(error, json) {
	  	window.colors = json;

		// actualizar grafico
		d3.json(data_url,updateChart);
	  
	});
})()