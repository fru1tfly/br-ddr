import { Note } from './note.js';
import { arrowImgs } from './assetLoader.js';
import { inputs, needToRelease } from './input.js';
import { ARROW_SIZE, GOAL_LINE, END_ANIM_TIME } from './gameConstants.js';

const POINT_VALUES = [100, 80, 60, 30, 10];

export class Song {
    constructor(filename, width, height) {
        this.notes = []; // all notes in the song
        this.progress = 0; // current position in the song (0 = start, 1 = end)
        this.loaded = false;

        this.score = 0;
        this.combo = 0;
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.noteTotals = [0, 0, 0, 0, 0, 0]; // track note qualities (0-4 matching Note.getQuality(), 5 = missed)

        this.audio; // the Audio object of the song
        this.bpm; // the song's tempo
        this.beatDistance; // the pixel distance between beats of the song
        this.initOffset; // the distance to offset the first beat from the start
        this.songDistance; // the total height of the chart

        fetch(filename)
        .then((r) => r.text())
        .then((r) => {
            const chartData = JSON.parse(r);

            this.audio = new Audio(chartData.audioFile);
            this.audio.addEventListener("canplaythrough", (e) => {
                this.bpm = chartData.bpm;
                this.beatDistance = chartData.beatDistance;
                this.initOffset = chartData.initOffset;

                for (let n of chartData.notes) {
                    this.notes.push(new Note(this, n.dir, n.beat, n.sustainEnd, n.ind));
                }

                const beatCount = Math.floor(this.audio.duration / (60 / this.bpm));
                this.songDistance = (this.initOffset + beatCount) * this.beatDistance;
                this.loaded = true;

                window.addEventListener('click', () => {
                    this.audio.play();
                })
            });
        });
    }

    update(dt) {
        if(!this.loaded) return;

        this.progress = this.audio.currentTime / this.audio.duration;
        const currentBeat = this.progress * (this.songDistance / this.beatDistance - this.initOffset);

        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i] && !needToRelease[i]) {

                const note = this.getNote(i, currentBeat);
                if(note) {
                    note.played = true;
                    note.endY = note.yPos;
                    if (note.sustainEnd > note.beat) {
                        note.sustaining = true;
                    } else {
                        note.endAnimTimer = END_ANIM_TIME;
                    }
                    const hitQuality = note.getQuality();
                    this.noteTotals[hitQuality]++;
                    this.combo++;
                    this.score += POINT_VALUES[hitQuality] * this.getMultiplier();

                }

                needToRelease[i] = true;
            } else if (!inputs[i] && needToRelease[i]) {

                let notesToRelease = this.notes.filter((n) => n.dir === i && n.sustaining);
                if (notesToRelease.length > 0) {
                    notesToRelease[0].releaseBeat = currentBeat;
                    notesToRelease[0].endAnimTimer = END_ANIM_TIME;
                    notesToRelease[0].sustaining = false;
                }

                needToRelease[i] = false;
            }
        }

        for(let note of this.notes) {
            note.update(dt);
        }
    }

    draw(ctx) {
        this.drawGoal(ctx);
        for(let note of this.notes) {
            note.draw(ctx);
        }

        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        ctx.fillText('Score: ' + Math.floor(this.score), 10, this.canvasHeight - 40);
        ctx.fillText('Combo: ' + this.combo, 10, this.canvasHeight - 15);
    }

    getNote(dir, beat) {
        let candidateNotes = [];
        for (let n of this.notes) {
            if (n.inWindow(dir, beat)) {
                candidateNotes.push(n);
            }
        }

        // find first note within candidate window (cannot assume notes are sorted in order)
        if (candidateNotes.length > 0) {
            let note;
            let minBeat = -1;
            for (let n of candidateNotes) {
                if (minBeat === -1 || minBeat > n.beat) {
                    minBeat = n.beat;
                    note = n;
                }
            }

            return note;
        }

        return null;
    }

    drawGoal(ctx) {
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < arrowImgs.length; i++) {
            ctx.drawImage(
                arrowImgs[i],
                (this.canvasWidth / 4) * i + this.canvasWidth / 8 - ARROW_SIZE / 2,
                GOAL_LINE - ARROW_SIZE / 2,
                ARROW_SIZE,
                ARROW_SIZE
            );
        }
        ctx.globalAlpha = 1;
    }

    getMultiplier() {
        if(this.combo > 50) return 5;
        if(this.combo > 30) return 4;
        if(this.combo > 20) return 3;
        if(this.combo > 10) return 2;
        return 1;
    }

}