import * as d3 from "d3";
import { responsive } from './helper';

import '../sass/gender.scss';

const episodeKey = {
  "3w-0m": "3 women/0 men",
  "2w-1m": "2 women/1 man",
  "2m-1w": "2 men/1 woman",
  "3m-0w": "3 men/0 women"
};

const promises = [
  d3.csv('../data/gender-by-series.csv'),
  d3.csv('../data/gender-by-episode.csv')
];

Promise.all(promises).then(renderEverything);

function renderEverything(results) {
  createCharts("series", "gender-by-series-chart", results[0][0]);
  createCharts("episode", "gender-by-episode-chart", results[1][0]);
}

function createCharts(type, chartDiv, data) {
  const width = 250,
        height = 250,
        margin = 0;

  const radius = Math.min(width, height) / 2 - margin;

  const svg = d3.select(`#${chartDiv}`)
    .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(responsive)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie()
    .sort(null)
    .value(d => d.value);

  const data_ready = pie(d3.entries(data));

  const arc = d3.arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 0.8);

  const outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);
  
  let total = data_ready.reduce((acc, val) => acc + +val.data.value, 0);
  data_ready.forEach(val => {
    val.data.perc = (+val.data.value/total*100).toFixed(1);
  });

  svg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append("g")
      .attr('class', (d, i) => `${chartDiv}-${i}`)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
    .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7);

  const legend = d3.select(`#${chartDiv}`)
    .append("div")
      .attr("class", "legend-container");
  
  legend.selectAll(".legend-text")
    .data(data_ready)
    .enter().append("div")
      .attr("class", (d, i) => `legend-text ${chartDiv}-legend-text ${chartDiv}-legend-text-${i}`)
      .style("color", (d, i) => {
        return color(i);
      })
      .text(d => {
        return `${type === "episode" ? episodeKey[d.data.key] : d.data.key}`;
      })
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  
  function handleMouseOver(d, i) {
    let g = d3.select(`.${chartDiv}-${i}`)
      .style("fill", "black")
      .append("g")
        .attr("class", "text-group");
  
    g.append("text")
      .attr("class", "name-text")
      .text(`${d.data.key.replace('-', '/')}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.2em')
      .style("fill", d => color(i));

    g.append("text")
      .attr("class", "value-text")
      .text(`${(+d.data.value).toLocaleString()} (${d.data.perc}%)`)
      .attr('text-anchor', 'middle')
      .attr('dy', '.6em')
      .style("fill", d => color(i));

    d3.selectAll(`.${chartDiv}-legend-text`).style("opacity", 0.2);
    d3.select(`.${chartDiv}-legend-text-${i}`).style("opacity", 1);

    d3.select(`.${chartDiv}-${i}`).select('path')
      .style("fill", "black");
  }

  function handleMouseOut(d, i) {
    d3.select(`.${chartDiv}-${i}`)
      .style("fill", color(i))
      .select(".text-group").remove();

    d3.selectAll(`.${chartDiv}-legend-text`).style("opacity", 1);
    d3.select(`.${chartDiv}-${i}`).select('path')
      .style("fill", color(i));
  }

}
