import * as d3 from "d3";
import { responsive } from './helper';

import '../sass/topics.scss';

const margin = { top: 10, right: 20, bottom: 30, left: 30 };

const width = 400 - margin.left - margin.right;
const height = 200 - margin.top - margin.bottom;

const parseDate = d3.timeParse("%Y");

const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);
const color = d3.scaleOrdinal().range(d3.schemeCategory10);

const xAxis = d3.axisBottom().scale(xScale);
const yAxis = d3.axisLeft().scale(yScale);

const line = d3
  .line()
  .curve(d3.curveMonotoneX)
  .x(function(d) {
    return xScale(d.date);
  })
  .y(function(d) {
    return yScale(d.frequency);
  });

var clicked = false;

const svg = d3.select('#topic-line-chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .call(responsive)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

svg.on("click", () => {
  if(clicked) {
    d3.selectAll('.topic-line')
      .style("opacity", 0.2);
    clicked = false;
  }
});

d3.select('body')
  .on("click", () => {
    if(clicked) {
      d3.selectAll('.topic-line').style("opacity", 0.2);
      d3.selectAll('.legend-text').style("opacity", 1);
      clicked = false;
    }
  });

d3.csv("../data/topics.csv").then(data => {

  const topicData = d3.keys(data[0]).filter(key => {
    return key !== "date";
  });

  color.domain(topicData);

  data.forEach(d => {
    d.date = parseDate(d.date);
  });

  const frequencies = topicData.map(topic => {
    return {
      topic: topic,
      datapoints: data.map(d => {
        return { date: d.date, frequency: +d[topic] };
      })
    };
  });

  xScale.domain(
    d3.extent(data, d => {
      return d.date;
    })
  );

  yScale.domain(
    d3.extent(
      frequencies.map(point => point.datapoints.map(value => value.frequency)).flat()
    )
  );

  let topics = svg
    .selectAll(".topic")
    .data(frequencies)
    .enter().append("g")
      .attr("class", "topic");

  topics
    .append("path")
      .attr("class", (d, i) => `topic-line topic-line-${i}`)
      .attr("d", d => {
        return line(d.datapoints);
      })
      .style("stroke", d => {
        return color(d.topic);
      })
      .style("opacity", 0.2)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick);

  svg
    .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

  svg
    .append("g")
      .attr("class", "y axis")
      .call(yAxis);

  const legend = d3.select(".topic-modeling")
    .append("div")
      .attr("class", "legend-container");
  
  legend.selectAll(".legend-text")
    .data(frequencies)
    .enter().append("div")
      .attr("class", (d, i) => `legend-text legend-text-${i}`)
      .style("color", d => {
        return color(d.topic);
      })
      .text(d => d.topic)
      .on("mouseover", (d, i) => {
        if(!clicked) {
          d3.selectAll('.legend-text').style("opacity", 0.2);
          d3.select(`.legend-text-${i}`).style("opacity", 1);
          d3.select(`.topic-line-${i}`).style("opacity", 1);
        }
      })
      .on("mouseout", d => {
        if(!clicked) {
          d3.selectAll('.legend-text').style("opacity", 1);
          d3.selectAll(`.topic-line`).style("opacity", 0.2);
        }
      })
      .on("click", (d, i) => {
        if(!clicked) {
          d3.selectAll('.legend-text').style("opacity", 0.2);
          d3.select(`.legend-text-${i}`).style("opacity", 1);
          d3.select(`.topic-line-${i}`).style("opacity", 1);
          clicked = true;
        }
        else {
          d3.selectAll('.legend-text').style("opacity", 1);
          d3.selectAll(`.topic-line`).style("opacity", 0.2);
          clicked = false;
        }
        d3.event.stopPropagation();
      });

  function handleMouseOver(d, i) {
    if(!clicked) {
      d3.select(this).style("opacity", 1);
      d3.selectAll('.legend-text').style("opacity", 0.2);
      d3.select(`.legend-text-${i}`).style("opacity", 1);
    }
  }

  function handleMouseOut(d, i) {
    if(!clicked) {
      d3.select(this).style("opacity", 0.2);
      d3.selectAll('.legend-text').style("opacity", 1);
    }
  }

  function handleClick(d, i) {
    if(!clicked) {
      d3.selectAll(".topic-line").style("opacity", 0.2);
      d3.select(this).style("opacity", 1);
      d3.selectAll('.legend-text').style("opacity", 0.2);
      d3.select(`.legend-text-${i}`).style("opacity", 1);
      clicked = true;
    }
    else {
      d3.selectAll(".topic-line").style("opacity", 0.2);
      d3.select(`.legend-text-${i}`).style("opacity", 1);
      d3.selectAll('.legend-text').style("opacity", 1);
      clicked = false;
    }
    d3.event.stopPropagation();
  }

});
