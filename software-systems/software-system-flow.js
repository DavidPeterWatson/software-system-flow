import define1 from "./scrubber.js";
import { serialize } from "@palewire/saving-json"

export default function define(runtime, observer) {
    const main = runtime.module();
    const core_banking_dev_flow = new Map([["core-banking-dev-flow", new URL("./files/core-banking-dev-flow.json", import.meta.url)]]);
    var linkOpacity = {
        "path": 1,
        "flow": 0
    }
    var nodeColor = {
        "person": "#ddee11",
        "team": "#ff9922",
        "service": "#0022aa",
        "environment": "#11dd00",
        "flowitem": "#dd2200"
    }
    var nodeRadius = {
        "person": "10",
        "team": "10",
        "service": "10",
        "environment": "10",
        "flowitem": "4"
    }
    // var xCenter = {
    //     "start": 10,
    //     "person": 0,
    //     "service": 0,
    //     "end": 0,

    // }
    // [10, 300, 1400, 1800, 180, 1800];
    // var xStrength = {
    //     "startperson": 2,
    //     "person": 0,
    //     "person": 0,

    // }
    // var xStrength = [2, 0, 0, 20, 0, 20];
    // var yCenter = [0, 0, 0, 0, 400, 400];
    // var yStrength = [0, 0, 0.1, 0, 0.1, 0.1];

    main.builtin("core_banking_dev_flow", runtime.fileAttachments(name => core_banking_dev_flow.get(name)));

    main.variable(observer("data")).define("data", ["core_banking_dev_flow"], function (core_banking_dev_flow) {
        return (
            core_banking_dev_flow("core-banking-dev-flow").json()
        )
    });

    main.variable(observer()).define(["md"], function (md) {
        return (
            md`# Software System Flow`
        )
    });


    main.variable(observer("viewoft")).define("viewoft", ["Scrubber", "d3"], function (Scrubber, d3) {
        return (
            Scrubber(d3.ticks(10, 30, 600), {
                autoplay: false,
                loop: false,
                initial: 0,
                format: x => `t = ${x.toFixed(3)}`
            })
        )
    });

    main.variable(observer("t")).define("t", ["Generators", "viewoft"], function (G, viewoft) {
        return G.input(viewoft);
    });


    main.variable(observer("chart")).define("chart", ["d3", "width", "height", "invalidation", "color", "drag",], function (d3, width, height, invalidation, color, drag) {
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);

        const simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-100))
            .force("link", d3.forceLink().id(d => d.id).distance(d => d.distance))
            .force('center', d3.forceCenter(width / 2, height / 2))
            // .force('x', d3.forceX()
            //     .x(d => xCenter[d.category])
            //     .strength(d => xStrength[d.category]))
            // .force('y', d3.forceY()
            //     .y(d => yCenter[d.category])
            //     .strength(d => yStrength[d.category]))
            .force('collision', d3.forceCollide().radius(5))
            .on("tick", ticked);

        let link = svg.append("g")
            .attr("stroke", "#333333")
            .attr("stroke-width", 1)
            .selectAll("line");

        let node = svg.append("g")
            .attr("stroke", "#333333")
            .attr("stroke-width", 0.5)
            .selectAll("circle");

        let label = svg.append("g")
            .selectAll("text");

        function ticked() {
            node.attr("cx", d => d.x)
                .attr("cy", d => d.y);

            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            label.attr("x", d => d.x - 20)
                .attr("y", d => d.y - 12)
                .text(d => d.name);
        }

        // Terminate the force layout when this cell re-runs.
        invalidation.then(() => simulation.stop());

        return Object.assign(svg.node(), {
            update({ nodes, links }) {

                // Make a shallow copy to protect against mutation, while
                // recycling old nodes to preserve position and velocity.
                const old = new Map(node.data().map(d => [d.id, d]));
                nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));

                const oldlinks = new Map(link.data().map(d => [d.linkid, d]));
                links = links.map(d => Object.assign(oldlinks.get(d.linkid) || {}, d));

                node = node
                    .data(nodes, d => d.id)
                    .join(enter => enter.append("circle")
                        .attr("r", d => nodeRadius[d.type])
                        .attr("fill", d => nodeColor[d.type])
                        .call(drag(simulation))
                    );

                link = link
                    .data(links, d => [d.source, d.target])
                    .join(enter => enter.append("line")
                        .attr("stroke-opacity", d => linkOpacity[d.type])
                    );

                label = label
                    .data(nodes, d => d.id)
                    .join(enter => enter.append("text")
                        .text(d => d.name)
                    );

                simulation.nodes(nodes);
                simulation.force("link").links(links);
                simulation.alpha(0.05).restart();
            }
        });
    }
    );

    main.variable(observer("drag")).define("drag", ["d3"], function (d3) {
        return (
            simulation => {

                function dragstarted(event) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    event.subject.fx = event.subject.x;
                    event.subject.fy = event.subject.y;
                }

                function dragged(event) {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                }

                function dragended(event) {
                    if (!event.active) simulation.alphaTarget(0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                }

                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            }
        )
    });

    main.variable(observer("filtered_data")).define("filtered_data", ["data", "t"], function (data, t) {
        let filtered_data = {}
        filtered_data.nodes = []
        filtered_data.links = []

        data.links.forEach(link => {
            if (link.time < t) {
                filtered_data.links.push(link)
                var index = filtered_data.nodes.findIndex(n => n.id === link.source);
                if (index === -1) { filtered_data.nodes.push(data.nodes.find(n => n.id === link.source)) }
                index = filtered_data.nodes.findIndex(n => n.id === link.target);
                if (index === -1) { filtered_data.nodes.push(data.nodes.find(n => n.id === link.target)) }
            }
        })

        filtered_data.links.forEach(link => {
            if (data.nodes.find(node => node.id === link.source).type === "flowitem") {
                link.distance = 1;
                link.strength = 1;
            } else if (data.nodes.find(node => node.id == link.source).name === data.nodes.find(node => node.id == link.target).team) {
                link.distance = 50;
                link.strength = 1;
            } else if (data.nodes.find(node => node.id == link.source).team === data.nodes.find(node => node.id == link.target).team) {
                link.distance = 100;
                link.strength = 0.3;
            } else {
                link.distance = 200;
                link.strength = 0.4;
            }
        });
        return filtered_data
    });

    main.variable(observer("update")).define("update", ["chart", "filtered_data"], function (chart, filtered_data) {
        return (
            chart.update(filtered_data)
        )
    });



    main.variable(observer("color")).define("color", ["d3"], function (d3) {
        return (
            d3.scaleOrdinal(d3.schemeTableau10)
        )
    });
    main.variable(observer("height")).define("height", function () {
        return (
            600
        )
    });
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
        return (
            require("d3@6")
        )
    });

    main.variable(observer()).define(["DOM", "serialize", "filtered_data"], function (DOM, serialize, filtered_data) {
        return (
            DOM.download(serialize(filtered_data), null, "Download JSON")
        )
    });

    main.variable(observer("serialize")).define("serialize", function () {
        return (
            function serialize(data) {
                let s = JSON.stringify(data);
                return new Blob([s], { type: "application/json" })
            }
        )
    });

    const child1 = runtime.module(define1);
    main.import("Scrubber", child1);
    return main;
}
