import * as d3 from "d3";
import * as topojson from "topojson";
import { responsive } from './helper';

import '../sass/states.scss';

const toolDiv = d3.select("body")
  .append("div")
    .attr("class", "state-tooltip")
    .style("opacity", 0);

const margin = { top: 10, right: 20, bottom: 30, left: 30 };

const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select('#state-chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .call(responsive);

const map = d3.map();
const stateNames = d3.map();

const path = d3.geoPath();

const color = d3.scaleSequential()
  .interpolator(d3.interpolateBlues)
  .domain([0, 100]);

const xScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0, width/2]);

const g = svg.append("g")
  .attr("class", "key")
  .attr("transform", `translate(${width/2}, 10)`);

g.selectAll("rect")
  .data(Array.from(Array(100).keys()))
  .enter()
    .append("rect")
      .attr("x", d => Math.floor(xScale(d)))
      .attr("y", 0)
      .attr("height", 10)
      .attr("width", d => {
        if (d == 100) {
          return 6;
        }
        return Math.floor(xScale(d+1)) - Math.floor(xScale(d)) + 1;
      })
      .attr("fill", d => color(d));

g.append("text")
    .attr("class", "caption")
    .attr("x", width/4)
    .attr("y", 0)
    .attr("fill", "#000000")
    .text("Proportion of population that has been a contestant on Jeopardy");

g.call(d3.axisBottom(xScale)
    .tickSize(15)
    .tickFormat(d => { return d === 0 ? 'Lowest' : 'Highest'; })
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

const promises = [
  d3.json("https://d3js.org/us-10m.v1.json"),
  d3.tsv("../data/us-state-names.tsv", function(d) {
    stateNames.set(d.id, d.name);
  }),
  d3.csv("../data/us-state-proportions.csv", function(d) { 
    map.set(d.name, { proportion: +d.proportion, percentage: +d.percentage, population: d.population, contestants: d.contestants }); 
  })
]

Promise.all(promises).then(createMap)

function createMap([us]) {
  svg.append("g")
    .attr("class", "state-container")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("fill", d => {
        let sn = stateNames.get(+d.id);
        d.percentage = map.get(sn)["percentage"] || 0;
        d.proportion = map.get(sn)["proportion"] || 0;
        d.population = map.get(sn)["population"] || 0;
        d.contestants = map.get(sn)["contestants"] || 0;
        let col = color(d.percentage); 
        if (col) {
          return col;
        } else {
          return '#ffffff';
        }
      })
      .attr("d", path)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

  svg.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("class", "states")
    .attr("d", path);
  
  const dc = svg.append("g")
    .attr("transform", `translate(${width - 40}, ${height - 150})`)
    .attr("class", "dc-group");
  
  dc.append("text")
    .attr("class","aca-dc-text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text("DC");
  
  d3.select(".dc-group").selectAll("rect")
    .data([map.get("District of Columbia")])
    .enter()
      .append("rect")
      .attr("class", "aca-dc")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => {
        let col = color(d.percentage); 
        if (col) {
          return col;
        } else {
          return '#ffffff';
        }
      })
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  
  function handleMouseOver(d) {
    toolDiv.transition()
      .duration(200)
      .style("opacity", .9);
    toolDiv.html(`
      <h2>${stateNames.get(+d.id) || "District of Columbia"}</h2>
      <h3>2019 Population</h3>
      <p>${d.population}</p>
      <h3>Contestants</h3>
      <p>${d.contestants}</p>
      <h3>Proportion</h3>
      <p>1 contestant / ${Math.round(d.proportion).toLocaleString()} people</p>
    `)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
  }

  function handleMouseOut() {
    toolDiv.transition()
      .duration(500)
      .style("opacity", 0);
  }
}
