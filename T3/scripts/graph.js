
const WIDTH = 1100;
const HEIGHT = 750;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const FILEPATH = 'datasets/dataset.json';

const radius = 20;

const MAX_RADIUS = 50;

const forkColors0 = d3.schemeYlOrRd[7];
const forkColors = forkColors0.slice(1, 8);
const container = d3.select('#container1')
  .append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
  .append('g')
    .attr('transform',
        `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);



const infoBox = container.append('text');

const simulation = d3.forceSimulation()
                     .force('center', d3.forceCenter(width/2, height/2))
                     .force('collision', d3.forceCollide()
                                           .radius([40]))
                     .force('charge', d3.forceManyBody().strength(-600))
                     .force('link', d3.forceLink().id(node => node.name)
                                                  .distance(100));

// Escalas!
const rscale = d3.scalePow().exponent(0.2)
                  .range([0, MAX_RADIUS]);

const forkScale = d3.scaleQuantile()
                    .range(forkColors0);

//Tooltip
var divTooltip = d3.select("#container1").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


d3.json(FILEPATH, dataset => {

    simulation.nodes(dataset.nodes)
              .on('tick', ticked)
              .force('link')
              .links(dataset.links)
              .distance(MAX_RADIUS + 20);

    var sorted_forks = dataset.nodes.sort(function(a, b) {return parseInt(a.forks) - parseInt(b.forks)}).map(node => node.forks);

    // Rangos de escala
    rscale.domain([0, d3.max(dataset.nodes, d => parseInt(d.stars))]);
    // forkScale.domain([d3.max(dataset.nodes, d=> parseInt(d.forks)), 0]);

    forkScale.domain([d3.quantile(sorted_forks, 0), d3.quantile(sorted_forks, 0.2),
                     d3.quantile(sorted_forks, 0.4), d3.quantile(sorted_forks, 0.6),
                     d3.quantile(sorted_forks, 0.8), d3.quantile(sorted_forks, 1)]);


    // Flechas para los links
    container.append("svg:defs")
      .append("svg:marker")
        .attr("id", 'arrowhead')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 60)
        .attr("refY", -0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .attr('xoverflow','visible')
        .attr('fill', '#979797')

      .append("path")
        .attr("d", "M0,-5 L10,0 L0,5");

    const links = container.selectAll('.links')
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
              .style('stroke-width', '2px')
              .attr("id", function(d,i) {return 'edge'+i})
              .attr('marker-end','url(#arrowhead)')
              .style("pointer-events", "none");


    const nodes = container.selectAll('.node')
                           .data(dataset.nodes)
                           .enter()
                           .append('g')
                            .append('circle')
                              .attr('class', 'node')
                              .attr('r', d=> rscale(d.stars))
                              .attr('fill', d=>forkScale(d.forks))
                              .call(drag_handler);

    nodes.append('text').text(node => node.name).attr('dy', 5).attr('fill', 'black');

    // para seleccionar nodos vecinos
    var linkedByIndex = {};
    dataset.links.forEach(function(d) {
          linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });

    function neighboring(a, b) {
      return linkedByIndex[a.index + "," + b.index];
    }
    console.log(linkedByIndex);
    nodes.on('mouseover',(d, i, node) => {
          // d3.select(nodes[i])
          console.log(d);

            d3.select(nodes[i]).style("opacity", function(o) {
              return neighboring(d, o) ? 1 : 0;
              });

            d3.selectAll('circle')
            .filter(':not(:hover)')
            .style('fill-opacity', 0.3)
            .style('');

            divTooltip.transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("position", "absolute");

            divTooltip.html(d.name + "<br/>"
                          + "<b>Stars: </b>"
                          + d.stars + "<br/>" + "<b>Forks: </b>"
                          +d.forks)

            .style('font-size', '20px')
            .style("left", 1100  + "px")
            .style("top", 100 +   "px");
            })

          .on('mouseout', (d, i, nodes) => {
              d3.select(nodes[i])
                .style('stroke-width', d=>forkScale(d.forks));

                divTooltip.transition()
                .duration(500)
                .style("opacity", 0);

                d3.selectAll('circle')
                .style('fill-opacity', 1);
          });

    function ticked() {
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
});


// Helper functions
const linkColor = link_type => {
  if (link_type){
    return 'black';
  }
  else {
    return '#bdbdbd';
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
