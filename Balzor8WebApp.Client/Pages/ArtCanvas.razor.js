export function consoleLog(msg) {
    console.log(msg);
}

export async function setImage(content, canvasElement) {
    await new Promise(async (resolve) => {
        const url = URL.createObjectURL(new Blob([await content.arrayBuffer()]))
        const img = new Image();
        img.onload = function () {
            let canvas = canvasElement;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            let canvasStyleWidth = getClosestWidthForContainer(canvas.width);
            canvas.style.width = canvasStyleWidth + 'px';
            canvas.style.height = (canvasStyleWidth * (canvas.height / canvas.width)) + 'px';
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(true);
        };
        img.src = url;
    });
}

export async function getDimensions(canvasElement) {
    let canvas = canvasElement;
    return { Width: canvas.width, Height: canvas.height };
}

export function getPixelDataFromCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const dataArray = new Uint8Array(imageData.data);
    return dataArray;
}

export function setPixelDataToCanvas(canvasId, bytes) {
    console.log("Setting pixel data to canvas");
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i + 0] = bytes[i + 0];
        data[i + 1] = bytes[i + 1];
        data[i + 2] = bytes[i + 2];
        data[i + 3] = bytes[i + 3];
    }
    ctx.putImageData(imageData, 0, 0);
}

export function saveImage(canvasId) {
    const canvas = document.getElementById(canvasId);
    const image = canvas.toDataURL("image/png");

    let link = document.createElement('a');
    link.download = "image-edit.png";
    link.href = image;
    link.click();
}

export function applyGammaCorrection(canvasId, optionsStr) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    gammaCorrectData(data);
    ctx.putImageData(imageData, 0, 0);
}

export function applyPixelate(canvasId, optionsStr) {
    const options = JSON.parse(optionsStr);
    const type = options.type.StringValue;
    switch (type) {
        case "Average":
            console.log("average");
            applyPixelateAverage(canvasId, optionsStr);
            break;
        case "Saturation":
            console.log("saturation");
            applyPixelateSaturation(canvasId, optionsStr);
            break;
        case "Naive":
            console.log("naive");
            applyPixelateNaive(canvasId, optionsStr);
            break;
        default:
            console.log("unexpected type");
            break;
    }
}

export function applyPixelateNaive(canvasId, optionsStr) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const options = JSON.parse(optionsStr);
    const strength = options.strength.Value;
    const pixelationStrength = 2 ** strength;
    for (let i = 0; i < data.length; i += 4) {
        const coords = getCoordsForIndex(i, canvas);
        const parentX = coords[0] - (coords[0] % pixelationStrength);
        const parentY = coords[1] - (coords[1] % pixelationStrength);
        const parentIndex = getIndexForCoords([parentX, parentY], canvas);
        copyColorsToIndex(parentIndex, i, data);
    }
    ctx.putImageData(imageData, 0, 0);
}

export function applyPixelateAverage(canvasId, optionsStr) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const options = JSON.parse(optionsStr);
    const strength = options.strength.Value;
    const pixelationStrength = 2 ** strength;
    let pixelateValues = {};
    for (let i = 0; i < data.length; i += 4) {
        const coords = getCoordsForIndex(i, canvas);
        const parentX = coords[0] - (coords[0] % pixelationStrength);
        const parentY = coords[1] - (coords[1] % pixelationStrength);
        const parentIndex = getIndexForCoords([parentX, parentY], canvas);
        let pixelateValue = getAveragePixelateValueForIndex(parentIndex, data, pixelationStrength, pixelateValues, canvas);
        data[i + 0] = pixelateValue[0];
        data[i + 1] = pixelateValue[1];
        data[i + 2] = pixelateValue[2];
    }
    ctx.putImageData(imageData, 0, 0);
}

function getAveragePixelateValueForIndex(index, imageData, pixelationStrength, calculatedValues, canvas) {
    if (index in calculatedValues) {
        return calculatedValues[index];
    }

    var indexCoords = getCoordsForIndex(index, canvas);
    var farthestX = indexCoords[0] + pixelationStrength;
    var farthestY = indexCoords[1] + pixelationStrength;
    if (farthestX >= canvas.width || farthestY >= canvas.height) {
        return [127, 127, 127, 255];
    }

    let indicesInPixel = [];
    for (var j = 0; j < pixelationStrength; j++) {
        var startingX = index + (canvas.width * 4 * j);

        for (var i = startingX; i < startingX + (pixelationStrength * 4); i += 4) {
            indicesInPixel.push(i);
        }
    }

    let accumulatedValues = [0, 0, 0];
    indicesInPixel.forEach((ind) => {
        accumulatedValues[0] += imageData[ind + 0];
        accumulatedValues[1] += imageData[ind + 1];
        accumulatedValues[2] += imageData[ind + 2];
    });

    accumulatedValues = accumulatedValues.map(val => val / indicesInPixel.length);
    calculatedValues[index] = accumulatedValues;
    return accumulatedValues;
}

export function applyPixelateSaturation(canvasId, optionsStr) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const options = JSON.parse(optionsStr);
    const strength = options.strength.Value;
    const pixelationStrength = 2 ** strength;
    let pixelateValues = {};
    for (let i = 0; i < data.length; i += 4) {
        const coords = getCoordsForIndex(i, canvas);
        const parentX = coords[0] - (coords[0] % pixelationStrength);
        const parentY = coords[1] - (coords[1] % pixelationStrength);
        const parentIndex = getIndexForCoords([parentX, parentY], canvas);
        let avgSaturationVal = getAverageHuePixelateValueForIndex(parentIndex, data, pixelationStrength, pixelateValues, canvas);
        var [h, s, v] = rgb2hsv(data[i + 0], data[i + 1], data[i + 2]);
        [data[i + 0], data[i + 1], data[i + 2]] = hsv2rgb(h, avgSaturationVal, v);
    }
    ctx.putImageData(imageData, 0, 0);
}

function getAverageHuePixelateValueForIndex(index, imageData, pixelationStrength, calculatedValues, canvas) {
    if (index in calculatedValues) {
        return calculatedValues[index];
    }

    var indexCoords = getCoordsForIndex(index, canvas);
    var farthestX = indexCoords[0] + pixelationStrength;
    var farthestY = indexCoords[1] + pixelationStrength;
    if (farthestX >= canvas.width || farthestY >= canvas.height) {
        return .5;
    }

    let indicesInPixel = [];
    for (var j = 0; j < pixelationStrength; j++) {
        var startingX = index + (canvas.width * 4 * j);

        for (var i = startingX; i < startingX + (pixelationStrength * 4); i += 4) {
            indicesInPixel.push(i);
        }
    }

    let accumulatedSaturation = 0.0;
    indicesInPixel.forEach((ind) => {
        let [h, s, v] = rgb2hsv(imageData[ind + 0], imageData[ind + 1], imageData[ind + 2]);
        accumulatedSaturation += s;
    });
    accumulatedSaturation /= indicesInPixel.length;
    calculatedValues[index] = accumulatedSaturation;
    return accumulatedSaturation;
}

function gammaCorrectData(data) {
    let correctFunction = function (value) {
        return Math.pow(value, .7);
    }
    for (let i = 0; i < data.length; i += 4) {
        data[i] = correctFunction(data[i]);
        data[i + 1] = correctFunction(data[i + 1]);
        data[i + 2] = correctFunction(data[i + 2]);
    }
    return data;
}

function getClosestWidthForContainer(width) {
    var containerWidth = 1150;

    var currentTestWidth = width;
    while (true) {
        if (currentTestWidth < containerWidth) {
            return currentTestWidth;
        }
        currentTestWidth /= 2;
    }
}

function getCoordsForIndex(i, canvas) {
    var coords = [];
    var width = canvas.width;
    var x = (i % (width * 4)) / 4;
    var tempI = i - (x * 4);
    var y = (tempI / (width * 4));
    coords.push(x, y);
    return coords;
}

function getIndexForCoords(coords, canvas) {
    var width = canvas.width;
    var height = canvas.height;
    var index = ((coords[0]) + (coords[1] * width)) * 4;
    return index;
}

function getColorIndicesForIndex(index) {
    return [index, index + 1, index + 2, index + 3];
}

function copyColorsToIndex(fromIndex, toIndex, colorData) {
    const [parentRedIndex, parentGreenIndex, parentBlueIndex, parentAlphaIndex] = getColorIndicesForIndex(fromIndex);
    const [childRedIndex, childGreenIndex, childBlueIndex, childAlphaIndex] = getColorIndicesForIndex(toIndex);
    colorData[childRedIndex] = colorData[parentRedIndex];
    colorData[childGreenIndex] = colorData[parentGreenIndex];
    colorData[childBlueIndex] = colorData[parentBlueIndex];
    colorData[childAlphaIndex] = colorData[parentAlphaIndex];
}

// https://stackoverflow.com/a/54070620/3869501
// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
function rgb2hsv(r, g, b) {
    let v = Math.max(r, g, b), c = v - Math.min(r, g, b);
    let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
    return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
function hsv2rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}  