export const arrowImgs = [];

let arrowAssets = [
    "/assets/arrow-l-pass-1.png",
    "/assets/arrow-u-pass-1.png",
    "/assets/arrow-d-pass-1.png",
    "/assets/arrow-r-pass-1.png",
];

for (let arrowAsset of arrowAssets) {
    let arrowImg = new Image();
    arrowImg.src = arrowAsset;
    arrowImgs.push(arrowImg);
}

