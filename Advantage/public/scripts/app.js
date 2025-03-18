document.addEventListener("DOMContentLoaded", function () {

  const data = Array.from({ length: 10 }, (_, i) => ({
    x: i,
    y:  Math.floor(Math.random() * 501),
  }));
  
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  
  const svg = d3
    .select(".curve_graph")
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.y) * 1.2, d3.max(data, (d) => d.y) * 1.2])
    .range([height, 0]);

  const gradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "area-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#3b82f6")
    .attr("stop-opacity", 0.4);

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#3b82f6")
    .attr("stop-opacity", 0.1);

  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickSize(-height).tickFormat(""));

  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickFormat(""));

  const area = d3
    .area()
    .x((d) => x(d.x))
    .y0(height)
    .y1((d) => y(d.y))
    .curve(d3.curveNatural);

  svg.append("path").datum(data).attr("class", "area").attr("d", area);

  const line = d3
    .line()
    .x((d) => x(d.x))
    .y((d) => y(d.y))
    .curve(d3.curveNatural);

  svg.append("path").datum(data).attr("class", "line").attr("d", line);
  
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10));

  svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(10));

  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  const dots = svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", 4)
    .attr("fill", "#3b82f6")
    .attr("opacity", 0)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("r", 6).attr("opacity", 1);

      tooltip
        .style("opacity", 1)
        .html(`Value: ${d.y.toFixed(2)}`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", function () {
      d3.select(this).attr("r", 4).attr("opacity", 0);

      tooltip.style("opacity", 0);
    });

  // const hoverArea = svg
  //   .append("rect")
  //   .attr("width", width)
  //   .attr("height", height)
  //   .attr("fill", "none")
  //   .attr("pointer-events", "all")
  //   .on("mousemove", function (event) {
  //     const [xPos] = d3.pointer(event);
  //     const xValue = Math.round(x.invert(xPos));
  //     if (xValue >= 0 && xValue < data.length) {
  //       const dot = dots.filter((d) => d.x === xValue);
  //       dot.dispatch("mouseover");
  //     }
  //   })
  //   .on("mouseout", () => {
  //     dots.dispatch("mouseout");
    });

