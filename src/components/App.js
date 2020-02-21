import React from 'react';
import { generateDungeon } from '../lib/map';

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
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.onClick = this.onClick.bind(this);
    this.state = {
      map: generateDungeon(101, 53, 1000)
    };
  }

  componentDidMount() {
    this._resizeViewport();
    window.addEventListener('resize', this.onResize);
    this.frame = window.requestAnimationFrame(this.onAnimationFrame);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    window.cancelAnimationFrame(this.frame);
  }

  onResize() {
    this._resizeViewport();
  }

  onAnimationFrame() {
    this._drawMap();
    this.frame = window.requestAnimationFrame(this.onAnimationFrame);
  }

  onClick() {
    this.setState({
      map: generateDungeon(101, 53, 1000)
    });
  }

  _resizeViewport() {
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  _drawMap() {
    const { width, height, data } = this.state.map;
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#000000';
    const cellWidth = Math.floor(this.canvas.width / width);
    const cellHeight = Math.floor(this.canvas.height / height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[y][x] !== 1) {
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }

  render() {
    return (
      <div className="screen">
        <canvas id="canvas" ref={elem => this.canvas = elem} onClick={this.onClick}></canvas>
      </div>
    );
  }
}

export default App;
