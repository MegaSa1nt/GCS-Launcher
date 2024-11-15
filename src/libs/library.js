import { invoke } from '@tauri-apps/api/core';
import { appCacheDir, resolve, resourceDir } from '@tauri-apps/api/path';
import { remove } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-shell';
import style from './style.module.scss';
const library = [];
let playButtonStateChangeEvent = new Event("playButtonStateChange", {bubbles: true});


window.gameUpdatingAnimation = '';
window.playButtonIsAvailable = style.isAvailable;
window.playButtonState = 0;

window.updatePlayButtonState = () => {
	switch(true) {
		case isCheckingUpdate:
			window.gameUpdatingAnimation = '';
			window.playButtonIsAvailable = style.isAvailable;
			window.playButtonState = 1;
			break;
		case isUpdatingGame:
			window.gameUpdatingAnimation = style.show;
			window.playButtonIsAvailable = '';
			window.playButtonState = 1;
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

library.initializeEvents = function() {
	if(typeof window.isCheckingUpdate == 'undefined') window.isCheckingUpdate = false;
	if(typeof window.isUpdatingGame == 'undefined') window.isUpdatingGame = false;
	if(typeof window.isGameStarting == 'undefined') window.isGameStarting = false;
	if(typeof window.isGameRunning == 'undefined') window.isGameRunning = false;
}

library.initializeVariables = function() {
	if(typeof localStorage.update_time == 'undefined') localStorage.update_time = 0;
}

library.getSettings = function() {
	library.initializeVariables();
	return {
		updates_api_url: "https://updates.gcs.icu/",
		gdps_name: "GreenCatsServer",
		
		update_time: localStorage.update_time
	}
}

library.checkUpdates = async function() {
	if(window.isCheckingUpdate) return;
	await library.changeIsCheckingUpdateState(true);
	const settings = library.getSettings();
	if(settings.update_time == 0) {
		console.log('You should install game ;)');
		await library.changeIsCheckingUpdateState(false);
	} else {
		fetch(settings.updates_api_url + "updates/" + settings.update_time).then(res => res.json()).then(response => {
			if(response.length == 0) {
				console.log("No updates available. Latest version!");
				library.changeIsCheckingUpdateState(false);
				return true;
			}
		}).catch(err => {
			console.error('Failed checking updates:', err);
			library.changeIsCheckingUpdateState(false);
		});
	}
}

library.installGame = async function() {
	if(window.isUpdatingGame) return;
	library.changeUpdatingGameState(true);
	const settings = library.getSettings();
	const configPath = await resolve(await appCacheDir() + "/temp.7z");
	const resourcePath = "C:\\Users\\megas\\OneDrive\\Рабочий стол\\UNPACKING TEST";
	//const resourcePath = await resourceDir();
	console.log('Starting downloading game...');
	return;
	invoke('download_archive', { url: settings.updates_api_url + "download/0", tempPath: configPath}).then(stdout => {
		if(stdout === null) {
			console.log('Unpacking game...');
			invoke("unpack_archive", { archivePath: configPath, extractPath: resourcePath}).then(stdout => {
				if(stdout === null) {
					console.log('Game successfully updated!');
					library.changeUpdatingGameState(false);
					library.cleanTemporaryFiles();
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

library.cleanTemporaryFiles = async function() {
	if(window.isUpdatingGame) return;
	const settings = library.getSettings();
	const configPath = await resolve(await appCacheDir() + "/temp.7z");
	await remove(configPath).catch(err => {console.error(err);});
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

library.openOrInstallGame = async function() {
	await open("GreenCatsServer.exe").then(res => {
		console.log(res);
	}).catch(err => {
		console.log("No game LOL:", err);
		library.installGame();
	})
}

library.styles = style;

library.initializeEvents();

export default library;