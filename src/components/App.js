import React from 'react';
import Controls from './Controls';
import { generateDungeon, getPlayerStartingLocation } from '../lib/map';

// Take Home Projects - Build a Roguelike Dungeon Crawler Game
// Objective: Build a CodePen.io app that is functionally similar to this: https://codepen.io/freeCodeCamp/full/apLXEJ/.
// Fulfill the below user stories. Use whichever libraries or APIs you need. Give it your own personal style.
// User Story: I have health, a level, and a weapon. I can pick up a better weapon. I can pick up health items.
// User Story: All the items and enemies on the map are arranged at random.
// User Story: I can move throughout a map, discovering items.
// User Story: I can move anywhere within the map's boundaries, but I can't move through an enemy until I've beaten it.
// User Story: Much of the map is hidden. When I take a step, all spaces that are within a certain number of spaces from me are revealed.
// User Story: When I beat an enemy, the enemy goes away and I get XP, which eventually increases my level.
// User Story: When I fight an enemy, we take turns damaging each other until one of us loses. I do damage based off of my level and my weapon. The enemy does damage based off of its level. Damage is somewhat random within a range.
// User Story: When I find and beat the boss, I win.
// User Story: The game should be challenging, but theoretically winnable.

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onResize = this.onResize.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.onClickPrevious = this.onClickPrevious.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
    this.onChange = this.onChange.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.keys = {};
    this.state = {
      showControls: false,
      mode: 0,
      modes: ['Map Mode', 'Explore Mode'],
      options: [
        [
          {
            name: 'Update Map',
            type: 'function',
            function: this.updateMap
          }
        ],
        []
      ]
    }
  }

  componentDidMount() {
    this._resizeViewport();
    this.updateMap();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.frame = window.requestAnimationFrame(this.onAnimationFrame);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.cancelAnimationFrame(this.frame);
  }

  onResize() {
    this._resizeViewport();
  }

  onKeyDown(event) {
    event.preventDefault();
    if (!this.keys[event.key]) {
      this.onKeyPress(event.key);
      this.keys[event.key] = true;
      if (this.captureKeys) {
        this.state.scene.keyboardState(this.keys);
      }
    }
  }

  onKeyUp(event) {
    event.preventDefault();
    this.keys[event.key] = false;
    if (this.captureKeys) {
      this.state.scene.keyboardState(this.keys);
    }
  }

  onKeyPress(key) {
    const { map, player } = this.state;
    if (key === 'Escape') {
      this.setState({
        showControls: !this.state.showControls
      });
    }
    let dx = 0;
    let dy = 0;
    if (key === 'ArrowUp') {
      dy = -1;
    } else if (key === 'ArrowDown') {
      dy = 1;
    } else if (key === 'ArrowLeft') {
      dx = -1;
    } else if (key === 'ArrowRight') {
      dx = 1;
    }
    if (dx !== 0 || dy !== 0) {
      if (map.data[player.y + dy][player.x + dx] !== 0) {
        this.setState({
          player: {
            x: player.x + dx,
            y: player.y + dy
          }
        })
      }
    }
  }

  onCloseMenu() {
    this.setState({
      showControls: false
    });
  }

  onAnimationFrame() {
    this._drawMap();
    this.frame = window.requestAnimationFrame(this.onAnimationFrame);
  }

  onClickNext() {
    this.setState({ mode: (this.state.mode + 1) % this.state.modes.length });
  }

  onClickPrevious() {
    this.setState({ mode: (this.state.mode + this.state.modes.length - 1) % this.state.modes.length });
  }

  onChange(option, value) {
    if (value !== option.value) {
      this.setOption(option, value);
      this.forceUpdate();
    }
  }

  setOption(option, value) {
  }

  _resizeViewport() {
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  updateMap() {
    let map = generateDungeon({ width: 112, height: 63, goal: 0.25, zones: 20, minSize: 4, maxSize: 10 });
    const player = getPlayerStartingLocation(map);
    this.setState({
      map,
      player
    });
  }

  _drawMap() {
    if (!this.state || !this.state.map) {
      return;
    }
    const { width, height, data, rooms } = this.state.map;
    const player = this.state.player;
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const cellWidth = Math.floor(this.canvas.width / width);
    const cellHeight = Math.floor(this.canvas.height / height);
    const xOffset = Math.floor((this.canvas.width - width * cellWidth) / 2);
    const yOffset = Math.floor((this.canvas.height - height * cellHeight) / 2);
    const colors = ['#7F0000', '#007F00', '#00007F', '#7F7F00', '#7F007F', '#007F7F', '#7F3F3F', '#3F7F3F', '#3F3F7F', '#7F7F3F', '#7F3F7F', '#3F7F7F'];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[y][x] !== 0) {
          if (data[y][x] <= rooms.length) {
            const room = rooms[data[y][x] - 1];
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
          ctx.fillText(data[y][x].toString(), xOffset + x * cellWidth + cellWidth / 2, yOffset + y * cellHeight + cellHeight / 2);
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

  render() {
    return (
      <div id="screen">
        <canvas id="canvas" ref={elem => this.canvas = elem} onClick={this.onClick}></canvas>
        <Controls show={this.state.showControls} title={this.state.modes[this.state.mode]} options={this.state.options[this.state.mode]} onClickPrevious={this.onClickPrevious} onClickNext={this.onClickNext} onChange={this.onChange} />
      </div>
    );
  }
}

export default App;