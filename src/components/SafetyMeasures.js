import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "../styles/timeline-chart.css";

// Utility function to get icon for safety measure
const getIconForSafetyMeasure = (measure) => {
  const iconMap = {
    "First Seat Belts": "🔐",
    "Life Jackets (Mae West)": "🦺",
    "Pressurized Cabins": "🛫",
    "Smoke Detection Systems": "🔥",
    "Ground Proximity Warning": "📡",
    "Emergency Locator Transmitter": "📡",
    "Reinforced Cockpit Doors": "🚪",
    "Enhanced GPWS": "📡",
    "Fatigue Risk Management": "😴",
    "Safety Management Systems (SMS)": "🛡️",
    "Pilot Qualification Standards": "✈️",
    "NextGen Data Comm": "💻",
    "Flight Tracking Requirements": "🛰️",
    "ADS-B Introduction": "🛰️",
    "Enhanced Two-Person Cockpit Rule": "👥",
    "ADS-B Mandate Preparation": "🛰️",
    "Lithium Battery Restrictions": "🔋",
    "COVID-19 Aviation Safety Protocol": "🦠",
    "Autonomous Aircraft": "🤖",
  };

  return iconMap[measure] || "✈️";
};

export function splitDescriptionIntoLines(description, maxWidth) {
  const words = description.split(" ");
  let lines = [];
  let currentLine = "";
  for (let i = 0; i < words.length; i++) {
    if ((currentLine + (currentLine ? " " : "") + words[i]).length <= maxWidth) {
      currentLine += (currentLine ? " " : "") + words[i];
    } else {
      if (currentLine) { lines.push(currentLine); }
      currentLine = words[i].trim();
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

const AviationSafetyTimeline = () => {
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    d3.csv(`/data/Safety_measures.csv`)
      .then(rawData => {
        const parsedData = rawData.map((row) => ({
          Year: row.Year || "",
          "Safety Measure": row["Safety Measure"] || "",
          Description: row.Description || "",
          Icon: getIconForSafetyMeasure(row["Safety Measure"]),
        }));
        const sortedData = parsedData.sort(
          (a, b) => parseInt(a.Year) - parseInt(b.Year)
        );
        createTimeline(sortedData);
      })
      .catch(error => {
        console.error("Error loading the CSV data: ", error);
      });

    function createTimeline(data) {
      const g = d3.select("#timeline-line")
        .append('g')
        .attr("transform", `translate(10, 40)`);

      const width = +d3.select("#timeline-line").style("width").replace("px", "") - 30;
      const svgheight = +d3.select("#timeline-line").style("height").replace("px", "") - 40;
      const height = svgheight - 150
      const stepX = width / data.length;

      data.forEach((d, i) => {
        d.x = (i * stepX) + 20;
        d.y = height - (i / 5 * height / 5 - 80 * Math.sin((i / 5) * Math.PI)) + 25;
      });

      const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCatmullRom);

      g.selectAll(".card")
        .data(data)
        .join("rect")
        .attr("class", "card")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", "#fff")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#959595")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.5)
        .attr("x", (d, i) => {
          var lines = splitDescriptionIntoLines(d["Safety Measure"], 10)
          var max = d3.max(lines, l => l.length)
          const { xOffset } = calculateLabelPosition(data, i);
          return data[i].x - (3.5 * max) + xOffset - 2.5;
        })
        .attr("y", (d, i) => {
          const { yOffset } = calculateLabelPosition(data, i);
          return data[i].y + (yOffset < 0 ? -(splitDescriptionIntoLines(d["Safety Measure"], 10).length * 15 - 1.7 * yOffset) : yOffset / 3);
        })
        .attr("width", (d, i) => {
          var lines = splitDescriptionIntoLines(d["Safety Measure"], 10)
          var max = d3.max(lines, l => l.length)
          return 7 * max + 5;
        })
        .attr("height", (d, i) => {
          return splitDescriptionIntoLines(d["Safety Measure"], 10).length * 15 + 30;
        })
        .on("mouseover", function (event, d) {
          d3.select("#tooltip-timeline")
            .style("left", `${event.clientX}px`)
            .style("top", `${event.clientY - 225}px`)
            .style("visibility", "visible")
            .html(`
                    <strong>${d.Year}: ${d["Safety Measure"]}</strong> <br/> ${d.Description}
                `);
        })
        .on("mousemove", function (event) {
          d3.select("#tooltip-timeline")
            .style("left", `${event.clientX}px`)
            .style("top", `${event.clientY - 225}px`)
        })
        .on("mouseout", function () {
          d3.select("#tooltip-timeline").style("visibility", "hidden");
        });;

      const textElements = g.selectAll(".card-text")
        .data(data)
        .join("text")
        .attr("class", "card-text")
        .attr("x", (d, i) => {
          const { xOffset } = calculateLabelPosition(data, i);
          return data[i].x + xOffset;
        })
        .attr("y", (d, i) => {
          const { yOffset } = calculateLabelPosition(data, i);
          return data[i].y + (yOffset < 0 ? -(splitDescriptionIntoLines(d["Safety Measure"], 10).length * 15 - 1.2 * yOffset) : yOffset + 20);
        })
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#333")
        .selectAll("tspan")
        .data(d => {
          return splitDescriptionIntoLines(d["Safety Measure"], 10)
        })
        .join("tspan")
        .attr("x", (d, i, nodes) => d3.select(nodes[i].parentNode).attr("x"))
        .attr("dy", (d, i) => (i === 0 ? 0 : 15))
        .text(d => d);
      const labels = g.selectAll(".label")
        .data(data)
        .join("text")
        .attr("x", (d, i) => {
          const { xOffset } = calculateLabelPosition(data, i);
          return data[i].x + xOffset;
        })
        .attr("y", (d, i) => {
          const { yOffset } = calculateLabelPosition(data, i);
          return data[i].y + yOffset;
        })
        .attr("text-anchor", "middle")
        .text(d => `${d.Icon} ${d.Year}`)
        .style("font-size", "15px")
        .style("fill", "black");

      var path = g.append("path")
        .datum(data)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "url(#gradient)")
        .attr("stroke-width", 3);

      const defs = g.append("defs");

      const gradient = defs.append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "blue");

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "green");

      const checkpoints = g.selectAll(".checkpoint")
        .data(data)
        .join("circle")
        .attr("class", "checkpoint")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 10)
        .attr("fill", "#d6d6d6")
        .style("stroke", "black")
        .style("stroke-width", 2)
        .on("mouseover", function (event, d) {
          d3.select("#tooltip-timeline")
            .style("left", `${event.clientX}px`)
            .style("top", `${event.clientY - 225}px`)
            .style("visibility", "visible")
            .html(`
                    <strong>${d.Year}: ${d["Safety Measure"]}</strong> <br/> ${d.Description}
                `);
        })
        .on("mousemove", function (event) {
          d3.select("#tooltip-timeline")
            .style("left", `${event.clientX}px`)
            .style("top", `${event.clientY - 225}px`)
        })
        .on("mouseout", function () {
          d3.select("#tooltip-timeline").style("visibility", "hidden");
        });

      var description = "From the Wright Brothers’ flight in 1903 to the skies we traverse today, the U.S. aviation industry has consistently pushed the boundaries of innovation to prioritize passenger safety. This timeline captures the evolution of key safety milestones — from the introduction of seat belts and pressurized cabins in the early 20th century to modern breakthroughs like automated flight tracking systems, and Safety Management Systems (SMS). Recent advancements, including COVID-19 safety protocols and ongoing testing of autonomous aircraft, underscore the industry's ability to adapt to unforeseen challenges. Each milestone not only marks a technical achievement but also reflects an unwavering focus on ensuring air travel is safer, more reliable, and better equipped."

      const availableHeight = height - data[6].y 
      const textYPosition = availableHeight > 30 ? availableHeight / 2 : 30; 


      g.selectAll(".description")
        .data([1])
        .join("text")
        .attr("class", "description")
        .attr("x", 0) 
        .attr("y", 30) 
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .style("font-family", "Open Sans")
        .style("text-justify", "inter-word")
        .style("line-height", "32px")
        .attr("fill", "#003366")
        .selectAll("tspan")
        .data(d => splitDescription(description, (width / 3) * 2.2, availableHeight))
        .join("tspan")
        .attr("x", (d, i, nodes) => d3.select(nodes[i].parentNode).attr("x"))
        .attr("dy", (d, i) => (i === 0 ? 0 : 30)) 
        .text(d => d);

      g.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .text("Safety Measures Timeline")
        .attr("fill", "#003366")
        .style("font-weight", "bold")

      var transition = "The story of aviation safety is one of relentless progress, where each innovation builds upon lessons learned from the past. By connecting technological advancements to tangible outcomes and visualizing it over time, we uncover how data driven strategies and adaptive measures have not only addressed vulnerabilities but also laid the groundwork for a safer and more resilient future in air travel."
      g.selectAll(".transition")
        .data([1])
        .join("text")
        .attr("class", "transition")
        .attr("x", (width / 3) + 30)
        .attr("y", height)
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .style("text-justify", "inter-word")
        .style("text-align", "justify")
        .style("font-family", "Open Sans")
        .style("line-height", "32px")
        .attr("fill", "#003366")
        .selectAll("tspan")
        .data(d => {
          return splitDescription(transition, (width / 3) * 2 - 70, height)
        })
        .join("tspan")
        .attr("x", (d, i, nodes) => d3.select(nodes[i].parentNode).attr("x"))
        .attr("dy", (d, i) => (i === 0 ? 0 : 30))
        .text(d => d);

      const planeIcon = g.append("text")
        .attr("x", data[0].x - 15) 
        .attr("y", data[0].y + 10)
        .text("✈️")
        .style("font-weight", "bold")
        .style("font-size", "30px");

      animateIconLoop(planeIcon, path, height);

    }

    function animateIconLoop(planeIcon, path, height) {
      planeIcon
        .attr("opacity", 1) 
        .transition()
        .duration(7000) 
        .ease(d3.easeLinear) 
        .attrTween("transform", translateAlong(path.node(), height))
        .on("end", function () {
          planeIcon.attr("opacity", 0)
          animateIconLoop(d3.select(this), path, height);
        });

    }

    function translateAlong(path, height) {
      var l = path.getTotalLength();
      return function (d, i, a) {
        return function (t) {
          var p = path.getPointAtLength(t * l);
          var py = p.y - height - 30
          return "translate(" + p.x + "," + py + ")";
        };
      };
    }

    function calculateLabelPosition(points, i) {
      const padding = 15;
      let xOffset = 0, yOffset = 0;

      if (i < points.length - 1) {
        const x1 = points[i].x, y1 = points[i].y;
        const x2 = points[i + 1].x, y2 = points[i + 1].y;
        const slope = (y2 - y1) / (x2 - x1);

        if (Math.abs(slope) > 1) {
          xOffset = slope > 0 ? -padding : 2 * padding;
          yOffset = 1.5 * padding;
        } else {
          xOffset = 1.5 * padding;
          yOffset = slope > 0 ? -2 * padding : 2 * padding;
        }
      }

      if (i === points.length - 1) {
        xOffset = 0;
        yOffset = -1.6 * padding;
      }

      return { xOffset, yOffset };
    }

    function splitDescription(description, maxWidth, availableHeight) {
      const words = description.split(" ");
      const lines = [];
      let currentLine = "";
      let flag = 0;
      const tempText = d3.select("svg").append("text").style("font-size", "20px").style("font-family", "Open Sans");
      words.forEach(word => {
        currentLine += word + " ";
        tempText.text(currentLine);
        if (tempText.node().getComputedTextLength() > maxWidth) {
          lines.push(currentLine.trim());
          if (lines.length * 30 >= availableHeight && flag === 0) {
            maxWidth = maxWidth / 3;
            flag = 1;
          }
          currentLine = word + " ";
        }
      });
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      tempText.remove();

      return lines;
    }
  }, []);

  return (
    <div id="timeline-container" className="timeline-container">
      <svg id="timeline-line"></svg>
      <div className="tooltip-timeline" id="tooltip-timeline" style={{ position: "absolute", visibility: "hidden" }}></div>
    </div>
  );
};

export default AviationSafetyTimeline;
