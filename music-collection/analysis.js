const timeline = document.querySelector('[data-timeline]');

if (timeline) {
  const canvas = timeline.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    const focus = timeline.querySelector('.timeline-focus');
    const data = Array.from(timeline.querySelectorAll('[data-year]'), (row) => ({
      year: row.dataset.year,
      count: Number(row.dataset.count),
    }));
    const peak = data.reduce((top, item, index) => item.count > data[top].count ? index : top, 0);
    const margin = {left: 37, right: 15, top: 16, bottom: 26};
    let active = peak;

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.scale(scale, scale);
      const bottom = height - margin.bottom;
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = bottom - margin.top;
      const maximum = Math.max(4, Math.ceil(data[peak].count / 4) * 4);
      const points = data.map((item, index) => ({
        x: margin.left + plotWidth * (data.length === 1 ? .5 : index / (data.length - 1)),
        y: bottom - plotHeight * item.count / maximum,
      }));
      context.font = '11px system-ui, sans-serif';
      context.fillStyle = '#4e625b';
      context.strokeStyle = '#dce4d8';
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      for (let step = 0; step <= 4; step++) {
        const y = bottom - plotHeight * step / 4;
        context.beginPath();
        context.moveTo(margin.left, y);
        context.lineTo(width - margin.right, y);
        context.stroke();
        context.fillText(String(maximum * step / 4), margin.left - 7, y);
      }
      if (points.length > 1) {
        context.beginPath();
        context.moveTo(points[0].x, bottom);
        for (const point of points) context.lineTo(point.x, point.y);
        context.lineTo(points.at(-1).x, bottom);
        context.closePath();
        const shade = context.createLinearGradient(0, margin.top, 0, bottom);
        shade.addColorStop(0, '#93b69d90');
        shade.addColorStop(1, '#93b69d15');
        context.fillStyle = shade;
        context.fill();
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (const point of points.slice(1)) context.lineTo(point.x, point.y);
        context.strokeStyle = '#3c6b53';
        context.lineWidth = 2.3;
        context.stroke();
      }
      context.fillStyle = '#4e625b';
      context.textAlign = 'center';
      const gap = Math.max(1, Math.ceil(38 * (points.length - 1) / plotWidth));
      points.forEach((point, index) => {
        if (index === points.length - 1 || (index % gap === 0 && points.length - 1 - index >= gap)) {
          context.fillText(data[index].year, point.x, bottom + 15);
        }
      });
      const point = points[active];
      context.beginPath();
      context.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
      context.fillStyle = '#ae6347';
      context.fill();
      focus.textContent = `${data[active].year} 年 · ${data[active].count} 首`;
    }

    canvas.hidden = false;
    focus.hidden = false;
    timeline.querySelector('details').open = false;
    new ResizeObserver(draw).observe(canvas);
    canvas.addEventListener('pointermove', (event) => {
      const plotWidth = canvas.clientWidth - margin.left - margin.right;
      const position = (event.offsetX - margin.left) / plotWidth;
      const index = Math.min(data.length - 1, Math.max(0, Math.round(position * (data.length - 1))));
      if (index !== active) {
        active = index;
        draw();
      }
    });
    canvas.addEventListener('pointerleave', () => {
      active = peak;
      draw();
    });
  }
}
