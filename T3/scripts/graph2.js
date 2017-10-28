const WIDTH = 1150;
const HEIGHT = 1000;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const FILEPATH = 'datasets/dataset.json';

const radius = 10;

const container = d3.select('#container1')
  .append('svg')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform',
        `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);


const simulation = d3.forceSimulation()
                     .force('center', d3.forceCenter(width/3, height/2))
                     .force('collision', d3.forceCollide(30))
                     .force('charge', d3.forceManyBody()
                                        .strength(-300))
                     .force('link', d3.forceLink()
                                      .id(node => node.name))
                     .on("tick", tickActions);

d3.json(FILEPATH, dataset => {
  console.log(dataset.nodes);
  simulation.nodes(dataset.nodes)
            .force('link')
            .links(dataset.links)
            .distance(20);

  //draw lines for the links
    container.append("g")
      .attr("class", "links")
      .selectAll("line")
        .data(dataset.links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .style("stroke", linkColour);

  //draw circles for the nodes
  var node = container.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("r", radius)
        .attr("fill", 'black');
  drag_handler(node)
});

var drag_handler = d3.drag()
	.on("start", drag_start)
	.on("drag", drag_drag)
	.on("end", drag_end);


/** Functions **/

//Function to choose what color circle we have
//Let's return blue for males and red for females
function circleColour(d){
	if(d.sex =="M"){
		return "blue";
	} else {
		return "pink";
	}
}

//Function to choose the line colour and thickness
//If the link type is "A" return green
//If the link type is "E" return red
function linkColour(d){
	if(d.dev){
		return "green";
	} else {
		return "red";
	}
}


//drag handler
//d is the node
function drag_start(d) {
 if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function drag_drag(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}


function drag_end(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}


function tickActions() {
    //constrains the nodes to be within a box
      container.selectAll("nodes")
        .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

    container.selectAll("links")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
}
