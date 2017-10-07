
const WIDTH2 = 720;
const HEIGHT2 = 680;
const MARGIN2 = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };
const PADDING2 = 30;
const MAX_RADIUS2 = 40;

const width2 = WIDTH2 - MARGIN2.RIGHT - MARGIN2.LEFT;
const height2 = HEIGHT2 - MARGIN2.TOP - MARGIN2.BOTTOM;

const FILEPATH2 = 'datasets/bubble_dataset.csv';

const container2 = d3.select('.container2')
                    .append('svg')
                      .attr('width', WIDTH2)
                      .attr('height', HEIGHT2)
                    .append('g')
                      .attr('transform',
                            `translate(${MARGIN2.LEFT}, ${MARGIN2.TOP})`);

const chart = container2.append('g').attr('id', 'chart');

container2.append('clipPath')
       .attr('id', 'clip')
       .append('rect')
       .attr('width', width2)
       .attr('height', height2);
    //    .attr('transform', `translate(30, 30)`);

chart.append('rect')
        //    .attr('id', 'chart')
           .attr('width', width2)
           .attr('height', height2)
           .attr('fill', '#07B');

// Primera alternativa de escala
// =============================
const ageToColor = age => {
   if (age < 35) {
       return '#00C853';
   } else if (age < 45) {
       return '#FF4081';
   } else if (age < 55) {
       return '#2979FF';
   } else {
       return '#FFD600';
   }
};


const zoom = d3.zoom()
               .scaleExtent([1, 100])
               .translateExtent([[300, -200], [WIDTH2+200, HEIGHT2]])
               .on('zoom', zoomed);
container2.call(zoom);

let currentTransform = d3.zoomIdentity;

function zoomed() {
    // console.log(d3.event.transform);
    currentTransform = d3.event.transform;
    const xscale2 = currentTransform.rescaleX(xscale);
    const yscale2 = currentTransform.rescaleY(yscale);

    chart.selectAll('circle').attr("transform", currentTransform);
    container2.select(".axis--x").call(axisBottom.scale(xscale2));
    container2.select(".axis--y").call(axisLeft.scale(yscale2));
}

const xscale = d3.scaleLinear().range([PADDING2, width2 - PADDING2]);
const yscale = d3.scaleLinear().range([height2 - PADDING2, PADDING2]);
const rscale = d3.scalePow().exponent(0.5).range([0, MAX_RADIUS2]);

const axisBottom = d3.axisBottom(xscale).tickPadding(10);
const axisLeft = d3.axisLeft(yscale).tickPadding(10);

const ageToColor2 = d3.scaleLinear().range(['#FFF', '#F44336']);

const xAxis = container2.append('g')
                   .attr("class", "axis axis--x")
                   .attr('transform', `translate(0, ${height})`);

const yAxis = container2.append('g').attr("class", "axis axis--y");

const render = csvFile => {
  d3.csv(csvFile, dataset => {
    xscale.domain([0, d3.max(dataset, d => d.gini)]);
    yscale.domain([0, d3.max(dataset, d => d.hdi)]);
    rscale.domain([0, d3.max(dataset, d => d.pop)]);
    console.log(d3.max(dataset, d => d.hdi));
   // Segunda alternativa de escala
   // =============================
   ageToColor2.domain(d3.extent(dataset, d => d.age))

   xAxis.call(axisBottom);
   yAxis.call(axisLeft);

   const updatingCircles = chart.selectAll('circle')
        .data(dataset, d => `${d.country} ${d.continent}`);
   const enteringCircles = updatingCircles.enter().append('circle')
                                .attr('cx', d => xscale(d.gini))
                                .attr('cy', d => yscale(d.hdi))
                                .attr('fill', d => '#FFF');

    updatingCircles.merge(enteringCircles)
        .attr('transform', currentTransform)
        .transition()
        .duration(2000)
        .attr('r', d => rscale(d.pop))
        .attr('cx', d => xscale(d.gini))
        .attr('cy', d => yscale(d.hdi));

    enteringCircles.on('mouseover', (d, i, nodes) => {
                  d3.select(nodes[i])
                    .style('stroke', '#333')
                    .style('stroke-width', '5px');

                  d3.selectAll('circle')
                    .filter(':not(:hover)')
                    .style('fill-opacity', 0.5);
              })
              .on('mouseout', (d, i, nodes) => {
                  d3.select(nodes[i])
                    .style('stroke-width', '0px');

                  d3.selectAll('circle')
                    .style('fill-opacity', 1);
                })
               .append('title')
               .text(d => `${d.country} ${d.continent} (${d.pop})`);

    updatingCircles.exit()
        .transition()
        .duration(2000)
        .attr('r', 0)
        .remove();
  })
};

const getValue = phase => +d3.select(`#${phase}-input`).property('value');

let dataset = undefined;
render(FILEPATH2)

d3.select('#go-button').on('click', () => {
    const [enter, update, exit] = ['enter', 'update', 'exit'].map(getValue);
    fetchData(dataset, {enter, update, exit}).get(newDataset => {
        dataset = newDataset;
        console.log(dataset);
        render(dataset)
    });
})
