/** 
 * @fileOverview Drawing logic
 */

/**
 * Resizes the viewport to match the bouding rectangle
 * @param {HTMLCanvasElement} canvas
 */
export function resizeViewport(canvas) {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width;
  canvas.height = rect.height;
}

/**
 * Draws the map and the player
 * @param {HTMLCanvasElement} canvas
 * @param {Map} map
 * @param {Player} player
 */
export function drawMap(canvas, map, player) {
  const { width, height, data, rooms, zones } = map;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cellWidth = Math.floor(canvas.width / width);
  const cellHeight = Math.floor(canvas.height / height);
  const xOffset = Math.floor((canvas.width - width * cellWidth) / 2);
  const yOffset = Math.floor((canvas.height - height * cellHeight) / 2);
  const colors = ['#7F0000', '#007F00', '#00007F', '#7F7F00', '#7F007F', '#007F7F', '#7F3F3F', '#3F7F3F', '#3F3F7F', '#7F7F3F', '#7F3F7F', '#3F7F7F'];

  if (zones) {
    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      ctx.fillStyle = colors[i % colors.length];
      for (let y = 0; y < zone.height; y++) {
        for (let x = 0; x < zone.width; x++) {
          ctx.fillRect(xOffset + (zone.x + x) * cellWidth + Math.floor((cellWidth - 4) / 2), yOffset + (zone.y + y) * cellHeight + Math.floor((cellHeight - 4) / 2), 4, 4);
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y][x] !== 0) {
        let room = undefined;
        if (data[y][x] <= rooms.length) {
          room = rooms[data[y][x] - 1];
          if (room.group) {
            ctx.fillStyle = colors[(room.group - 1) % colors.length];
          } else {
            ctx.fillStyle = '#3F3F3F';
          }
        } else {
          ctx.fillStyle = '#3F3F3F';
        }
        ctx.fillRect(xOffset + x * cellWidth + 1, yOffset + y * cellHeight + 1, cellWidth - 2, cellHeight - 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (room && room.zone) {
          ctx.fillText(data[y][x].toString(), xOffset + x * cellWidth + cellWidth / 2, yOffset + y * cellHeight + cellHeight / 4);
          ctx.fillText(room.zone.toString(), xOffset + x * cellWidth + cellWidth / 2, yOffset + y * cellHeight + cellHeight * 3 / 4);
        } else {
          ctx.fillText(data[y][x].toString(), xOffset + x * cellWidth + cellWidth / 2, yOffset + y * cellHeight + cellHeight / 2);
        }
      }
    }
  }

  const boss = {
    x: Math.floor(rooms[0].x + rooms[0].width / 2),
    y: Math.floor(rooms[0].y + rooms[0].height / 2)
  };

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '50px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('O', xOffset + boss.x * cellWidth + cellWidth / 2, yOffset + boss.y * cellHeight + cellHeight / 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '50px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', xOffset + player.x * cellWidth + cellWidth / 2, yOffset + player.y * cellHeight + cellHeight / 2);
}
