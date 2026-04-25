// This app was done very fast, so be sure that it has some poor code

const appWindow = window.__TAURI__.window.getCurrentWindow();

appWindow.setMaximizable(false);
appWindow.setResizable(false);
appWindow.setShadow(false);

const language = {
	loading: "Downloading",
	updating: "Updating",
	done: "Done",
	error: "Error"
}

const getSettings = async () => {
	const resourcePath = await window.__TAURI__.path.resourceDir();
	const separator = await window.__TAURI__.path.sep();
	
	return {
		updates_api_url: "https://updates.example.com/",
		launcher_exe: "launcher.exe",
		
		resource_path: resourcePath,
		separator: separator
	}
}

const downloadFile = async (url, savePath) => {
	return new Promise(async (resolve, reject) => {
		const file = await window.__TAURI__.core.invoke("plugin:download|create", {path: savePath, url: url}).catch((err) => reject(err));
		
		window.__TAURI__.event.listen("tauri-plugin-download:changed", (updatedDownload) => {
			console.log(updatedDownload);
			if(updatedDownload.payload.status.toLowerCase() == 'completed') return resolve(true);
		});
	   
		await window.__TAURI__.core.invoke("plugin:download|start", {path: savePath}).catch((err) => reject(err));
		
		const checkInterval = setInterval(async () => { // For some reason plugin-download sometimes doesn't send "completed" event
			const downloadsList = await window.__TAURI__.core.invoke("plugin:download|list").catch((err) => reject(err));
			
			if(!downloadsList.length) {
				clearInterval(checkInterval);
				return resolve(true);
			}
		}, 100);
	});
}

const getTimestamp = async () => {
	return Math.floor(new Date().getTime() / 1000);
}

const installer = {};

installer.install = async () => {
	const settings = await getSettings();
	const launcherPath = await window.__TAURI__.path.resolve(await window.__TAURI__.path.appCacheDir() + "/launcher.zip");
	
	text.innerHTML = language.loading;
	console.log('Downloading launcher...');
	await installer.downloadUpdate(launcherPath).catch((err) => installer.showError(err));
	if(isError) return;
	
	text.innerHTML = language.updating;
	console.log('Extracting update...');
	await installer.extractArchive(launcherPath).catch((err) => installer.showError(err));
	if(isError) return;
	
	text.innerHTML = language.done;
	console.log('Opening launcher...');
	await installer.openLauncher().catch((err) => installer.showError(err));
	if(isError) return;
	
	setTimeout(() => window.__TAURI__.process.exit(0), 100);
}

installer.showError = async (error) => {
	window.isError = true;
	
	const timestamp = await getTimestamp();
	text.innerHTML = language.error;
	
	icon.src = "res/x.svg";
	icon.classList.remove("spin");
	
	console.error("Error has occured:", error);
	
	const logPath = await window.__TAURI__.path.resolve(`logs`);
	const logFilePath = await window.__TAURI__.path.resolve(logPath + `/updater-${timestamp}.log`);
	
	if(!await window.__TAURI__.fs.exists(logPath)) await window.__TAURI__.fs.mkdir(logPath);
	
	const logFile = await window.__TAURI__.fs.create(logFilePath);
	await logFile.write(new TextEncoder().encode(error.toString()));
	await logFile.close();
	
	setTimeout(() => window.__TAURI__.process.exit(0), 4000);
}

installer.downloadUpdate = (path) => {
	return new Promise(async (resolve, reject) => {
		const settings = await getSettings();
		
		await downloadFile(`${settings.updates_api_url}download/pc-launcher/0`, path).catch((err) => reject(err));
		
		return resolve(true);
	});
}

installer.extractArchive = async (path) => {
	return new Promise(async (resolve, reject) => {
		const settings = await getSettings();
	
		window.__TAURI__.core.invoke("unpack_archive", { archivePath: path, outputPath: settings.resource_path + settings.separator})
			.then((stdout) => {
				if(stdout !== null) return reject(stdout);
				
				return resolve(true);
			})
			.catch((err) => reject(err));		
	});
}

installer.openLauncher = async () => {
	return new Promise(async (resolve, reject) => {
		const settings = await getSettings();
	
		await window.__TAURI__.shell.open(settings.launcher_exe).catch((err) => reject(err));
		
		return resolve(true);
	});
}

window.addEventListener('load', () => {
	window.text = document.getElementById("loadingText");
	window.icon = document.getElementById("loadingIcon");
	window.isError = false;
	
	installer.install();
});

window.installer = installer;