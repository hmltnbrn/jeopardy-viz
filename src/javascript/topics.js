import * as d3 from "d3";
import { responsive } from './helper';

import '../sass/topics.scss';

const margin = { top: 10, right: 20, bottom: 30, left: 30 };

const width = 400 - margin.left - margin.right;
const height = 200 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y");

var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);
var color = d3.scaleOrdinal().range(d3.schemeCategory10);

var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

var line = d3
  .line()
  .curve(d3.curveMonotoneX)
  .x(function(d) {
    return xScale(d.date);
  })
  .y(function(d) {
    return yScale(d.frequency);
  });

const svg = d3.select('#topic-line-chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .call(responsive)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

d3.csv("../data/topics.csv").then(data => {
  var topicData = d3.keys(data[0]).filter(key => {
    return key !== "date";
  });
  color.domain(topicData);

  data.forEach(d => {
    d.date = parseDate(d.date);
  });

  var frequencies = topicData.map(topic => {
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

  var topics = svg
    .selectAll(".topic")
    .data(frequencies)
    .enter()
    .append("g")
    .attr("class", "topic");

  topics
    .append("path")
    .attr("class", "line")
    .attr("d", d => {
      return line(d.datapoints);
    })
    .style("stroke", d => {
      return color(d.topic);
    })
    .style("opacity", 0.2)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  function handleMouseOver(d, i) {
    d3.select(this).style("opacity", 1);
  }

  function handleMouseOut(d, i) {
    d3.select(this).style("opacity", 0.2);
  }

});
