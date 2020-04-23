import * as d3 from "d3";
import { responsive } from './helper';

import '../sass/gender.scss';

d3.csv("../data/gender-by-wins.csv").then(data => {
  const keys = data.columns.slice(1);
  const margin = { top: 10, right: 20, bottom: 30, left: 30 };
  const width = 650 - margin.left - margin.right;;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#gender-by-wins')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsive)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const y = d3.scaleLinear()
    .rangeRound([height - margin.bottom, margin.top])

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("class", "x-axis")

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("class", "y-axis")

  const color = d3.scaleOrdinal()
    .range(["steelblue", "darkorange"])
    .domain(keys);

  data.forEach(d => {
    d.total = d3.sum(keys, k => +d[k]);
    return d;
  })

  y.domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();

  svg.selectAll(".y-axis").call(d3.axisLeft(y).ticks(null, "s"));

  x.domain(data.map(d => d.Gender));

  svg.selectAll(".x-axis").call(d3.axisBottom(x).tickSizeOuter(0));

  const group = svg.selectAll("g.layer")
    .data(d3.stack().keys(keys)(data), d => d.key);

  group.exit().remove()

  group.enter().append("g")
    .classed("layer", true)
    .attr("fill", d => color(d.key));

  const bars = svg.selectAll("g.layer").selectAll("rect")
    .data(d => d, e => e.data.Gender);

  bars.exit().remove();

  bars.enter().append("rect")
    .attr('class', (d, i) => `rect-${d.data.Gender}-${d[0]}`)
    .attr("width", x.bandwidth())
    .merge(bars)
    .attr("x", d => x(d.data.Gender))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  const text = svg.selectAll(".desc-text")
    .data(data, d => d.Gender);

  text.exit().remove();

  text.enter().append("text")
    .attr("class", d => `desc-text ${d.Gender}-text`)
    .attr("text-anchor", "middle")
    .merge(text)
    .attr("x", d => x(d.Gender) + x.bandwidth() / 2)
    .attr("y", d => y(d.total) - 5)
    .text(d => d.total.toLocaleString());

  const legend = d3.select('#gender-by-wins')
    .append("div")
      .attr("class", "legend-container");
  
  legend.selectAll(".legend-text")
    .data(keys)
    .enter().append("div")
      .attr("class", (d, i) => `legend-text legend-text-${i}`)
      .style("color", d => {
        return color(d);
      })
      .text(d => {
        return d;
      });

  function handleMouseOver(d, i) {
    let mouseTotal = d[1] - d[0];
    d3.selectAll('rect').style("opacity", 0.2);
    d3.select(`.rect-${d.data.Gender}-${d[0]}`).style("opacity", 1);
    d3.selectAll('.desc-text').style("opacity", 0.2);
    d3.select(`.${d.data.Gender}-text`)
      .style("opacity", 1)
      .text(mouseTotal.toLocaleString());
  }

  function handleMouseOut(d) {
    d3.selectAll('rect').style("opacity", 1);
    d3.select(`.${d.data.Gender}-text`).text(d.data.total.toLocaleString());
    d3.selectAll('.desc-text').style("opacity", 1);
  }
});
