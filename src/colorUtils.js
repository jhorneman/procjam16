import convert from 'color-convert';


export function jitterHSV(HSV, jitterRange) {
    let H = HSV[0];

    H = H + (Math.random() * jitterRange) - (jitterRange / 2);
    while (H < 0) {
        H += 360;
    }
    H = Math.trunc(H % 360);

    return [H, HSV[1], HSV[2]];
}


export function HSVtoRGBstring(HSV) {
    const [R, G, B] = convert.hsv.rgb(HSV);
    return `rgb(${R}, ${G}, ${B})`;
}
