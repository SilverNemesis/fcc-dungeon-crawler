export function generateDungeon(width, height) {
  width = _makeOdd(width);
  height = _makeOdd(height);

  const data = [];
  for (let y = 0; y < height; y++) {
    data.push(new Array(width).fill(0));
  }

  const maxRoomSize = _makeOdd(Math.max(Math.floor(Math.min(width / 4, height / 4)), 3));
  const roomSize = [];
  let power = 0;
  for (let s = maxRoomSize; s >= 3; s -= 2) {
    const count = Math.pow(2, power++);
    for (let c = 0; c < count; c++) {
      roomSize.push(s);
    }
  }

  let rooms = [];
  const areaGoal = width * height / 2;
  let area = 0;
  while (area < areaGoal) {
    const size = _pickRandom(roomSize);
    const room = { width: size, height: size };
    if (Math.random() > 0.3) {
      if (Math.random() < 0.5) {
        room.width += 2;
      } else {
        room.height += 2;
      }
    }
    rooms.push(room)
    area += room.width * room.height;
  }

  _sortRooms_LargestToSmallest(rooms);

  let roomCount = rooms.length;
  for (let i = 0; i < roomCount; i++) {
    const room = rooms[i];
    let placed = false;
    for (let t = 0; t < 1000; t++) {
      room.x = _makeOdd(_range(1, width - room.width - 1));
      room.y = _makeOdd(_range(1, height - room.height - 1));
      let overlap = false;
      for (let j = 0; j < i; j++) {
        if (_doRoomsOverlap(room, rooms[j], room.width >= 7 ? 3 : 1, room.height >= 7 ? 3 : 1)) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        placed = true;
        break;
      }
    }
    if (!placed) {
      delete room.x;
      delete room.y;
    }
  }

  rooms = rooms.filter((room) => room.x || room.y);
  roomCount = rooms.length;

  for (let i = 0; i < roomCount; i++) {
    const room = rooms[i];
    for (let h = 0; h < room.height; h++) {
      for (let w = 0; w < room.width; w++) {
        data[room.y + h][room.x + w] = i + 1;
      }
    }
  }

  const links = [];
  for (let i = 0; i <= roomCount; i++) {
    links.push(i);
  }

  const connectors = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (data[y][x] === 0) {
        if (data[y - 1][x] === 0 && data[y + 1][x] === 0 && data[y][x - 1] !== 0 && data[y][x + 1] !== 0) {
          if (data[y][x - 1] < data[y][x + 1]) {
            connectors.push({ x, y, r1: data[y][x - 1], r2: data[y][x + 1] });
          } else if (data[y][x - 1] > data[y][x + 1]) {
            connectors.push({ x, y, r1: data[y][x + 1], r2: data[y][x - 1] });
          }
        } else if (data[y][x - 1] === 0 && data[y][x + 1] === 0 && data[y - 1][x] !== 0 && data[y + 1][x] !== 0) {
          if (data[y - 1][x] < data[y + 1][x]) {
            connectors.push({ x, y, r1: data[y - 1][x], r2: data[y + 1][x] });
          } else if (data[y - 1][x] > data[y + 1][x]) {
            connectors.push({ x, y, r1: data[y + 1][x], r2: data[y - 1][x] });
          }
        }
      }
    }
  }

  _sortConnectors(connectors);

  const conCount = connectors.length;
  let cur;
  let nxt;
  for (cur = 0; cur < conCount; cur = nxt) {
    for (nxt = cur + 1; nxt < conCount; nxt++) {
      if (connectors[nxt].r1 !== connectors[cur].r1 || connectors[nxt].r2 !== connectors[cur].r2) {
        break;
      }
    }
    if (links[connectors[cur].r1] !== links[connectors[cur].r2]) {
      const apl = connectors[Math.floor(cur + (nxt - cur) / 2)];
      const min = Math.min(links[apl.r1], links[apl.r2]);
      const max = Math.max(links[apl.r1], links[apl.r2]);
      links[apl.r1] = min;
      links[apl.r2] = min;
      for (let i = 1; i <= roomCount; i++) {
        if (links[i] === max) {
          links[i] = min;
        }
      }
      data[apl.y][apl.x] = roomCount + 1;
    }
  }

  for (let i = 0; i < roomCount; i++) {
    const room = rooms[i];
    room.id = i + 1;
    room.group = links[room.id];
  }

  _sortRooms_GroupAndId(rooms);

  let groups = 0;

  for (cur = 0; cur < roomCount; cur = nxt) {
    for (nxt = cur + 1; nxt < roomCount; nxt++) {
      if (rooms[nxt].group !== rooms[cur].group) {
        break;
      }
    }
    groups++;
    for (let apl = cur; apl < nxt; apl++) {
      rooms[apl].group = groups;
    }
  }

  const roomInfo = [];
  for (let i = 0; i < groups; i++) {
    roomInfo.push(new Array(groups).fill(null));
  }

  for (let i = 0; i < roomCount; i++) {
    for (let j = i + 1; j < roomCount; j++) {
      if (rooms[i].group === rooms[j].group) {
        continue;
      }

      const alignmentAndDistance = _getAlignmentAndDistance(rooms[i], rooms[j]);

      if (!alignmentAndDistance) {
        continue;
      }

      const { alignment, distance, x, y, horizontal } = alignmentAndDistance;

      if (alignment === 0) {
        continue;
      }

      const g1 = rooms[i].group - 1;
      const g2 = rooms[j].group - 1;

      if (!roomInfo[g1][g2] || roomInfo[g1][g2].distance > distance || (roomInfo[g1][g2].distance === distance && roomInfo[g1][g2].alignment < alignment)) {
        roomInfo[g1][g2] = { distance, room1: rooms[i].id, room2: rooms[j].id, alignment, x, y, horizontal };
      }

      if (!roomInfo[g2][g1] || roomInfo[g2][g1].distance > distance || (roomInfo[g2][g1].distance === distance && roomInfo[g2][g1].alignment < alignment)) {
        roomInfo[g2][g1] = { distance, room1: rooms[i].id, room2: rooms[j].id, alignment, x, y, horizontal };
      }
    }
  }

  for (let i = 0; i < groups; i++) {
    let min = -1;
    for (let j = 0; j < groups; j++) {
      if (!roomInfo[i][j]) {
        continue;
      }
      if (min === -1 || roomInfo[i][j].distance < roomInfo[i][min].distance) {
        min = j;
      }
    }
    if (min !== -1) {
      const { x, y, distance, horizontal } = roomInfo[i][min];

      if (horizontal) {
        for (let o = 0; o < distance; o++) {
          data[y][x + o] = roomCount + 1;
        }
      } else {
        for (let o = 0; o < distance; o++) {
          data[y + o][x] = roomCount + 1;
        }
      }
    }
  }

  _sortRooms_Id(rooms);

  return {
    width,
    height,
    data,
    rooms
  };
}

export function getPlayerStartingLocation(map) {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.data[y][x] !== 0) {
        return { x, y };
      }
    }
  }
}

function _range(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _makeOdd(value) {
  return Math.floor(value / 2) * 2 + 1;
}

function _pickRandom(data) {
  return data[Math.floor(Math.random() * data.length)];
}

function _sortRooms_LargestToSmallest(rooms) {
  rooms.sort((pri, sec) => {
    const priArea = pri.width * pri.height;
    const secArea = sec.width * sec.height;
    if (priArea < secArea) {
      return 1;
    } else if (priArea > secArea) {
      return -1;
    }
    return 0;
  });
}

function _sortRooms_GroupAndId(rooms) {
  rooms.sort((pri, sec) => {
    if (pri.group < sec.group) {
      return -1;
    } else if (pri.group > sec.group) {
      return 1;
    }
    if (pri.id < sec.id) {
      return -1;
    } else if (pri.id > sec.id) {
      return 1;
    }
    return 0;
  });
}

function _sortRooms_Id(rooms) {
  rooms.sort((pri, sec) => {
    if (pri.id < sec.id) {
      return -1;
    } else if (pri.id > sec.id) {
      return 1;
    }
    return 0;
  });
}

function _sortConnectors(connectors) {
  connectors.sort((pri, sec) => {
    if (pri.r1 < sec.r1) { return -1; }
    else if (pri.r1 > sec.r1) { return 1; }
    if (pri.r2 < sec.r2) { return -1; }
    else if (pri.r2 > sec.r2) { return 1; }
    if (pri.x < sec.x) { return -1; }
    else if (pri.x > sec.x) { return 1; }
    if (pri.y < sec.y) { return -1; }
    else if (pri.y > sec.y) { return 1; }
    return 0;
  });
}

function _doRoomsOverlap(pri, sec, bx, by) {
  if (pri.x >= sec.x + sec.width + bx || sec.x >= pri.x + pri.width + bx) {
    return false;
  }
  if (pri.y >= sec.y + sec.height + by || sec.y >= pri.y + pri.height + by) {
    return false;
  }
  return true;
}

function _getAlignmentAndDistance(room1, room2) {
  if (room1.y > room2.y + room2.height || room2.y > room1.y + room1.height) {
    if (room1.x > room2.x + room2.width || room2.x > room1.x + room1.width) {
      return null;
    } else {
      let y;
      let distance;
      if (room1.y > room2.y + room2.height) {
        y = room2.y + room2.height
        distance = room1.y - y;
      } else {
        y = room1.y + room1.height;
        distance = room2.y - y;
      }
      const max = Math.min(room1.x + room1.width, room2.x + room2.width);
      const min = Math.max(room1.x, room2.x)
      const x = Math.floor((min + max) / 2);
      return { alignment: max - min, distance, x, y, horizontal: false };
    }
  } else {
    if (room1.x > room2.x + room2.width || room2.x > room1.x + room1.width) {
      let x
      let distance;
      if (room1.x > room2.x + room2.width) {
        x = room2.x + room2.width;
        distance = room1.x - x;
      } else {
        x = room1.x + room1.width;
        distance = room2.x - x;
      }
      const max = Math.min(room1.y + room1.height, room2.y + room2.height);
      const min = Math.max(room1.y, room2.y)
      const y = Math.floor((min + max) / 2);
      return { alignment: max - min, distance, x, y, horizontal: true };
    } else {
      return null;
    }
  }
}
