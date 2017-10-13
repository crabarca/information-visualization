// referencia del script: https://bl.ocks.org/greencracker/e08d5e789737e91d6e73d7dcc34969bf
// Adaptado por Cristobal Abarca

const WIDTH3 = 960;
const HEIGHT3 = 680;
const MARGIN3 = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };
const PADDING3 = 30;
const MAX_RADIUS3 = 50;

const width3 = WIDTH3 - MARGIN3.RIGHT - MARGIN3.LEFT;
const height3 = HEIGHT3 - MARGIN3.TOP - MARGIN3.BOTTOM;

const colors3 = d3.schemeSet1;

const container3 = d3.select(".container3").append("svg")
    .attr("width", width3 + MARGIN3.LEFT + MARGIN3.RIGHT)
    .attr("height", height3 + MARGIN3.TOP + MARGIN3.BOTTOM)
    .append("g")
    .attr("transform", "translate(" + MARGIN3.LEFT + "," + MARGIN3.TOP + ")");


var parseDate = d3.timeParse('%Y');

var formatSi = d3.format(".3s");

var formatNumber = d3.format(".1f"),
    formatBillion = function(x) { return formatNumber(x / 1e6); };

var xScale3 = d3.scaleTime()
    .range([PADDING3, width3 - PADDING3]);

var yScale3 = d3.scaleLinear()
    .range([height3 - PADDING3, PADDING3]);

var color3 = d3.scaleOrdinal()
              .range(colors3);

var xAxis3 = d3.axisBottom()
    .scale(xScale3);

var yAxis3 = d3.axisLeft()
    .scale(yScale3)
    .tickFormat(formatBillion);

var area = d3.area()
    .x(function(d) {
      return xScale3(d.data.year); })
    .y0(function(d) { return yScale3(d[0]); })
    .y1(function(d) { return yScale3(d[1]); });

var stack = d3.stack()

const updateStacked = (dataset, value) => {
  d3.csv(dataset, function(d) {
    return {
      year : parseDate(d['year']),
      region : d.region,
      pop : +d.pop - +d.chrstgen - +d.islmgen - +d.hindgen - +d.nonrelig - +d.syncgen,
      chrstgen : +d.chrstgen,
      islmgen : +d.islmgen,
      hindgen : +d.hindgen,
      nonrelig : +d.nonrelig,
      syncgen : +d.syncgen
    };
  }, function(data) {
    console.log(value);
    console.log(data.region);
    var filteredData = data.filter(d => {
      console.log(d.region);
      if (d['region'] == value){
        return d
      };
      }
    )
    console.log(filteredData);

    var keys = ['islmgen','chrstgen', 'hindgen', 'nonrelig', 'syncgen', 'pop']

    color3.domain(keys);

    // Max population
    var maxPop = d3.max(filteredData, function(d){
      var vals = d3.keys(d).map(function(key){ return key !== 'year' ? d[key] : 0 });
      return d3.sum(vals);
    });

    // Set domains for axes
    xScale3.domain(d3.extent(filteredData, function(d) { return d.year; }));
    yScale3.domain([0, maxPop])

    stack.keys(keys);

    stack.order(d3.stackOrderNone);
    stack.offset(d3.stackOffsetNone);

    console.log(stack(filteredData));
    keyTraductions = {'chrstgen' : 'Cristianos', 'islmgen': 'Musulmanes',
                      'hindgen' : 'Hinduistas', 'nonrelig': 'No religiosos',
                      'syncgen': 'Sincreticos', 'pop': 'Total'};

    d3.selectAll('.chart3').remove()
    d3.selectAll('.area3').remove()
    d3.selectAll('.legend-x').remove()
    d3.selectAll('.legend-y').remove()
    d3.selectAll('.x-axis3').remove()
    d3.selectAll('.y-axis3').remove()
    
    var chart3 = container3.selectAll('.chart3')
                            .data(stack(filteredData))
                            .enter()
                            .append('g')
                            .attr('class', d => { return 'chart ' + d.key; })
                            .attr('fill-opacity', 0.9);

                            chart3.append('path')
                            .attr('class', 'area3')
                            .attr('d', area)
                            .style('fill', function(d) { return color3(d.key); });

                            chart3.append('text')
                            .datum( d=> {return d; })
                            .attr('transform', d => { return 'translate(' + (xScale3(data[13].year) - 20) + ',' + (yScale3(d[13][1]) - 10) + ')'; })
                            .attr('x', -6)
                            .attr('dy', '.35em')
                            .attr('class', 'legend-x')
                            .style("text-anchor", "start")
                            .text( d=> { return keyTraductions[d.key]; })
                            .attr('fill-opacity', 1);

                            container3.append('g')
                            .attr('class', 'x-axis3')
                            .attr('transform', 'translate(0,' + height3 + ')')
                            .call(xAxis3);

                            container3.append('g')
                            .attr('class', 'y-axis3')
                            .call(yAxis3);

                            container3.append("text")
                            .text("Millions of People")
                            .attr("x", 0-margin.left)
                            .atrr('class', 'legend-y')


                          })};

const filePathStacked = 'datasets/stacked_dataset.csv'
var value = undefined;

updateStacked(filePathStacked, 'Global')

d3.select('#stacked-selector-button').on('click', () => {
    var value = d3.select(`#stacked-selector`).property('value');
    var valueTraductor = {'America': 'Am�rica', 'Oceania': 'Ocean�a', 'Africa': '�frica'}
    if (value === 'America' || value === 'Africa' || value == 'Oceania'){
      value = valueTraductor[value];
    }
    updateStacked(filePathStacked, value);
    });
