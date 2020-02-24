const _directions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];

export function generateDungeon(options) {
  const { width, height, zones } = options;
  const data = [];
  for (let y = 0; y < height; y++) {
    data.push(new Array(width).fill(0));
  }

  const map = {
    width,
    height,
    data
  }

  _generateRooms(map, options);

  _sortRooms_LargestToSmallest(map.rooms);

  let { maxRooms } = options;

  if (zones && zones > 1) {
    _generateZones(map, zones);
    const placedRooms = _placeRoomsByZone(map, maxRooms);
    if (maxRooms !== undefined) {
      maxRooms -= placedRooms;
    }
  }

  _placeRooms(map, maxRooms);

  _connectNearbyRooms(map);

  _connectDistantRooms(map);

  return map;
}

export function getPlayerStartingLocation(map) {
  const { width, height, data } = map;
  const visited = [];
  for (let i = 0; i < height; i++) {
    visited.push(new Array(width).fill(0));
  }
  if (map.rooms.length === 0) {
    return { x: 1, y: 1 };
  }
  const bossRoom = map.rooms[0];
  let x = Math.floor(bossRoom.x + bossRoom.width / 2);
  let y = Math.floor(bossRoom.y + bossRoom.height / 2);
  let room = 1;
  const q = [];
  q.push({ x, y });
  while (q.length > 0) {
    const size = q.length;
    for (let i = 0; i < size; i++) {
      const top = q.shift();
      room = data[top.y][top.x];
      for (let j = 0; j < 4; j++) {
        const dir = _directions[j];
        if (top.x + dir.x < 0 || top.x + dir.x > width - 1 || top.y + dir.y < 0 || top.y + dir.y > height - 1) {
          continue;
        }
        if (data[top.y + dir.y][top.x + dir.x] !== 0) {
          if (visited[top.y + dir.y][top.x + dir.x] === 0) {
            visited[top.y + dir.y][top.x + dir.x] = 1;
            q.push({ x: top.x + dir.x, y: top.y + dir.y });
          }
        }
      }
    }
  }
  const playerRoom = map.rooms[room - 1];
  x = Math.floor(playerRoom.x + playerRoom.width / 2);
  y = Math.floor(playerRoom.y + playerRoom.height / 2);
  return { x, y };
}

function _generateRooms(map, options) {
  const { width, height } = map;
  let { goal, minSize, maxSize } = options;
  if (!goal) {
    goal = 0.5;
  }
  if (!minSize) {
    minSize = 3;
  }
  if (!maxSize) {
    maxSize = _makeOdd(Math.max(Math.floor(Math.min(width / 4, height / 4)), minSize));;
  }
  const roomSize = [];
  let power = 0;
  for (let s = maxSize; s >= minSize; s -= 2) {
    const count = Math.pow(2, power++);
    for (let c = 0; c < count; c++) {
      roomSize.push(s);
    }
  }

  let rooms = [];
  const areaGoal = width * height * goal;
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
  map.rooms = rooms;
}

function _generateZones(map, count) {
  const { width, height } = map;
  const loc = [];
  for (let i = 0; i < count; i++) {
    loc[i] = i;
  }

  _shuffle(loc);

  const xStep = Math.floor((width - 2) / count);
  const yStep = Math.floor((height - 2) / count);

  const zones = [];

  for (let i = 0; i < count; i++) {
    const zone = { x: i * xStep + 1, y: loc[i] * yStep + 1, width: xStep, height: yStep };
    zones.push(zone);
  }

  map.zones = zones;
}

function _placeRoomsByZone(map, maxRooms) {
  const { width, height, rooms, zones } = map;

  let placedRooms = 0;
  let zone = 0;
  const roomCount = rooms.length;
  for (let i = 0; i < roomCount; i++) {
    if (maxRooms && placedRooms === maxRooms) {
      break;
    }
    const room = rooms[i];
    const minX = zones[zone].x;
    const maxX = Math.min(zones[zone].x + zones[zone].width, width - room.width - 1);
    const minY = zones[zone].y;
    const maxY = Math.min(zones[zone].y + zones[zone].height, height - room.height - 1);
    if (minX + room.width > width - 1 || minY + room.height > height - 1) {
      continue;
    }
    let isPlaced = false;
    for (let t = 0; t < 100; t++) {
      room.x = _makeOdd(_range(minX, maxX));
      room.y = _makeOdd(_range(minY, maxY));
      let overlap = false;
      for (let j = 0; j < roomCount; j++) {
        if (j === i || !rooms[j].hasOwnProperty('x') || !rooms[j].hasOwnProperty('y')) {
          continue;
        }
        if (_doRoomsOverlap(room, rooms[j], 1, 1)) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        isPlaced = true;
        break;
      }
    }
    if (isPlaced) {
      placedRooms++;
      zone = (zone + 1) % zones.length;
    } else {
      delete room.x;
      delete room.y;
    }
  }

  return placedRooms;
}

function _placeRooms(map, maxRooms) {
  const { width, height, rooms } = map;

  let placedRooms = 0;
  const roomCount = rooms.length;
  for (let i = 0; i < roomCount; i++) {
    if (maxRooms !== undefined && placedRooms === maxRooms) {
      break;
    }
    const room = rooms[i];
    if (room.hasOwnProperty('x') && room.hasOwnProperty('y')) {
      continue;
    }
    let placed = false;
    for (let t = 0; t < 1000; t++) {
      room.x = _makeOdd(_range(1, width - room.width - 1));
      room.y = _makeOdd(_range(1, height - room.height - 1));
      let overlap = false;
      for (let j = 0; j < roomCount; j++) {
        if (j === i || !rooms[j].hasOwnProperty('x') || !rooms[j].hasOwnProperty('y')) {
          continue;
        }
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
    if (placed) {
      placedRooms++;
    } else {
      delete room.x;
      delete room.y;
    }
  }

  map.rooms = map.rooms.filter((room) => room.x || room.y);

  return map.rooms.length;
}

function _connectNearbyRooms({ width, height, data, rooms }) {
  const roomCount = rooms.length;

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

  const roomConnectors = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (data[y][x] === 0) {
        if (data[y - 1][x] === 0 && data[y + 1][x] === 0 && data[y][x - 1] !== 0 && data[y][x + 1] !== 0) {
          if (data[y][x - 1] < data[y][x + 1]) {
            roomConnectors.push({ x, y, r1: data[y][x - 1], r2: data[y][x + 1] });
          } else if (data[y][x - 1] > data[y][x + 1]) {
            roomConnectors.push({ x, y, r1: data[y][x + 1], r2: data[y][x - 1] });
          }
        } else if (data[y][x - 1] === 0 && data[y][x + 1] === 0 && data[y - 1][x] !== 0 && data[y + 1][x] !== 0) {
          if (data[y - 1][x] < data[y + 1][x]) {
            roomConnectors.push({ x, y, r1: data[y - 1][x], r2: data[y + 1][x] });
          } else if (data[y - 1][x] > data[y + 1][x]) {
            roomConnectors.push({ x, y, r1: data[y + 1][x], r2: data[y - 1][x] });
          }
        }
      }
    }
  }

  _sortRoomConnectors(roomConnectors);

  const conCount = roomConnectors.length;
  let cur;
  let nxt;
  for (cur = 0; cur < conCount; cur = nxt) {
    for (nxt = cur + 1; nxt < conCount; nxt++) {
      if (roomConnectors[nxt].r1 !== roomConnectors[cur].r1 || roomConnectors[nxt].r2 !== roomConnectors[cur].r2) {
        break;
      }
    }
    if (links[roomConnectors[cur].r1] !== links[roomConnectors[cur].r2]) {
      const apl = roomConnectors[Math.floor(cur + (nxt - cur) / 2)];
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
}

function _connectDistantRooms(map) {
  const { data, rooms } = map;

  const roomCount = rooms.length;

  _sortRooms_GroupAndId(rooms);

  let groups = 0;

  let cur;
  let nxt;

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

  const roomInfoList = {};

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

      const g1 = rooms[i].group;
      const g2 = rooms[j].group;
      const key = g1 + '_' + g2;

      if (!roomInfoList[key]) {
        roomInfoList[key] = { distance, g1, g2, room1: rooms[i].id, room2: rooms[j].id, alignment, x, y, horizontal };
      } else if (roomInfoList[key].distance > distance || (roomInfoList[key].distance === distance && roomInfoList[key].alignment < alignmentAndDistance)) {
        roomInfoList[key] = { distance, g1, g2, room1: rooms[i].id, room2: rooms[j].id, alignment, x, y, horizontal };
      }
    }
  }

  const groupConnectors = [];

  for (let prop in roomInfoList) {
    if (roomInfoList.hasOwnProperty(prop)) {
      groupConnectors.push(roomInfoList[prop]);
    }
  }

  _sortGroupConnectors(groupConnectors);

  const groupLinks = [];

  for (let i = 0; i <= groups; i++) {
    groupLinks.push(i);
  }

  for (let i = 0; i < groupConnectors.length; i++) {
    const groupConnector = groupConnectors[i];
    if (groupLinks[groupConnector.g1] !== groupLinks[groupConnector.g2]) {
      const min = Math.min(groupLinks[groupConnector.g1], groupLinks[groupConnector.g2]);
      const max = Math.max(groupLinks[groupConnector.g1], groupLinks[groupConnector.g2]);
      groupLinks[groupConnector.g1] = min;
      groupLinks[groupConnector.g2] = min;
      for (let i = 1; i <= groups; i++) {
        if (groupLinks[i] === max) {
          groupLinks[i] = min;
        }
      }

      const { x, y, distance, horizontal } = groupConnector;

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

  map.connected = true;

  for (let i = 1; i <= groups; i++) {
    if (groupLinks[i] !== 1) {
      map.connected = false;
      break;
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

function _shuffle(data) {
  const n = data.length;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = data[i];
    data[i] = data[j];
    data[j] = t;
  }
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

function _sortRoomConnectors(connectors) {
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

function _sortGroupConnectors(connectors) {
  connectors.sort((pri, sec) => {
    if (pri.distance < sec.distance) { return -1; }
    else if (pri.distance > sec.distance) { return 1; }
    if (pri.alignment < sec.alignment) { return -1; }
    else if (pri.alignment > sec.alignment) { return 1; }
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
