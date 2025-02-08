import React, { useEffect } from 'react';
import * as d3 from 'd3';
import '../styles/SafetyVsAccidents.css';

const SafetyVsAccidents = () => {
    useEffect(() => {
        const accidentDataPath = `${process.env.PUBLIC_URL}/data/accident_data.csv`;
        const safetyDataPath = `${process.env.PUBLIC_URL}/data/Safety_measures.csv`;
        const yearCountDataPath = `${process.env.PUBLIC_URL}/data/Total_Passengers_Count_by_Year.csv`;

        Promise.all([
            d3.csv(accidentDataPath),
            d3.csv(safetyDataPath),
            d3.csv(yearCountDataPath)
        ]).then(([accidentData, safetyData, yearCountData]) => {
            const annualAccidents = d3.rollups(
                accidentData,
                group => {
                    const fatalInjuries = d3.sum(group, d => +d["Total.Fatal.Injuries"]);
                    const seriousInjuries = d3.sum(group, d => +d["Total.Serious.Injuries"]);
                    const minorInjuries = d3.sum(group, d => +d["Total.Minor.Injuries"]);
                    const totalInjuries = d3.sum(group, d => +d['Total.Injuries']);
                    return { fatalInjuries, seriousInjuries, minorInjuries, totalInjuries };
                },
                d => +d['Event.Year']
            ).map(([year, { fatalInjuries, seriousInjuries, minorInjuries, totalInjuries }]) => ({
                year,
                fatalInjuries,
                seriousInjuries,
                minorInjuries,
                totalInjuries
            })).sort((a, b) => a.year - b.year).filter(d => +d.year >= 2000);

            const yearCountMap = new Map();
            yearCountData.forEach(d => {
                const year = +d['Year'];
                const count = +d['Total_Passenger_Count'];
                yearCountMap.set(year, count);
            });
            const annualAccidentsWithPercentages = annualAccidents.map(d => {
                const totalCount = yearCountMap.get(d.year);
                if (totalCount) {
                    return {
                        ...d,
                        fatalInjuriesPercentage: (d.fatalInjuries / totalCount) * 100,
                        seriousInjuriesPercentage: (d.seriousInjuries / totalCount) * 100,
                        minorInjuriesPercentage: (d.minorInjuries / totalCount) * 100,
                        totalInjuriesPercentage: (d.totalInjuries / totalCount) * 100
                    };
                }
            });
            const safetyMeasures = safetyData
                .filter(d => +d.Year >= 2000)
                .map(d => ({
                    year: +d.Year,
                    measure: d['Safety Measure'],
                }));

            createVisualization(annualAccidentsWithPercentages, safetyMeasures);
        }).catch(err => console.error("Error loading datasets: ", err));
    }, []);

    const createVisualization = (annualAccidentsWithPercentages, safetyMeasures) => {
        const svg = d3.select('#safetyVsAccidents');
        const width = +svg.style("width").replace("px", "");
        const height = +svg.style("height").replace("px", "");
        const margin = { top: 50, right: 50, bottom: 100, left: 50 };

        const xScale = d3.scaleLinear()
            .domain([2000, 2010, 2020, 2023])
            .range([
                margin.left,
                (width - margin.right) * 0.3,  
                (width - margin.right) * 0.90, 
                width - margin.right           
            ]);

        const yScale = d3.scaleLinear()
            .domain([0, Math.max(d3.max(annualAccidentsWithPercentages, d => d.fatalInjuriesPercentage),
                d3.max(annualAccidentsWithPercentages, d => d.seriousInjuriesPercentage),
                d3.max(annualAccidentsWithPercentages, d => d.minorInjuriesPercentage)) + 0.00001])
            .range([height - margin.bottom, margin.top]);

        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
        const yAxis = d3.axisLeft(yScale);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis)
            .attr('class', 'x-axis')
            .selectAll('text')
            .remove();

        svg.selectAll('.x-axis line')
            .style('display', 'none');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yAxis)
            .attr('class', 'y-axis');

        const fatalInjuriesLine = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.fatalInjuriesPercentage))
            .curve(d3.curveMonotoneX);

        var tooltip = d3.select(".tooltip-safety-accidents");

        svg.append('path')
            .datum(annualAccidentsWithPercentages)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', '#FF0000')
            .attr('stroke-width', 5)
            .attr('d', fatalInjuriesLine)
            .on('mouseover', (event, d) => {
                const svgRect = d3.select("#safetyVsAccidents").node().getBoundingClientRect();
                tooltip
                .style('left', `${event.clientX - svgRect.left  + 50}px`)
                        .style('top', `${event.clientY - svgRect.top+100}px`)
                .style('visibility', "visible");
            })
            .on('mousemove', (event, d) => {
                const year = Math.round(xScale.invert(d3.pointer(event)[0]));
                const svgRect = d3.select("#safetyVsAccidents").node().getBoundingClientRect();
                const yearData = annualAccidentsWithPercentages.find(data => data.year === year);
                if (yearData) {
                    tooltip
                    .style('left', `${event.clientX - svgRect.left  + 50}px`)
                    .style('top', `${event.clientY - svgRect.top +100}px`)
                        .style('visibility', "visible")
                        .html(`
                            <strong>Year:</strong> ${yearData.year}<br>
                            <strong>Fatal Injuries:</strong> ${yearData.fatalInjuries}<br>
                            <strong>Serious Injuries:</strong> ${yearData.seriousInjuries}<br>
                            <strong>Minor Injuries:</strong> ${yearData.minorInjuries}
                        `);
                }
            })
            .on('mouseout', () => {
                tooltip.style('visibility', "hidden"); 
            });

        const seriousInjuriesLine = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.seriousInjuriesPercentage))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(annualAccidentsWithPercentages)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', '#FFA500')
            .attr('stroke-width', 2)
            .attr('d', seriousInjuriesLine)
            .on('mouseover', (event, d) => {
                const svgRect = d3.select("#safetyVsAccidents").node().getBoundingClientRect();
                tooltip
                .style('left', `${event.clientX - svgRect.left  + 50}px`)
                        .style('top', `${event.clientY - svgRect.top +100}px`)
                .style('visibility', "visible");
            })
            .on('mousemove', (event, d) => {
                const year = Math.round(xScale.invert(d3.pointer(event)[0]));
                const svgRect = d3.select("#safetyVsAccidents").node().getBoundingClientRect();
                const yearData = annualAccidentsWithPercentages.find(data => data.year === year);
                if (yearData) {
                    tooltip
                    .style('left', `${event.clientX - svgRect.left  + 50}px`)
                    .style('top', `${event.clientY - svgRect.top+100 }px`)
                        .style('visibility', "visible")
                        .html(`
                            <strong>Year:</strong> ${yearData.year}<br>
                            <strong>Fatal Injuries:</strong> ${yearData.fatalInjuries}<br>
                            <strong>Serious Injuries:</strong> ${yearData.seriousInjuries}<br>
                            <strong>Minor Injuries:</strong> ${yearData.minorInjuries}
                        `);
                }
            })
            .on('mouseout', () => {
                tooltip.style('visibility', "hidden"); 
            });

        const minorInjuriesLine = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.minorInjuriesPercentage))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(annualAccidentsWithPercentages)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', '#32CD32')
            .attr('stroke-width', 2)
            .attr('d', minorInjuriesLine)
            .on('mouseover', (event, d) => {
                const svgRect = d3.select("#safetyVsAccidents").node().getBoundingClientRect();
                tooltip
                .style('left', `${event.clientX - svgRect.left  + 50}px`)
                        .style('top', `${event.clientY - svgRect.top +100}px`)
                .style('visibility', "visible");
            })
            .on('mousemove', (event, d) => {
                const year = Math.round(xScale.invert(d3.pointer(event)[0]));
                const svgRect = d3.select("#safetyVsAccidents").node().getBoundingClientRect();
                const yearData = annualAccidentsWithPercentages.find(data => data.year === year);
                if (yearData) {
                    tooltip
                        .style('left', `${event.clientX - svgRect.left  + 50}px`)
                        .style('top', `${event.clientY - svgRect.top +100}px`)
                        .style('visibility', "visible")
                        .html(`
                            <strong>Year:</strong> ${yearData.year}<br>
                            <strong>Fatal Injuries:</strong> ${yearData.fatalInjuries}<br>
                            <strong>Serious Injuries:</strong> ${yearData.seriousInjuries}<br>
                            <strong>Minor Injuries:</strong> ${yearData.minorInjuries}
                        `);
                }
            })
            .on('mouseout', () => {
                tooltip.style('visibility', "hidden"); 
            });
        safetyMeasures.forEach((safety, index) => {
            const xPosition = xScale(safety.year);
            const yPosition = height - margin.bottom;
            const offset = index % 2 === 0 ? 40 : 60;
            svg.append('circle')
                .attr('cx', xPosition)
                .attr('cy', yPosition + 10)
                .attr('r', 6)
                .attr('fill', 'red');
            svg.append('line')
                .attr('x1', xPosition)
                .attr('y1', () => {
                    const yearData = annualAccidentsWithPercentages.filter((d) => d.year === safety.year)[0]
                    if (yearData) {
                        return yScale(Math.max(yearData.fatalInjuriesPercentage, yearData.seriousInjuriesPercentage, yearData.minorInjuriesPercentage))
                    } else {
                        return yScale(0)
                    }
                })
                .attr('x2', xPosition)
                .attr('y2', yPosition + offset - 20)
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
            svg.append('text')
                .attr('x', xPosition)
                .attr('y', yPosition + offset)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('fill', 'black')
                .text(safety.year)
            svg.append('text')
                .attr('x', xPosition)
                .attr('y', yPosition + offset + 15)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .style('fill', 'black')
                .style('fill', '#555')
                .text(safety.measure)
                .call(wrap, 90);
        });

        const yGrid = d3.axisLeft(yScale)
            .tickSize(-width + margin.left + margin.right)
            .tickFormat('')
            .ticks(10);

        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yGrid)
            .selectAll('line')
            .attr('stroke', '#ccc')
            .attr('stroke-dasharray', '2,2');


        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 250}, ${margin.top + 20})`);

        legend.append('line')
            .attr('x1', 0)
            .attr('y1', 20)
            .attr('x2', 30)
            .attr('y2', 20)
            .attr('stroke', '#FF0000')
            .attr('stroke-width', 2);

        legend.append('text')
            .attr('x', 40)
            .attr('y', 25)
            .attr('text-anchor', 'start')
            .style('font-size', '15px')
            .text('Fatal Injuries');

        legend.append('line')
            .attr('x1', 0)
            .attr('y1', 40)
            .attr('x2', 30)
            .attr('y2', 40)
            .attr('stroke', '#FFA500')
            .attr('stroke-width', 2);

        legend.append('text')
            .attr('x', 40)
            .attr('y', 45)
            .attr('text-anchor', 'start')
            .style('font-size', '15px')
            .text('Serious Injuries');

        legend.append('line')
            .attr('x1', 0)
            .attr('y1', 60)
            .attr('x2', 30)
            .attr('y2', 60)
            .attr('stroke', '#32CD32')
            .attr('stroke-width', 2);

        legend.append('text')
            .attr('x', 40)
            .attr('y', 65)
            .attr('text-anchor', 'start')
            .style('font-size', '15px')
            .text('Minor Injuries');

        legend.append('circle')
            .attr('cx', 15)
            .attr('cy', 0)
            .attr('r', 6)
            .attr('fill', 'red');

        legend.append('text')
            .attr('x', 40)
            .attr('y', 5)
            .attr('text-anchor', 'start')
            .style('font-size', '15px')
            .text('Safety Measures');

        d3.select('body')
            .append('div')
            .attr('class', 'tooltip-safety-accidents')
            .style('position', 'absolute')
            .style('opacity', 0)
            .style('background', '#fff')
            .style('padding', '5px')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px');

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "26px")
            .text("Safety Measures V/s Accidents")
            .attr("fill", "#003366")
            .style("font-weight", "bold")
    };

    const wrap = (text, width) => {
        text.each(function () {
            const text = d3.select(this);
            const words = text.text().split(/\s+/).reverse();
            let word;
            let line = [];
            const lineHeight = 1.1; 
            const x = text.attr('x');
            const y = text.attr('y');
            let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y);
            let lineNumber = 0;

            while ((word = words.pop())) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = text.append('tspan')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('dy', `${++lineNumber * lineHeight}em`)
                        .text(word);
                }
            }
        });
    };



    return (
        <div>
            <p className="safetyVsAccidentText">The below visualization highlights the remarkable correlation between the implementation of key safety measures and the steady decline in aviation accidents over time. Each milestone, marked by red points, represents a critical safety enhancement that has shaped the modern aviation landscape. Measures like reinforced cockpit doors and advanced tracking systems have addressed critical vulnerabilities, while initiatives like Fatigue Risk Management and Safety Management Systems have focused on human and operational factors. Despite challenges such as the COVID-19 pandemic, the industry has demonstrated resilience and a commitment to innovation, adapting to evolving risks. This timeline is a testament to how continuous advancements in technology, regulation, and practices have reshaped the landscape of aviation safety.</p>
            <svg id="safetyVsAccidents"></svg>
            <div className='tooltip-safety-accidents' style={{ position: "absolute", visibility: "hidden" }}></div>
        </div>
    );
};

export default SafetyVsAccidents;
