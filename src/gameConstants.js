export let ARROW_SIZE = 0;
export let GOAL_LINE = 0;
export const END_ANIM_TIME = 0.25;


export function setSizes(width, height) {
    ARROW_SIZE = width / 4 - 20;
    GOAL_LINE = height - ARROW_SIZE * 2;
}