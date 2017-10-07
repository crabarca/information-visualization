// Código obtenido de :
// http://bl.ocks.org/ganezasan/dfe585847d65d0742ca7d0d1913d50e1
// Adaptado por para esta tarea por:
// Cristóbal Abarca


const margin = { top: 50, right: 30, bottom: 100, left: 30 },
          width = 960 - margin.left - margin.right,
          height = 430 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 24),
          cellHeight = Math.floor(width / 21),
          cellWidth = Math.floor(width / 13) + 5,
          legendElementWidth = gridSize*2,
          buckets = 10,
          colors = d3.schemeGnBu[8]

          regions = ['Asia', 'Europe', 'América', 'Africa', 'Oceanía']
          religions = ['Cristianismo', 'Islamismo', 'Hinduismo', 'Sin religion', 'Sincretismo', 'Budismo', 'Animismo', 'Sintoismo', 'Otra', 'Sijismo']

          datasets = ["datasets/heat_dataset.csv"];

      const container = d3.select(".chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const heatmapChart = function(csvFile) {
           d3.csv(csvFile, dataset => {
            var dataCells = []
            // MANIPULACIÓN DE LOS DATOS
            var tmp = dataset.map(row => {
               var region = row.region;
               for (col in row) {
                   var newCell = {};
                   if (col === 'region' || col == 'pop') {
                       continue;
                   }
                   newCell.value = (row[col]);
                   newCell.region = region;
                   newCell.religion = col;
                   dataCells.push(newCell);
               }
            });

            var popData = dataset.map(row => {
                var newItem = {};
                newItem.region = row.region;
                newItem.pop = row.pop;
                return newItem
            });

            function getPop(region) {
              for (item in popData) {
                if (popData[item].region === region) {
                  return popData[item].pop
                  }
                }
              };

            // ESCALAS DE LOS EJES Y RECTANGULOS
            var x_elements = d3.set(dataCells.map(cell => {return cell.religion;})).values(),
                y_elements = d3.set(dataCells.map(cell => {return cell.region;})).values();

            var xScale = d3.scaleOrdinal()
                           .domain(x_elements)
                           .range(d3.range(0, 750, cellWidth + 2)),

                  yScale = d3.scaleOrdinal()
                             .domain(y_elements)
                             .range(d3.range(0, 200, cellHeight + 2));

            const colorScale = d3.scaleQuantile()
                                   .domain([0, buckets - 1, d3.max(dataCells, (d) => d.value)])
                                   .range(colors);

            const popToColor = d3.scaleQuantile()
                                  .domain(d3.extent(dataCells, d => +d.value))
                                  .range(colors);

            const axisTop = d3.axisTop(xScale).tickPadding(10),
                  axisLeft = d3.axisLeft(yScale).tickPadding(10);

            const cards = container.selectAll(".hour")
                .data(dataCells);

            cards.append("title");

            cards.enter()
                  .append("rect")
                    .attr("x", (d) => xScale(d.religion) + 50)
                    .attr("y", (d) => yScale(d.region))
                    .attr("class", "hour bordered")
                    .attr("width", cellWidth)
                    .attr("height", cellHeight )
                    .style("fill", d => popToColor(d.value))
                  .append("title")
                    .text(d => Math.round(+d.value * getPop(d.region)))
            cards.exit().remove();

            const legend = container.selectAll(".legend")
                 .data([0].concat(popToColor.quantiles()), (d) =>d);

            const legend_g = legend.enter().append("g")
                 .attr("class", "legend");

            legend_g.append("rect")
               .attr("x", (d, i) => legendElementWidth * i)
               .attr("y", height)
               .attr("width", legendElementWidth)
               .attr("height", gridSize / 2)
               .style("fill", (d, i) => colors[i]);

            legend_g.append("text")
               .attr("class", "mono")
               .text((d) => "≥ " + Math.round(d *100) + "%")
               .attr("x", (d, i) => legendElementWidth * i)
               .attr("y", height + gridSize);

            legend.exit().remove();

            const xAxis = container.append('g')
                    .attr('transform', `translate(85, -5)`)
                    .style('font-size', '9pt');

            const yAxis = container.append('g')
                          .attr('transform', `translate(40, 15)`)
                          .style('font-size', '9pt');
            xAxis.call(axisTop)
            yAxis.call(axisLeft)
      });
    };

    heatmapChart(datasets[0]);

    const datasetpicker = d3.select("#dataset-picker")
      .selectAll(".dataset-button")
      .data(datasets);

    datasetpicker.enter()
      .append("input")
      .attr("value", (d) => "Dataset " + d)
      .attr("type", "button")
      .attr("class", "dataset-button")
      .on("click", (d) => heatmapChart(d));
