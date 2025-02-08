import React, { useEffect, useState, useContext } from 'react';
import * as d3 from 'd3';
import '../styles/FlightRoute.css';
import { AirportContext } from './../AirportContext';

const FlightRoute = () => {
    const [selectedAirport, setSelectedAirport] = useState(null);
    const { onSelectAirport } = useContext(AirportContext);

    useEffect(() => {
        Promise.all([
            d3.json(`${process.env.PUBLIC_URL}/data/geojson.json`),
            d3.csv(`${process.env.PUBLIC_URL}/data/Airport_Passenger_Count.csv`),
            d3.csv(`${process.env.PUBLIC_URL}/data/Flight_Routes.csv`)
        ])
            .then(([geoData, cityData, flightRoutes]) => {
                processCityData(cityData);
                renderFlightRoute(geoData, cityData, flightRoutes);
            })
            .catch(error => console.error('Error loading data:', error));
    }, []);

    const processCityData = (cityData) => {
        cityData.forEach(d => {
            d.departure_count = +d.departure_count;
            d.arrival_count = +d.arrival_count;
            d.total_passenger_count = d.departure_count + d.arrival_count;

            if (d.total_passenger_count < 50000) {
                d.category = "low";
                d.color = "gold";
            } else if (d.total_passenger_count >= 50000 && d.total_passenger_count < 200000) {
                d.category = "medium";
                d.color = "red";
            } else {
                d.category = "high";
                d.color = "navy";
            }
        });
    };

    const renderFlightRoute = (geoData, cityData, flightRoutes) => {
        const width = +d3.select("#flightRoute").style("width").replace("px", "");
        const height = +d3.select("#flightRoute").style("height").replace("px", "");

        d3.select('#flightRoute').selectAll('*').remove();

        if (!geoData || !geoData.features || !Array.isArray(geoData.features)) {
            console.error("Invalid GeoJSON data:", geoData);
            return;
        }

        const zoomBehavior = d3.zoom()
            .scaleExtent([1, 2])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        const svg = d3.select('#flightRoute')

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "26px")
            .text("Airports & Flight Routes")
            .attr("fill", "#003366")
            .style("font-weight", "bold")

        const g = svg.append('g').attr('transform', `translate(0, 0)`);;
        const projection = d3.geoAlbersUsa().fitSize([width, height-50], geoData);
        const path = d3.geoPath().projection(projection);

        g.selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', '#d3d3d3')
            .attr('stroke', '#000')
            .attr('stroke-width', 0.5);

        const cityCircles = g.selectAll('circle')
            .data(cityData)
            .enter()
            .append('circle')
            .attr('cx', d => {
                const coordinates = projection([d.Longitude, d.Latitude]);
                if (coordinates) return coordinates[0];
                return null;
            })
            .attr('cy', d => {
                const coordinates = projection([d.Longitude, d.Latitude]);
                if (coordinates) return coordinates[1];
                return null;
            })
            .attr('r', 4)
            .attr('fill', d => d.color)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .attr('class', 'city-circle')
            .on('click', (event, d) => {
                event.stopPropagation();
                d3.selectAll('.city-circle')
                    .attr('r', 4)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 0.5)
                    .style('filter', 'none');
                d3.select(event.currentTarget)
                    .attr('r', 8)
                    .attr('stroke', '#FFD700')
                    .attr('stroke-width', 3)
                    .style('filter', 'drop-shadow(0px 0px 8px #FFD700)');
                setSelectedAirport(d);
                drawRoutes(g, projection, flightRoutes, cityData, d.Latitude, d.Longitude);
                onSelectAirport(d);
            })
            .on('mouseover', (event, d) => {
                d3.select('#tooltip-route')
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`)
                    .style('visibility', 'visible')
                    .html(`<strong>${d.city_name}</strong><br/>
                           <strong>Departures:</strong> ${d.departure_count}<br/>
                           <strong>Arrivals:</strong> ${d.arrival_count}<br/>`);
            })
            .on('mouseout', () => {
                d3.select('#tooltip-route').style('visibility', 'hidden');
            });

        if (!d3.select('#tooltip-route').node()) {
            d3.select('body').append('div')
                .attr('id', 'tooltip-route')
                .style('position', 'absolute')
                .style('background', '#fff')
                .style('padding', '5px')
                .style('border', '1px solid #ccc')
                .style('border-radius', '5px')
                .style('visibility', 'hidden');
        }

        const legendData = [
            { label: 'Airports (< 50,000 passengers)', color: 'gold' },
            { label: 'Airports (50,000 - 200,000 passengers)', color: 'red' },
            { label: 'Airports (>= 200,000 passengers)', color: 'navy' }
        ];
        const legendGroup = svg.append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(${width - 750}, ${height - 30})`);
        legendGroup.selectAll('g')
            .data(legendData)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(${i * 250}, 0)`)
            .each(function (d) {
                d3.select(this).append('rect')
                    .attr('width', 15)
                    .attr('height', 15)
                    .attr('fill', d.color)
                    .attr('stroke', 'black');

                d3.select(this).append('text')
                    .attr('x', 25)
                    .attr('y', 12)
                    .attr('fill', 'black')
                    .style('font-size', '12px')
                    .text(d.label);
            });

        svg.on('click', (event) => {
            const isCircle = event.target.tagName === 'circle';
            if (!isCircle) {
                resetMap(g, cityData);
            }
        });
    };

    const drawRoutes = (g, projection, flightRoutes, cityData, originLat, originLng) => {
        const routes = flightRoutes.filter(route =>
            Math.abs(+route.ORIGIN_LAT - originLat) < 0.0001 &&
            Math.abs(+route.ORIGIN_LNG - originLng) < 0.0001
        );

        const destinationPoints = new Set(
            routes.map(route => `${route.DEST_LAT},${route.DEST_LNG}`)
        );

        g.selectAll('.city-circle')
            .style('visibility', d => {
                const coordinates = `${d.Latitude},${d.Longitude}`;
                return (
                    Math.abs(+d.Latitude - originLat) < 0.0001 &&
                    Math.abs(+d.Longitude - originLng) < 0.0001
                ) || destinationPoints.has(coordinates)
                    ? 'visible'
                    : 'hidden';
            });

        g.selectAll('.route-line').remove();

        g.selectAll('.route-line')
            .data(routes)
            .enter()
            .append('path')
            .attr('d', d => {
                const [x1, y1] = projection([+d.ORIGIN_LNG, +d.ORIGIN_LAT]);
                const [x2, y2] = projection([+d.DEST_LNG, +d.DEST_LAT]);
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2 - 50;
                return d3.line()
                    .curve(d3.curveBasis)([
                        [x1, y1],
                        [midX, midY],
                        [x2, y2],
                    ]);
            })
            .attr('fill', 'none')
            .attr('stroke', '#348cbb')
            .attr('opacity', 0.5)
            .attr('stroke-width', 1)
            .attr('class', 'route-line');
    };

    const resetMap = (g, cityData) => {
        setSelectedAirport(null);
        g.selectAll('.route-line').remove();
        g.selectAll('.city-circle').style('visibility', 'visible')
            .attr('r', 4)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .style('filter', 'none');
        onSelectAirport(null);
    };

    return (
        <div>
            <svg id="flightRoute"></svg>
            <p class="flightRouteText">The above chart allows you to select any airport, represented by a dot, to uncover the specific flight routes it connects to. This reveals the pathways passengers traverse and highlights the airport's role within the broader network. Simultaneously, the adjacent sunburst chart dynamically updates to reflect data for the selected airport, offering deeper insights into delays, cancellations, and divergences tied to that location.</p>
        </div>
    );
};

export default FlightRoute;

