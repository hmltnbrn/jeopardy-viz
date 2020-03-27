import * as d3 from "d3";
import { responsive } from './helper';

import '../sass/gender.scss';

const toolDiv = d3.select("body")
  .append("div")
    .attr("class", "gender-tooltip")
    .style("opacity", 0);

const episodeKey = {
  "3w-0m": "3 women/0 men",
  "2w-1m": "2 women/1 man",
  "1w-2m": "2 men/1 woman",
  "0w-3m": "3 men/0 women"
};

const promises = [
  d3.csv('../data/gender-by-series.csv'),
  d3.csv('../data/gender-by-episode.csv')
];

Promise.all(promises).then(renderEverything);

function renderEverything(results) {
  createCharts("series", "#gender-by-series", results[0][0]);
  createCharts("episode", "#gender-by-episode", results[1][0]);
}

function createCharts(type, chartDiv, data) {
  const width = 450,
        height = 450,
        margin = 40;

  const radius = Math.min(width, height) / 2 - margin;

  const svg = d3.select(chartDiv)
    .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(responsive)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  const color = d3.scaleOrdinal()
    .domain(d3.keys(data))
    .range(d3.schemeDark2);

  const pie = d3.pie()
    .sort(null)
    .value(function(d) {return d.value; });

  const data_ready = pie(d3.entries(data));

  const arc = d3.arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 0.8);

  const outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  svg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);
    // .on("mouseover", handleMouseOver)
    // .on("mouseout", handleMouseOut);

  const legend = d3.select(chartDiv)
    .append("div")
      .attr("class", "legend-container");
  
  legend.selectAll(".legend-text")
    .data(data_ready)
    .enter().append("div")
      .attr("class", (d, i) => `legend-text legend-text-${i}`)
      .style("color", d => {
        return color(d.data.key);
      })
      .text(d => {
        return `${type === "episode" ? episodeKey[d.data.key] : d.data.key} (${d.data.value})`;
      });
  
  function handleMouseOver(d) {
    toolDiv.transition()
      .duration(200)
      .style("opacity", .9);
    toolDiv.html(`<h2>${type === "episode" ? episodeKey[d.data.key] : d.data.key}</h2><p>${d.data.value} ${type === "episode" ? "occurences" : ""}</p>`)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
  }

  function handleMouseOut() {
    toolDiv.transition()
      .duration(500)
      .style("opacity", 0);
  }

}
