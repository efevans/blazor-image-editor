export function consoleLog(msg) {
    console.log(msg);
}

export function consoleLog2(serializedStr) {
    let options = JSON.parse(serializedStr);
    console.log(serializedStr);
    console.log(options);
    console.log(options.a);
}

// https://www.meziantou.net/upload-files-with-drag-drop-or-paste-from-clipboard-in-blazor.htm
export function initializeFileDropZone (dropZoneElement, inputFile) {
    // Handle the paste and drop events
    function onDrop(e) {
        e.preventDefault();
        console.log("file dropped");

        // Set the files property of the input element and raise the change event
        inputFile.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        inputFile.dispatchEvent(event);
    }
    dropZoneElement.addEventListener("drop", onDrop);

    // The returned object allows to unregister the events when the Blazor component is destroyed
    //return {
    //    dispose: () => {
    //        dropZoneElement.removeEventListener("drop", onDrop);
    //    }
    //}
}

window.previewImage = (inputElement, canvasElement, cleanCanvasElement) => {
    const imgLink = URL.createObjectURL(inputElement.files[0]);
    const img = new Image();
    img.src = imgLink;
    var targetImg = img;
    targetImg.onload = function () {
        var canvas = canvasElement;
        var cleanCanvas = cleanCanvasElement;
        canvas.width = cleanCanvas.width = targetImg.naturalWidth;
        canvas.height = cleanCanvas.height = targetImg.naturalHeight;
        var canvasStyleWidth = getClosestWidthForContainer(targetImg);
        canvas.style.width = canvasStyleWidth + 'px';
        canvas.style.height = (canvasStyleWidth * (canvas.height / canvas.width)) + 'px';

        canvas.getContext("2d").drawImage(targetImg, 0, 0);
        cleanCanvas.getContext("2d").drawImage(targetImg, 0, 0);
    }
}

export function saveImage(canvasId) {
    const canvas = document.getElementById(canvasId);
    const image = canvas.toDataURL("image/png");

    let link = document.createElement('a');
    link.download = "image-edit.png";
    link.href = image;
    link.click();
}

export function resetImage(canvasId, cleanCanvasId) {
    var canvas = document.getElementById(canvasId);
    var cleanCanvas = document.getElementById(cleanCanvasId);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(cleanCanvas, 0, 0);
}

export function applyDither(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const correctionValues = Array(data.length).fill(0);
    const thresholdValue = 255 * 3 / 2;
    for (let i = 0; i < data.length; i += 4) {
        var accumulatedValue = data[i] + data[i + 1] + data[i + 2] + (correctionValues[i] ?? 0);
        var correctionValue = 0;
        if (accumulatedValue >= thresholdValue) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            correctionValue = accumulatedValue - 765;
        } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            correctionValue = accumulatedValue;
        }
        var coords = getCoordsForIndex(i, canvas);
        if (!coordIsOnRightEdge(coords, canvas)) {
            let rightIndex = getIndexForCoords([coords[0] + 1, coords[1]], canvas);
            let addedValue = Math.round(correctionValue * 7.0 / 16.0);
            let existingValue = (correctionValues[rightIndex] ?? 0.0);
            correctionValues[rightIndex] = addedValue + existingValue;
        }
        if (!coordIsOnLeftEdge(coords, canvas) && !coordIsOnBottomEdge(coords, canvas)) {
            let bottomLeftIndex = getIndexForCoords([coords[0] - 1, coords[1] + 1], canvas);
            correctionValues[bottomLeftIndex] = Math.round(correctionValue * 3.0 / 16.0) + (correctionValues[bottomLeftIndex] ?? 0.0);
        }
        if (!coordIsOnBottomEdge(coords, canvas)) {
            let bottomIndex = getIndexForCoords([coords[0], coords[1] + 1], canvas);
            correctionValues[bottomIndex] = Math.round(correctionValue * 5.0 / 16.0) + (correctionValues[bottomIndex] ?? 0.0);
        }
        if (!coordIsOnRightEdge(coords, canvas) && !coordIsOnBottomEdge(coords, canvas)) {
            let bottomRightIndex = getIndexForCoords([coords[0] + 1, coords[1] + 1], canvas);
            correctionValues[bottomRightIndex] = Math.round(correctionValue * 1.0 / 16.0) + (correctionValues[bottomRightIndex] ?? 0.0);
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

export function applyInvert(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
}

export function applyGammaCorrection(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    gammaCorrectData(data);
    ctx.putImageData(imageData, 0, 0);
}

export function applyPixelate(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelationStrength = 2 ** 4;
    for (let i = 0; i < data.length; i += 4) {
        const coords = getCoordsForIndex(i, canvas);
        const parentX = coords[0] - (coords[0] % pixelationStrength);
        const parentY = coords[1] - (coords[1] % pixelationStrength);
        const parentIndex = getIndexForCoords([parentX, parentY], canvas);
        copyColorsToIndex(parentIndex, i, data);
    }
    ctx.putImageData(imageData, 0, 0);
}

export function applyOrderedDither(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let thresholdMatrix = [
        [0, 32, 8, 40, 2, 34, 10, 42],
        [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38],
        [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41],
        [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37],
        [63, 31, 55, 23, 61, 29, 53, 21]
    ]
    let normalizedThresholdMatrix = thresholdMatrix.map(row => row.map(value => value / 64));
    for (let i = 0; i < data.length; i += 4) {
        let normalizedValue = (data[i] + data[i + 1] + data[i + 2]) / 765.0;
        let coords = getCoordsForIndex(i, canvas);
        let xPosition = coords[0] % 8;
        let yPosition = coords[1] % 8;
        let thresholdValue = normalizedThresholdMatrix[yPosition][xPosition];
        if (normalizedValue >= thresholdValue) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
    }
    ctx.putImageData(imageData, 0, 0);
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

function getClosestWidthForContainer(img) {
    var containerWidth = 900;

    var currentTestWidth = img.naturalWidth;
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
    var height = canvas.height;
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

function coordIsOnLeftEdge(coords, canvas) {
    return coords[0] == 0;
}

function coordIsOnRightEdge(coords, canvas) {
    return (coords[0] + 1) == canvas.width;
}

function coordIsOnBottomEdge(coords, canvas) {
    return (coords[1] + 1) == canvas.height;
}

function copyColorsToIndex(fromIndex, toIndex, colorData) {
    const [parentRedIndex, parentGreenIndex, parentBlueIndex, parentAlphaIndex] = getColorIndicesForIndex(fromIndex);
    const [childRedIndex, childGreenIndex, childBlueIndex, childAlphaIndex] = getColorIndicesForIndex(toIndex);
    colorData[childRedIndex] = colorData[parentRedIndex];
    colorData[childGreenIndex] = colorData[parentGreenIndex];
    colorData[childBlueIndex] = colorData[parentBlueIndex];
    colorData[childAlphaIndex] = colorData[parentAlphaIndex];
}