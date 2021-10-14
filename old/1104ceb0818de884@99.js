// https://observablehq.com/@mbostock/color-ramp@99
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Color Ramp

A simple, reusable ramp for visualizing color scales. For a labeled version using D3 scales, see the [D3 color legend](/@d3/color-legend).`
)});
  main.variable(observer("ramp")).define("ramp", ["DOM"], function(DOM){return(
function ramp(color, n = 512) {
  const canvas = DOM.canvas(n, 1);
  const context = canvas.getContext("2d");
  canvas.style.margin = "0 -14px";
  canvas.style.width = "calc(100% + 28px)";
  canvas.style.height = "40px";
  canvas.style.imageRendering = "-moz-crisp-edges";
  canvas.style.imageRendering = "pixelated";
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}
)});
  main.variable(observer()).define(["ramp"], function(ramp){return(
ramp(t => `hsl(${t * 360},100%,50%)`)
)});
  main.variable(observer()).define(["ramp","d3"], function(ramp,d3){return(
ramp(d3.interpolateRainbow)
)});
  main.variable(observer()).define(["ramp","d3"], function(ramp,d3){return(
ramp(d3.interpolateViridis)
)});
  main.variable(observer()).define(["ramp","d3"], function(ramp,d3){return(
ramp(d3.interpolateViridis, 12)
)});
  main.variable(observer()).define(["ramp","d3"], function(ramp,d3){return(
ramp(d3.interpolateRgb("red", "blue"))
)});
  main.variable(observer()).define(["ramp","d3"], function(ramp,d3){return(
ramp(d3.interpolateLab("red", "blue"))
)});
  main.variable(observer()).define(["ramp","d3"], function(ramp,d3){return(
ramp(d3.interpolateHclLong("red", "blue"))
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3-scale-chromatic@1", "d3-interpolate@1")
)});
  return main;
}
