var wavefile = require('wavefile');

// ===================================================
// MGREEL.js WEB PORT
// ===================================================

const sampleRate = 48000.0;
const bitDepth = '32f';

const openFiles = async (e) => {
	
	error(); // Reset error message
	
	try {
		await processFiles(e.target.files || (e.dataTransfer && e.dataTransfer.files));
	} catch (x) {
		error(x.toString());
	}
	
};

const processFiles = async (files) => {
	
	// No file given?
	if (files == null || files.length == 0) return;
	
	// splicesL|R is an array of samples for each input file (splice). Samples are
	// resampled to 32f/48khz.
	let splicesL = [];
	let splicesR = [];
	let count = 1;
	for (const file of files) {
		await progress('Processing file ' + count + '/' + files.length + '... ' + (file.name || ''));
		let wav = new wavefile.WaveFile(await readFileAsUint8Array(file));
		wav.toBitDepth(bitDepth);
		wav.toSampleRate(sampleRate);
		let samples = wav.getSamples(false);
		if (wav.fmt.numChannels == 2) {
			splicesL.push(samples[0]);
			splicesR.push(samples[1]);
		} else {
			splicesL.push(samples);
			splicesR.push(samples);
		}
		count++;
	}
	
	// totalLength contains total number of samples.
	let totalLength = splicesL.reduce((total, splice) => total + splice.length, 0);

	// samplesL|R are arrays with the final samples.
	let samplesL = new Float64Array(totalLength);
	let samplesR = new Float64Array(totalLength);
	let currentOffset = 0;
	splicesL.forEach(splice => {
		samplesL.set(splice, currentOffset);
		currentOffset += splice.length;
	});
	currentOffset = 0;
	splicesR.forEach(splice => {
		samplesR.set(splice, currentOffset);
		currentOffset += splice.length;
	});
	
	// Assemble final wav.
	await progress('Assembling reel...');
	let wav = new wavefile.WaveFile();
	wav.fromScratch(2, sampleRate, bitDepth, [ samplesL, samplesR ]);

	// Set cue points based on splices length.
	currentOffset = 0;
	splicesL.forEach(splice => {
		if (currentOffset > 0) {
			wav.setCuePoint({ position: currentOffset / sampleRate * 1000 });
		}
		currentOffset += splice.length;
	});

	// MG requires that dwPosition is set to same value as dwSampleOffset.
	wav.cue.points.forEach(point => {
		point.dwPosition = point.dwSampleOffset;
	});
	
	// Save file
	saveBufferToFile(wav.toBuffer());
	await progress(); // Reset progress
	
};

const error = (message = null) => {
	document.getElementById('error').innerText = message || '';
};

const progress = async (message = null) => {
	document.getElementById('progress').innerText = message || '';
	await new Promise(resolve => setTimeout(resolve, 1000));
};

// ===================================================
// WAV FILES PICKER WITH DRAG & DROP
// ===================================================

const fileInput = document.getElementById('file-input');
const fileDropArea = document.getElementById('file-area');

const dragFiles = (e, enter) => {
	e.stopPropagation();
	e.preventDefault();
	fileDropArea.classList[enter ? 'add' : 'remove']('dragging');
};

const dropFiles = (e) => {
	e.stopPropagation();
	e.preventDefault();
	fileDropArea.classList.remove('dragging');
	openFiles(e);
};

fileInput.addEventListener('change', e => openFiles(e));
fileDropArea.addEventListener('dragenter', e => dragFiles(e, true));
fileDropArea.addEventListener('dragover', e => dragFiles(e, true));
fileDropArea.addEventListener('dragleave', e => dragFiles(e, false));
fileDropArea.addEventListener('drop', e => dropFiles(e));

// ===================================================
// UTILS
// ===================================================

const readFileAsUint8Array = async (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(new Uint8Array(reader.result));
		reader.onerror = (x) => reject(x);
		reader.readAsArrayBuffer(file);
	});
};

const saveBufferToFile = (buffer) => {
	
	const blob = new Blob([buffer], { type: "audio/wav" });
	
	// Create an object URL, to allow right-click and "save as".
	// This is not available in IE 11, where msSaveOrOpenBlob will be used on button left-click.
	// Adapted from: https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
	const name = 'mg1.wav';
	const a = document.createElement('a');
    a.download = name;
    a.rel = 'noopener';
	if ('download' in HTMLAnchorElement.prototype) {
		URL.revokeObjectURL(a.href);
		a.href = URL.createObjectURL(blob);
		setTimeout(() => URL.revokeObjectURL(a.href), 4E4); // 40s
		setTimeout(() => click(a), 0);
	} else if ('msSaveOrOpenBlob' in navigator) {
		a.onclick = () => {
			navigator.msSaveOrOpenBlob(blob, name);
		};
	}
	
};

const click = (node) => {
	
	// From: https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
	try {
		node.dispatchEvent(new MouseEvent('click'));
	} catch (e) {
		var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
		node.dispatchEvent(evt);
	}
	
};
