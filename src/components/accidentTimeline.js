import React, { useEffect } from "react";
import * as d3 from "d3";
import "../styles/accidentTimeline.css";

const AccidentTimeline = () => {
  useEffect(() => {
    const datasetUrl = `${process.env.PUBLIC_URL}/data/accident_data.csv`;
    const stateCodesUrl = `${process.env.PUBLIC_URL}/data/USState_Codes.csv`;
    const geoJsonUrl = `${process.env.PUBLIC_URL}/data/gz_2010_us_040_00_500k.json`;

    const svg = d3.select("#accident");
    const width = +svg.style("width").replace("px", "");
    const height = +svg.style("height").replace("px", "") - 100;

    Promise.all([
      d3.csv(datasetUrl, (d) => ({
        ...d,
        Year: +d["Event.Year"].trim() || null,
        State: d.State,
      })),
      d3.csv(stateCodesUrl),
      d3.json(geoJsonUrl),
    ]).then(([accidentData, stateCodes, geoJson]) => {
      const stateMap = new Map(
        stateCodes.map((d) => [d.Abbreviation, d.US_State])
      );
      const accidentByStateAndYear = d3.rollup(
        accidentData,
        (v) => v.length, 
        (d) => d.Year,
        (d) => stateMap.get(d.State)
      );
      const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]);
      const path = d3.geoPath().projection(projection);

      svg
        .selectAll("path")
        .data(geoJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);

      const timelineYOffset = height + 40;
      const circleRadius = 10;
      const years = [...new Set(accidentData.map((d) => d.Year))]
        .filter((year) => year >= 2000) 
        .sort((a, b) => a - b);
      const xScale = d3.scaleLinear()
        .domain([years[0], years[years.length - 1]])
        .range([30, width - 30]);
      svg
        .append("line")
        .attr("x1", xScale(years[0]))
        .attr("x2", xScale(years[years.length - 1]))
        .attr("y1", timelineYOffset)
        .attr("y2", timelineYOffset)
      svg
        .selectAll("circle.timeline")
        .data(years)
        .enter()
        .append("circle")
        .attr("class", "timeline")
        .attr("cx", (d) => xScale(d))
        .attr("cy", timelineYOffset)
        .attr("r", circleRadius)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .on("click", function (event, selectedYear) {
          svg.selectAll("circle.timeline").attr("fill", "white");
          d3.select(this).attr("fill", "red");
          const fatalitiesByState = accidentByStateAndYear.get(selectedYear) || new Map();
          const maxFatalities = d3.max([...fatalitiesByState.values()] || [0]);
          const radiusScale = d3.scaleSqrt()
            .domain([0, maxFatalities])
            .range([1, 20]);

          svg.selectAll("circle.centroid-marker")
            .data(geoJson.features.filter((d) => {
              const stateName = d.properties.NAME;
              const fatalities = fatalitiesByState.get(stateName) || 0;
              return fatalities > 0;
            }))
            .join("circle")
            .attr("class", "centroid-marker")
            .attr("cx", (d) => {
              const centroid = d3.geoCentroid(d);
              const projected = projection(centroid);
              return projected ? projected[0] : null;
            })
            .attr("cy", (d) => {
              const centroid = d3.geoCentroid(d);
              const projected = projection(centroid);
              return projected ? projected[1] : null;
            })
            .attr("r", (d) => {
              const stateName = d.properties.NAME;
              const fatalities = fatalitiesByState.get(stateName) || 0;
              return radiusScale(fatalities);
            })
            .style("fill", "red")
            .style("opacity", 0.6)
            .on("mouseover", function (event, d) {
              const stateName = d.properties.NAME;
              const svgRect = d3.select("#accident").node().getBoundingClientRect();
              const stateData = accidentData.filter(
                (row) => stateMap.get(row.State) === stateName && row.Year === selectedYear
              );

              if (stateData.length > 0) {
                const totalAccidents = stateData.length;
                d3.select("#accidentTooltip")
                  .html(`
                            <strong>${stateName}</strong><br>
                             <strong>Total Accidents:</strong> ${totalAccidents}
                            `)
                  .style("visibility", "visible")
                  .style("left", `${event.clientX - svgRect.left  + 50}px`)
                  .style("top", `${event.clientY - svgRect.top + 30}px`);
              }
            })
            .on("mousemove", function (event) {
              const svgRect = d3.select("#accident").node().getBoundingClientRect();
              d3.select("#accidentTooltip")
                .style("left", `${event.clientX - svgRect.left  + 50}px`)
                .style("top", `${event.clientY - svgRect.top + 30}px`);
            })
            .on("mouseout", () => {
              d3.select("#accidentTooltip").style("visibility", "hidden");
            });

        });

      svg.selectAll("circle.timeline").each(function (d) {
        if (d === 2022) {
          d3.select(this).dispatch("click");
        }
      });
      svg
        .selectAll("text.timeline")
        .data(years)
        .enter()
        .append("text")
        .attr("class", "timeline")
        .attr("x", (d) => xScale(d))
        .attr("y", timelineYOffset + 25)
        .attr("text-anchor", "middle")
        .text((d) => d)
        .style("font-size", "10px")
        .style("fill", "black");

      svg.append("text")
        .attr("x", width / 4 + 20)
        .attr("y", 20)
        .attr("text-anchor", "left")
        .style("font-size", "26px")
        .text("State-Level Accident Insights Through the Years")
        .attr("fill", "#003366")
        .style("font-weight", "bold")
    });
  }, []);

  return (
    <div class="side-by-side-container">
      <svg id="accident"></svg>
      <p class="accidentTimelineText">This chart offers a sobering yet critical view of aviation safety across the United States, spotlighting state-level accident trends over the years. Each red circle marks incidents, with its size representing the scale of fatalities, injuries, or damages. States with larger circles reveal concentrated challenges, prompting deeper exploration into underlying causes—ranging from weather conditions to operational failures. By visualizing this data, we gain invaluable insights into patterns that demand immediate attention, enabling informed decisions to enhance safety protocols and reduce risks across the nation’s aviation network.

</p>
      <div id="accidentTooltip" style={{ position: "absolute", visibility: "hidden" }}></div>
    </div>
  );
};

export default AccidentTimeline;
