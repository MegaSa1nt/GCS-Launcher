import { invoke } from '@tauri-apps/api/core';
import { appCacheDir, resolve, resourceDir, join, sep } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import { getCurrentWindow, Effect } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { remove, readDir, BaseDirectory, rename } from '@tauri-apps/plugin-fs';
import { open, Command } from '@tauri-apps/plugin-shell';
import Database from '@tauri-apps/plugin-sql';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { exit } from '@tauri-apps/plugin-process';
import { version } from '@tauri-apps/plugin-os';
import style from './style.module.scss';
import { printf } from 'fast-printf';
const library = [];
let playButtonStateChangeEvent = new Event("playButtonStateChange", {bubbles: true});
let themeChangeEvent = new Event("themeChange", {bubbles: true});
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
	
	// Rare type of events
	if(typeof window.isLoggingIn == 'undefined') window.isLoggingIn = false;
	if(typeof window.isNotificationsLoading == 'undefined') window.isNotificationsLoading = true;
	
	// Not really events
	if(typeof window.new_updates == 'undefined') window.new_updates = [];
	if(typeof window.recursive_check == 'undefined') window.recursive_check = [];
	if(typeof window.game_folders == 'undefined') window.game_folders = [];
	if(typeof window.notifications == 'undefined') window.notifications = [];
	const dbPath = await resolve(await appCacheDir(), "files.db")
	if(typeof window.db == 'undefined') window.db = await Database.load("sqlite:" + dbPath);
	await db.execute(`CREATE TABLE IF NOT EXISTS 'files' (
		'file' varchar(255) NOT NULL DEFAULT '',
		'md5' varchar(255) NOT NULL DEFAULT '',
		PRIMARY KEY ('file')
	);
	CREATE TABLE IF NOT EXISTS 'folders' (
		'folder' varchar(255) NOT NULL DEFAULT '',
		PRIMARY KEY ('folder')
	);`);
}

const gameCheckInterval = setInterval(async function() {
	const settings = await library.getSettings();
	library.checkProcess(settings.game_exe);
},	500);

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
	if(typeof localStorage.use_accent_color == 'undefined') localStorage.use_accent_color = 'false';
}

library.getSettings = function() {
	library.initializeVariables();
	return new Promise(async function(r) {
		const resourcePath = await resourceDir();
		r({
			updates_api_url: "https://updates.gcs.icu/",
			dashboard_api_url: "https://api.gcs.icu/",
			gdps_name: "GreenCatsServer",
			game_exe: "GreenCatsServer.exe",
			
			update_time: localStorage.update_time,
			resource_path: resourcePath
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
			fetch(settings.updates_api_url + "updates/" + settings.update_time).then(res => res.json()).then(response => {
				if(response.length == 0) {
					console.log("No updates available. Latest version!");
					library.changeIsCheckingUpdateState(false);
					library.changePendingUpdateState(false);
					r(true);
				} else {
					library.sendNotification(strings.notifications.foundUpdate.title, strings.notifications.foundUpdate.description);
					console.log("Updates were found!");
					window.new_updates = response;
					library.changeIsCheckingUpdateState(false);
					library.changePendingUpdateState(true);
					r(false);
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
	if(window.isUpdatingGame) return;
	library.changeUpdatingGameState(true);
	library.changePendingUpdateState(false);
	const settings = await library.getSettings();
	const lastUpdateTimestamp = await library.getLatestUpdateTimestamp();
	const configPath = await resolve(await appCacheDir() + "/temp.7z");
	console.log('Starting downloading game...');
	invoke('download_file', { url: settings.updates_api_url + "download/0", tempPath: configPath}).then(stdout => {
		if(stdout === null) {
			console.log('Unpacking game...');
			invoke("unpack_archive", { archivePath: configPath, extractPath: settings.resource_path}).then(async function(stdout) {
				if(stdout === null) {
					console.log('Adding all files to SQL... (that means it also calculates MD5 checksum for all files)');
					await library.addFolderToSQL(settings.resource_path);
					library.sendNotification(strings.notifications.gameInstalled.title, strings.notifications.gameInstalled.description);
					console.log('Game successfully downloaded!');
					library.changeUpdatingGameState(false);
					library.cleanTemporaryFiles();
					localStorage.update_time = lastUpdateTimestamp;
				} else {
					console.error('Failed extracting archive:', err);
					library.changeUpdatingGameState(false);
					library.cleanTemporaryFiles();
				}
			}).catch(err => {				
				console.error('Failed extracting archive:', err);
				library.changeUpdatingGameState(false);
				library.cleanTemporaryFiles();
			});
		} else {
			console.error('Failed downloading archive:', stdout);
			library.changeUpdatingGameState(false);
			library.cleanTemporaryFiles();
		}
	}).catch(err => {
		console.error('Failed downloading archive:', err);
		library.changeUpdatingGameState(false);
		library.cleanTemporaryFiles();
	});
}

library.cleanTemporaryFiles = async function(patchTimestamp = 0) {
	const settings = await library.getSettings();
	const configPath = await appCacheDir();
	await remove(configPath + "/temp.7z").catch(err => {console.log("Temporary game archive was not found. Nothing to delete!");});
	if(patchTimestamp != 0) {
		await remove(configPath + "/patch_" + patchTimestamp + ".7z").catch(err => {console.log("Temporary patch archive was not found. 🤨");});
		await remove(configPath + "/patch_" + patchTimestamp).catch(err => {console.log("Temporary patch folder was not found. 🤨");});
	}
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

library.openOrInstallGame = async function() {
	if(isGameRunning) return;
	if(isPendingUpdate) return library.updateGame();
	clearInterval(gameCheckInterval);
	const settings = await library.getSettings();
	await library.changeIsGameStartingState(true);
	await open(await join(settings.resource_path, settings.game_exe)).then(res => {
		library.changeIsGameStartingState(false);
		library.changeIsGameRunningState(true);
		setTimeout(() => {const gameCheckInterval = setInterval(() => library.checkProcess(settings.game_exe), 500)}, 1250);
	}).catch(err => {
		library.changeIsGameStartingState(false);
		library.changeIsGameRunningState(false);
		console.log("Failed to run game:", err);
		library.installGame();
	})
}

library.updateGame = async function() {
	if(window.isUpdatingGame) return;
	const settings = await library.getSettings();
	if(settings.update_time == 0) return library.installGame();
	library.changePendingUpdateState(false);
	library.changeUpdatingGameState(true);
	var i = 0;
	for(i = 0; i < new_updates.length; i++) {
		await library.patchGame(new_updates[i]);
	}
	const lastUpdateTimestamp = new_updates[new_updates.length - 1];
	library.sendNotification(strings.notifications.gameUpdated.title, strings.notifications.gameUpdated.description);
	console.log('Game successfully updated!');
	library.changeUpdatingGameState(false);
	library.cleanTemporaryFiles();
	localStorage.update_time = lastUpdateTimestamp;
}

library.getLatestUpdateTimestamp = async function() {
	const settings = await library.getSettings();
	return new Promise(r => {
		fetch(settings.updates_api_url + "lastUpdate").then(res => res.json()).then(response => {
			r(response.timestamp);
		}).catch(err => {
			console.error('Failed getting update time:', err);
			r(0);
		});
	});
}

library.patchGame = async function(patchTimestamp) {
	const settings = await library.getSettings();
	const patchArchivePath = await resolve(await appCacheDir() + "/patch_" + patchTimestamp + ".7z");
	const patchFolderPath = await resolve(await appCacheDir() + "/patch_" + patchTimestamp);
	console.log('Downloading patch ' + patchTimestamp + '...');
	return new Promise(r => {
		invoke('download_file', { url: settings.updates_api_url + "download/" + patchTimestamp, tempPath: patchArchivePath}).then(stdout => {
			if(stdout === null) {
				console.log('Unpacking patch ' + patchTimestamp + '...');
				invoke("unpack_archive", { archivePath: patchArchivePath, extractPath: patchFolderPath}).then(async function(stdout) {
					if(stdout === null) {
						console.log('Patching ' + patchTimestamp + '...');
						const patchFiles = await library.recursiveReadDir(patchFolderPath, patchFolderPath);
						recursive_check = [];
						var i = 0;
						const patchedFiles = [];
						const downloadedFiles = [];
						const deletedFiles = [];
						for(i = 0; i < patchFiles.length; i++) {
							var patchFunction = patchFiles[i].slice(-2);
							var patchFile = patchFiles[i].slice(0, patchFiles[i].length - 2);
							const patchPath = await join(settings.resource_path, patchFile);
							const fullPatchPath = await join(patchFolderPath, patchFile + ".p");
							switch(patchFunction) {
								case '.p':
									const check = await Command.create("bin/hpatch.exe", [patchPath, fullPatchPath, patchPath + "_new"], { encoding: "utf-8" }).execute();
									await remove(patchPath).catch(err => {console.error(err);});
									await rename(patchPath + "_new", patchPath).catch(err => {console.error(err);});
									patchedFiles.push(patchFile);
									console.log("Patched", patchFile);
									break;
								case '.m':
									downloadedFiles.push(patchFile);
									console.log("Will download", patchFile);
									break;
								case '.d':
									await remove(patchPath).catch(err => {console.error(err);});
									deletedFiles.push(patchFile);
									console.log("Removed", patchFile);
									break;
							}
						}
						if(patchedFiles.length > 0) await library.addFilesToSQL(patchedFiles);
						if(downloadedFiles.length > 0) {
							await library.downloadSpecificFiles(downloadedFiles);
							await library.addFilesToSQL(downloadedFiles);
						}
						if(deletedFiles.length > 0) await library.removeFilesFromSQL(deletedFiles);
						await library.removeEmptyFolders();
						game_folders = [];
						library.cleanTemporaryFiles(patchTimestamp);
						r(true);
					} else {
						console.error('Failed extracting archive:', err);
						library.cleanTemporaryFiles();
						r(false);
					}
				}).catch(err => {				
					console.error('Failed extracting archive:', err);
					library.cleanTemporaryFiles();
					r(false);
				});
			} else {
				console.error('Failed downloading archive:', stdout);
				library.cleanTemporaryFiles();
				r(false);
			}
		}).catch(err => {
			console.error('Failed downloading archive:', err);
			library.cleanTemporaryFiles();
			r(false);
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
	if(!localStorage.auth.length) return false;
	const settings = await library.getSettings();
	fetch(settings.dashboard_api_url + "login.php?auth=" + localStorage.auth).then(r => r.json()).then(response => {
		if(!response.success) {
			library.logout();
			return false;
		}
		return true;
	});
}

library.logout = function() {
	localStorage.username = '';
	localStorage.auth = '';
	localStorage.color = '';
	localStorage.accountID = 0;
}

library.timeConverter = function(timestamp, min = false) { // This is function from old launcher version, so it was written poor
	const a = new Date(timestamp * 1000);
	var months = '';
	if(!min) months = [strings.months.full.january, strings.months.full.february, strings.months.full.march, strings.months.full.april, strings.months.full.may, strings.months.full.june, strings.months.full.july, strings.months.full.august, strings.months.full.september, strings.months.full.october, strings.months.full.november, strings.months.full.december];
	else months = [strings.months.short.january, strings.months.short.february, strings.months.short.march, strings.months.short.april, strings.months.short.may, strings.months.short.june, strings.months.short.july, strings.months.short.august, strings.months.short.september, strings.months.short.october, strings.months.short.november, strings.months.short.december];
	const year = a.getFullYear();
	const month = months[a.getMonth()];
	const date = a.getDate();
	var time = '';
	if(!min) time = date + ' ' + month + ' ' + year;
	else {
		const b = new Date();
		if(a.getFullYear() == b.getFullYear()) time = date + ' ' + month;
		else time = date + ' ' + month + ' ' + year;
	}
	return time;
}

library.checkLauncherUpdates = function() {
	return new Promise(r => {
		library.getSettings().then(settings => {		
			fetch(settings.updates_api_url + "launcher").then(r => r.text()).then(async function(response) {
				const version = await getVersion();
				if(version != response) {
					open("updater.exe").then(r => {
						exit(0);
					});
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
		const appWindow = getCurrentWindow();
		document.dispatchEvent(themeChangeEvent);
		document.getElementById("launcher-contents").setAttribute("launcher-theme", theme);
		switch(theme) {
			case 'main':
				document.getElementById("launcher-background").style.display = "block";
				appWindow.clearEffects();
				appWindow.setShadow(false);
				break;
			case 'mica':
				let micaEffect = library.isWindows11() ? Effect.Mica : Effect.Acrylic;
				document.getElementById("launcher-background").style.display = "none";
				appWindow.setEffects({ effects: [ micaEffect ] });
				appWindow.setShadow(true);
				break;
		}
	});
}

library.changeAccentColorSetting = function(doUseAccentColor) {
	localStorage.use_accent_color = doUseAccentColor;
	document.getElementById("launcher-contents").setAttribute("accent-color", doUseAccentColor);
}

library.getNotifications = function() {
	return new Promise(async function(r) {
		if(!localStorage.auth.length) r({ notifies: [] });
		const settings = await library.getSettings();
		fetch(settings.dashboard_api_url + "notify.php?auth=" + localStorage.auth).then(res => res.json()).then(response => {
			if(!response.success) r({ notifies: [] });
			
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
	let windowsVersion = version().split('.');
	return Number(windowsVersion[2]) >= 22000;
}

let accentColorChange = listen('accentColorChange', (event) => {
	let rustColors = event.payload.split('|');
	let rgb = [Math.round(rustColors[0] * 255), Math.round(rustColors[1] * 255), Math.round(rustColors[2] * 255)].join(',');
	document.getElementById("accent-color").innerHTML = `
		:root {
			--system-accent-color: rgb(${rgb});
		}
	`;
});

library.styles = style;

library.initializeEvents();

library.getNotifications();

export default library;