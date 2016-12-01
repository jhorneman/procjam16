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

const colors = ['#64e4ac', '#098d76', '#36082e'];

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
    // Fill background with base color.
    bgContext.fillStyle = '#36082e';
    bgContext.fillRect(0, 0, backgroundWidth, backgroundHeight);

    // Set up circle mask.
    bgContext.save();
    bgContext.beginPath();
    bgContext.arc(centerX, centerY, centerY, 0, Math.PI * 2, false);
    bgContext.clip();

    // Draw background gradient.
    const radialGradient = bgContext.createRadialGradient(centerX, centerY, 20,
        centerX, centerY, centerY);
    radialGradient.addColorStop(0, '#e4f5ce');
    radialGradient.addColorStop(1, '#a5febe');
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
        compositingContext.fillStyle = colors[index];
        compositingContext.fillRect(0, 0, imageWidth, imageHeight);

        // Copy the recolored image onto the background canvas.
        bgContext.drawImage(
            compositingCanvas,
            -27, -83,
            imageWidth / 2,
            imageHeight / 2
        );
    });

    // End circle mask.
    bgContext.restore();
}
