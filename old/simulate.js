import define1 from "./450051d7f1174df8@254.js";
import define2 from "./1104ceb0818de884@99.js";

export default function define(runtime, observer) {
    const main = runtime.module();
    const fileAttachments = new Map([["info-exchange.json", new URL("./files/information-exchange.json", import.meta.url)]]);

    var time = 0

    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));

    main.variable(observer()).define(["md"], function (md) {
        return (
            md`# Software System Flow

Each node is a compute instance, or a cluster of compute instances. Each time information is exchanged between 2 compute nodes a fient trace line is drawn.`
        )
    });

    main.variable(observer("viewoft")).define("viewoft", ["Scrubber", "d3"], function (Scrubber, d3) {
        return (
            Scrubber(d3.ticks(0, 200, 200), {
                autoplay: false,
                loop: false,
                initial: 50,
                format: x => `t = ${x.toFixed(3)}`
            })
        )
    });

    main.variable(observer("nodes")).define("nodes", ["data"], function (data) {
        return data.nodes.map(d => Object.create(d));
    });

    main.variable(observer("filterednodes")).define("filterednodes", ["nodes", "t"], function (nodes, t) {
        nodes.forEach(function (node) {
            if (node.test < t) {
                node.active = 'red'
            } else {
                node.active = 'green'
            }
        });

        return nodes;
    });

    main.variable(observer("t")).define("t", ["Generators", "viewoft", "data"], function (G, viewoft, data) {
        
        return G.input(viewoft);
    });


    main.variable(observer("links")).define("links", ["data"], function (data) {
        return data.exchange.map(d => Object.create(d));
    });

    
    main.variable(observer("chart")).define("chart", ["nodes", "links", "d3", "width", "height", "color", "drag", "invalidation"], function (nodes, links, d3, width, height, color, drag, invalidation) {

        
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.4)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        // const node = svg.append("g")
        //     .attr("stroke", "#fff")
        //     .attr("stroke-width", 1.5)
        //     .selectAll("circle")
        //     .data(nodes)
        //     .join("circle")
        //     .attr("r", 5)
        //     .attr("fill", color)
        //     .call(drag(simulation));

        const compute_node = svg.append("g")
            // .attr("stroke", "#fff")
            // .attr("stroke-width", 1.5)
            .selectAll("g")
            .data(nodes)
            .join(
              function(enter) {
                    return enter.append('circle')
                        .attr("fill", function (d) { return d.active });
               },
              function(update) {
                return update.attr('fill', function (d) { return d.active });
              }
            )
            .attr("r", 5)
            .call(drag(simulation));

        // node.append("title")
        //     .text(d => d.id);

        // var elem = svg.selectAll("g")
        //     .data(nodes)

        /*Create and place the "blocks" containing the circle and the text */
        // var elemEnter = elem.enter()
        //     .append("g")
        //     .call(drag(simulation))

        /*Create the circle for each block */
        // var circle = compute_node.enter()
        //     .append("circle")
        //     .attr("r", 5)
        //     .attr("stroke", "black")
        //     .attr("fill", color)
        //     .call(drag(simulation));
        

        /* Create the text for each block */
        // var label = compute_node.enter()
        //     .append("text")
        //     .text(function (d) { return d.name })

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            compute_node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            // elem
            //     .attr("x", d => d.x)
            //     .attr("y", d => d.y);

            // label
            //     .attr("x", d => d.x)
            //     .attr("y", d => d.y - 20);
        });

        // invalidation.then(() => simulation.stop());

        return svg.node();
    }
    );

    main.variable(observer("data")).define("data", ["FileAttachment"], function (FileAttachment) {
        return (
            FileAttachment("info-exchange.json").json()
        )
    });

    main.variable(observer("height")).define("height", function () {
        return (
            600
        )
    });

    main.variable(observer("color")).define("color", ["d3"], function (d3) {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return d => scale(d.active);
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
    
    const child1 = runtime.module(define1);
    main.import("Scrubber", child1);
    const child2 = runtime.module(define2);
    main.import("ramp", child2);
    return main;
}
