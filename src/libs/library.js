import { invoke } from '@tauri-apps/api/core';
import { appCacheDir, resolve, downloadDir, join, sep, cacheDir } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import { listen } from '@tauri-apps/api/event';
import { remove, readDir, BaseDirectory, rename } from '@tauri-apps/plugin-fs';
import { open, Command } from '@tauri-apps/plugin-shell';
import { sendNotification, createChannel, removeChannel, requestPermission } from '@tauri-apps/plugin-notification';
import { exit } from '@tauri-apps/plugin-process';
import { version } from '@tauri-apps/plugin-os';
import { download } from '@tauri-apps/plugin-upload';
import { toast } from '@zerodevx/svelte-toast';
import style from './style.module.scss';
import { printf } from 'fast-printf';
const library = [];
let playButtonStateChangeEvent = new Event("playButtonStateChange", {bubbles: true});
let themeChangeEvent = new Event("themeChange", {bubbles: true});
let accountChangeEvent = new Event("accountChange", {bubbles: true});
let progressChangeEvent = new Event("progressChange", {bubbles: true});
import languageStrings from './languages.js';
let strings = languageStrings[localStorage.language];

document.addEventListener("languageChange", (event) => strings = languageStrings[localStorage.language]);

document.addEventListener("notificationChange", (event) => notifications = event.detail.notifies);

window.gameUpdatingAnimation = '';
window.playButtonIsAvailable = style.isAvailable;
window.playButtonState = 0;

window.updatePlayButtonState = () => {
	switch(true) {
		case isUpdatingGame:
			window.gameUpdatingAnimation = style.show;
			window.playButtonIsAvailable = '';
			window.playButtonState = 1;
			break;
		case isCheckingUpdate:
		case isGameStarting:
			window.gameUpdatingAnimation = '';
			window.playButtonIsAvailable = style.isAvailable;
			window.playButtonState = 1;
			break;
		case isPendingUpdate:
		case isPendingAPKInstallation:
			window.gameUpdatingAnimation = '';
			window.playButtonIsAvailable = style.isAvailable;
			window.playButtonState = 2;
			break;
		case isGameRunning:
			window.gameUpdatingAnimation = style.show;
			window.playButtonIsAvailable = '';
			window.playButtonState = 0;
			break;
		default:
			window.gameUpdatingAnimation = '';
			window.playButtonIsAvailable = style.isAvailable;
			window.playButtonState = 0;
			break;
	}
	return window.playButtonState;
}

library.sleep = ms => new Promise(r => setTimeout(r, ms));

library.initializeEvents = async function() {
	if(typeof window.isCheckingUpdate == 'undefined') window.isCheckingUpdate = false;
	if(typeof window.isUpdatingGame == 'undefined') window.isUpdatingGame = false;
	if(typeof window.isGameStarting == 'undefined') window.isGameStarting = false;
	if(typeof window.isGameRunning == 'undefined') window.isGameRunning = false;
	if(typeof window.isPendingUpdate == 'undefined') window.isPendingUpdate = false;
	if(typeof window.hasNewNotifications == 'undefined') window.hasNewNotifications = false;
	if(typeof window.isPendingAPKInstallation == 'undefined') window.isPendingAPKInstallation = false;
	
	// Rare type of events
	if(typeof window.isLoggingIn == 'undefined') window.isLoggingIn = false;
	if(typeof window.isNotificationsLoading == 'undefined') window.isNotificationsLoading = true;
	
	// Not really events
	if(typeof window.new_updates == 'undefined') window.new_updates = [];
	if(typeof window.recursive_check == 'undefined') window.recursive_check = [];
	if(typeof window.game_folders == 'undefined') window.game_folders = [];
	if(typeof window.notifications == 'undefined') window.notifications = [];
	if(typeof window.profile_data == 'undefined') window.profile_data = false;
	if(typeof window.progress_value == 'undefined') window.progress_value = 0;
	if(typeof window.progress_max == 'undefined') window.progress_max = 0;
	if(typeof window.progress_value_text == 'undefined') window.progress_value_text = '';
	if(typeof window.progress_max_text == 'undefined') window.progress_max_text = '';
	if(typeof window.progress_title_text == 'undefined') window.progress_title_text = '';
	if(typeof window.progress_speed_text == 'undefined') window.progress_speed_text = '';
}

library.initializeVariables = function() {
	if(typeof localStorage.update_time == 'undefined') localStorage.update_time = 0;
	if(typeof localStorage.profile_type == 'undefined') localStorage.profile_type = 1;
	if(typeof localStorage.enable_notifications == 'undefined') localStorage.enable_notifications = 'true';
	if(typeof localStorage.username == 'undefined') localStorage.username = '';
	if(typeof localStorage.accountID == 'undefined') localStorage.accountID = 0;
	if(typeof localStorage.auth == 'undefined') localStorage.auth = '';
	if(typeof localStorage.color == 'undefined') localStorage.color = '';
	if(typeof localStorage.language == 'undefined') localStorage.language = 'en';
	if(typeof localStorage.updates_interval == 'undefined') localStorage.updates_interval = 1800000;
	if(typeof localStorage.theme == 'undefined') localStorage.theme = 'main';
	if(typeof localStorage.main_icon == 'undefined') localStorage.main_icon = 'https://icons.gcs.icu/icon.png?type=cube&value=1&color1=0&color2=3';
	if(typeof localStorage.clan_name == 'undefined') localStorage.clan_name = '';
	if(typeof localStorage.clan_color == 'undefined') localStorage.clan_color = '';
}

library.getSettings = function() {
	library.initializeVariables();
	return new Promise(async function(r) {
		const resourcePath = await downloadDir();
		const geodePath = resourcePath.replace("Android" + await sep() + "data", "Android" + await sep() + "media").replace("files" + await sep() + "Download", "");
		r({
			updates_api_url: "https://updates.gcs.icu/",
			dashboard_api_url: "https://api.gcs.icu/",
			gdps_name: "GreenCatsServer",
			game_package: "com.sa1ntsh.greencatssrv",
			
			update_time: localStorage.update_time,
			resource_path: resourcePath,
			geode_path: geodePath
		});
	});
}

library.checkUpdates = function() {
	return new Promise(async function(r) {
		if(window.isCheckingUpdate) r(false);
		await library.changeIsCheckingUpdateState(true);
		const settings = await library.getSettings();
		if(settings.update_time == 0) {
			console.log('You should install game ;)');
			await library.changeIsCheckingUpdateState(false);
			await library.changePendingUpdateState(true);
			r(false);
		} else {
			fetch(settings.updates_api_url + "last/android").then(res => res.json()).then(response => {
				if(response && response.timestamp > settings.update_time) {
					library.sendNotification(strings.notifications.foundUpdate.title, strings.notifications.foundUpdate.description);
					console.log("Updates were found!");
					window.new_updates = response;
					library.changeIsCheckingUpdateState(false);
					library.changePendingUpdateState(true);
					r(false);
				} else {
					console.log("No updates available. Latest version!");
					library.changeIsCheckingUpdateState(false);
					library.changePendingUpdateState(false);
					r(true);
				}
			}).catch(err => {
				console.error('Failed checking updates:', err);
				library.changeIsCheckingUpdateState(false);
				library.changePendingUpdateState(false);
				r(false);
			});
		}
	});
}

library.installGame = async function() {
	const settings = await library.getSettings();
	const lastUpdateTimestamp = await library.getLatestUpdateTimestamp();
	library.changeUpdatingGameState(false);
	library.changeIsCheckingUpdateState(true);
	library.changeProgressState(3, 4, 'Установка...', 'Сейчас...', '...почти!', ' ');
	console.log('Installing game...');
	window.__TAURI__.core.invoke("plugin:gcs|install", { payload: { value: await join(settings.resource_path, "/android.apk") } }).then(res => {
		if(res.value == "Success") {
			library.changeProgressState(0, 0, '', '', '', '');
			library.changeIsCheckingUpdateState(false);
			library.changePendingUpdateState(false);
			library.changePendingAPKInstallationState(false);
			library.cleanTemporaryFiles();
			localStorage.update_time = lastUpdateTimestamp;
		} else {
			library.changeProgressState(0, 4, 'Установка...', 'Нажмите...', '...обновить!', ' ');
			library.changeIsCheckingUpdateState(false);
			library.changePendingUpdateState(false);
			library.changePendingAPKInstallationState(true);
		}
	}).catch(err => {
		console.error('Failed installing APK file:', err);
		library.changeProgressState(0, 0, '', '', '', '');
		library.changeUpdatingGameState(false);
		library.cleanTemporaryFiles();
	});
}

library.cleanTemporaryFiles = async function(patchTimestamp = 0) {
	const settings = await library.getSettings();
	const apkPath = await join(settings.resource_path, "/android.apk")
	await remove(apkPath).catch(err => console.log("Game APK was not found. Nothing to delete!"));
}

library.changeUpdatingGameState = async function(state) {
	window.isUpdatingGame = state;
	await window.updatePlayButtonState();
	document.dispatchEvent(playButtonStateChangeEvent);
}

library.changeIsCheckingUpdateState = async function(state) {
	window.isCheckingUpdate = state;
	await window.updatePlayButtonState();
	document.dispatchEvent(playButtonStateChangeEvent);
}

library.changeIsGameStartingState = async function(state) {
	window.isGameStarting = state;
	await window.updatePlayButtonState();
	document.dispatchEvent(playButtonStateChangeEvent);
}

library.changeIsGameRunningState = async function(state) {
	window.isGameRunning = state;
	await window.updatePlayButtonState();
	document.dispatchEvent(playButtonStateChangeEvent);
}

library.changePendingUpdateState = async function(state) {
	window.isPendingUpdate = state;
	await window.updatePlayButtonState();
	document.dispatchEvent(playButtonStateChangeEvent);
}

library.changePendingAPKInstallationState = async function(state) {
	window.isPendingAPKInstallation = state;
	await window.updatePlayButtonState();
	document.dispatchEvent(playButtonStateChangeEvent);
}

library.openOrInstallGame = async function() {
	if(isGameRunning) return;
	if(isPendingAPKInstallation) return library.installGame();
	if(isPendingUpdate) return library.updateGame();
	const settings = await library.getSettings();
	await library.changeIsGameStartingState(true);
	await invoke("plugin:gcs|run", {payload: {value: settings.game_package}}).then(res => {
		library.changeIsGameStartingState(false);
		if(!res.value) {
			console.log("Failed to run game (after invoking):", err);
			library.updateGame();
		}
	}).catch(err => {
		library.changeIsGameStartingState(false);
		console.log("Failed to run game (failed invoking):", err);
		library.updateGame();
	});
}

library.updateGame = async function() {
	if(window.isUpdatingGame) return;
	library.changeUpdatingGameState(true);
	library.changePendingUpdateState(false);
	const settings = await library.getSettings();
	console.log('Starting downloading game...');
	var decreaseEventFires = 0;
	download(settings.updates_api_url + "download/android", await join(settings.resource_path, "/android.apk"), (progress) => {
		decreaseEventFires++;
		if(decreaseEventFires % 200 === 0) library.changeProgressState(progress.progressTotal, progress.total, 'Загрузка...', Math.round(progress.progressTotal / 104857.6) / 10 + " МБ", Math.round(progress.total / 104857.6) / 10 + " МБ", Math.round(progress.transferSpeed /104857.6) / 10 + " МБ/c");
	}).then(async (r) => {
		library.changeUpdatingGameState(false);
		library.changeIsCheckingUpdateState(true);
		library.changeProgressState(3, 4, 'Установка...', 'Сейчас...', '...почти!', ' ');
		console.log('Installing game...');
		library.installGame();
	}).catch(err => {
		console.error('Failed downloading APK file:', err);
		library.changeProgressState(0, 0, '', '', '', '');
		library.changeUpdatingGameState(false);
		library.changePendingUpdateState(true);
		library.cleanTemporaryFiles();
	});
}

library.getLatestUpdateTimestamp = async function() {
	const settings = await library.getSettings();
	return new Promise(r => {
		fetch(settings.updates_api_url + "last/android").then(res => res.json()).then(response => {
			r(response.timestamp);
		}).catch(err => {
			console.error('Failed getting update time:', err);
			r(0);
		});
	});
}

library.recursiveReadDir = async function(parent, initialParent) {
	const dirEntries = await readDir(parent, { baseDir: BaseDirectory.Cache });
	for(const entry of dirEntries) {
		const onlyFilePath = parent.substr(initialParent.length + await sep().length);
		if(entry.isDirectory) {
			const folderPath = onlyFilePath.length != 0 ? await join(onlyFilePath, entry.name) : entry.name;
			game_folders.push(folderPath);
			const dir = await join(parent, entry.name);
			await library.recursiveReadDir(dir, initialParent);
		} else {
			const filePath = onlyFilePath.length != 0 ? await join(onlyFilePath, entry.name) : entry.name;
			recursive_check.push(filePath);
		}
	}
	return recursive_check;
}

library.addFolderToSQL = async function(folder) {
	const allFiles = await library.recursiveReadDir(folder, folder);
	await library.addFilesToSQL(allFiles);
	await library.addGameFoldersToSQL(game_folders);
	recursive_check = game_folders = [];
}

library.addFilesToSQL = async function(allFiles) {
	const settings = await library.getSettings();
	var i = 0;
	for(i = 0; i < allFiles.length; i++) {
		const fileRelativePath = allFiles[i];
		const md5 = await invoke('get_file_md5', {filePath: await join(settings.resource_path, fileRelativePath)}) ?? 'MD5 failed';
		await db.execute("INSERT INTO files (file, md5) VALUES($1, $2) ON CONFLICT(file) DO UPDATE SET md5 = $2", [fileRelativePath, md5]);
	}
}

library.addGameFoldersToSQL = async function(allFolders) {
	const settings = await library.getSettings();
	var i = 0;
	for(i = 0; i < allFolders.length; i++) {
		const folderRelativePath = allFolders[i];
		await db.execute("INSERT INTO folders (folder) VALUES($1) ON CONFLICT(folder) DO UPDATE SET folder = $1", [folderRelativePath]);
	}
}

library.removeFilesFromSQL = async function(allFiles) {
	const deletedFilesString = "'" + allFiles.join("','") + "'";
	await db.execute("DELETE FROM files WHERE file IN (" + deletedFilesString + ")");
}

library.uninstallGame = async function() {
	if(window.isUpdatingGame) return;
	const settings = await library.getSettings();
	console.log('Deleting game...');
	library.changeUpdatingGameState(true);
	const gameFiles = await db.select("SELECT file FROM files");
	var i = 0;
	for(i = 0; i < gameFiles.length; i++) {
		const gameFile = gameFiles[i].file;
		await remove(await join(settings.resource_path, gameFile)).catch(err => console.error("File " + gameFile + " was not found."));
	}
	const gameFolders = await db.select("SELECT folder FROM folders");
	var i = 0;
	for(i = 0; i < gameFolders.length; i++) game_folders.push(gameFolders[i].folder);
	await library.removeEmptyFolders();
	await db.execute("DELETE FROM files");
	await db.execute("DELETE FROM folders");
	localStorage.update_time = 0;
	library.sendNotification(strings.notifications.gameDeleted.title, strings.notifications.gameDeleted.description);
	console.log('Game was successfully deleted! ...');
	library.changePendingUpdateState(true);
	library.changeUpdatingGameState(false);
	library.checkUpdates();
}

library.removeEmptyFolders = async function() {
	const settings = await library.getSettings();
	var i = game_folders.length - 1;
	for(i = game_folders.length - 1; i >= 0; i--) {
		const folderPath = game_folders[i];
		remove(await join(settings.resource_path, folderPath), { recursive: false }).catch(err => console.error("Folder " + folderPath + " is not empty/was not found."));
	}
}

library.checkProcess = async function(process) {
	console.log("Game checked...");
	return new Promise(resolve => {
		invoke("check_processes", {process: process}).then(r => {
			library.changeIsGameRunningState(true);
			resolve(true)
		}).catch(e => {
			library.changeIsGameRunningState(false);
			resolve(false)
		});
	});
}

library.verifyGameFilesIntegrity = async function() {
	if(window.isUpdatingGame) return;
	const settings = await library.getSettings();
	console.log("Verifying game files integrity...");
	library.changeUpdatingGameState(true);
	const gameFiles = await db.select("SELECT * FROM files");
	var i = 0;
	const failedFiles = [];
	for(i = 0; i < gameFiles.length; i++) {
		const gameFile = gameFiles[i].file;
		try {
			const md5 = await invoke('get_file_md5', {filePath: await join(settings.resource_path, gameFile)});
			if(gameFiles[i].md5 != md5) failedFiles.push(gameFile);
		} catch(e) {
			console.log('File', gameFile, 'was not found');
			failedFiles.push(gameFile);
		}
	}
	if(failedFiles.length == 0) {
		library.changeUpdatingGameState(false);
		console.log('All files are fine!');
	} else {
		console.log("Found damaged files!");
		await library.downloadSpecificFiles(failedFiles);
		library.changeUpdatingGameState(false);
	}
}

library.downloadSpecificFiles = async function(downloadFiles) {
	return new Promise(async function(r) {
		const settings = await library.getSettings();
		console.log("Downloading some specific files...");
		const downloadArchivePath = await resolve(await appCacheDir() + "/download.7z");
		invoke('download_archive', { url: settings.updates_api_url + "files", tempPath: downloadArchivePath, files: JSON.stringify({ files: downloadFiles })}).then(stdout => {
			if(stdout == null) {
				console.log('Unpacking downloaded files...');
				invoke("unpack_archive", { archivePath: downloadArchivePath, extractPath: settings.resource_path}).then(async function(stdout) {
					if(stdout == null) {
						console.log('Extracted downloaded files!');
						await remove(downloadArchivePath).catch(err => {console.error(err);});
						r(true)
					} else {
						console.error('Failed to extract files:', stdout);
						r(false);
					}
				});
			} else {
				console.error('Failed to download files:', stdout);
				r(false);
			}
		});
	});
}

library.getProfile = function(accountID) {
	return new Promise(async function(r) {
		const settings = await library.getSettings();
		fetch(settings.dashboard_api_url + "profile.php?accountID=" + accountID).then(res => res.json()).then(response => {
			r(response);
		});
	});
}

library.openGameFolder = async function() {
	const settings = await library.getSettings();
	open(settings.resource_path);
}

library.sendNotification = async function(title, body) {
	if(localStorage.enable_notifications == 'false') return;
	sendNotification({title: title.toString(), body: body.toString()});
}

library.checkIfPlayerIsLoggedIn = async function() {
	if(!localStorage.auth || !localStorage.auth.length) return false;
	const settings = await library.getSettings();
	fetch(settings.dashboard_api_url + "login.php?auth=" + localStorage.auth).then(r => r.json()).then(response => {
		if(!response.success) {
			library.logout();
			return false;
		}
		localStorage.username = response.user;
		localStorage.color = response.color;
		localStorage.accountID = response.accountID;
		localStorage.main_icon = response.mainIcon;
		localStorage.clan_name = response.clan.name;
		localStorage.clan_color = response.clan.color;
		document.dispatchEvent(accountChangeEvent);
		return true;
	});
}

library.logout = function() {
	localStorage.auth = '';
	localStorage.username = '';
	localStorage.color = '';
	localStorage.accountID = 0;
	localStorage.main_icon = 'https://icons.gcs.icu/icon.png?type=cube&value=1&color1=0&color2=3';
	localStorage.clan_name = '';
	localStorage.clan_color = '';
	document.dispatchEvent(accountChangeEvent);
}

library.timeConverter = function(timestamp, min = false) {
	if(!min) {
		const time = new Date(timestamp * 1000);
		const dayNumber = time.getDate();
		const day = dayNumber < 10 ? '0' + String(dayNumber) : dayNumber;
		const monthNumber = time.getMonth() + 1;
		const month = monthNumber < 10 ? '0' + String(monthNumber) : monthNumber;
		return day + '.' + month + '.' + time.getFullYear();
	}
	const currentTime = new Date();
	var passedTime = Math.round(currentTime.getTime() / 1000) - timestamp;
	var unitType = '';
	switch(true) {
		case passedTime >= 31536000:
			passedTime = Math.round(passedTime / 31536000);
			unitType = 'year';
			break;
		case passedTime >= 2592000:
			passedTime = Math.round(passedTime / 2592000);	
			unitType = 'month';
			break;
		case passedTime >= 604800:
			passedTime = Math.round(passedTime / 604800);
			unitType = 'week';
			break;
		case passedTime >= 86400:
			passedTime = Math.round(passedTime / 86400);
			unitType = 'day';
			break;
		case passedTime >= 3600:
			passedTime = Math.round(passedTime / 3600);
			unitType = 'hour';
			break;
		case passedTime >= 60:
			passedTime = Math.round(passedTime / 60);
			unitType = 'minute';
			break;
		case passedTime >= 0:
			unitType = 'second';
			break;
	}
	const options = {
		numeric: "auto",
		style: "short"
	}
	const rtf = new Intl.RelativeTimeFormat(localStorage.language, options);
	return rtf.format(-1 * passedTime, unitType);
}

library.checkLauncherUpdates = function() {
	return new Promise(r => {
		library.getSettings().then(settings => {		
			fetch(settings.updates_api_url + "launcher").then(r => r.text()).then(async function(response) {
				const version = await getVersion();
				if(version != response) {
					console.error('ОБНОВЛЕНИЕ ЛАУНЧЕРА');
				} else {
					r(true);
				}
			}).catch(e => {
				r(true);
			});
		});
	});
}

library.changeLauncherTheme = function(theme) {
	return new Promise(r => {
		document.dispatchEvent(themeChangeEvent);
		document.getElementById("launcher-contents").setAttribute("launcher-theme", theme);
		switch(theme) {
			case 'main':
				document.getElementById("launcher-background").style.display = "block";
				break;
			case 'mica':
				document.getElementById("launcher-background").style.display = "none";
				break;
		}
	});
}

library.getNotifications = function() {
	return new Promise(async function(r) {
		if(!localStorage.auth.length) r({ notifies: [] });
		const settings = await library.getSettings();
		fetch(settings.dashboard_api_url + "notify.php?auth=" + localStorage.auth).then(res => res.json()).then(response => {
			if(!response.success || !response.notifies) return r({ notifies: [] });
			
			hasNewNotifications = response.notifies.some(notification => !notification.checked);
			
			let notificationChangeEvent = new CustomEvent("notificationChange", { detail: response });
			document.dispatchEvent(notificationChangeEvent);
			
			if(isNotificationsLoading) {
				if(response.counts.new > 0) {
					if(response.counts.new == 1) {
						let unreadNotification = response.notifies.filter((notification) => !notification.checked)[0].action;
						let notificationTitle = library.getNotificationTitle(unreadNotification);
						library.sendNotification(notificationTitle.title, notificationTitle.description);
					} else {
						let getPlural = library.getPluralType(response.counts.new);
						library.sendNotification(printf(strings.notifications.several['title-' + getPlural], response.counts.new), printf(strings.notifications.several['description-' + getPlural], response.counts.new));
					}
				}
			}
			
			isNotificationsLoading = false;
			
			r(response);
		});
	});
}

library.getNotificationTitle = function(action) {
	let notificationTitle = '';
	let notificationDescription = '';
	let notificationType = style.squareYellow;
	switch(action.type) {
		case 1:
			if(action.v3) {
				notificationTitle = strings.notifications.first.levelRated.title;
				notificationDescription = printf(strings.notifications.first.levelRated["description-" + library.getPluralType(action.v3)], action.v1.name, action.v3);
				notificationType = style.squareGreen;
			} else {
				notificationTitle = strings.notifications.first.levelUnrated.title;
				notificationDescription = printf(strings.notifications.first.levelUnrated.description, action.v1.name);
				notificationType = style.squareRed;
			}
			break;
		case 2:
			if(action.v1 > 5) action.v1 = 0;
			if(!action.v3) {
				notificationTitle = strings.notifications.second.unbanned.title;
				notificationDescription = strings.notifications.second.unbanned["description-" + action.v1]
				notificationType = style.squareGreen;
			} else {
				notificationTitle = strings.notifications.second.banned.title;
				notificationDescription = strings.notifications.second.banned["description-" + action.v1]
				notificationType = style.squareRed;
			}
			break;
		case 3:
			notificationTitle = strings.notifications.third.title;
			notificationDescription = printf(strings.notifications.third.description, action.v2.clan);
			notificationType = style.squareYellow;
			break;
		case 4:
			if(action.v1) {
				notificationTitle = strings.notifications.fourth.joined.title;
				notificationDescription = printf(strings.notifications.fourth.joined.description, action.v2.clan);
				notificationType = style.squareGreen;
			} else {
				notificationTitle = strings.notifications.fourth.left.title;
				notificationDescription = printf(strings.notifications.fourth.left.description, action.v2.clan);
				notificationType = style.squareRed;
			}
			break;
		case 5:
			notificationTitle = strings.notifications.fifth.title;
			notificationDescription = printf(strings.notifications.fifth.description, action.v2.clan);
			notificationType = style.squareRed;
			break;
		case 6:
			if(action.v1) {
				notificationTitle = strings.notifications.sixth.accepted.title;
				notificationDescription = printf(strings.notifications.sixth.accepted.description, action.v2.clan);
				notificationType = style.squareGreen;
			} else {
				notificationTitle = strings.notifications.sixth.denied.title;
				notificationDescription = printf(strings.notifications.sixth.denied.description, action.v2.clan);
				notificationType = style.squareRed;
			}
			break;
		default:
			notificationTitle = strings.notifications.unknown.title;
			notificationDescription = strings.notifications.unknown.description;
			break;
	}
	return {
		title: notificationTitle,
		description: notificationDescription,
		type: notificationType
	};
}

library.getPluralType = function(number) {
	let lastCharacter = String(number).slice(-1);
	if(number == 1) return 1;
	if((lastCharacter > 1 && lastCharacter < 5) || (number < 10 || number > 21)) return 2;
	return 3;
}

library.isWindows11 = function() {
	return false;
}

library.toast = function(text) {
	toast.pop();
	toast.push(text, {
		duration: 1500,
		intro: {
			x: 0,
			y: -100
		}
	});
}

library.initializeAndroidNotifications = function() {
	removeChannel('default');
	createChannel({
		id: "launcher-notifications",
		name: "Уведомления лаунчера",
		description: "Это уведомления, которые отправляет сам лаунчер, к примеру, новое обновление лаунчера, игры и так далее."
	});
	if(localStorage.enable_notifications == 'false') {
		requestPermission().then(isGranted => {
			localStorage.enable_notifications = isGranted == 'granted' ? true : 'asked';
		});
	}
}

library.changeProgressState = function(value, max, titleText, valueText, maxText, speedText) {
	window.progress_value = value;
	window.progress_max = max;
	window.progress_title_text = titleText;
	window.progress_value_text = valueText;
	window.progress_max_text = maxText;
	window.progress_speed_text = speedText;
	document.dispatchEvent(progressChangeEvent);
}

window.debug = function(type, isTrue) {
	switch(type) {
		case 1:
			library.changeIsCheckingUpdateState(isTrue);
			break;
		case 2:
			library.changeUpdatingGameState(isTrue);
			break;
		case 3:
			library.changeIsGameStartingState(isTrue);
			break;
		case 4:
			library.changeIsGameRunningState(isTrue);
			break;
		case 5:
			library.changePendingUpdateState(isTrue);
			break;
	}
}

library.styles = style;

library.initializeEvents();

library.initializeAndroidNotifications();

library.getNotifications();

window.library = library;

export default library;