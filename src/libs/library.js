import { invoke } from '@tauri-apps/api/core';
import { appCacheDir, resolve, resourceDir, join, sep } from '@tauri-apps/api/path';
import { remove, readDir, BaseDirectory, rename } from '@tauri-apps/plugin-fs';
import { open, Command } from '@tauri-apps/plugin-shell';
import Database from '@tauri-apps/plugin-sql';
import { sendNotification } from '@tauri-apps/plugin-notification';
import style from './style.module.scss';
const library = [];
let playButtonStateChangeEvent = new Event("playButtonStateChange", {bubbles: true});
import languageStrings from './languages.js';
let strings = languageStrings[localStorage.language];

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
	
	// Rare type of events
	if(typeof window.isLoggingIn == 'undefined') window.isLoggingIn = false;
	
	// Not really events
	if(typeof window.new_updates == 'undefined') window.new_updates = [];
	if(typeof window.recursive_check == 'undefined') window.recursive_check = [];
	if(typeof window.game_folders == 'undefined') window.game_folders = [];
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
	if(typeof localStorage.enable_notifications == 'undefined') localStorage.enable_notifications = true;
	if(typeof localStorage.username == 'undefined') localStorage.username = '';
	if(typeof localStorage.accountID == 'undefined') localStorage.accountID = 0;
	if(typeof localStorage.auth == 'undefined') localStorage.auth = '';
	if(typeof localStorage.color == 'undefined') localStorage.color = '';
	if(typeof localStorage.language == 'undefined') localStorage.language = 'en';
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

library.checkUpdates = async function() {
	if(window.isCheckingUpdate) return;
	await library.changeIsCheckingUpdateState(true);
	const settings = await library.getSettings();
	if(settings.update_time == 0) {
		console.log('You should install game ;)');
		await library.changeIsCheckingUpdateState(false);
		await library.changePendingUpdateState(true);
	} else {
		fetch(settings.updates_api_url + "updates/" + settings.update_time).then(res => res.json()).then(response => {
			if(response.length == 0) {
				console.log("No updates available. Latest version!");
				library.changeIsCheckingUpdateState(false);
				library.changePendingUpdateState(false);
				return true;
			} else {
				library.sendNotification(strings.notifications.foundUpdate.title, strings.notifications.foundUpdate.description);
				console.log("Updates were found!");
				window.new_updates = response;
				library.changeIsCheckingUpdateState(false);
				library.changePendingUpdateState(true);
			}
		}).catch(err => {
			console.error('Failed checking updates:', err);
			library.changeIsCheckingUpdateState(false);
			library.changePendingUpdateState(false);
		});
	}
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

library.styles = style;

library.initializeEvents();

export default library;