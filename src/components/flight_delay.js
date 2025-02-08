import * as d3 from 'd3';
import React, { useEffect, useState, useContext } from 'react';
import { AirportContext } from './../AirportContext';
import '../styles/flight_delays.css';
import {splitDescriptionIntoLines} from './SafetyMeasures';

const FlightDelayChart = () => {
    var { airport } = useContext(AirportContext);
    useEffect(() => {
        d3.select('#sunburst').selectAll('*').remove();

        d3.csv(`${process.env.PUBLIC_URL}/data/flight_delay_data.csv`)
            .then(rawData => {
                var svg_label;
                if (airport === undefined || airport === null || airport === '') {
                    airport = { city_name: "USA" };
                }
                if (airport.city_name === "USA") {
                    svg_label = "Overview of All Airports Across the U.S.";
                } else {
                    svg_label = (`Detailed Insights for Airport: ${airport.city_name}`);
                }
                const filteredData = rawData.filter(d => d.origin_city_name.includes(airport.city_name.split(',')[0]));

                if (filteredData.length === 0) {
                    console.warn(`No data found for airport: ${airport.city_name}`);
                    svg_label = (`No data found for airport: ${airport.city_name}`);
                }

                const width = +d3.select("#sunburst").style("width").replace("px", "");
                const height = +d3.select("#sunburst").style("height").replace("px", "");                
                const radius = Math.min(width, height) / 7;

                const svg = d3.select('#sunburst').append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`)
                .attr("viewBox", [-width / 2, -height / 2, width, width])
                .style("font", "10px sans-serif"); 

                svg.selectAll("#svg_label")
                .data([svg_label])
                .join("text")
                    .attr("x", -radius / 2)
                    .attr("y", radius * 3)
                    .attr("text-anchor", "middle")
                    .style("font-size", "20px")
                    .attr("id", "svg_label")
                    .attr("fill", "#003366")
                    .style("font-weight", "bold")
                    .selectAll("tspan")
                    .data(d => {
                      return splitDescriptionIntoLines(d, 50)
                    })
                    .join("tspan")
                    .attr("x", (d, i, nodes) => d3.select(nodes[i].parentNode).attr("x")) 
                    .attr("dy", (d, i) => (i === 0 ? 0 : 25)) 
                    .text(d => d);  

                const data = {
                    name: "Flight",
                    children: [
                        {
                            name: "No Delay",
                            key: "no_delay",
                            size: +filteredData[0].no_delay,
                        },
                        {
                            name: "Departure Delay",
                            key: "dep_delay",
                            size: +filteredData[0].dep_delay,
                        },
                        {
                            name: "Arrival Delay",
                            key: "arr_delay",
                            children: [
                                { name: "Weather", key: "weather_delay_count", size: +filteredData[0].weather_delay_count },
                                { name: "Carrier", key: "carrier_delay_count", size: +filteredData[0].carrier_delay_count },
                                { name: "Security", key: "security_delay_count", size: +filteredData[0].security_delay_count },
                                { name: "NAS", key: "nas_delay_count", size: +filteredData[0].nas_delay_count },
                                { name: "Late Aircraft", key: "late_aircraft_delay_count", size: +filteredData[0].late_aircraft_delay_count },
                            ],
                        },
                        {
                            name: "Diverted",
                            key: "diverted",
                            size: +filteredData[0].diverted,
                        },
                        {
                            name: "Cancelled",
                            key: "cancelled",
                            children: [
                                { name: "Code A", key: "cancellation_code_a", size: +filteredData[0].cancellation_code_a },
                                { name: "Code B", key: "cancellation_code_b", size: +filteredData[0].cancellation_code_b },
                                { name: "Code C", key: "cancellation_code_c", size: +filteredData[0].cancellation_code_c },
                                { name: "Code D", key: "cancellation_code_d", size: +filteredData[0].cancellation_code_d },
                            ],
                        }
                    ],
                };

                const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

                const hierarchy = d3.hierarchy(data)
                    .sum(d => d.size)
                    .sort((a, b) => b.size - a.size);

                const root = d3.partition()
                    .size([2 * Math.PI, hierarchy.height + 1])
                    (hierarchy);

                root.each(d => d.current = d);

                var tooltip_delay = d3.select("body").append("div").attr("class", "tooltip-delay").style('opacity', 0);

                const arc = d3.arc()
                    .startAngle(d => d.x0)
                    .endAngle(d => d.x1)
                    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                    .padRadius(radius * 1.5)
                    .innerRadius(d => d.y0 * radius)
                    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))             

                const path = svg.append("g")
                    .selectAll("path")
                    .data(root.descendants().slice(1))
                    .join("path")
                    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
                    .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.9 : 0.6) : 0)
                    .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
                    .attr("d", d => arc(d.current))
                    .on("mouseover", function (event, d) {
                        tooltip_delay.style("opacity", 1);
                        tooltip_delay.html(`${d.data.name}: ${filteredData[0][d.data.key]}`)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    })
                    .on("mousemove", function (event) {
                        tooltip_delay
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    })
                    .on("mouseout", function () {
                        tooltip_delay.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                path.filter(d => d.children)
                    .style("cursor", "pointer")
                    .on("click", clicked);

                const label = svg.append("g")
                    .attr("pointer-events", "none")
                    .attr("text-anchor", "middle")
                    .style("user-select", "none")
                    .selectAll("text")
                    .data(root.descendants().slice(1))
                    .join("text")
                    .attr("dy", "0.35em")
                    .attr("fill-opacity", d => +labelVisible(d.current))
                    .attr("transform", d => labelTransform(d.current))
                    .text(d => d.data.name);

                const parent = svg.append("circle")
                    .datum(root)
                    .attr("r", radius)
                    .attr("fill", "none")
                    .attr("pointer-events", "all")
                    .on("click", clicked);

                function clicked(event, p) {
                    parent.datum(p.parent || root);

                    root.each(d => d.target = {
                        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                        y0: Math.max(0, d.y0 - p.depth),
                        y1: Math.max(0, d.y1 - p.depth)
                    });

                    const t = svg.transition().duration(750);

                    path.transition(t)
                        .tween("data", d => {
                            const i = d3.interpolate(d.current, d.target);
                            return t => d.current = i(t);
                        })
                        .filter(function (d) {
                            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                        })
                        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.8 : 0.4) : 0)
                        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
                        .attrTween("d", d => () => arc(d.current));

                    label.filter(function (d) {
                        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
                    }).transition(t)
                        .attr("fill-opacity", d => +labelVisible(d.target))
                        .attrTween("transform", d => () => labelTransform(d.current));
                }

                function arcVisible(d) {
                    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
                }

                function labelVisible(d) {
                    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
                }

                function labelTransform(d) {
                    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                    const y = (d.y0 + d.y1) / 2 * radius;
                    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
                }

                svg.append("text")
                    .attr("x", -radius / 2)
                    .attr("y", -radius * 3.2)
                    .attr("text-anchor", "middle")
                    .style("font-size", "26px")
                    .text("Flight Delays and Cancellations")
                    .attr("fill", "#003366")
                    .style("font-weight", "bold")


                    const legend = svg.append('g')
                    .attr('class', 'legend')
                    .attr('transform', `translate(${(radius*1.65)}, ${-radius * 2.8})`);
        
                legend.append('text')
                    .attr('x', 10)
                    .attr('y', 10)
                    .attr('text-anchor', 'center')
                    .style('font-size', '18px')
                    .text('Cancellation Codes')
                    .attr("fill", "#003366")
                    .style("font-weight", "bold");

                    legend.append('text')
                    .attr('x', 10)
                    .attr('y', 30)
                    .attr('text-anchor', 'center')
                    .style('font-size', '15px')
                    .text('Code A - Carrier')
                    .attr("fill", "#003366");

                    legend.append('text')
                    .attr('x', 10)
                    .attr('y', 50)
                    .attr('text-anchor', 'center')
                    .style('font-size', '15px')
                    .text('Code B - Weather')
                    .attr("fill", "#003366");

                    legend.append('text')
                    .attr('x', 10)
                    .attr('y', 70)
                    .attr('text-anchor', 'center')
                    .style('font-size', '15px')
                    .text('Code C - NAS')
                    .attr("fill", "#003366");

                    legend.append('text')
                    .attr('x', 10)
                    .attr('y', 90)
                    .attr('text-anchor', 'center')
                    .style('font-size', '15px')
                    .text('Code D - Security')
                    .attr("fill", "#003366");

            })
            .catch(error => {
                console.error("Error loading the CSV data: ", error);
            });
    }, [airport]);

    return (
        <div>
            <p className="flightDelayText">Air travel is a marvel of modern logistics, yet delays and cancellations remain persistent hurdles, impacting both passengers and operations. This sunburst chart unpacks the story behind these disruptions, ranging from weather disruptions and carrier delays to issues like air traffic control and mechanical failures. It offers a layered perspective, allowing us to explore the interplay of these factors at both the national and local levels. By delving into this data, we gain valuable insights into the pressure points within the aviation system, offering actionable insights to enhance efficiency and reliability for travelers across the U.S.
            </p>
            <svg id="sunburst"></svg>
            {/* <p className="flightDelayText">It dynamically displays data for either the city selected in the map above or the entire U.S., providing both localized and nationwide perspectives on flight delays and cancellations.</p> */}
        </div>
    );
};


export default FlightDelayChart;