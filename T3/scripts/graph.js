
const WIDTH = 1400;
const HEIGHT = 1000;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const FILEPATH = 'datasets/dataset.json';

const radius = 20;

const MAX_RADIUS = 60;

const container = d3.select('#container1')
  .append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
  .append('g')
    .attr('transform',
        `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

const ticked = () => {
    container.selectAll('.node')
    // .attr('transform', node => `translate(${node.x}, ${node.y})`)
    .attr('cx', node => Math.max(radius, Math.min(width - radius, node.x)))
    .attr('cy', node => Math.max(radius, Math.min(height - radius, node.y)));

    container.selectAll('.links')
             .attr('x1', link => Math.max(radius, Math.min(width - radius, link.source.x)))
             .attr('y1', link => Math.max(radius, Math.min(height - radius, link.source.y)))
             .attr('x2', link => Math.max(radius, Math.min(width - radius, link.target.x)))
             .attr('y2', link => Math.max(radius, Math.min(height - radius, link.target.y)));
};

const infoBox = container.append('text');

const simulation = d3.forceSimulation()
                     .force('center', d3.forceCenter(width/2, height/2))
                     .force('collision', d3.forceCollide(60))
                     .force('charge', d3.forceManyBody().strength(-500))
                     .force('link', d3.forceLink().id(node => node.name));

// Escalas!
const rscale = d3.scalePow().exponent(0.2)
                  .range([0, MAX_RADIUS]);

const forkScale = d3.scalePow().exponent(0.2)
                    .range([0, 20]);


d3.json(FILEPATH, dataset => {

    simulation.nodes(dataset.nodes)
              .on('tick', ticked)
              .force('link')
              .links(dataset.links)
              .distance(MAX_RADIUS + 20);

    // Rangos de escala
    rscale.domain([0, d3.max(dataset.nodes, d => parseInt(d.stars))])
    forkScale.domain([0, d3.max(dataset.nodes, d =>parseInt(d.forks))])

    // Flechas para los links
    container.append("svg:defs").selectAll("marker")
      .data(['false'])
      .enter().append("svg:marker")
        .attr("id", 'arrowhead')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 45)
        .attr("refY", -1.5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    container.selectAll('.links')
             .data(dataset.links)
             .enter()
             .append('g')
              .append('line')
              .attr('class', 'links')
              .attr('x1', link => link.source.x)
              .attr('y1', link => link.source.y)
              .attr('x2', link => link.target.x)
              .attr('y2', link => link.target.y)
              .style('stroke', link => linkColor(link.dev))
              .attr("id", function(d,i) {return 'edge'+i})
              .attr('marker-end','url(#arrowhead)')
              .style("pointer-events", "none");

    // // add the links and the arrows
    // container.append("svg:g").selectAll(".links")
    //          .data(dataset.links)
    //          .enter()
    //          .append("svg:path")
    // //    .attr("class", function(d) { return "link " + d.type; })
    //          .attr("class", "links")
    //          .attr("marker-end", "url(#end)");

    const nodes = container.selectAll('.node')
                           .data(dataset.nodes)
                           .enter()
                           .append('g')
                            .append('circle')
                              .attr('class', 'node')
                              .attr('r', d=> rscale(d.stars))
                              .attr('fill', 'blue')
                              .attr('stroke', 'orange')
                              .attr('stroke-width', d=> forkScale(d.forks))
                              .call(drag_handler);

    nodes.append('text').text(node => node.name).attr('dy', 5).attr('fill', 'black');



});


// Helper functions
const linkColor = link_type => {
  if (link_type){
    return 'red';
  }
  else {
    return 'green';
  }
};

// Drag handler
var drag_handler = d3.drag()
	                   .on("start", drag_start)
	                   .on("drag", drag_drag)
	                   .on("end", drag_end);

 //drag handler
 //d is the node
 function drag_start(d) {
  if (!d3.event.active)
     simulation.alphaTarget(0.3).restart();
     d.fx = d.x;
     d.fy = d.y;
 }

 function drag_drag(d) {
   simulation.restart();
   d.fx = d3.event.x;
   d.fy = d3.event.y;
 }


 function drag_end(d) {
   if (!d3.event.active)
   simulation.alphaTarget(0);
  //  simulation.stop();
   d.fx = null;
   d.fy = null;
 }
