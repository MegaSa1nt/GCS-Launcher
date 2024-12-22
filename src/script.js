// This app was done very fast, so be sure that it has some poor code

const appWindow = window.__TAURI__.window.getCurrentWindow();
const text = document.getElementById("ph1");

appWindow.setMaximizable(false);
appWindow.setResizable(false);
appWindow.setShadow(false);

const language = {
	loading: "Downloading",
	updating: "Updating",
	done: "Done"
}

const getSettings = async function() {
	const resourcePath = await window.__TAURI__.path.resourceDir();
	return {
		updates_api_url: "https://updates.example.com/",
		launcher_exe: "launcher.exe",
		
		resource_path: resourcePath
	}
}

const installLauncher = async function() {
	const settings = await getSettings();
	const configPath = await window.__TAURI__.path.resolve(await window.__TAURI__.path.appCacheDir() + "/launcher.7z");
	console.log('Starting downloading launcher...');
	text.innerHTML = language.loading;
	window.__TAURI__.core.invoke('download_file', { url: settings.updates_api_url + "download/launcher/0", tempPath: configPath}).then(stdout => {
		if(stdout === null) {
			console.log('Unpacking launcher...');
			text.innerHTML = language.updating;
			window.__TAURI__.core.invoke("unpack_archive", { archivePath: configPath, extractPath: settings.resource_path}).then(async function(stdout) {
				if(stdout === null) {
					window.__TAURI__.shell.open(settings.launcher_exe).then(res => {
						text.innerHTML = language.done;
						window.__TAURI__.process.exit(0);
					}).catch(err => {				
						console.error('Failed extracting archive:', err);
						window.__TAURI__.process.exit(0);
					});
				} else {
					console.error('Failed extracting archive:', err);
					window.__TAURI__.process.exit(0);
				}
			}).catch(err => {				
				console.error('Failed extracting archive:', err);
				window.__TAURI__.process.exit(0);
			});
		} else {
			console.error('Failed downloading archive:', stdout);
			window.__TAURI__.process.exit(0);
		}
	}).catch(err => {
		console.error('Failed downloading archive:', err);
		window.__TAURI__.process.exit(0);
	});
}

installLauncher();