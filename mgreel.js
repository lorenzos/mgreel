const wavefile = require('wavefile');

// ===================================================
// MGREEL.js WEB PORT
// ===================================================

const sampleRate = 48000.0;
const bitDepth = '32f';

/**
 * Assemble a Morphagene reel from given WAV files
 * @param files An array of File object, or a FileList object
 * @param progressCallback An optional function to report progress; it receives a state string and an object with more details
 * @return A Blob with the resulting WAV file, or NULL if no file is given
 */
module.exports = async (files, progressCallback) => {
	
	// No file given?
	files = Array.from(files);
	if (files == null || files.length == 0) return null;
	
	const p = progressCallback;
	
	// splicesL|R is an array of samples for each input file (splice). Samples are
	// resampled to 32f/48khz.
	let splicesL = [];
	let splicesR = [];
	let count = 1;
	for (const file of files) {
		await progress(p, 'file', { file: file, current: count, total: files.length });
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
	await progress(p, 'reel');
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
	
	// Save to blob
	return new Blob([ wav.toBuffer() ], { type: "audio/wav" });
	
};

const readFileAsUint8Array = async (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(new Uint8Array(reader.result));
		reader.onerror = (x) => reject(x);
		reader.readAsArrayBuffer(file);
	});
};

const progress = async (f, state, args = {}) => {
	if (f) f(state, args);
	await new Promise(resolve => setTimeout(resolve, 100)); // Wait to give UI time to refresh
};
