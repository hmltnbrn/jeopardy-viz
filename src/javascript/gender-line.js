import * as d3 from "d3";
import { responsive } from './helper';

const margin = { top: 20, right: 30, bottom: 50, left: 30 };

const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const parseDate = d3.timeParse("%Y");

const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height, margin.top]);
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

const svg = d3.select('#gender-by-winnings')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .call(responsive)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

svg.on("click", () => {
  if(clicked) {
    d3.selectAll('.contestant-line')
      .style("opacity", 0.2);
    clicked = false;
  }
});

d3.select('body')
  .on("click", () => {
    if(clicked) {
      d3.selectAll('.contestant-line').style("opacity", 0.2);
      d3.selectAll('.contestant-legend-text').style("opacity", 1);
      clicked = false;
    }
  });

d3.csv("../data/gender-by-winnings.csv").then(data => {

  const winningsData = d3.keys(data[0]).filter(key => {
    return key !== "date";
  });

  color.domain(winningsData);

  data.forEach(d => {
    d.date = parseDate(d.date);
  });

  const frequencies = winningsData.map(contestant => {
    return {
      contestant: contestant,
      datapoints: data.map(d => {
        return { date: d.date, frequency: +d[contestant] };
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

  let contestants = svg
    .selectAll(".contestant")
    .data(frequencies)
    .enter().append("g")
      .attr("class", "contestant");

  contestants
    .append("path")
      .attr("class", (d, i) => `contestant-line contestant-line-${i}`)
      .attr("d", d => {
        return line(d.datapoints);
      })
      .style("stroke", d => {
        return color(d.contestant);
      })
      .style("opacity", 0.2)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("class", "y axis")
    .call(yAxis.ticks(null, "s"));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Median Winnings");

  const legend = d3.select(".gender-winnings-charts")
    .append("div")
      .attr("class", "legend-container");
  
  legend.selectAll(".legend-text")
    .data(frequencies)
    .enter().append("div")
      .attr("class", (d, i) => `legend-text contestant-legend-text contestant-legend-text-${i}`)
      .style("color", d => {
        return color(d.contestant);
      })
      .text(d => d.contestant)
      .on("mouseover", (d, i) => {
        if(!clicked) {
          d3.selectAll('.contestant-legend-text').style("opacity", 0.2);
          d3.select(`.contestant-legend-text-${i}`).style("opacity", 1);
          d3.select(`.contestant-line-${i}`).style("opacity", 1);
        }
      })
      .on("mouseout", d => {
        if(!clicked) {
          d3.selectAll('.contestant-legend-text').style("opacity", 1);
          d3.selectAll(`.contestant-line`).style("opacity", 0.2);
        }
      })
      .on("click", (d, i) => {
        if(!clicked) {
          d3.selectAll('.contestant-legend-text').style("opacity", 0.2);
          d3.select(`.contestant-legend-text-${i}`).style("opacity", 1);
          d3.select(`.contestant-line-${i}`).style("opacity", 1);
          clicked = true;
        }
        else {
          d3.selectAll('.contestant-legend-text').style("opacity", 1);
          d3.selectAll(`.contestant-line`).style("opacity", 0.2);
          clicked = false;
        }
        d3.event.stopPropagation();
      });

  function handleMouseOver(d, i) {
    if(!clicked) {
      d3.select(this).style("opacity", 1);
      d3.selectAll('.contestant-legend-text').style("opacity", 0.2);
      d3.select(`.contestant-legend-text-${i}`).style("opacity", 1);
    }
  }

  function handleMouseOut(d, i) {
    if(!clicked) {
      d3.select(this).style("opacity", 0.2);
      d3.selectAll('.contestant-legend-text').style("opacity", 1);
    }
  }

  function handleClick(d, i) {
    if(!clicked) {
      d3.selectAll(".contestant-line").style("opacity", 0.2);
      d3.select(this).style("opacity", 1);
      d3.selectAll('.contestant-legend-text').style("opacity", 0.2);
      d3.select(`.contestant-legend-text-${i}`).style("opacity", 1);
      clicked = true;
    }
    else {
      d3.selectAll(".contestant-line").style("opacity", 0.2);
      d3.select(`.contestant-legend-text-${i}`).style("opacity", 1);
      d3.selectAll('.contestant-legend-text').style("opacity", 1);
      clicked = false;
    }
    d3.event.stopPropagation();
  }

});
