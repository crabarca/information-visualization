// Script basado en la ayudantía 8 del curso IIC2026-2017/1
// Adaptado por Cristobal Abarca para la tarea 2

const WIDTH2 = 960;
const HEIGHT2 = 680;
const MARGIN2 = { TOP: 40, BOTTOM: 100, LEFT: 50, RIGHT: 50 };
const PADDING2 = 30;
const MAX_RADIUS2 = 50;

const width2 = WIDTH2 - MARGIN2.RIGHT - MARGIN2.LEFT;
const height2 = HEIGHT2 - MARGIN2.TOP - MARGIN2.BOTTOM;

const colorsCont = d3.schemePRGn[5];
const colorsRelig = d3.schemeOrRd[9];

var buttonPressed = 0;

const FILEPATH2 = 'datasets/bubble_dataset.csv';

const container2 = d3.select('.container2')
                    .append('svg')
                      .attr('width', WIDTH2)
                      .attr('height', HEIGHT2)
                    .append('g')
                      .attr('transform',
                            `translate(${MARGIN2.LEFT}, ${MARGIN2.TOP})`);

const chart = container2.append('g').attr('id', 'chart');


chart.append('rect')
           .attr('width', width2)
           .attr('height', height2)
           .attr('fill', '#efe6e6');


const zoom = d3.zoom()
               .scaleExtent([1, 3])
               .translateExtent([[0, -100], [WIDTH2, HEIGHT2 - 100]])
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
const rscale = d3.scalePow().exponent(0.25).range([0, MAX_RADIUS2]);

const axisBottom = d3.axisBottom(xscale).tickPadding(10);
const axisLeft = d3.axisLeft(yscale).tickPadding(10);

console.log(colorsRelig);
const continentToColor2 = d3.scaleOrdinal().range(colorsCont);
const religToColor = d3.scaleOrdinal().range(colorsRelig);


const xAxis = container2.append('g')
                   .attr("class", "axis axis--x")
                   .attr('transform', `translate(0, ${height2})`);

const yAxis = container2.append('g').attr("class", "axis axis--y");



const render = function(csvFile) {
  d3.csv(csvFile, dataset => {
    // Manipulación de los datos
    var dataBubbles = [];
    dataset.map(r => {
      dataBubbles.push({
        country: r.country,
        hdi: +r.hdi,
        gini: +r.gini,
        continent: r.continent,
        pop: +r.pop,
        religion: r.religion
      })
    });
    // Sort del array, para que los circulos más grandes se dibujen primero
    dataBubbles.sort((a, b) => {
      return parseFloat(+a.pop) < parseFloat(+b.pop)
    });

    // Escalas de los ejes y radios
    xscale.domain([0, d3.max(dataBubbles, d => +d.gini)]);
    yscale.domain([0, d3.max(dataBubbles, d => +d.hdi)]);
    rscale.domain([0, d3.max(dataBubbles, d => d.pop)]);

   // Escalas de color
   continentToColor2.domain(d3.set(dataBubbles.map(country => {return country.continent;})).values());
   religToColor.domain(d3.set(dataBubbles.map(country => {return country.religion;})).values());

   xAxis.call(axisBottom);
   yAxis.call(axisLeft);

   const updatingCircles = chart.selectAll('circle')
        .data(dataset, d => `${d.country} ${d.continent}`);

   const enteringCircles = updatingCircles.enter().append('circle')
                                .attr('cx', d => xscale(d.gini))
                                .attr('cy', d => yscale(d.hdi))
                                .attr('fill', d => continentToColor2(d.continent))
                                .style('fill-opacity', 0.8)
                                .style('stroke', '#333')
                                .style('stroke-width', '0.4px');

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
                    .style('stroke-width', '3px');

                  d3.selectAll('circle')
                    .filter(':not(:hover)')
                    .style('fill-opacity', 0.3);
              })
              .on('mouseout', (d, i, nodes) => {
                  d3.select(nodes[i])
                    .style('stroke-width', '0.5px');

                  d3.selectAll('circle')
                    .style('fill-opacity', 1);
                })
               .append('title')
               .text(d => `${d.country} ${d.continent} (${d.pop})`);

    d3.select('#go-button').on('click', () =>{
                          if (buttonPressed === 0){
                            d3.selectAll('circle')
                              .attr('fill', d => religToColor(d.religion));
                              buttonPressed = 1;
                            d3.select('#go-button')
                              .text('Mostrar continentes')
                          } else {
                            d3.selectAll('circle')
                              .attr('fill', d => continentToColor2(d.continent));
                              buttonPressed = 0;
                            d3.select('#go-button')
                              .text('Mostrar religiones')
                          }

                        });
    updatingCircles.exit()
        .transition()
        .duration(2000)
        .attr('r', 0)
        .remove();

    //  Simbologia de los colores
     const legend2 = container2.selectAll(".legend")
          .data(colorsCont);
          var contLegend = d3.set(dataBubbles.map(country => {return country.continent;})).values()

     const legend_g2 = legend2.enter().append("g")
          .attr("class", "legend")
          .attr("transform", `translate(200, 50)`);

     legend_g2.append("rect")
        .attr("x", (d, i) => 80 * i)
        .attr("y", height2)
        .attr("width", 70)
        .attr("height", 20 / 2)
        .style("fill", (d, i) => colorsCont[i]);

     legend_g2.append("text")
        .attr("class", "mono")
        .text((d, i) => contLegend[i])
        .attr("x", (d, i) => 80 * i)
        .attr("y", height2 + 30);

    legend2.exit().remove();
  })};

render(FILEPATH2)
