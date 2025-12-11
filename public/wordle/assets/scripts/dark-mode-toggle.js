const modeToggle = document.getElementById('mode-toggle');

if (modeToggle) {
	modeToggle.addEventListener('click', () => {
		document.body.classList.toggle('light-mode');
		console.log('mode-toggle clicked — light-mode:', document.body.classList.contains('light-mode'));
	});
} else {
	console.warn('mode-toggle element not found');
}

