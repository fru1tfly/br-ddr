import { arrowImgs } from './assetLoader.js';
import { ARROW_SIZE, GOAL_LINE, END_ANIM_TIME } from './gameConstants.js';

const SUSTAIN_COLORS = ["#73E673", "#4C9797", "#FF9F42", "#874487"];

export class Note {
    constructor(song, dir, beat, sustainEnd, ind) {
        this.song = song; // the Song the note belongs to
        this.beat = beat; // beat the note starts on
        this.dir = dir; // direction of the note
        this.sustainEnd = sustainEnd; // beat the note ends on (if no sustain, equal to beat)
        this.ind = ind; // index in the initial array of notes created in the level editor

        this.played = false;
        this.missed = false;
        this.sustaining = false;
        this.releaseBeat = 0; // the beat when the sustain was released, if before end of sustain

        this.xPos = 0; // current X position
        this.yPos = 0; // current Y position
        this.sustainEndY = 0; // current Y position of the end of the note's sustain
        this.endY = 0; // Y position where the note was played

        this.arrowSize = ARROW_SIZE;
        this.opacity = 1;

        // animation timers
        this.endAnimTimer = 0;
        this.sustainAnimTimer = 0;
    }

    update(dt) {

        this.xPos = (this.song.canvasWidth / 4) * this.dir + this.song.canvasWidth / 8;
        this.yPos = GOAL_LINE - (this.song.initOffset + this.beat) * this.song.beatDistance + this.song.progress * this.song.songDistance;

        if(this.sustainEnd != this.beat) {
            this.sustainEndY = this.yPos - (this.sustainEnd - this.beat) * this.song.beatDistance;
        }

        if (this.endAnimTimer > 0) {
            this.endAnimTimer -= dt / 1000;

            // progress through the animation (0 = start, 1 = end)
            const animProgress = (END_ANIM_TIME - this.endAnimTimer) / END_ANIM_TIME;

            // adjust animProgress to use easing function on animation
            const easedOutBack = 1 + 2.70158 * Math.pow(animProgress - 1, 3) + 1.70158 * Math.pow(animProgress - 1, 2);

            this.arrowSize = ARROW_SIZE + 0.5 * ARROW_SIZE * easedOutBack;
            this.opacity = Math.max(1 - animProgress, 0);
        }

        if(this.sustaining) {
            this.sustainAnimTimer += dt / 30;
            this.song.score += 50 * dt / 1000 * this.song.combo;
            this.arrowSize = ARROW_SIZE * 1.1 + ARROW_SIZE * 0.05 * Math.sin(this.sustainAnimTimer);

            if (this.yPos - (this.sustainEnd - this.beat) * this.song.beatDistance > GOAL_LINE) {
                this.sustaining = false;
                this.endAnimTimer = END_ANIM_TIME;
                this.releaseBeat = this.sustainEnd;
            }
        }

        if(this.yPos > this.song.canvasHeight + ARROW_SIZE && !this.played && !this.missed) {
            this.missed = true;
            this.song.noteTotals[5]++;
            this.song.combo = 0;
        }
    }

    draw(ctx) {

        // if the sustain bar is in frame
        if(this.sustainEnd != this.beat && this.sustainEndY < this.song.canvasHeight + ARROW_SIZE && this.yPos > -ARROW_SIZE) {
            ctx.beginPath();
            if(!this.played || this.sustaining) {
                ctx.fillStyle = SUSTAIN_COLORS[this.dir];
                ctx.roundRect(
                    this.xPos - 10,
                    this.sustainEndY,
                    20,
                    (this.played ? this.endY : this.yPos) - this.sustainEndY,
                    [10]
                );
            } else if(this.played && !this.sustaining && this.releaseBeat !== this.sustainEnd) {
                const releaseY = this.yPos - (this.releaseBeat - this.beat) * this.song.beatDistance;
                ctx.fillStyle = "#333";
                ctx.roundRect(
                    this.xPos - 10,
                    this.sustainEndY,
                    20,
                    releaseY - this.sustainEndY,
                    [10]
                );
            }
            ctx.fill();
        }

        ctx.globalAlpha = this.opacity;
        ctx.drawImage(
            arrowImgs[this.dir],
            this.xPos - this.arrowSize / 2,
            (this.played ? this.endY : this.yPos) - this.arrowSize / 2,
            this.arrowSize,
            this.arrowSize
        );
        ctx.globalAlpha = 1;
    }

    // given the current beat when a note of a given direction is hit, check if this note is in range
    inWindow(dir, beat) {
        return this.dir === dir && this.beat > beat - 0.25 && this.beat < beat + 0.5;
    }

    // 
    getQuality() {
        const dist = Math.abs(this.yPos - GOAL_LINE);
        if (dist < this.song.canvasHeight / 50) {
            // perfect
            return 0;
        } else if (dist < this.song.canvasHeight / 25) {
            // great
            return 1;
        } else if (dist < this.song.canvasHeight / 12) {
            // good
            return 2;
        } else if (dist < this.song.canvasHeight / 8) {
            // ok
            return 3;
        } else  {
            // bad
            return 4;
        }
    }
}
