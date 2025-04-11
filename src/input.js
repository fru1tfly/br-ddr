export const inputs = [false, false, false, false];
export const needToRelease = [false, false, false, false];

window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") inputs[0] = true;
    if (e.code === "ArrowUp" || e.code === "KeyW") inputs[1] = true;
    if (e.code === "ArrowDown" || e.code === "KeyS") inputs[2] = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") inputs[3] = true;
});

window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") inputs[0] = false;
    if (e.code === "ArrowUp" || e.code === "KeyW") inputs[1] = false;
    if (e.code === "ArrowDown" || e.code === "KeyS") inputs[2] = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") inputs[3] = false;
});
 
