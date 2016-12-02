import jungleFar01 from '../images/jungle_far_01.png';
import jungleMid01 from '../images/jungle_mid_01.png';
import jungleClose01 from '../images/jungle_close_01.png';


const backgroundWidth = 1000;
const backgroundHeight = 800;
const centerX = backgroundWidth / 2;
const centerY = backgroundHeight / 2;

const colors = {
    'jungle': {
        close: '#36082e',           // Closest layer / outside circle.
        middle: '#098d76',          // Middle layer.
        far: '#64e4ac',             // Far layer.
        background: '#a5febe',      // Background inside circle.
        gradient: '#e4f5ce'         // Center of gradient inside circle.
    },

    'fog': {
        close: '#989fbb',
        middle: '#989fbb',
        far: '#a6aac2',
        background: '#989fbb',
        gradient: '#e8dbe7'
    }
};


const defaultStyle = 'jungle';
const imagePaths = {
    'jungle': [jungleFar01, jungleMid01, jungleClose01]
};

let images = {};


export function loadImages() {
    let imagePromises = [];
    for (let styleName in imagePaths) {     // eslint-disable-line guard-for-in
        Array.prototype.push.apply(imagePromises, loadImagesForAStyle(styleName));
    }
    return Promise.all(imagePromises);
}


function loadImagesForAStyle(styleName) {
    if (!imagePaths.hasOwnProperty(styleName)) {
        console.log(`Unknown style name '${styleName}'.`);
        return [];
    }
    const newImages = imagePaths[styleName].map(() => new Image());
    images[styleName] = newImages;
    return newImages.map((img, index) =>
        new Promise(function(resolve, reject) {
            img.src = imagePaths[styleName][index];
            img.onload = function() {
                resolve(this);
            }
        }
    ));
}


export function createCanvases() {
    // Create background canvas.
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = backgroundWidth;
    bgCanvas.height = backgroundHeight;

    // Create compositing canvas.
    const compositingCanvas = document.createElement('canvas');
    compositingCanvas.width = 1890;
    compositingCanvas.height = 1932;

    return { bgCanvas, compositingCanvas };
}


export function drawBackground({ bgCanvas, compositingCanvas }, styles) {
    const mainStyle = findMainStyle(styles);
    if (images.hasOwnProperty(mainStyle)) {
        _drawBackground(bgCanvas, compositingCanvas, mainStyle, styles);
    } else {
        Promise.all(loadImagesForAStyle(mainStyle)).then(function() {
            _drawBackground(bgCanvas, compositingCanvas, mainStyle, styles);
        });
    }
}


function _drawBackground(bgCanvas, compositingCanvas, mainStyle, styles) {
    const bgContext = bgCanvas.getContext('2d');
    const compositingContext = compositingCanvas.getContext('2d');
    const currentColors = colors[mainStyle];

    // Draw background gradient.
    let radialGradient = bgContext.createRadialGradient(centerX, centerY, 20,
        centerX, centerY, centerY);
    radialGradient.addColorStop(0, currentColors.gradient);
    radialGradient.addColorStop(1, currentColors.background);
    bgContext.fillStyle = radialGradient;
    bgContext.fillRect(0, 0, backgroundWidth, backgroundHeight);

    // Recolor and draw image layers, back to front.
    images[mainStyle].forEach((img, index) => {
        const imageWidth = img.width;
        const imageHeight = img.height;

        // Copy the image to the compositing canvas, erasing anything already there.
        compositingContext.globalCompositeOperation = 'copy';
        compositingContext.drawImage(img, 0, 0);

        // Draw a colored rectangle to the compositing canvas, blending it with the image there.
        compositingContext.globalCompositeOperation = 'source-in';
        compositingContext.fillStyle = currentColors[['far', 'middle', 'close'][index]];
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
    radialGradient.addColorStop(0, RGBtoRGBA(currentColors.close, 0));
    radialGradient.addColorStop(1, RGBtoRGBA(currentColors.close, 1));
    bgContext.fillStyle = radialGradient;
    bgContext.fillRect(0, 0, backgroundWidth, backgroundHeight);
}


function findMainStyle(styles) {
    let mainStyle = styles.find(style => imagePaths.hasOwnProperty(style));
    if (mainStyle === undefined) {
        console.log(`Couldn't find main style in '${styles}' - picking default style.`);
        mainStyle = defaultStyle;
    }
    return mainStyle;
}


function RGBtoRGBA(RGB, alpha) {
    if (RGB.length !== 7) {
        console.log('RGBtoRGBA: expected a 7 character RGB string, got something else. The resulting color is likely wrong.');
    }
    const color = parseInt(RGB.substring(1), 16);
    return `rgba(${color >> 16}, ${(color >> 8) & 0xFF}, ${color & 0xFF}, ${alpha})`;
}
