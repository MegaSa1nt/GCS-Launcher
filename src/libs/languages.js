function getLanguages() {
	return new Promise(r => {
		switch(localStorage.language) {
			case 'en':
				import('./languages/en.json').then(str => {
					r(str);
				});
				break;
			case 'ru':
				import('./languages/ru.json').then(str => {
					r(str);
				});
				break;
		}
	})
}

const strings = await getLanguages();

export default strings;