import jungleFar01 from '../images/jungle_far_01.png';
import jungleMid01 from '../images/jungle_mid_01.png';
import jungleClose01 from '../images/jungle_close_01.png';


const canvasWidth = 1000;
const canvasHeight = 800;

const colors = ['#64e4ac', '#098d76', '#36082e'];

const jungleImagePaths = [jungleFar01, jungleMid01, jungleClose01];

let jungleImages = [];


export function loadImages() {
    jungleImages = jungleImagePaths.map(() => new Image());
    let jungleImagePromises = jungleImages.map((img, index) =>
        new Promise(function(resolve, reject) {
            img.src = jungleImagePaths[index];
            img.onload = function() {
                resolve(this);
            }
        }
    ));

    return Promise.all(jungleImagePromises);
}


export function drawBackground() {
    let canvas = document.createElement('canvas');
    let c = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const backgroundElement = document.getElementById('background');
    backgroundElement.appendChild(canvas);

    let tempCanvas = document.createElement('canvas');
    let ct = tempCanvas.getContext('2d');
    tempCanvas.width = 1890;
    tempCanvas.height = 1932;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Prepare background gradient.
    const gradientCenterX = centerX + (Math.random() * 50) - 25;
    const gradientCenterY = centerY + (Math.random() * 50) - 25;

    const radialGradient = c.createRadialGradient(gradientCenterX, gradientCenterY, 20,
        gradientCenterX, gradientCenterY, centerY);

    radialGradient.addColorStop(0, '#e4f5ce');
    radialGradient.addColorStop(1, '#a5febe');

    c.fillStyle = '#36082e';
    c.fillRect(0, 0, canvasWidth, canvasHeight);

    // Prepare circle mask.
    c.save();
    c.beginPath();
    c.arc(centerX, centerY, centerY, 0, Math.PI * 2, false);
    c.clip();

    // Draw gradient.
    c.fillStyle = radialGradient;
    c.fillRect(0, 0, canvasWidth, canvasHeight);

    jungleImages.forEach((img, index) => {
        const imageWidth = img.width;
        const imageHeight = img.height;

        ct.clearRect(0, 0, 1890, 1932);

        ct.globalCompositeOperation = 'source-over';
        ct.drawImage(img, 0, 0);
        ct.globalCompositeOperation = 'source-in';
        ct.fillStyle = colors[index];
        ct.fillRect(0, 0, imageHeight, 1932);

        c.drawImage(
            tempCanvas,
            (canvasWidth - (imageWidth / 2)) / 2,
            (canvasHeight - (imageHeight / 2)) / 2,
            imageWidth / 2,
            imageHeight / 2
        );
    });

    // End circle mask.
    c.restore();
}
