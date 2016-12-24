const backgroundWidth = 1000;
const backgroundHeight = 800;
const centerX = backgroundWidth / 2;
const centerY = backgroundHeight / 2;

const colors = {
    'jungle': {
        close: '#36082e',           // Closest layer / outside circle.
        mid: '#098d76',             // Middle layer.
        far: '#64e4ac',             // Far layer.
        background: '#a5febe',      // Background inside circle.
        gradient: '#e4f5ce'         // Center of gradient inside circle.
    },

    'fog': {
        close: '#989fbb',
        mid: '#989fbb',
        far: '#a6aac2',
        background: '#989fbb',
        gradient: '#e8dbe7'
    }
};


const defaultStyle = 'jungle';
const layerNames = ['far', 'mid', 'close'];     // Names must be back to front.
let imagePaths = {};
let images = {};


export function prepareImages() {
    imagePaths = {
        'jungle': imageLayerVariationPaths('jungle'),
        'cave': imageLayerVariationPaths('cave'),
        'special': imageVariationPaths('special_mid')
    };

    for (let theme in imagePaths) {     // eslint-disable-line guard-for-in
        images[theme] = {};
        for (let layer in imagePaths[theme]) {     // eslint-disable-line guard-for-in
            images[theme][layer] = {};
            for (let nr in imagePaths[theme][layer]) {     // eslint-disable-line guard-for-in
                images[theme][layer][nr] = null;
            }
        }
    }
}


function imageLayerVariationPaths(imageName) {
    let paths = {};
    layerNames.forEach(layer => {
        paths[layer] = imageVariationPaths(imageName + `_${layer}`)
    });
    return paths;
}


function imageVariationPaths(imageName) {
    let paths = {};
    [1, 2, 3].forEach(nr => {
        paths[nr] = fullImagePath(imageName + `_0${nr}`)
    });
    return paths;
}


function fullImagePath(imageFilename) {
    return process.env.PUBLIC_URL + `/images/${imageFilename}.png`;
}


function hasImage(obj, theme, layer, nr) {
    return (obj.hasOwnProperty(theme) && obj[theme].hasOwnProperty(layer) && obj[theme][layer].hasOwnProperty(nr));
}


function loadImage(theme, layer, nr) {
    if (!hasImage(imagePaths, theme, layer, nr)) {
        console.log(`No path known for image with theme '${theme}', layer '${layer}', and number ${nr}.`);
        return null;
    }

    if (hasImage(images, theme, layer, nr) && (images[theme][layer][nr] !== null)) return null;

    return new Promise(function(resolve, reject) {
        let image = new Image();
        images[theme][layer][nr] = image;
        image.src = imagePaths[theme][layer][nr];
        image.onload = function() {
            resolve(image);
        }
    });
}


export function createCanvases() {
    // Create background canvas.
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = backgroundWidth;
    bgCanvas.height = backgroundHeight;

    // Create compositing canvas.
    const compositingCanvas = document.createElement('canvas');
    compositingCanvas.width = 945;
    compositingCanvas.height = 966;

    return { bgCanvas, compositingCanvas };
}


export function drawBackground({ bgCanvas, compositingCanvas }, styles) {
    let theme = 'jungle';
    const nr = Math.floor(Math.random() * (3 - 1)) + 1;
    let imagePromises = layerNames.map(layer => loadImage(theme, layer, nr)).filter(promise => promise !== null);
    if (imagePromises.count > 0) {
        Promise.all(imagePromises).then(function() {
            _drawBackground(bgCanvas, compositingCanvas, theme, nr);
        });
    } else {
        _drawBackground(bgCanvas, compositingCanvas, theme, nr);
    }
}


function _drawBackground(bgCanvas, compositingCanvas, theme, nr) {
    const bgContext = bgCanvas.getContext('2d');
    const compositingContext = compositingCanvas.getContext('2d');
    const currentColors = colors['jungle'];

    // Draw background gradient.
    let radialGradient = bgContext.createRadialGradient(centerX, centerY, 20,
        centerX, centerY, centerY);
    radialGradient.addColorStop(0, currentColors.gradient);
    radialGradient.addColorStop(1, currentColors.background);
    bgContext.fillStyle = radialGradient;
    bgContext.fillRect(0, 0, backgroundWidth, backgroundHeight);

    // Recolor and draw image layers, back to front.
    layerNames.forEach(layer => {
        const img = images[theme][layer][nr];
        const imageWidth = img.width;
        const imageHeight = img.height;

        // Copy the image to the compositing canvas, erasing anything already there.
        compositingContext.globalCompositeOperation = 'copy';
        compositingContext.drawImage(img, 0, 0);

        // Draw a colored rectangle to the compositing canvas, blending it with the image there.
        compositingContext.globalCompositeOperation = 'source-in';
        compositingContext.fillStyle = currentColors[layer];
        compositingContext.fillRect(0, 0, imageWidth, imageHeight);

        // Copy the recolored image onto the background canvas.
        bgContext.drawImage(
            compositingCanvas,
            27, -83,
            imageWidth,
            imageHeight
        );
    });

    // Draw circle mask.
    radialGradient = bgContext.createRadialGradient(centerX, centerY, 398, centerX, centerY, 400);
    radialGradient.addColorStop(0, RGBtoRGBA(currentColors.close, 0));
    radialGradient.addColorStop(1, RGBtoRGBA(currentColors.close, 1));
    bgContext.fillStyle = radialGradient;
    bgContext.fillRect(0, 0, backgroundWidth, backgroundHeight);

    // Set body background color.
    const bodyElement = document.getElementsByTagName('body')[0];
    bodyElement.style.backgroundColor = currentColors.close;
}

/*
function findMainStyle(styles) {
    let mainStyle = styles.find(style => imagePaths.hasOwnProperty(style));
    if (mainStyle === undefined) {
        console.log(`Couldn't find main style in '${styles}' - picking default style.`);
        mainStyle = defaultStyle;
    }
    return mainStyle;
}
*/

function RGBtoRGBA(RGB, alpha) {
    if (RGB.length !== 7) {
        console.log('RGBtoRGBA: expected a 7 character RGB string, got something else. The resulting color is likely wrong.');
    }
    const color = parseInt(RGB.substring(1), 16);
    return `rgba(${color >> 16}, ${(color >> 8) & 0xFF}, ${color & 0xFF}, ${alpha})`;
}
