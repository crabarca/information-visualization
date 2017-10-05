// Este código se baso en el código expuesto en el siguiente link
// https://bl.ocks.org/Bl3f/cdb5ad854b376765fa99

const itemSize = 22;
const cellSize = itemSize - 1;

const WIDTH = 800;
const HEIGHT = 500;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };
const PADDING = 30;
const MAX_RADIUS = 40;

const width = WIDTH - MARGIN.right - MARGIN.left;
const height = HEIGHT - MARGIN.top - MARGIN.bottom;

const FILEPATH = 'datasets/heat_dataset.csv';

const continents = ['Asia', 'Europe', 'América', 'Africa', 'Oceanía']
const religions = ['Cristianismo', 'Islamismo', 'Hinduismo', 'Sin religion', 'Sincretismo', 'Budismo', 'Animismo', 'Sintoismo', 'Otra', 'Sijismo']

const container = d3.select('#container')
    .append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .append('g')
    .attr('transform',
    `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);


d3.csv(FILEPATH, dataset => {
    var dataCells = []
    var tmp = dataset.map(row => {
        var region = row.region;
        for (col in row) {
            var newCell = {};
            if (col === 'region' || col == 'pop') {
                continue;
            }
            newCell.value = row[col];
            newCell.region = region;
            newCell.religion = col;
            console.log(newCell);
            dataCells.push(newCell);
        }
    });

    var popData = dataset.map(row => {
        var newItem = {};
        newItem.region = row.region;
        newItem.pop = row.pop;
        return newItem
    });

    console.log(dataCells)
    console.log(popData)


    var x_elements = d3.set(dataCells.map(function (item) { return item.religion; })).values(),
        y_elements = d3.set(dataCells.map(function (item) { return item.region; })).values();

    console.log(x_elements, y_elements);

    var xScale = d3.scaleOrdinal()
        .domain(x_elements)
        .range([0, x_elements.length * itemSize]);

    var axisBottom = d3.axisBottom()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        });

    var yScale = d3.scaleOrdinal()
        .domain(y_elements)
        .range([0, y_elements.length * itemSize]);

    var axisLeft = d3.axisLeft()
        .scale(yScale)
        .tickFormat(function (d) {
            return d;
        });

    var colorScale = d3.scaleLinear()
        .domain([0.85, 1])
        .range(["#2980B9", "#E67E22", "#27AE60", "#27AE60"]);

    console.log(dataCells)

    container.selectAll('rect')
        .data(dataCells)
        .enter()
        .append('rect')
          .attr('class', 'cell')
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('y', d => yScale(d.region))
          .attr('x', d => xScale(d.religion))
          .attr('fill', d => colorScale(d.value));

  const yAxis.append("g")
        .attr("class", "y axis")
        .call(axisLeft)
        .selectAll('text')
        .attr('font-weight', 'normal');

    con.append("g")
        .attr("class", "x axis")
        .call(axisTop)
        .selectAll('text')
        .attr('font-weight', 'normal')
        .style("text-anchor", "start")
        .attr("dx", ".8em")
        .attr("dy", ".5em")
        .attr("transform", function (d) {
            return "rotate(-65)";
        });
});
