import { invoke } from '@tauri-apps/api/core';
import { appCacheDir, resolve, resourceDir, join, sep } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import { getCurrentWindow, Effect } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { remove, readDir, BaseDirectory, rename } from '@tauri-apps/plugin-fs';
import { Command } from '@tauri-apps/plugin-shell';
import Database from '@tauri-apps/plugin-sql';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { exit } from '@tauri-apps/plugin-process';
import { openPath } from '@tauri-apps/plugin-opener';
import { version } from '@tauri-apps/plugin-os';
import { toast } from '@zerodevx/svelte-toast';
import style from './style.module.scss';
import { printf } from 'fast-printf';
import { create as download } from 'tauri-plugin-download';

const library = [];

let playButtonStateChangeEvent = new Event("playButtonStateChange", {bubbles: true});
let themeChangeEvent = new Event("themeChange", {bubbles: true});
let accountChangeEvent = new Event("accountChange", {bubbles: true});
let progressChangeEvent = new Event("progressChange", {bubbles: true});

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
	if(typeof window.profile_data == 'undefined') window.profile_data = false;
	if(typeof window.progress_value == 'undefined') window.progress_value = 0;
	if(typeof window.progress_max == 'undefined') window.progress_max = 0;
	if(typeof window.progress_value_text == 'undefined') window.progress_value_text = '';
	if(typeof window.progress_max_text == 'undefined') window.progress_max_text = '';
	if(typeof window.progress_title_text == 'undefined') window.progress_title_text = '';
	if(typeof window.progress_speed_text == 'undefined') window.progress_speed_text = '';
	if(typeof window.pending_apk == 'undefined') window.pending_apk = '';
	
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
},	1500);

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
	if(typeof localStorage.main_icon == 'undefined') localStorage.main_icon = 'https://gdicon.oat.zone/icon.png?type=cube&value=1&color1=0&color2=3';
	if(typeof localStorage.clan_name == 'undefined') localStorage.clan_name = '';
	if(typeof localStorage.clan_color == 'undefined') localStorage.clan_color = '';
	if(typeof localStorage.update_type == 'undefined') localStorage.update_type = 'pc';
	if(typeof localStorage.notifications_check_time == 'undefined') localStorage.notifications_check_time = 0;
}

library.getSettings = function() {
	library.initializeVariables();
	return new Promise(async function(r) {
		const resourcePath = await resourceDir();
		r({
			updates_api_url: "https://updates.example.com/",
			dashboard_api_url: "https://example.com/dashboard/api/",
			gdps_name: "GDPS",
			game_exe: "GDPS.exe",
			
			update_time: localStorage.update_time,
			update_type: localStorage.update_type,
			resource_path: resourcePath
		});
	});
}
library.checkUpdates = function() {
	return new Promise(async function(r) {
		if(window.isCheckingUpdate) return r(false);
		
		await library.changeIsCheckingUpdateState(true);
		
		const settings = await library.getSettings();
		
		if(settings.update_time == 0) {
			console.log('You should install game ;)');
			
			await library.changeIsCheckingUpdateState(false);
			await library.changePendingUpdateState(true);
			
			r(false);
		} else {
			fetch(`${settings.updates_api_url}updates/${settings.update_type}/${settings.update_time}`).then(res => res.json()).then(async(response) => {
				if(response && response.updates && response.updates.length > 0) {
					library.sendNotification(strings.notifications.foundUpdate.title, strings.notifications.foundUpdate.description);
					console.log("Updates were found!");
					
					window.new_updates = response.updates;
					
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
	if(window.isUpdatingGame) return;
	
	library.changeUpdatingGameState(true);
	library.changePendingUpdateState(false);
	
	const settings = await library.getSettings();
	const lastUpdateTimestamp = await library.getLatestUpdateTimestamp();
	
	const tempArchivePath = await resolve(await appCacheDir() + `/${settings.update_type}.zip`);
	
	library.downloadFile(`${settings.updates_api_url}download/${settings.update_type}/0`, tempArchivePath, (progress) => {
		library.changeProgressState(progress.current, progress.total, strings.progress.downloadingGame, printf(strings.progress.megabytes, Math.round(progress.current / 104857.6) / 10), printf(strings.progress.megabytes, Math.round(progress.total / 104857.6) / 10), progress.percent + '%');
	}).then(async (r) => {
		await library.unzipArchive(tempArchivePath, settings.resource_path, "Game");
		await library.addFolderToSQL(settings.resource_path, true);
		
		library.changeProgressState(0, 0, '', '', '', '');
		
		if(localStorage.update_time == 0) library.sendNotification(strings.notifications.gameInstalled.title, strings.notifications.gameInstalled.description);
		else library.sendNotification(strings.notifications.gameUpdated.title, strings.notifications.gameUpdated.description);
		
		console.log('Game was successfully installed!');
		localStorage.update_time = lastUpdateTimestamp;
		
		library.changeUpdatingGameState(false);
		library.cleanTemporaryFiles();
	}).catch(err => {
		console.error('Failed downloading game:', err);
		
		library.changeProgressState(0, 0, '', '', '', '');
		library.changeUpdatingGameState(false);
		
		library.cleanTemporaryFiles();
	});
}

library.cleanTemporaryFiles = async function(patchTimestamp = 0) {
	const settings = await library.getSettings();
	const configPath = await appCacheDir();
	
	await remove(configPath + `/${settings.update_type}.zip`).catch(err => console.log("Temporary game archive was not found. Nothing to delete!"));
	
	if(patchTimestamp != 0) {
		await remove(configPath + "/patch_" + patchTimestamp + ".zip").catch(err => console.log("Temporary patch archive was not found."));
		await remove(configPath + "/patch_" + patchTimestamp).catch(err => console.log("Temporary patch folder was not found."));
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
	
	await openPath(await join(settings.resource_path, settings.game_exe)).then(res => {
		library.changeIsGameStartingState(false);
		library.changeIsGameRunningState(true);
		
		setTimeout(() => {const gameCheckInterval = setInterval(() => library.checkProcess(settings.game_exe), 1500)}, 2000);
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
	
	library.changeProgressState(0, 0, '', '', '', '');
	
	const lastUpdateTimestamp = new_updates[new_updates.length - 1];
	
	library.sendNotification(strings.notifications.gameUpdated.title, strings.notifications.gameUpdated.description);
	
	console.log('Game successfully updated!');
	
	library.changeUpdatingGameState(false);
	library.cleanTemporaryFiles();
	
	localStorage.update_time = lastUpdateTimestamp;
}

library.patchGame = async function(patchTimestamp) {
	return new Promise(async (r) => {
		const settings = await library.getSettings();
		
		const patchArchivePath = await resolve(await appCacheDir() + "/patch_" + patchTimestamp + ".zip");
		const patchFolderPath = await resolve(await appCacheDir() + "/patch_" + patchTimestamp);
		
		console.log(`Downloading patch ${patchTimestamp}...`);
		library.downloadFile(`${settings.updates_api_url}download/${settings.update_type}/${patchTimestamp}`, patchArchivePath, (progress) => {
			library.changeProgressState(progress.current, progress.total, strings.progress.downloadingPatch, printf(strings.progress.megabytes, Math.round(progress.current / 104857.6) / 10), printf(strings.progress.megabytes, Math.round(progress.total / 104857.6) / 10), progress.percent + '%');
		}).then(async (res) => {
			library.changeUpdatingGameState(true);
			library.changeIsCheckingUpdateState(false);
			
			console.log(`Unzipping patch ${patchTimestamp}...`);
			await library.unzipArchive(patchArchivePath, patchFolderPath, 'Patch');
			
			console.log(`Patching ${patchTimestamp}...`);
			
			const patchFiles = await library.recursiveReadDir(patchFolderPath, patchFolderPath);
			
			const patchedFiles = [];
			const downloadedFiles = [];
			const deletedFiles = [];
			
			recursive_check = [];
			var i = 0;
			
			var getPluralCurrent = await library.getPluralType(0);
			var getPluralTotal = await library.getPluralType(patchFiles.length);
			
			var percent = 0;
			
			library.changeProgressState(0, patchFiles.length, strings.progress.patchingGame, printf(strings.progress['files-' + getPluralCurrent], 0), printf(strings.progress['files-' + getPluralTotal], patchFiles.length), percent + '%');
			
			for(i = 0; i < patchFiles.length; i++) {
				const patchFunction = patchFiles[i].slice(-2);
				const patchFile = patchFiles[i].slice(0, patchFiles[i].length - 2);
				
				const patchPath = await join(settings.resource_path, patchFile);
				const fullPatchPath = await join(patchFolderPath, patchFile + patchFunction);
				
				switch(patchFunction) {
					case '.p':
						const check = await Command.create("bin/hpatch.exe", [patchPath, fullPatchPath, patchPath + "_new"], { encoding: "utf-8" }).execute();
						
						await remove(patchPath).catch(err => {console.error(err);});
						await rename(patchPath + "_new", patchPath).catch(err => console.error("Failed renaming:", err));
						
						patchedFiles.push(patchFile);
						console.log("Patched", patchFile);
						break;
					case '.m':
						await rename(fullPatchPath, patchPath).catch(err => console.error("Failed moving:", err));
						
						downloadedFiles.push(patchFile);
						console.log("Moved", patchFile);
						break;
					case '.d':
						await remove(patchPath).catch(err => {console.error("Failed removing:", err);});
						
						deletedFiles.push(patchFile);
						console.log("Removed", patchFile);
						break;
				}
				
				getPluralCurrent = await library.getPluralType(i);
				getPluralTotal = await library.getPluralType(patchFiles.length);
				
				percent = await (Math.round((i / patchFiles.length) * 1000) / 10);
				
				library.changeProgressState(i, patchFiles.length, strings.progress.patchingGame, printf(strings.progress['files-' + getPluralCurrent], i), printf(strings.progress['files-' + getPluralTotal], patchFiles.length), percent + '%');
			}
			
			if(patchedFiles.length > 0) await library.addFilesToSQL(patchedFiles);
			if(downloadedFiles.length > 0) await library.addFilesToSQL(downloadedFiles);
			if(deletedFiles.length > 0) await library.removeFilesFromSQL(deletedFiles);
			await library.removeEmptyFolders();
			game_folders = [];
			
			library.cleanTemporaryFiles(patchTimestamp);
			
			r(true);
		}).catch(err => {
			console.error(`Failed downloading patch ${patchTimestamp}:`, err);
			
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

library.addFolderToSQL = async function(folder, showProgressBar = false) {
	const allFiles = await library.recursiveReadDir(folder, folder);
	
	await library.addFilesToSQL(allFiles, showProgressBar);
	await library.addGameFoldersToSQL(game_folders, showProgressBar);
	
	recursive_check = game_folders = [];
}

library.addFilesToSQL = async function(allFiles, showProgressBar = false) {
	const settings = await library.getSettings();
	
	if(showProgressBar) {
		var percent = 0;
		var getPluralCurrent = await library.getPluralType(0);
		var getPluralTotal = await library.getPluralType(allFiles.length);
			
		library.changeProgressState(0, allFiles.length, strings.progress.savingFiles, printf(strings.progress['files-' + getPluralCurrent], 0), printf(strings.progress['files-' + getPluralTotal], allFiles.length), percent + '%');
	}
	
	var i = 0;
	for(i = 0; i < allFiles.length; i++) {
		await db.execute("INSERT INTO files (file, md5) VALUES($1, '') ON CONFLICT(file) DO UPDATE SET md5 = ''", [allFiles[i]]);
		
		if(showProgressBar) {
			percent = await (Math.round((i / allFiles.length) * 1000) / 10);
			getPluralCurrent = await library.getPluralType(i);
			getPluralTotal = await library.getPluralType(allFiles.length);
				
			library.changeProgressState(i, allFiles.length, strings.progress.savingFiles, printf(strings.progress['files-' + getPluralCurrent], i), printf(strings.progress['files-' + getPluralTotal], allFiles.length), percent + '%');
		}
	}
	
	library.changeProgressState(0, 0, '', '', '', '');
}

library.addGameFoldersToSQL = async function(allFolders, showProgressBar = false) {
	const settings = await library.getSettings();
	
	if(showProgressBar) {
		var percent = 0;
		var getPluralCurrent = await library.getPluralType(0);
		var getPluralTotal = await library.getPluralType(allFolders.length);
			
		library.changeProgressState(0, allFolders.length, strings.progress.savingFiles, printf(strings.progress['files-' + getPluralCurrent], 0), printf(strings.progress['files-' + getPluralTotal], allFolders.length), percent + '%');
	}
	
	var i = 0;
	for(i = 0; i < allFolders.length; i++) {
		await db.execute("INSERT INTO folders (folder) VALUES($1) ON CONFLICT(folder) DO UPDATE SET folder = $1", [allFolders[i]]);
		
		if(showProgressBar) {
			percent = await (Math.round((i / allFolders.length) * 1000) / 10);
			getPluralCurrent = await library.getPluralType(i);
			getPluralTotal = await library.getPluralType(allFolders.length);
				
			library.changeProgressState(i, allFolders.length, strings.progress.savingFolders, printf(strings.progress['files-' + getPluralCurrent], i), printf(strings.progress['files-' + getPluralTotal], allFolders.length), percent + '%');
		}
	}
	
	library.changeProgressState(0, 0, '', '', '', '');
}

library.removeFilesFromSQL = async function(allFiles) {
	const deletedFilesString = "'" + allFiles.join("','") + "'";
	await db.execute("DELETE FROM files WHERE file IN (" + deletedFilesString + ")");
}

library.uninstallGame = async function() {
	if(window.isUpdatingGame) return;
	
	const settings = await library.getSettings();
	library.changeUpdatingGameState(true);
	
	console.log('Deleting game...');
	
	const gameFiles = await db.select("SELECT file FROM files");
	
	var percent = 0;
	var getPluralCurrent = await library.getPluralType(0);
	var getPluralTotal = await library.getPluralType(gameFiles.length);
				
	library.changeProgressState(0, gameFiles.length, strings.progress.deletingGame, printf(strings.progress['files-' + getPluralCurrent], 0), printf(strings.progress['files-' + getPluralTotal], gameFiles.length), percent + '%');
	
	var i = 0;
	for(i = 0; i < gameFiles.length; i++) {
		const gameFile = gameFiles[i].file;
		
		await remove(await join(settings.resource_path, gameFile)).catch(err => console.error("File " + gameFile + " was not found."));
		
		percent = await (Math.round((i / gameFiles.length) * 1000) / 10);
		getPluralCurrent = await library.getPluralType(i);
		getPluralTotal = await library.getPluralType(gameFiles.length);
				
		library.changeProgressState(i, gameFiles.length, strings.progress.deletingGame, printf(strings.progress['files-' + getPluralCurrent], i), printf(strings.progress['files-' + getPluralTotal], gameFiles.length), percent + '%');
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
	
	library.changeProgressState(0, 0, '', '', '', '');
	
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

library.getLatestUpdateTimestamp = async function(extraType = '') {
	const settings = await library.getSettings();
	return new Promise(r => {
		fetch(`${settings.updates_api_url}version/${settings.update_type}${extraType}`).then(res => res.json()).then(response => {
			r(response.timestamp);
		}).catch(err => {
			console.error('Failed getting update time:', err);
			r(0);
		});
	});
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
	openPath(settings.resource_path);
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
	localStorage.main_icon = 'https://gdicon.oat.zone/icon.png?type=cube&value=1&color1=0&color2=3';
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
			fetch(`${settings.updates_api_url}version/${settings.update_type}-launcher`).then(r => r.text()).then(async function(response) {
				const version = await getVersion();
				if(version != response) {
					openPath("updater.exe").then(r => {
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
			if(!response.success || !response.notifies) return r({ notifies: [] });
			
			hasNewNotifications = response.notifies.some(notification => !notification.checked && notification.time > localStorage.notifications_check_time);
			
			let notificationChangeEvent = new CustomEvent("notificationChange", { detail: response });
			document.dispatchEvent(notificationChangeEvent);
			
			if(hasNewNotifications) {
				if(response.counts.new == 1) {
					let unreadNotification = response.notifies.filter((notification) => !notification.checked && notification.time > localStorage.notifications_check_time)[0].action;
					let notificationTitle = library.getNotificationTitle(unreadNotification);
					library.sendNotification(notificationTitle.title, notificationTitle.description);
				} else {
					let getPlural = library.getPluralType(response.counts.new);
					library.sendNotification(printf(strings.notifications.several['title-' + getPlural], response.counts.new), printf(strings.notifications.several['description-' + getPlural], response.counts.new));
				}
				
				localStorage.notifications_check_time = Math.round(Date.now() / 1000);
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
	if(number == 0) return 3;
	
	if((lastCharacter > 1 && lastCharacter < 5) && (number < 10 || number > 20)) return 2;
	
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

library.changeProgressState = function(value, max, titleText, valueText, maxText, speedText) {
	const percent = (max > 0) ? Math.round((value / max) * 1000) / 10 : 0;
	
	const appWindow = getCurrentWindow();
	appWindow.setProgressBar({progress: Math.round(percent)});
	
	window.progress_value = value;
	window.progress_max = max;
	window.progress_title_text = titleText;
	window.progress_value_text = valueText;
	window.progress_max_text = maxText;
	window.progress_speed_text = speedText;
	
	document.dispatchEvent(progressChangeEvent);
}

library.unzipArchive = async function(archivePath, targetPath, notificationName = 'Game') {
	return new Promise(async(r) => {
		const settings = await library.getSettings();
		
		let getPluralCurrent = await library.getPluralType(0);
		
		library.changeProgressState(0, 1, strings.progress[`extracting${notificationName}`], printf(strings.progress['files-' + getPluralCurrent], 0), '...', '0%');
		
		let fileExtractEvent = listen('fileExtract', async (event) => {
			const filesCount = event.payload.split('|');
			
			getPluralCurrent = await library.getPluralType(filesCount[0]);
			const getPluralTotal = await library.getPluralType(filesCount[1]);
			
			const percent = await (Math.round((filesCount[0] / filesCount[1]) * 1000) / 10);
			
			library.changeProgressState(filesCount[0], filesCount[1], strings.progress[`extracting${notificationName}`], printf(strings.progress['files-' + getPluralCurrent], filesCount[0]), printf(strings.progress['files-' + getPluralTotal], filesCount[1]), percent + '%');
		});
		
		invoke('extract_archive', { archivePath: archivePath, outputPath: targetPath + await sep()}).then(e => {
			library.changeProgressState(0, 0, '', '', '', '');
			
			r(true);
		});		
	});
}

library.calculatePercentNumber = async function(percent, totalNumber) {
	return (percent / 100) * totalNumber;
}

library.downloadFile = async function(url, savePath, callback) {
	return new Promise(async (r) => {
		const fileSize = await library.getURLSize(url);
		
		const fileToken = "file-" + Math.random() + "-" + Math.random();
		const file = await download(fileToken, url, savePath);
		file.listen(async (updatedDownload) => {
			if(updatedDownload.state.toLowerCase() == 'completed') return r(true);

			const percent = updatedDownload.progress;
			
			callback({
				current: await library.calculatePercentNumber(percent, fileSize),
				total: fileSize,
				percent: (Math.round(percent * 10) / 10)
			});
		});
	   
		file.start();
	});
}

library.getURLSize = async function(url) {
	return await fetch(url, {
		method: 'OPTIONS'
	}).then(res => res.text());
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
		case 6:
			library.changePendingGeodeUpdateState(isTrue);
			break;
	}
}

library.styles = style;

library.initializeEvents();

library.initializeVariables();
import languageStrings from './languages.js';
let strings = languageStrings[localStorage.language];

library.getNotifications();

window.library = library;

export default library;