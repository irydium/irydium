<script>
  import {
    sugiyama,
    layeringSimplex,
    decrossOpt,
    coordVert,
    dagStratify,
  } from "d3-dag";
  import { symbol, symbolTriangle } from "d3-shape";
  import { getContext } from "svelte";

  var BrowserText = (function () {
    var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d");

    /**
     * Measures the rendered width of arbitrary text given the font size and font face
     * @param {string} text The text to measure
     * @param {number} fontSize The font size in pixels
     * @param {string} fontFace The font face ("Arial", "Helvetica", etc.)
     * @returns {number} The width of the text
     **/
    function getTextWidth(text, fontSize, fontFace) {
      context.font = `${fontSize}px ${fontFace ? fontFace : ""}`;
      return context.measureText(text).width;
    }

    return {
      getTextWidth: getTextWidth,
    };
  })();

  export let fontSize = 14;
  export let nodeRadius = 20;
  export let width = 1200;
  export let height = 400;

  export let fontFace = "Helvetica Neue";
  const tasks = getContext("tasks")();
  console.log(tasks);
  const layout = sugiyama()
    .size([width, height])
    .layering(layeringSimplex())
    .decross(decrossOpt())
    .coord(coordVert());

  const dag = layout(
    dagStratify()(
      tasks.map((t) => ({
        id: t.id,
        parentIds: t.inputs,
        textWidth: BrowserText.getTextWidth(t.id, fontSize, fontFace),
      }))
    )
  ).dag;

  const arrow = symbol()
    .type(symbolTriangle)
    .size((nodeRadius * nodeRadius) / 5.0);
  console.log(arrow());
</script>

<center>
  <svg {width} {height}>
    {#each dag.links() as link}
      <line
        stroke-width={3}
        stroke={'gray'}
        x1={link.source.x}
        y1={link.source.y}
        x2={link.target.x}
        y2={link.target.y} />
    {/each}
    {#each dag.descendants() as descendant}
      <circle cx={descendant.x} cy={descendant.y} r={nodeRadius} />
      <rect
        x={descendant.x - descendant.data.textWidth / 2}
        y={descendant.y + 7 - 14.0 / 2}
        width={descendant.data.textWidth}
        height={fontSize}
        style="fill:rgb(247, 250, 252);stroke-width:1;stroke:rgb(226, 232, 240)" />
      <text
        x={descendant.x}
        y={descendant.y + 12}
        font-weight="bold"
        fill="rgb(113, 128, 150)"
        font-size={fontSize}
        font-face={fontFace}
        text-anchor={'middle'}>
        {descendant.id}
      </text>
    {/each}
    {#each dag.links() as link}
      <path
        d={symbol()
          .type(symbolTriangle)
          .size((nodeRadius * nodeRadius) / 5.0)()}
        stroke={'white'}
        transform={((start, end) => {
          const dx = start.x - end.x;
          const dy = start.y - end.y;
          const scale = (nodeRadius * 1.15) / Math.sqrt(dx * dx + dy * dy);
          // This is the angle of the last line segment
          const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90;
          console.log(angle, dx, dy);
          return `translate(${end.x + dx * scale}, ${end.y + dy * scale}) rotate(${angle})`;
        })(link.source, link.target)} />
    {/each}
  </svg>
</center>
