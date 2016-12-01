import jungleFar01 from '../images/jungle_far_01.png';
import jungleMid01 from '../images/jungle_mid_01.png';
import jungleClose01 from '../images/jungle_close_01.png';


const backgroundWidth = 1000;
const backgroundHeight = 800;
const centerX = backgroundWidth / 2;
const centerY = backgroundHeight / 2;

let bgCanvas = null;
let bgContext = null;
let compositingCanvas = null;
let compositingContext = null;

const colors = {
    close: '#36082e',           // Closest layer / outside circle.
    middle: '#098d76',          // Middle layer.
    far: '#64e4ac',             // Far layer.
    background: '#a5febe',      // Background inside circle.
    gradient: '#e4f5ce'         // Center of gradient inside circle.
};


const imagePaths = [jungleFar01, jungleMid01, jungleClose01];

let images = [];


export function loadImages() {
    images = imagePaths.map(() => new Image());
    let imagePromises = images.map((img, index) =>
        new Promise(function(resolve, reject) {
            img.src = imagePaths[index];
            img.onload = function() {
                resolve(this);
            }
        }
    ));

    return Promise.all(imagePromises);
}


export function setupBackground() {
    // Create background canvas.
    bgCanvas = document.createElement('canvas');
    bgContext = bgCanvas.getContext('2d');
    bgCanvas.width = backgroundWidth;
    bgCanvas.height = backgroundHeight;

    // Add it to the DOM.
    const backgroundElement = document.getElementById('background');
    backgroundElement.appendChild(bgCanvas);

    // Create compositing canvas.
    compositingCanvas = document.createElement('canvas');
    compositingContext = compositingCanvas.getContext('2d');
    compositingCanvas.width = 1890;
    compositingCanvas.height = 1932;
}


export function drawBackground() {
    // Draw background gradient.
    let radialGradient = bgContext.createRadialGradient(centerX, centerY, 20,
        centerX, centerY, centerY);
    radialGradient.addColorStop(0, colors.gradient);
    radialGradient.addColorStop(1, colors.background);
    bgContext.fillStyle = radialGradient;
    bgContext.fillRect(0, 0, backgroundWidth, backgroundHeight);

    // Recolor and draw image layers, back to front.
    images.forEach((img, index) => {
        const imageWidth = img.width;
        const imageHeight = img.height;

        // Copy the image to the compositing canvas, erasing anything already there.
        compositingContext.globalCompositeOperation = 'copy';
        compositingContext.drawImage(img, 0, 0);

        // Draw a colored rectangle to the compositing canvas, blending it with the image there.
        compositingContext.globalCompositeOperation = 'source-in';
        compositingContext.fillStyle = colors[['far', 'middle', 'close'][index]];
        compositingContext.fillRect(0, 0, imageWidth, imageHeight);

        // Copy the recolored image onto the background canvas.
        bgContext.drawImage(
            compositingCanvas,
            -27, -83,
            imageWidth / 2,
            imageHeight / 2
        );
    });

    // Draw circle mask.
    radialGradient = bgContext.createRadialGradient(centerX, centerY, 398, centerX, centerY, 400);
    radialGradient.addColorStop(0, RGBtoRGBA(colors.close, 0));
    radialGradient.addColorStop(1, RGBtoRGBA(colors.close, 1));
    bgContext.fillStyle = radialGradient;
    bgContext.fillRect(0, 0, backgroundWidth, backgroundHeight);
}


function RGBtoRGBA(RGB, alpha) {
    if (RGB.length !== 7) {
        console.logWarning('RGBtoRGBA: expected a 7 character RGB string, got something else. The resulting color is likely wrong.');
    }
    const color = parseInt(RGB.substring(1), 16);
    return `rgba(${color >> 16}, ${(color >> 8) & 0xFF}, ${color & 0xFF}, ${alpha})`;
}
