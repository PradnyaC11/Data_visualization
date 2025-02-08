import React, { useEffect } from 'react';
import * as d3 from 'd3';
import '../styles/Heatmap.css';
const stateAbbreviationToName = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
    MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
    VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};
const Heatmap = () => {
    useEffect(() => {
        Promise.all([
            d3.json('/data/geojson.json'),
            d3.csv('/data/State_Wise_Passenger_Count.csv')
        ]).then(([geoData, csvData]) => {
            csvData.forEach(d => {
                d.State = stateAbbreviationToName[d.STATE] || d.State;
            });
            const passengerData = d3.rollup(
                csvData,
                v => d3.sum(v, d => +d.Departure_Passenger_Count + +d.Arriving_Passenger_Count),
                d => d.State
            );
            geoData.features.forEach(feature => {
                const stateName = feature.properties.NAME;
                feature.properties.arrival_count = csvData
                    .filter(d => d.State === stateName)
                    .reduce((sum, d) => sum + +d.Arriving_Passenger_Count, 0);
                feature.properties.departure_count = csvData
                    .filter(d => d.State === stateName)
                    .reduce((sum, d) => sum + +d.Departure_Passenger_Count, 0);
                feature.properties.passenger_count = passengerData.get(stateName) || 0;
            });
            renderHeatmap(geoData);
        }).catch(error => console.error('Error loading data:', error));
    }, []);
    const renderHeatmap = (geoData) => {
        const width = +d3.select("#heatmap").style("width").replace("px", "");
        const height = +d3.select("#heatmap").style("height").replace("px", "");
        const svg = d3.select('#heatmap')
            .append('g')
            .attr('transform', `translate(0, 20)`);

        svg.append("text")
            .attr("x", (width / 5) * 3)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .style("font-size", "26px")
            .text("Passenger Traffic Analysis")
            .attr("fill", "#003366")
            .style("font-weight", "bold")

        const projection = d3.geoAlbersUsa().fitSize([width + 100, height - 80], geoData);
        const path = d3.geoPath().projection(projection);
        const colorScale = d3.scaleSqrt()
            .domain([0, d3.max(geoData.features, d => d.properties.passenger_count)])
            .range(["#f7fbff", "#08306b"]);
        svg.selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', d => colorScale(d.properties.passenger_count))
            .attr('stroke', '#000')
            .attr('stroke-width', 0.5)
            .on('mouseover', (event, d) => {
                const { NAME, arrival_count, departure_count } = d.properties;
                d3.select('#tooltip-heatmap')
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`)
                    .style('visibility', 'visible')
                    .html(`<strong>${NAME}</strong><br/>
            <strong>Arrivals:</strong> ${arrival_count}<br/>
            <strong>Departures:</strong> ${departure_count}`);
            })
            .on('mouseout', () => {
                d3.select('#tooltip-heatmap').style('visibility', 'hidden');
            });
        d3.select('body').append('div')
            .attr('id', 'tooltip-heatmap')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('padding', '5px')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px')
            .style('visibility', 'hidden');

        const legendGroup = svg.append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(${width - 350}, ${height - 70})`);
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f7fbff');
        gradient.append('stop').attr('offset', '100%').attr('stop-color', '#08306b');
        legendGroup.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 300)
            .attr('height', 20)
            .style('fill', 'url(#legend-gradient)');
        const passengerDomain = [0, d3.max(geoData.features, d => d.properties.passenger_count)];
        legendGroup.selectAll('text')
            .data(passengerDomain)
            .enter()
            .append('text')
            .attr('x', (d, i) => i * 300)
            .attr('y', 35)
            .style('text-anchor', (d, i) => (i === 0 ? 'start' : 'end'))
            .text(d => d3.format(',')(d))
            .style('font-size', '12px')
            .style('fill', '#000');
    };
    return (
        <div class="side-by-side-container">
            <p class="heatmapText">The choropleth map shown alongside paints a vivid picture of the 2023 passenger traffic landscape, revealing the aviation giants that drive the national network. States like Texas and California emerge as powerhouses, handling immense passenger volumes that underscore their pivotal role in connecting domestic and international routes. Meanwhile, smaller states, with lighter traffic, highlight the importance of regional hubs and niche travel markets. This visualization not only emphasizes the economic and logistical significance of aviation in major states but also showcases the intricate web of interdependence that sustains the broader U.S. air travel ecosystem.</p>
            <svg id='heatmap'></svg>
        </div>
    );
};

export default Heatmap;

