const mgreel = require('./mgreel.js');

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', e => openFiles(e));

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
fileDropArea.addEventListener('dragenter', e => dragFiles(e, true));
fileDropArea.addEventListener('dragover', e => dragFiles(e, true));
fileDropArea.addEventListener('dragleave', e => dragFiles(e, false));
fileDropArea.addEventListener('drop', e => dropFiles(e));

const openFiles = async (e) => {
	try {
		progress(); // Reset progress
		error(); // Reset error message
		const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
		const buffer = await mgreel(files, (state, args) => {
			switch (state) {
				case 'file':
					progress('Processing file ' + args.current + '/' + args.total + '... ' + (args.file.name || ''));
					break;
				case 'reel':
					progress('Assembling reel...');
					break;
			}
		});
		saveBufferToFile(buffer);
		progress();
	} catch (x) {
		error(x.toString());
		progress();
	}
};

const error = (message = null) => {
	document.getElementById('error').innerText = message || '';
};

const progress = async (message = null) => {
	document.getElementById('progress').innerText = message || '';
};

const saveBufferToFile = (buffer) => {
	
	const blob = new Blob([buffer], { type: "audio/wav" });
	
	// Create an object URL, to allow right-click and "save as".
	// This is not available in IE 11, where msSaveOrOpenBlob will be used on button left-click.
	// Adapted from: https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
	const name = 'mg.wav';
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
