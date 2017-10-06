// Código obtenido de :
// http://bl.ocks.org/ganezasan/dfe585847d65d0742ca7d0d1913d50e1
// Adaptado por para esta tarea por:
// Cristóbal Abarca


const margin = { top: 50, right: 30, bottom: 100, left: 30 },
          width = 960 - margin.left - margin.right,
          height = 430 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 24),
          legendElementWidth = gridSize*2,
          buckets = 10,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
          colors2 = d3.schemeYlOrRd[6]
          days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
          times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

          regions = ['Asia', 'Europe', 'América', 'Africa', 'Oceanía']
          religions = ['Cristianismo', 'Islamismo', 'Hinduismo', 'Sin religion', 'Sincretismo', 'Budismo', 'Animismo', 'Sintoismo', 'Otra', 'Sijismo']

          datasets = ["datasets/heat_dataset.csv"];

      const container = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const regionLabels = container.selectAll(".regionLabel")
          .data(regions)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", (d, i) => i * (gridSize + 5))
            .style("text-anchor", "end")
            .attr("transform", "translate(20," + gridSize / 1.5 + ")")
            .attr("class", (d, i) => ((i >= 0 && i <= 4) ? "regionLabel mono axis axis-workweek" : "regionLabel mono axis"));

      const religionLabels = container.selectAll(".religionLabel")
          .data(religions)
          .enter().append("text")
            .text((d) => d)
            .attr("x", (d, i) => i * 100  )
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", (d, i) => ((i >= 7 && i <= 16) ? "religionLabel mono axis axis-worktime" : "religionLabel mono axis"));

      const heatmapChart = function(csvFile) {
           d3.csv(csvFile, dataset => {
             var dataCells = []

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
            console.log(dataCells);
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

              var x_elements = d3.set(dataCells.map(cell => {return cell.religion;})).values(),
                  y_elements = d3.set(dataCells.map(cell => {return cell.region;})).values();

              var xScale = d3.scaleOrdinal()
                             .domain(x_elements)
                             .range(d3.range(0, 450, gridSize + 5))

                  yScale = d3.scaleOrdinal()
                             .domain(y_elements)
                             .range(d3.range(0, 200, gridSize + 5));

              const colorScale = d3.scaleQuantile()
               .domain([0, buckets - 1, d3.max(dataCells, (d) => d.value)])
               .range(colors);

              const popToColor = d3.scaleLinear()
                                   .domain(d3.extent(dataCells, d => parseInt(d.value)))
                                   .range(colors2);
                                   console.log(colors2);

              const cards = container.selectAll(".hour")
                 .data(dataCells);

             cards.append("title");

             cards.enter()
                  .append("rect")
                    .attr("x", (d) => xScale(d.religion))
                    .attr("y", (d) => yScale(d.region))
                    .attr("class", "hour bordered")
                    .attr("width", gridSize)
                    .attr("height", gridSize)
                    .style("fill", d => popToColor(d))
                  // .merge(cards)
                    // .transition()
                    // .duration(1000)
                    // .style("fill", (d) => colorScale(d.value))
                  .append("title")
                    .text(d => Math.round(+d.value * getPop(d.region)))
             cards.exit().remove();

             const legend = container.selectAll(".legend")
                 .data(colors2);

             const legend_g = legend.enter().append("g")
                 .attr("class", "legend");

             legend_g.append("rect")
               .attr("x", (d, i) => legendElementWidth * i)
               .attr("y", height)
               .attr("width", legendElementWidth)
               .attr("height", gridSize / 2)
               .style("fill", (d, i) => colors2[i]);

             legend_g.append("text")
               .attr("class", "mono")
               .text((d) => "≥ " + Math.round(d))
               .attr("x", (d, i) => legendElementWidth * i)
               .attr("y", height + gridSize);

               legend.exit().remove();
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
