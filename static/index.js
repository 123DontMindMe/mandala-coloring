var canvasWidth = 600;
var canvasHeight = 600;

var canvas = document.getElementById("canvas");
var canvasContext = canvas.getContext("2d");

var canvasHistory = [canvasContext.getImageData(0, 0, canvasWidth, canvasHeight)];
var historyDepth = 0

var canvasSaves = {};
var currentSaveID = null;
var savedImages = document.getElementById("saved");

var canvasOutlineImage = document.getElementById("canvas-outline-img");
var outlineCanvasPixels;
var outlineCanvasDataWidth;
var outlineCanvasContext = document.getElementById("outline-canvas").getContext("2d");
var sectionCanvas = document.getElementById("section-canvas");
var sectionCanvasContext = sectionCanvas.getContext("2d");
var strokeCanvas = document.getElementById("stroke-canvas");
var strokeCanvasContext = strokeCanvas.getContext("2d");


function newOutlineCanvas(outlineImage) {
	canvasOutlineImage.src = outlineImage.src;
	outlineCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
	outlineCanvasContext.drawImage(outlineImage, 0, 0, canvasWidth, canvasHeight);
	let outlineCanvasImageData = outlineCanvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
	outlineCanvasPixels = outlineCanvasImageData.data;
	outlineCanvasDataWidth = outlineCanvasImageData.width;
}
newOutlineCanvas(canvasOutlineImage);

function newCanvasSave() {
	let otherSaves = savedImages.querySelectorAll(".outline-image");
	let saveImage = document.createElement("img");
	saveImage.src = canvasOutlineImage.src;
	saveImage.classList.add("outline-image");
	otherSaves.forEach(e => e.classList.remove("outline-image-selected"));
	saveImage.classList.add("outline-image-selected");
	if (otherSaves.length === 0) {
		saveImage.id = "save1"
	}
	else {
		let otherSaveNumbers = Array.from(otherSaves).map(e => parseInt(e.id.slice(4)))
		let maxSaveNumber = Math.max(...otherSaveNumbers);
		saveImage.id = "save" + (maxSaveNumber + 1);
	}
	currentSaveID = saveImage.id;
	savedImages.appendChild(saveImage);
	updateCurrentSave();

	saveImage.addEventListener("click", () => {
		savedImages.querySelectorAll(".outline-image").forEach(e => e.classList.remove("outline-image-selected"));
		saveImage.classList.add("outline-image-selected");

		if (currentSaveID !== null) updateCurrentSave();

		currentSaveID = saveImage.id;
		canvasContext.putImageData(canvasSaves[saveImage.id], 0, 0);
		newOutlineCanvas(saveImage);
	});
}
window.addEventListener("load", newCanvasSave);

function updateCurrentSave() {
	canvasSaves[currentSaveID] = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
}

var outlineImages = document.getElementById("outlines").querySelectorAll(".outline-image");
outlineImages.forEach(image => {
	image.addEventListener("click", () => {
		updateCurrentSave();
		canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
		newOutlineCanvas(image.querySelector("img"));
		newCanvasSave();
	});
});

var strokeWidthSlider = document.getElementById("stroke-width");
var strokeWidth = strokeWidthSlider.value;
strokeWidthSlider.addEventListener("input", () => {
	strokeWidth = strokeWidthSlider.value;
	strokeWidthSlider.style.setProperty("--size", strokeWidth + "px");
});

var strokeColorSlider = document.getElementById("stroke-color");
var strokeColor = strokeColorSlider.value;
var strokeColorRed = parseInt(strokeColor.slice(1, 3), 16);
var strokeColorBlue = parseInt(strokeColor.slice(3, 5), 16);
var strokeColorGreen = parseInt(strokeColor.slice(5, 7), 16);
strokeColorSlider.addEventListener("change", () => {
	strokeColor = strokeColorSlider.value;
	strokeColorRed = parseInt(strokeColor.slice(1, 3), 16);
	strokeColorBlue = parseInt(strokeColor.slice(3, 5), 16);
	strokeColorGreen = parseInt(strokeColor.slice(5, 7), 16);
	strokeWidthSlider.style.setProperty("--color", strokeColor);
});

var eraseButton = document.getElementById("erase-button");
eraseButton.addEventListener("change", () => {
	canvasContext.globalCompositeOperation = eraseButton.checked ? "destination-out" : "source-over";
});

var coloringMode = "free-hand";
var freehandButton = document.getElementById("free-hand-button");
freehandButton.addEventListener("click", () => {
	coloringMode = "free-hand";
	freehandButton.classList.add("coloring-mode-button-selected");
	sectionedButton.classList.remove("coloring-mode-button-selected");
	fillButton.classList.remove("coloring-mode-button-selected");
});

var sectionedButton = document.getElementById("sectioned-button");
sectionedButton.addEventListener("click", () => {
	coloringMode = "sectioned";
	sectionedButton.classList.add("coloring-mode-button-selected");
	freehandButton.classList.remove("coloring-mode-button-selected");
	fillButton.classList.remove("coloring-mode-button-selected");
});

var fillButton = document.getElementById("fill-button");
fillButton.addEventListener("click", () => {
	coloringMode = "fill";
	fillButton.classList.add("coloring-mode-button-selected");
	freehandButton.classList.remove("coloring-mode-button-selected");
	sectionedButton.classList.remove("coloring-mode-button-selected");
})

var undoButton = document.getElementById("undo-button");
undoButton.addEventListener("click", () => {
	if (historyDepth === canvasHistory.length - 1) return;
	historyDepth++;
	canvasContext.putImageData(canvasHistory[canvasHistory.length - 1 - historyDepth], 0, 0);
	updateHistoryButtons();
});

var redoButton = document.getElementById("redo-button");
redoButton.addEventListener("click", () => {
	if (historyDepth === 0) return;
	historyDepth--;
	canvasContext.putImageData(canvasHistory[canvasHistory.length - 1 - historyDepth], 0, 0);
	updateHistoryButtons();
});

function updateHistoryButtons() {
	if (historyDepth === canvasHistory.length - 1) {
		undoButton.classList.add("history-button-disabled")
	} else undoButton.classList.remove("history-button-disabled");
	if (historyDepth === 0) {
		redoButton.classList.add("history-button-disabled")
	} else redoButton.classList.remove("history-button-disabled");
}

function createSectionMask(startX, startY) {
	if (outlineCanvasPixels[startX + startY * outlineCanvasDataWidth * 4 + 3] !== 0)
		return;  // pixel is part of the outline

	let canvasImageData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
	let sectionImageData = canvasContext.createImageData(canvasWidth, canvasHeight);
	function isEmpty(x, y) {
		return outlineCanvasPixels[(x + y * outlineCanvasDataWidth) * 4 + 3] === 0
					 && sectionImageData.data[(x + y * sectionImageData.width) * 4 + 3] === 0;
	}
	let startPixelRedIndex = (startX + startY * sectionImageData.width) * 4;
	canvasImageData.data[startPixelRedIndex] = strokeColorRed;
	canvasImageData.data[startPixelRedIndex + 1] = strokeColorBlue;
	canvasImageData.data[startPixelRedIndex + 2] = strokeColorGreen;
	canvasImageData.data[startPixelRedIndex + 3] = 255;
	let seeds = [[startX, startY]];
	while (seeds.length > 0) {
		// start at seed position
		let seed = seeds.pop();
		let leftmostX = seed[0];
		let seedY = seed[1];
		// travel all the way to the left until hitting an outline or already filled pixel
		while (isEmpty(leftmostX - 1, seedY)) leftmostX--;
		// color pixels all the way to the right until hitting an outline,
		// adding new seeds when passing an outline above/below
		let rightmostX = leftmostX;
		let addedSeedUp = false;
		let addedSeedDown = false;
		while (isEmpty(rightmostX, seedY)) {
			let pixelRedIndex = (rightmostX + seedY * sectionImageData.width) * 4;
			sectionImageData.data[pixelRedIndex] = strokeColorRed;
			sectionImageData.data[pixelRedIndex + 1] = strokeColorBlue;
			sectionImageData.data[pixelRedIndex + 2] = strokeColorGreen;
			sectionImageData.data[pixelRedIndex + 3] = 255;

			if (isEmpty(rightmostX, seedY - 1)) {
				if (!addedSeedUp) {
					seeds.push([rightmostX + 1, seedY - 1])
					addedSeedUp = true;
				}
			} else addedSeedUp = false;

			if (isEmpty(rightmostX, seedY + 1)) {
				if (!addedSeedDown) {
					seeds.push([rightmostX + 1, seedY + 1])
					addedSeedDown = true;
				}
			} else addedSeedDown = false;

			rightmostX++;
		}
	}
	let smoothedPixels = new Uint8ClampedArray(sectionImageData.data);
	for (let pixelAlphaIndex = 3; pixelAlphaIndex < sectionImageData.data.length; pixelAlphaIndex += 4) {
		if (sectionImageData.data[pixelAlphaIndex] === 0) {
			if (
				sectionImageData.data[pixelAlphaIndex + 4] === 255 ||
				sectionImageData.data[pixelAlphaIndex - 4] === 255 ||
				sectionImageData.data[pixelAlphaIndex + sectionImageData.width * 4] === 255 ||
				sectionImageData.data[pixelAlphaIndex - sectionImageData.width * 4] === 255 ||
				sectionImageData.data[pixelAlphaIndex + 4 + sectionImageData.width * 4] === 255 ||
				sectionImageData.data[pixelAlphaIndex - 4 + sectionImageData.width * 4] === 255 ||
				sectionImageData.data[pixelAlphaIndex + 4 - sectionImageData.width * 4] === 255 ||
				sectionImageData.data[pixelAlphaIndex - 4 - sectionImageData.width * 4] === 255
			) {
				smoothedPixels[pixelAlphaIndex - 3] = strokeColorRed;
				smoothedPixels[pixelAlphaIndex - 2] = strokeColorBlue;
				smoothedPixels[pixelAlphaIndex - 1] = strokeColorGreen;
				smoothedPixels[pixelAlphaIndex] = 255;
			}
		}
	}
	sectionImageData.data.set(smoothedPixels);
	sectionCanvasContext.putImageData(sectionImageData, 0, 0);
}

function draw(x, y, isNewStroke = false) {
	if (isNewStroke) {
		strokeCanvasContext.beginPath();
		strokeCanvasContext.lineCap = "round";
		strokeCanvasContext.lineJoin = "round";
		strokeCanvasContext.lineWidth = strokeWidth;
		strokeCanvasContext.strokeStyle = strokeColor;
		strokeCanvasContext.moveTo(x, y);
	} else {
		strokeCanvasContext.lineTo(x, y);
		strokeCanvasContext.stroke();
	}
	if (coloringMode === "sectioned") {
		// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
		strokeCanvasContext.globalCompositeOperation = "destination-in";
		strokeCanvasContext.drawImage(sectionCanvas, 0, 0);
		strokeCanvasContext.globalCompositeOperation = "source-over";
	}
	canvasContext.drawImage(strokeCanvas, 0, 0);
	strokeCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
}

var isDrawing = false;
function onMouseDown(event) {
	isDrawing = true;
	if (coloringMode === "fill") {
		createSectionMask(event.offsetX, event.offsetY);
		canvasContext.drawImage(sectionCanvas, 0, 0);
	} else {
		if (coloringMode === "sectioned") {
			createSectionMask(event.offsetX, event.offsetY);
		}
		draw(event.offsetX, event.offsetY, true);
		canvas.addEventListener("mousemove", onMouseMove);
	}
	document.addEventListener("mouseup", onMouseUp)
}

function onMouseMove(event) {
	draw(event.offsetX, event.offsetY);
}

function onMouseUp() {
	isDrawing = false;
	if (historyDepth > 0) {
			canvasHistory = canvasHistory.slice(0, -historyDepth);
			historyDepth = 0;
	}
	canvasHistory.push(canvasContext.getImageData(0, 0, canvasWidth, canvasHeight));
	updateHistoryButtons();
	canvas.removeEventListener("mousemove", onMouseMove);
	document.removeEventListener("mouseup", onMouseUp);
}

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mousemove", (event) => {
	if (!isDrawing && (coloringMode == "fill" || coloringMode == "sectioned")) {
		sectionCanvas.style.opacity = "0.4";
		createSectionMask(event.offsetX, event.offsetY);
	} else sectionCanvas.style.opacity = "0";
});