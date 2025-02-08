"use strict";(self.webpackChunkair_travel_pattern_and_safety=self.webpackChunkair_travel_pattern_and_safety||[]).push([[942],{942:(t,e,r)=>{r.r(e),r.d(e,{default:()=>i});var a=r(43),o=r(452),l=r(492),s=r(579);const i=()=>{const[t,e]=(0,a.useState)(null),{onSelectAirport:r}=(0,a.useContext)(l.Z);(0,a.useEffect)((()=>{Promise.all([o.Pq9("/Data_visualization/data/geojson.json"),o.fu7("/Data_visualization/data/Airport_Passenger_Count.csv"),o.fu7("/Data_visualization/data/Flight_Routes.csv")]).then((t=>{let[e,r,a]=t;i(r),n(e,r,a)})).catch((t=>console.error("Error loading data:",t)))}),[]);const i=t=>{t.forEach((t=>{t.departure_count=+t.departure_count,t.arrival_count=+t.arrival_count,t.total_passenger_count=t.departure_count+t.arrival_count,t.total_passenger_count<5e4?(t.category="low",t.color="gold"):t.total_passenger_count>=5e4&&t.total_passenger_count<2e5?(t.category="medium",t.color="red"):(t.category="high",t.color="navy")}))},n=(t,a,l)=>{const s=+o.Ltv("#flightRoute").style("width").replace("px",""),i=+o.Ltv("#flightRoute").style("height").replace("px","");if(o.Ltv("#flightRoute").selectAll("*").remove(),!t||!t.features||!Array.isArray(t.features))return void console.error("Invalid GeoJSON data:",t);o.s_O().scaleExtent([1,2]).on("zoom",(t=>{u.attr("transform",t.transform)}));const n=o.Ltv("#flightRoute");n.append("text").attr("x",s/2).attr("y",20).attr("text-anchor","middle").style("font-size","26px").text("Airports & Flight Routes").attr("fill","#003366").style("font-weight","bold");const u=n.append("g").attr("transform","translate(0, 0)"),p=o.UtK().fitSize([s,i-50],t),h=o.zFW().projection(p);u.selectAll("path").data(t.features).enter().append("path").attr("d",h).attr("fill","#d3d3d3").attr("stroke","#000").attr("stroke-width",.5);u.selectAll("circle").data(a).enter().append("circle").attr("cx",(t=>{const e=p([t.Longitude,t.Latitude]);return e?e[0]:null})).attr("cy",(t=>{const e=p([t.Longitude,t.Latitude]);return e?e[1]:null})).attr("r",4).attr("fill",(t=>t.color)).attr("stroke","black").attr("stroke-width",.5).attr("class","city-circle").on("click",((t,s)=>{t.stopPropagation(),o.Ubm(".city-circle").attr("r",4).attr("stroke","black").attr("stroke-width",.5).style("filter","none"),o.Ltv(t.currentTarget).attr("r",8).attr("stroke","#FFD700").attr("stroke-width",3).style("filter","drop-shadow(0px 0px 8px #FFD700)"),e(s),c(u,p,l,a,s.Latitude,s.Longitude),r(s)})).on("mouseover",((t,e)=>{o.Ltv("#tooltip-route").style("left",`${t.pageX+10}px`).style("top",`${t.pageY+10}px`).style("visibility","visible").html(`<strong>${e.city_name}</strong><br/>\n                           <strong>Departures:</strong> ${e.departure_count}<br/>\n                           <strong>Arrivals:</strong> ${e.arrival_count}<br/>`)})).on("mouseout",(()=>{o.Ltv("#tooltip-route").style("visibility","hidden")}));o.Ltv("#tooltip-route").node()||o.Ltv("body").append("div").attr("id","tooltip-route").style("position","absolute").style("background","#fff").style("padding","5px").style("border","1px solid #ccc").style("border-radius","5px").style("visibility","hidden");n.append("g").attr("id","legend").attr("transform",`translate(${s-750}, ${i-30})`).selectAll("g").data([{label:"Airports (< 50,000 passengers)",color:"gold"},{label:"Airports (50,000 - 200,000 passengers)",color:"red"},{label:"Airports (>= 200,000 passengers)",color:"navy"}]).enter().append("g").attr("transform",((t,e)=>`translate(${250*e}, 0)`)).each((function(t){o.Ltv(this).append("rect").attr("width",15).attr("height",15).attr("fill",t.color).attr("stroke","black"),o.Ltv(this).append("text").attr("x",25).attr("y",12).attr("fill","black").style("font-size","12px").text(t.label)})),n.on("click",(t=>{"circle"===t.target.tagName||d(u,a)}))},c=(t,e,r,a,l,s)=>{const i=r.filter((t=>Math.abs(+t.ORIGIN_LAT-l)<1e-4&&Math.abs(+t.ORIGIN_LNG-s)<1e-4)),n=new Set(i.map((t=>`${t.DEST_LAT},${t.DEST_LNG}`)));t.selectAll(".city-circle").style("visibility",(t=>{const e=`${t.Latitude},${t.Longitude}`;return Math.abs(+t.Latitude-l)<1e-4&&Math.abs(+t.Longitude-s)<1e-4||n.has(e)?"visible":"hidden"})),t.selectAll(".route-line").remove(),t.selectAll(".route-line").data(i).enter().append("path").attr("d",(t=>{const[r,a]=e([+t.ORIGIN_LNG,+t.ORIGIN_LAT]),[l,s]=e([+t.DEST_LNG,+t.DEST_LAT]),i=(r+l)/2,n=(a+s)/2-50;return o.n8j().curve(o.qrM)([[r,a],[i,n],[l,s]])})).attr("fill","none").attr("stroke","#348cbb").attr("opacity",.5).attr("stroke-width",1).attr("class","route-line")},d=(t,a)=>{e(null),t.selectAll(".route-line").remove(),t.selectAll(".city-circle").style("visibility","visible").attr("r",4).attr("stroke","black").attr("stroke-width",.5).style("filter","none"),r(null)};return(0,s.jsxs)("div",{children:[(0,s.jsx)("svg",{id:"flightRoute"}),(0,s.jsx)("p",{class:"flightRouteText",children:"The above chart allows you to select any airport, represented by a dot, to uncover the specific flight routes it connects to. This reveals the pathways passengers traverse and highlights the airport's role within the broader network. Simultaneously, the adjacent sunburst chart dynamically updates to reflect data for the selected airport, offering deeper insights into delays, cancellations, and divergences tied to that location."})]})}}}]);
//# sourceMappingURL=942.30fde709.chunk.js.map