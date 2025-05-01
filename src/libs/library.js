import { invoke } from '@tauri-apps/api/core';
import { appCacheDir, resolve, downloadDir, join, sep, cacheDir } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import { listen } from '@tauri-apps/api/event';
import { remove, readDir, readFile, writeFile, create, BaseDirectory, rename, mkdir } from '@tauri-apps/plugin-fs';
import { open, Command } from '@tauri-apps/plugin-shell';
import { sendNotification, createChannel, removeChannel, requestPermission } from '@tauri-apps/plugin-notification';
import { exit } from '@tauri-apps/plugin-process';
import { version } from '@tauri-apps/plugin-os';
import { toast } from '@zerodevx/svelte-toast';
import style from './style.module.scss';
import { printf } from 'fast-printf';
import fetchProgress from 'fetch-progress';
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
		case isPendingAPKInstallation:
		case isPendingGeodeUpdate:
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
	if(typeof window.isPendingGeodeUpdate == 'undefined') window.isPendingGeodeUpdate = false;
	
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
}

library.initializeVariables = function() {
	if(typeof localStorage.update_time == 'undefined') localStorage.update_time = 0;
	if(typeof localStorage.geode_update_time == 'undefined') localStorage.geode_update_time = 0;
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
	if(typeof localStorage.update_type == 'undefined') localStorage.update_type = 'android';
	if(typeof localStorage.notifications_check_time == 'undefined') localStorage.notifications_check_time = 0;
}

library.getSettings = function() {
	library.initializeVariables();
	return new Promise(async function(r) {
		const resourcePath = await downloadDir();
		const geodePath = resourcePath.replace("Android" + await sep() + "data", "Android" + await sep() + "media").replace("files" + await sep() + "Download", "");
		r({
			updates_api_url: "http://ts.gcs.icu:8083/",
			dashboard_api_url: "https://api.gcs.icu/",
			gdps_name: "GreenCatsServer",
			game_package: "com.sa1ntsh.greencatssrv",
			
			update_time: localStorage.update_time,
			geode_update_time: localStorage.geode_update_time,
			update_type: localStorage.update_type,
			resource_path: resourcePath,
			geode_path: geodePath
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
				if(response && response.updates) {
					library.sendNotification(strings.notifications.foundUpdate.title, strings.notifications.foundUpdate.description);
					console.log("Updates were found!");
					
					library.changeIsCheckingUpdateState(false);
					library.changePendingUpdateState(true);
					
					await library.checkGeodeUpdates();
					
					r(false);
				} else {
					console.log("No updates available. Latest version!");
					
					library.changeIsCheckingUpdateState(false);
					library.changePendingUpdateState(false);
					
					await library.checkGeodeUpdates();
					
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

library.checkGeodeUpdates = function() {
	return new Promise(async function(r) {
		await library.changeIsCheckingUpdateState(true);
		
		const settings = await library.getSettings();
		
		if(settings.geode_update_time == 0) {
			const lastUpdateTimestamp = await library.getLatestUpdateTimestamp('-geode');
			
			if(lastUpdateTimestamp > 0) {
				console.log('You should install Geode ;)');
				
				await library.changeIsCheckingUpdateState(false);
				await library.changePendingGeodeUpdateState(true);
				
				r(false);
			}
		} else {
			fetch(`${settings.updates_api_url}updates/${settings.update_type}-geode/${settings.geode_update_time}`).then(res => res.json()).then(response => {
				if(response && response.updates.length) {
					library.sendNotification(strings.notifications.foundGeodeUpdate.title, strings.notifications.foundGeodeUpdate.description);
					console.log("Geode updates were found!");
					
					library.changeIsCheckingUpdateState(false);
					library.changePendingGeodeUpdateState(true);
					
					r(false);
				} else {
					console.log("No Geode updates available. Latest version!");
					
					library.changeIsCheckingUpdateState(false);
					library.changePendingGeodeUpdateState(false);
					
					r(true);
				}
			}).catch(err => {
				console.error('Failed checking Geode updates:', err);
				
				library.changeIsCheckingUpdateState(false);
				library.changePendingGeodeUpdateState(false);
				
				r(false);
			});
		}
	});
}

library.installGame = async function(apkName = '') {
	return new Promise(async function(r) {
		const settings = await library.getSettings();
		const lastUpdateTimestamp = await library.getLatestUpdateTimestamp();
		
		if(!apkName.length) apkName = pending_apk;
		else pending_apk = apkName;
		
		library.changeUpdatingGameState(false);
		library.changeIsCheckingUpdateState(true);
		
		library.changeProgressState(3, 4, strings.progress.installing, strings.progress.installingFirstPart, strings.progress.installingSecondPart, '');
		console.log('Installing game...');
		
		invoke("plugin:gcs|install", { payload: { value: await join(settings.resource_path, "/" + apkName) } }).then(async(res) => {
			if(res.value == "Success") {
				if(apkName != "android.apk") return r(true);
					
				library.changeProgressState(0, 0, '', '', '', '');
				library.changePendingAPKInstallationState(false);
				library.changeIsCheckingUpdateState(false);
				library.cleanTemporaryFiles();
				
				if(localStorage.update_time == 0) library.sendNotification(strings.notifications.gameInstalled.title, strings.notifications.gameInstalled.description);
				else library.sendNotification(strings.notifications.gameUpdated.title, strings.notifications.gameUpdated.description);
				localStorage.update_time = lastUpdateTimestamp;
				
				if(settings.geode_update_time == 0 || isPendingGeodeUpdate) library.installGeode();
				
				r(true);
			} else {
				library.changeProgressState(0, 4, strings.progress.installing, strings.progress.installingPressInstallFirstPart, strings.progress.installingPressInstallSecondPart, '');
				library.changeIsCheckingUpdateState(false);
				library.changePendingUpdateState(false);
				library.changePendingAPKInstallationState(true);
			}
		}).catch(err => {
			console.error('Failed installing APK file:', err); // No one had any issues with installing, but saving, that person installed update
			
			library.changeProgressState(0, 0, '', '', '', '');
			library.changeUpdatingGameState(false);
			library.changePendingAPKInstallationState(false);
			library.changeIsCheckingUpdateState(false);
			library.cleanTemporaryFiles();
			
			if(localStorage.update_time == 0) library.sendNotification(strings.notifications.gameInstalled.title, strings.notifications.gameInstalled.description);
			else library.sendNotification(strings.notifications.gameUpdated.title, strings.notifications.gameUpdated.description);
			localStorage.update_time = lastUpdateTimestamp;
			
			if(settings.geode_update_time == 0 || isPendingGeodeUpdate) library.installGeode();
			
			r(false);
		});
	});
}

library.cleanTemporaryFiles = async function(patchTimestamp = 0) {
	const settings = await library.getSettings();
	
	const apkPath = await join(settings.resource_path, "/android.apk")
	await remove(apkPath).catch(err => console.log("Game APK was not found. Nothing to delete!"));
	
	const geodePath = await join(settings.resource_path, "/geode.zip")
	await remove(geodePath).catch(err => console.log("Geode ZIP was not found. Nothing to delete!"));
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

library.changePendingGeodeUpdateState = async function(state) {
	window.isPendingGeodeUpdate = state;
	await window.updatePlayButtonState();
	document.dispatchEvent(playButtonStateChangeEvent);
}

library.openOrInstallGame = async function() {
	if(isGameRunning || isCheckingUpdate || isUpdatingGame) return;
	
	if(isPendingAPKInstallation) return library.installGame();
	if(isPendingUpdate) return library.updateGame();
	if(isPendingGeodeUpdate) return library.installGeode();
	
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
	
	library.downloadFile(`${settings.updates_api_url}download/${settings.update_type}/${settings.update_time}`, await join(settings.resource_path, "/android.apk"), (progress) => {
		library.changeProgressState(progress.current, progress.total, strings.progress.downloadingGame, printf(strings.progress.megabytes, Math.round(progress.current / 104857.6) / 10), printf(strings.progress.megabytes, Math.round(progress.total / 104857.6) / 10), progress.percent + '%');
	}).then(async (r) => {
		library.changeUpdatingGameState(false);
		library.changeIsCheckingUpdateState(true);
		library.changeProgressState(3, 4, strings.progress.installing, strings.progress.installingFirstPart, strings.progress.installingSecondPart, '');
		
		console.log('Downloading completed!');
		
		await library.installGame("android.apk");
		library.changeIsCheckingUpdateState(false);
		library.changePendingUpdateState(false);
	}).catch(err => {
		console.error('Failed downloading APK file:', err);
		library.changeProgressState(0, 0, '', '', '', '');
		library.changeUpdatingGameState(false);
		library.changePendingUpdateState(true);
		library.cleanTemporaryFiles();
	});
}

library.installGeode = async function() {
	library.changeUpdatingGameState(true);
	library.changePendingGeodeUpdateState(false);
	
	const settings = await library.getSettings();
	
	console.log('Starting downloading Geode...');
	
	const lastUpdateTimestamp = await library.getLatestUpdateTimestamp('-geode');
	
	library.downloadFile(`${settings.updates_api_url}download/${settings.update_type}-geode/0`, await join(settings.resource_path, "/geode.zip"), (progress) => {
		library.changeProgressState(progress.current, progress.total, strings.progress.downloadingGeode, printf(strings.progress.megabytes, Math.round(progress.current / 104857.6) / 10), printf(strings.progress.megabytes, Math.round(progress.total / 104857.6) / 10), progress.percent + '%');
	}).then(async (r) => {
		library.changeUpdatingGameState(true);
		library.changeIsCheckingUpdateState(false);
		
		await library.unzipArchive(await join(settings.resource_path, "/geode.zip"), settings.geode_path);
		
		if(localStorage.geode_update_time == 0) library.sendNotification(strings.notifications.geodeInstalled.title, strings.notifications.geodeInstalled.description);
		else library.sendNotification(strings.notifications.geodeUpdated.title, strings.notifications.geodeUpdated.description);
		
		console.log('Geode was successfully installed!');
		localStorage.geode_update_time = lastUpdateTimestamp;
		
		library.changeUpdatingGameState(false);
		library.changePendingGeodeUpdateState(false);
		library.cleanTemporaryFiles();
	}).catch(err => {
		console.error('Failed downloading Geode:', err);
		
		library.changeProgressState(0, 0, '', '', '', '');
		library.changeUpdatingGameState(false);
		library.changePendingGeodeUpdateState(true);
		
		library.cleanTemporaryFiles();
	});
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
	sendNotification({channelId: "launcher-notifications", title: title.toString(), body: body.toString()});
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
			fetch(`${settings.updates_api_url}version/${settings.update_type}-launcher`).then(r => r.text()).then(async function(response) {
				const version = await getVersion();
				if(version != response) {
					r(false);
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

library.unzipArchive = async function(archivePath, targetPath) {
	return new Promise(async(r) => {
		const settings = await library.getSettings();
		
		let getPluralCurrent = await library.getPluralType(0);
		
		library.changeProgressState(0, 1, strings.progress.extractingGeode, printf(strings.progress['files-' + getPluralCurrent], 0), '...', '0%');

		await mkdir(await join(settings.geode_path, 'game', 'geode', 'mods'), { recursive: true });
		await mkdir(await join(settings.geode_path, 'save', 'geode', 'mods'), { recursive: true });
		
		let fileExtractEvent = listen('fileExtract', async (event) => {
			const filesCount = event.payload.split('|');
			
			getPluralCurrent = await library.getPluralType(filesCount[0]);
			const getPluralTotal = await library.getPluralType(filesCount[1]);
			
			const percent = await (Math.round((filesCount[0] / filesCount[1]) * 1000) / 10);
			
			library.changeProgressState(filesCount[0], filesCount[1], strings.progress.extractingGeode, printf(strings.progress['files-' + getPluralCurrent], filesCount[0]), printf(strings.progress['files-' + getPluralTotal], filesCount[1]), percent + '%');
		});
		
		invoke('extract_archive', { archivePath: archivePath, outputPath: targetPath}).then(e => {
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
			const percent = updatedDownload.progress;
			
			callback({
				current: await library.calculatePercentNumber(percent, fileSize),
				total: fileSize,
				percent: (Math.round(percent * 10) / 10)
			});
			
			if(updatedDownload.state == 'COMPLETED') r(true);
		});
	   
		file.start();
	});
}

library.getURLSize = async function(url) {
	return await fetch(url, {
		method: 'OPTIONS'
	}).then(res => res.text());
}

library.updateLauncher = async function() {
	library.changeUpdatingGameState(true);
	library.changePendingUpdateState(false);
	
	const settings = await library.getSettings();
	console.log('Starting downloading launcher...');
	
	library.downloadFile(`${settings.updates_api_url}download/${settings.update_type}-launcher/${settings.update_time}`, await join(settings.resource_path, "/launcher.apk"), (progress) => {
		library.changeProgressState(progress.current, progress.total, strings.progress.downloadingLauncher, printf(strings.progress.megabytes, Math.round(progress.current / 104857.6) / 10), printf(strings.progress.megabytes, Math.round(progress.total / 104857.6) / 10), progress.percent + '%');
	}).then(async (r) => {
		library.changeUpdatingGameState(false);
		library.changeIsCheckingUpdateState(true);
		library.changeProgressState(3, 4, strings.progress.installing, strings.progress.installingFirstPart, strings.progress.installingSecondPart, '');
		
		console.log('Installing launcher...');
		
		await library.installGame("launcher.apk");
		library.changeIsCheckingUpdateState(false);
		library.changePendingUpdateState(false);
	}).catch(err => {
		console.error('Failed downloading APK file:', err);
		library.changeProgressState(0, 0, '', '', '', '');
		
		library.changeUpdatingGameState(false);
		library.changePendingUpdateState(true);
		
		library.cleanTemporaryFiles();
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

library.initializeAndroidNotifications();

library.getNotifications();

window.library = library;

export default library;