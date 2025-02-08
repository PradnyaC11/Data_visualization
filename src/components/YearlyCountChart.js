import React, { useEffect } from 'react';
import * as d3 from 'd3';
import '../styles/YearlyCountChart.css';


const YearlyCountChart = () => {
    useEffect(() => {
        d3.csv(`${process.env.PUBLIC_URL}/data/Total_Passengers_Count_by_Year.csv`)
            .then(data => {
                const parsedData = data.map(d => ({
                    year: d.Year,
                    count: +d.Total_Passenger_Count
                }));
                renderYearlyCountChart(parsedData);
            })
            .catch(error => console.error('Error loading data:', error));
    }, []);

    const renderYearlyCountChart = (yearlyData) => {
        const width = +d3.select("#yearlyCount").style("width").replace("px", "");
        const height = +d3.select("#yearlyCount").style("height").replace("px", "");
        const margin = { top: 70, right: 110, bottom: 20, left: 50 };
        d3.select('#yearlyCount').selectAll('*').remove();
        const svg = d3
            .select('#yearlyCount');
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const chart = svg
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        const yScale = d3
            .scaleBand()
            .domain(yearlyData.map(d => d.year))
            .range([0, chartHeight])
            .padding(0.2);

        const xScale = d3
            .scaleLinear()
            .domain([0, d3.max(yearlyData, d => d.count)])
            .range([0, chartWidth]);
        chart
            .append('g')
            .attr('transform', `translate(0, 0)`)
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .style('text-anchor', 'end')
            .style("font-size", "14px");
        chart
            .selectAll('.line')
            .data(yearlyData)
            .enter()
            .append('line')
            .attr('class', 'line')
            .attr('x1', 0)
            .attr('y1', d => yScale(d.year) + yScale.bandwidth() / 2)
            .attr('x2', 0)
            .attr('y2', d => yScale(d.year) + yScale.bandwidth() / 2)
            .attr('stroke', '#003366')
            .attr('stroke-width', 2)
            .transition() 
            .duration(1000)
            .delay((d, i) => i * 100)
            .attr('x2', d => xScale(d.count));
        chart
            .selectAll('.icon')
            .data(yearlyData)
            .enter()
            .append('text')
            .attr('class', 'icon')
            .attr('x', 0) 
            .attr('y', d => yScale(d.year) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .style('font-size', '16px')
            .text('✈️') 
            .transition()
            .duration(1000)
            .delay((d, i) => i * 100)
            .attrTween('x', function (d) {
                const interpolate = d3.interpolate(0, xScale(d.count));
                return function (t) {
                    return interpolate(t);
                };
            });
        chart
            .selectAll('.label')
            .data(yearlyData)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => xScale(d.count) + 30)
            .attr('y', d => yScale(d.year) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .style('font-size', '14px')
            .attr('fill', 'black')
            .style('opacity', 0) 
            .text(d => d.count)
            .transition()
            .duration(1000)
            .delay((d, i) => i * 100 + 1000) 
            .style('opacity', 1);

        chart.append("text")
            .attr("x", width / 3) 
            .attr("y", -20) 
            .attr("text-anchor", "middle") 
            .style("font-size", "20px") 
            .text("Year Wise Passenger Count")
            .attr("fill", "#003366")
            .style("font-weight", "bold")
    };

    return (
        <div className="side-by-side-container">
            <svg id="yearlyCount"></svg>
            <p id="yearlyCountText">The annual passenger count tells a story of resilience and growth in the aviation industry over two decades. From the steady rise in passenger numbers in the early 2000s to the sharp plunge in 2020 due to the COVID-19 pandemic, this timeline mirrors the global shifts in travel behavior. What stands out is the industry's remarkable recovery—an inspiring testament to its adaptability and its indispensable role in connecting the world. By 2023, the numbers not only rebounded but surpassed pre-pandemic levels, showcasing the unyielding demand for air travel and the sector's enduring strength in driving global connectivity.
            </p>
        </div>
    );

};

export default YearlyCountChart;
