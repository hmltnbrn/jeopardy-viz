import * as d3 from "d3";
import { responsive } from './helper';

import '../sass/gender.scss';

d3.csv("../data/gender-by-topics.csv").then(data => {
  const keys = ['Correct', 'Incorrect'];
  const margin = { top: 10, right: 20, bottom: 30, left: 30 };
  const width = 650 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#gender-by-topics')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsive)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .rangeRound([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal()
    .range(d3.schemeCategory10)
    .domain(keys);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("class", "x-axis");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("class", "y-axis");

  data.forEach(d => {
    d.bar = [
      { Gender: 'Men', Correct: d.male_rights, Incorrect: d.male_wrongs, total: +d.male_rights + +d.male_wrongs },
      { Gender: 'Women', Correct: d.female_rights, Incorrect: d.female_wrongs, total: +d.female_rights + +d.female_wrongs }
    ];
    return d;
  });

  const legend = d3.select('#gender-by-topics')
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

  const options = d3.select("#topic-selector").selectAll("option")
    .data(data.map(d => d.topic));

  options
    .enter()
    .append("option")
      .text(d => d)
      .attr("value", d => d);

  document.getElementById("topic-selector").addEventListener("change", function(e) {
    if(e.target.value !== 'default') {
      createBar(data.filter(d => d.topic === e.target.value)[0], 750);
    }
  });

  createBar(data[0], 0);

  function createBar(data, speed) {
    d3.select('.gender-by-topics-title').html(data.topic)
    d3.select('.chi-square').html(data.chi_state);
    d3.select('.critical-value').html(data.critical);
    d3.select('.p-value').html(data.p_value);

    if(+data.chi_state >= +data.critical) {
      d3.select('.chi-significance').html('Significant').style('color', '#4caf50');
    }
    else {
      d3.select('.chi-significance').html('Insignificant').style('color', '#f44336');
    }

    y.domain([0, d3.max(data.bar, d => d3.sum(keys, k => +d[k]))]).nice();

    svg.selectAll(".y-axis").transition().duration(speed)
      .call(d3.axisLeft(y).ticks(null, "s"));

    x.domain(data.bar.map(d => d.Gender));

    svg.selectAll(".x-axis").transition().duration(speed)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    const group = svg.selectAll("g.layer")
      .data(d3.stack().keys(keys)(data.bar), d => d.key);

    group.exit().remove();

    group.enter().append("g")
      .classed("layer", true)
      .attr("fill", d => color(d.key));

    const bars = svg.selectAll("g.layer").selectAll("rect")
      .data(d => d, e => e.data.Gender);

    bars.exit().remove();

    bars.enter().append("rect")
      .attr("width", x.bandwidth())
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .merge(bars)
      .transition().duration(speed)
      .attr('class', (d, i) => `rect-topic rect-topic-${d.data.Gender}-${d[0]}`)
      .attr("x", d => x(d.data.Gender))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]));

    const text = svg.selectAll(".desc-topic-text")
      .data(data.bar, d => d.Gender);

    text.exit().remove();

    text.enter().append("text")
      .attr("class", d => `desc-topic-text ${d.Gender}-topic-text`)
      .attr("text-anchor", "middle")
      .merge(text)
      .transition().duration(speed)
      .attr("x", d => x(d.Gender) + x.bandwidth() / 2)
      .attr("y", d => y(d.total) - 5)
      .text(d => d.total.toLocaleString());

    function handleMouseOver(d) {
      let mouseTotal = d[1] - d[0];
      d3.selectAll('.rect-topic')
        .transition().duration(200)
        .style("opacity", 0.2);
      d3.select(`.rect-topic-${d.data.Gender}-${d[0]}`)
        .transition().duration(200)
        .style("opacity", 1);
      d3.selectAll('.desc-topic-text')
        .transition().duration(200)
        .style("opacity", 0.2);
      d3.select(`.${d.data.Gender}-topic-text`)
        .transition().duration(200)
        .style("opacity", 1)
        .text(`${mouseTotal.toLocaleString()} (${(mouseTotal/d.data.total*100).toFixed(1)}%)`);
    }

    function handleMouseOut(d) {
      d3.selectAll('.rect-topic')
        .transition().duration(200)
        .style("opacity", 1);
      d3.select(`.${d.data.Gender}-topic-text`)
        .transition().duration(200)
        .text(d.data.total.toLocaleString());
      d3.selectAll('.desc-topic-text')
        .transition().duration(200)
        .style("opacity", 1);
    }
  }
});
