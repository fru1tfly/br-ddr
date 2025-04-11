import { Song } from './song.js';
import { setSizes } from './gameConstants.js';

class Game {
    constructor(songs, ctx) {
        this.ctx = ctx; // rendering context

        // temp
        this.currentSong = new Song(songs[0], ctx.canvas.width, ctx.canvas.height);
    }

    update(dt) {
        this.currentSong.update(dt);
        this.currentSong.draw(this.ctx);
    }
}

let game;

let prevTime = 0;
function gameLoop(time) {
    let dt = time - prevTime;
    prevTime = time;

    game.ctx.clearRect(0, 0, game.ctx.canvas.width, game.ctx.canvas.height);
    game.update(dt);

    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    game = new Game(["/songs/Brain Rot.fruit"], ctx);
    setSizes(canvas.width, canvas.height);

    requestAnimationFrame(gameLoop);
});