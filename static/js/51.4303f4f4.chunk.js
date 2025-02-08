"use strict";(self.webpackChunkair_travel_pattern_and_safety=self.webpackChunkair_travel_pattern_and_safety||[]).push([[51],{51:(t,e,a)=>{a.r(e),a.d(e,{default:()=>o,splitDescriptionIntoLines:()=>s});var n=a(43),i=a(452),r=a(579);function s(t,e){const a=t.split(" ");let n=[],i="";for(let r=0;r<a.length;r++)(i+(i?" ":"")+a[r]).length<=e?i+=(i?" ":"")+a[r]:(i&&n.push(i),i=a[r].trim());return i&&n.push(i),n}const o=()=>{const[t,e]=(0,n.useState)([]);return(0,n.useEffect)((()=>{function t(e,a,n){e.attr("opacity",1).transition().duration(7e3).ease(i.yfw).attrTween("transform",function(t,e){var a=t.getTotalLength();return function(n,i,r){return function(n){var i=t.getPointAtLength(n*a),r=i.y-e-30;return"translate("+i.x+","+r+")"}}}(a.node(),n)).on("end",(function(){e.attr("opacity",0),t(i.Ltv(this),a,n)}))}function e(t,e){let a=0,n=0;if(e<t.length-1){const i=t[e].x,r=t[e].y,s=t[e+1].x,o=(t[e+1].y-r)/(s-i);Math.abs(o)>1?(a=o>0?-15:30,n=22.5):(a=22.5,n=o>0?-30:30)}return e===t.length-1&&(a=0,n=-24),{xOffset:a,yOffset:n}}function a(t,e,a){const n=t.split(" "),r=[];let s="",o=0;const l=i.Ltv("svg").append("text").style("font-size","20px").style("font-family","Open Sans");return n.forEach((t=>{s+=t+" ",l.text(s),l.node().getComputedTextLength()>e&&(r.push(s.trim()),30*r.length>=a&&0===o&&(e/=3,o=1),s=t+" ")})),s&&r.push(s.trim()),l.remove(),r}i.fu7("/Data_visualization/data/Safety_measures.csv").then((n=>{!function(n){const r=i.Ltv("#timeline-line").append("g").attr("transform","translate(10, 40)"),o=+i.Ltv("#timeline-line").style("width").replace("px","")-30,l=+i.Ltv("#timeline-line").style("height").replace("px","")-40-150,c=o/n.length;n.forEach(((t,e)=>{t.x=e*c+20,t.y=l-(e/5*l/5-80*Math.sin(e/5*Math.PI))+25}));const f=i.n8j().x((t=>t.x)).y((t=>t.y)).curve(i.oDi);r.selectAll(".card").data(n).join("rect").attr("class","card").attr("rx",5).attr("ry",5).attr("fill","#fff").attr("fill-opacity",.5).attr("stroke","#959595").attr("stroke-width",1.5).attr("stroke-opacity",.5).attr("x",((t,a)=>{var r=s(t["Safety Measure"],10),o=i.T9B(r,(t=>t.length));const{xOffset:l}=e(n,a);return n[a].x-3.5*o+l-2.5})).attr("y",((t,a)=>{const{yOffset:i}=e(n,a);return n[a].y+(i<0?-(15*s(t["Safety Measure"],10).length-1.7*i):i/3)})).attr("width",((t,e)=>{var a=s(t["Safety Measure"],10);return 7*i.T9B(a,(t=>t.length))+5})).attr("height",((t,e)=>15*s(t["Safety Measure"],10).length+30)).on("mouseover",(function(t,e){i.Ltv("#tooltip-timeline").style("left",`${t.clientX}px`).style("top",t.clientY-225+"px").style("visibility","visible").html(`\n                    <strong>${e.Year}: ${e["Safety Measure"]}</strong> <br/> ${e.Description}\n                `)})).on("mousemove",(function(t){i.Ltv("#tooltip-timeline").style("left",`${t.clientX}px`).style("top",t.clientY-225+"px")})).on("mouseout",(function(){i.Ltv("#tooltip-timeline").style("visibility","hidden")}));r.selectAll(".card-text").data(n).join("text").attr("class","card-text").attr("x",((t,a)=>{const{xOffset:i}=e(n,a);return n[a].x+i})).attr("y",((t,a)=>{const{yOffset:i}=e(n,a);return n[a].y+(i<0?-(15*s(t["Safety Measure"],10).length-1.2*i):i+20)})).attr("text-anchor","middle").style("font-size","12px").style("fill","#333").selectAll("tspan").data((t=>s(t["Safety Measure"],10))).join("tspan").attr("x",((t,e,a)=>i.Ltv(a[e].parentNode).attr("x"))).attr("dy",((t,e)=>0===e?0:15)).text((t=>t)),r.selectAll(".label").data(n).join("text").attr("x",((t,a)=>{const{xOffset:i}=e(n,a);return n[a].x+i})).attr("y",((t,a)=>{const{yOffset:i}=e(n,a);return n[a].y+i})).attr("text-anchor","middle").text((t=>`${t.Icon} ${t.Year}`)).style("font-size","15px").style("fill","black");var y=r.append("path").datum(n).attr("d",f).attr("fill","none").attr("stroke","url(#gradient)").attr("stroke-width",3);const d=r.append("defs").append("linearGradient").attr("id","gradient").attr("x1","0%").attr("x2","100%").attr("y1","0%").attr("y2","0%");d.append("stop").attr("offset","0%").attr("stop-color","blue"),d.append("stop").attr("offset","100%").attr("stop-color","green");r.selectAll(".checkpoint").data(n).join("circle").attr("class","checkpoint").attr("cx",(t=>t.x)).attr("cy",(t=>t.y)).attr("r",10).attr("fill","#d6d6d6").style("stroke","black").style("stroke-width",2).on("mouseover",(function(t,e){i.Ltv("#tooltip-timeline").style("left",`${t.clientX}px`).style("top",t.clientY-225+"px").style("visibility","visible").html(`\n                    <strong>${e.Year}: ${e["Safety Measure"]}</strong> <br/> ${e.Description}\n                `)})).on("mousemove",(function(t){i.Ltv("#tooltip-timeline").style("left",`${t.clientX}px`).style("top",t.clientY-225+"px")})).on("mouseout",(function(){i.Ltv("#tooltip-timeline").style("visibility","hidden")}));var u="From the Wright Brothers\u2019 flight in 1903 to the skies we traverse today, the U.S. aviation industry has consistently pushed the boundaries of innovation to prioritize passenger safety. This timeline captures the evolution of key safety milestones \u2014 from the introduction of seat belts and pressurized cabins in the early 20th century to modern breakthroughs like automated flight tracking systems, and Safety Management Systems (SMS). Recent advancements, including COVID-19 safety protocols and ongoing testing of autonomous aircraft, underscore the industry's ability to adapt to unforeseen challenges. Each milestone not only marks a technical achievement but also reflects an unwavering focus on ensuring air travel is safer, more reliable, and better equipped.";const p=l-n[6].y;r.selectAll(".description").data([1]).join("text").attr("class","description").attr("x",0).attr("y",30).attr("text-anchor","left").style("font-size","20px").style("font-family","Open Sans").style("text-justify","inter-word").style("line-height","32px").attr("fill","#003366").selectAll("tspan").data((t=>a(u,o/3*2.2,p))).join("tspan").attr("x",((t,e,a)=>i.Ltv(a[e].parentNode).attr("x"))).attr("dy",((t,e)=>0===e?0:30)).text((t=>t)),r.append("text").attr("x",o/2).attr("y",-10).attr("text-anchor","middle").style("font-size","30px").text("Safety Measures Timeline").attr("fill","#003366").style("font-weight","bold");var h="The story of aviation safety is one of relentless progress, where each innovation builds upon lessons learned from the past. By connecting technological advancements to tangible outcomes and visualizing it over time, we uncover how data driven strategies and adaptive measures have not only addressed vulnerabilities but also laid the groundwork for a safer and more resilient future in air travel.";r.selectAll(".transition").data([1]).join("text").attr("class","transition").attr("x",o/3+30).attr("y",l).attr("text-anchor","left").style("font-size","20px").style("text-justify","inter-word").style("text-align","justify").style("font-family","Open Sans").style("line-height","32px").attr("fill","#003366").selectAll("tspan").data((t=>a(h,o/3*2-70,l))).join("tspan").attr("x",((t,e,a)=>i.Ltv(a[e].parentNode).attr("x"))).attr("dy",((t,e)=>0===e?0:30)).text((t=>t));t(r.append("text").attr("x",n[0].x-15).attr("y",n[0].y+10).text("\u2708\ufe0f").style("font-weight","bold").style("font-size","30px"),y,l)}(n.map((t=>{return{Year:t.Year||"","Safety Measure":t["Safety Measure"]||"",Description:t.Description||"",Icon:(e=t["Safety Measure"],{"First Seat Belts":"\ud83d\udd10","Life Jackets (Mae West)":"\ud83e\uddba","Pressurized Cabins":"\ud83d\udeeb","Smoke Detection Systems":"\ud83d\udd25","Ground Proximity Warning":"\ud83d\udce1","Emergency Locator Transmitter":"\ud83d\udce1","Reinforced Cockpit Doors":"\ud83d\udeaa","Enhanced GPWS":"\ud83d\udce1","Fatigue Risk Management":"\ud83d\ude34","Safety Management Systems (SMS)":"\ud83d\udee1\ufe0f","Pilot Qualification Standards":"\u2708\ufe0f","NextGen Data Comm":"\ud83d\udcbb","Flight Tracking Requirements":"\ud83d\udef0\ufe0f","ADS-B Introduction":"\ud83d\udef0\ufe0f","Enhanced Two-Person Cockpit Rule":"\ud83d\udc65","ADS-B Mandate Preparation":"\ud83d\udef0\ufe0f","Lithium Battery Restrictions":"\ud83d\udd0b","COVID-19 Aviation Safety Protocol":"\ud83e\udda0","Autonomous Aircraft":"\ud83e\udd16"}[e]||"\u2708\ufe0f")};var e})).sort(((t,e)=>parseInt(t.Year)-parseInt(e.Year))))})).catch((t=>{console.error("Error loading the CSV data: ",t)}))}),[]),(0,r.jsxs)("div",{id:"timeline-container",className:"timeline-container",children:[(0,r.jsx)("svg",{id:"timeline-line"}),(0,r.jsx)("div",{className:"tooltip-timeline",id:"tooltip-timeline",style:{position:"absolute",visibility:"hidden"}})]})}}}]);
//# sourceMappingURL=51.4303f4f4.chunk.js.map