
const WIDTH = 1150;
const HEIGHT = 1000;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const FILEPATH = 'datasets/dataset.json';

const container = d3.select('#container1')
  .append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
  .append('g')
    .attr('transform',
        `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

const ticked = () => {
    container.selectAll('.node')
    .attr('transform', node => `translate(${node.x}, ${node.y})`);

    container.selectAll('line')
             .attr('x1', link => link.source.x)
             .attr('y1', link => link.source.y)
             .attr('x2', link => link.target.x)
             .attr('y2', link => link.target.y);
};

const simulation = d3.forceSimulation()
                     .force('center', d3.forceCenter(width/3, height/1.5))
                     .force('collision', d3.forceCollide(50))
                     .force('charge', d3.forceManyBody().strength(-300))
                     .force('link', d3.forceLink().id(node => node.name));

d3.json(FILEPATH, dataset => {
    console.log(dataset.nodes);
    simulation.nodes(dataset.nodes)
              .on('tick', ticked)
              .force('link')
              .links(dataset.links)
              .distance(20);

    container.selectAll('line')
             .data(dataset.links)
             .enter()
             .append('line')
             .attr('x1', link => link.source.x)
             .attr('y1', link => link.source.y)
             .attr('x2', link => link.target.x)
             .attr('y2', link => link.target.y);

    const nodes = container.selectAll('.node')
                           .data(dataset.nodes)
                           .enter()
                           .append('g')
                           .attr('class', 'node');

    nodes.append('circle').attr('r', 20);
    nodes.append('text').text(node => node.name).attr('dy', 5).attr('fill', 'red');
    nodes.attr('fill', 'black');
});
