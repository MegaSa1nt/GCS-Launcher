gDs = "https://gcs.icu"; // Your GDPS link to dashboard (doesn't work with default Cvolton's dashboard)
const wait = ms => new Promise(r => setTimeout(r, ms));
function newUpdate(ask = false, part = false) {
	if(window.dontupdate) return;
	updateQueue = [];
	updateQueueFunction();
	fetch('https://gcs.icu/download/updater.php?v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
		window.gcs = gcs;
		if(gcs.success) {
			if(gcs.game.version != window.localStorage.v2version) {
				window.localStorage.v2version = gcs.game.version;
				return newUpdate(ask, part);
			}
			if(!part) {
				if(gcs.game.windows.game > window.localStorage.v2wgame) updateQueue.push('wgame');
				if(gcs.game.windows[window.modmenu] > window.localStorage.v2modmenu) updateQueue.push('w'+window.modmenu);
				if(gcs.client.windows.time > window.localStorage.v2cw || gcs.client.windows.version != window.appVer) updateQueue.push('cw');
				if(gcs.game.windows[window.modmenu] == 0) uninstallMods();
			} else {
				if(part == 'game') updateQueue.push('wgame');
				else if(part == 'cw') updateQueue.push('cw');
				else if(part == 'mods') updateQueue.push(window.modmenu);
				else updateQueue.push(part);
			}
			if(updateQueue.length > 0) {
				document.getElementById('mainqueuecircle').style.display = 'flex';
				if(updateQueue.includes('wgame')) {
					document.getElementById('queue-gcs-notify-circle').style.display = 'flex';
					document.getElementById('queue-gcs-update').style.display = 'flex';
				}
				if(window.localStorage.v2version != 3) {
					if((updateQueue.includes('wmods') || updateQueue.includes('wmo') || updateQueue.includes('whm')) && window.isinstalled) {
						document.getElementById('queue-mods-notify-circle').style.display = 'flex';
						document.getElementById('queue-mods-update').style.display = 'flex';
					}
				}
				if(updateQueue.includes('cw')) {
					document.getElementById('queue-client-notify-circle').style.display = 'flex';
					document.getElementById('queue-client-update').style.display = 'flex';
				}
				if(ask) {
					document.getElementById("pbtn").setAttribute("onclick", "newUpdate()");
					document.getElementById("pimg").setAttribute("src", "res/svg/dl.svg");
					document.getElementById("pimg").classList.remove("dl");
					if(window.localStorage.usenf == 'true') window.__TAURI__.notification.sendNotification({title: "Что-то нужно обновить!", body: "Лаунчер нашёл обновление чего-то, скорее проверь, что там!", icon: "res/kitty.png"});
				} else {
					window.dontupdate = true;
					if(!window.localStorage.v2is22) uninstall();
					document.getElementById("pbtn").setAttribute("onclick", "newUpdate()");
					document.getElementById("pimg").setAttribute("src", "res/svg/load.svg");
					document.getElementById("pimg").classList.remove("dl");
					document.getElementById("pimg").classList.add("spin");
					allMenuBtns = document.querySelectorAll('[button-type]');
					allMenuBtns.forEach(e => {e.style.display = "none"});
					menus = document.querySelectorAll("[div-type='menu']");
					menus.forEach(i => {i.classList.remove("show");});
					jsZip = new JSZip();
					window.updatingPart = true;
					function dlPart(partName) {
						return new Promise(r => {
							window.updatingPart = true;
							if(partName == 'cw') {
								fetch('https://gcs.icu/download/updater.php?v='+window.localStorage.v2version+'&dl=cu').then(response => {
									listName = 'client';
									pbar = document.getElementById('queue-'+listName+'-progress');
									if(pbar.tagName != 'PROGRESS') {
										progpls = document.createElement('progress');
										progpls.id = 'queue-'+listName+'-progress';
										progpls.title = 'Загрузка';
										pbar.replaceWith(progpls);
										pbar = progpls;
									}
									const contentLength = response.headers.get('content-length');
									let loaded = 0;
									pbar.value = 0;
									pbar.max = contentLength;
									return new Response(
										new ReadableStream({
											start(controller) {
												const reader = response.body.getReader();
												read();
												function read() {
													reader.read().then((progressEvent) => {  
														if(progressEvent.done) {
															controller.close();
															return; 
														}
														loaded += progressEvent.value.byteLength;
														pbar.value = loaded;
														controller.enqueue(progressEvent.value);
														read();
													})
												}
											}
										})
									);
								}).then(response => response.arrayBuffer()).then(async (file) => {
									await zipFile(new Uint8Array(file), 'GCS-Updater.exe');
									window.__TAURI__.shell.open("GCS-Updater.exe").then(res=>{
										window.localStorage.v2cw = gcs.client.windows.time;
										window.__TAURI__.invoke('cgcsv', {ver: gcs.client.version});
										window.dontupdate = false;
										window.updatingPart = false;
										window.__TAURI__.process.exit(0);
									});
								});
							} else fetch('https://gcs.icu/download/updater.php?v='+window.localStorage.v2version+'&dl='+partName).then(response => {
								if(partName == 'wgame') listName = 'gcs';
								else listName = 'mods';
								pbar = document.getElementById('queue-'+listName+'-progress');
								if(pbar.tagName != 'PROGRESS') {
									progpls = document.createElement('progress');
									progpls.id = 'queue-'+listName+'-progress';
									progpls.title = 'Загрузка';
									pbar.replaceWith(progpls);
									pbar = progpls;
								}
								const contentLength = response.headers.get('content-length');
								let loaded = 0;
								pbar.value = 0;
								pbar.max = contentLength;
								return new Response(
									new ReadableStream({
										start(controller) {
											const reader = response.body.getReader();
											read();
											function read() {
												reader.read().then((progressEvent) => {  
													if(progressEvent.done) {
														controller.close();
														return; 
													}
													loaded += progressEvent.value.byteLength;
													pbar.value = loaded;
													controller.enqueue(progressEvent.value);
													read();
												})
											}
										}
									})
								);
							})
							.then(response => response.arrayBuffer()).then(async (file) => {
								l = 0;
								await fullZip(file, partName);
								window.gc();
								r(true);
							});
						});
					}
					function fullZip(files, partName) {
						return new Promise(r => {
							if(partName == 'wgame') listName = 'gcs';
							else listName = 'mods';
							pbar = document.getElementById('queue-'+listName+'-progress');
							if(pbar.tagName != 'PROGRESS') {
								progpls = document.createElement('progress');
								progpls.id = 'queue-'+listName+'-progress';
								pbar.replaceWith(progpls);
								pbar = progpls;
							}
							pbar.title = 'Распаковка';
							pbar.value = 0;
							jsZip.loadAsync(files).then(function (zip) {
								window.filesLol = [];
								window.filesTrue = [];
								fileCount = -1;
								function fuckingPlease() {
									fileCount++;
									delete filename;
									delete fileShift;
									filename = Object.keys(zip.files)[fileCount];
									window.filesLol.push(filename);
									plsdata = zip.files[filename].async('uint8array').then(async function (plsdatapls) {
										await checkGameAwait();
										zipFile(plsdatapls, filename).then(g => {
											l++;
											pbar.value = l;
											pbar.max = Object.keys(zip.files).length;
											window.gc();
											if(l >= Object.keys(zip.files).length) {
												window.dontupdate = false;
												window.updatingPart = false;
												document.getElementById('queue-'+listName+'-notify-circle').style.display = 'none';
												if(partName == 'wgame') {
													window.localStorage.v2wgame = gcs.game.windows.game;
													document.getElementById('queue-gcs-update').style.display = 'none';
												} else {
													partName = 'wmods';
													window.localStorage.v2modmenu = gcs.game.windows[window.modmenu];
													document.getElementById('queue-mods-update').style.display = 'none';
													window.localStorage.modmenu = part;
												}
												updateQueueFunction();
												window.__TAURI__.fs.writeTextFile(partName+".json", JSON.stringify(window.filesLol), {dir: 22});
												r(true);
												return true;
											} else fuckingPlease();
										}).catch(e => {
											console.log("[FAIL] "+filename+", "+e);
										});
									});
								}
								fuckingPlease();
							});
						});
					}
					async function runParts() {
						partName = await updateQueue.shift();
						await dlPart(partName);
						text.innerHTML = '';
						if(updateQueue.length > 0) runParts();
						else {
							window.updatingPart = false;
							window.gc();
							updateNoModsVar();
							updateQueueFunction();
							if(!window.localStorage.v2is22) window.localStorage.v2is22 = true;
							document.getElementById('mainqueuecircle').style.display = 'none';
							document.getElementById("pbtn").setAttribute("onclick", "play()");
							document.getElementById("pimg").setAttribute("src", "res/svg/play.svg");
							document.getElementById("pimg").classList.add("dl");
							document.getElementById("pimg").classList.remove("spin");
							allMenuBtns = document.querySelectorAll('[button-type]');
							allMenuBtns.forEach(e => {e.style.display = "flex"});
							menus = document.querySelectorAll("[div-type='menu']");
							menus.forEach(i => {i.classList.remove("show");});
							window.__TAURI__.window.appWindow.requestUserAttention(2);
							let permissionGranted = window.__TAURI__.notification.isPermissionGranted();
							if(!permissionGranted) {
								const permission = window.__TAURI__.notification.requestPermission();
								permissionGranted = permission === 'granted';
							}
							if(permissionGranted && window.localStorage.usenf == 'true') window.__TAURI__.notification.sendNotification({title: "Всё установлено!", body: "Хей, игрок! Игра была успешно установлена! Приятной игры :)", icon: "res/kitty.png"});
						}
					}
					runParts();
				}
			} else document.getElementById('mainqueuecircle').style.display = 'none';
		} else return false;
	});
}
function update(ask = false, err = '') {
	return false;
 	cook = [];
 	sd = new XMLHttpRequest();
 	sd.open("GET", gDs+"/download/updater.php", true);
 	sd.onload = function () {
 		result = JSON.parse(sd.response);
		cookie = document.cookie.split(";");
		cookie.forEach((penis) => {
			variable = penis.split("=");
			cook[variable[0].trim()] = variable[1];
		});
		if((result.time && result.time > cook["update"]) || err == "-1") {
			if(ask) {
				cookupdate = cook['update'];
				if(cookupdate == 0) text.innerHTML = "Загрузите игру!";
				else if(err == "-1") text.innerHTML = "Игра не найдена! Загрузить?";
				else {
					text.innerHTML = "Вышло обновление!";
					if(window.localStorage.usenf == 'true') window.__TAURI__.notification.sendNotification({title: "Вышло обновление!", body: "Вышла новая версия сервера, скорее устанавливай обновление!", icon: "res/kitty.png"});
				}
				document.getElementById("pbtn").setAttribute("onclick", "update(false, '-1')");
				document.getElementById("pimg").setAttribute("src", "res/svg/dl.svg");
				document.getElementById("pimg").classList.remove("dl");
			} else {
				window.dontupdate = true;
				document.getElementById("pbtn").setAttribute("onclick", "javascript:void");
				document.getElementById("pimg").setAttribute("src", "res/svg/load.svg");
				document.getElementById("pimg").classList.add("spin");
				if(cookupdate == 0 || err == -1) text.innerHTML = "Установка игры...";
				else text.innerHTML = "Обновление игры...";
				dl = new XMLHttpRequest();
				dl.open("GET", gDs+"/download/updater.php?dl=1", true);
				dl.responseType = 'blob';
				prog = document.getElementById("progress");
				prog.value = "0";
				document.getElementById("prdiv").style.opacity="1";
				dl.onprogress = function (event) {
					prog.max = event.total;
					prog.value = event.loaded;
					document.getElementById("ploaded").innerHTML = Math.round(event.loaded/104857.6)/10 + " МБ";
					document.getElementById("ptxt").innerHTML = "Загрузка..."
					document.getElementById("pmax").innerHTML = Math.round(event.total/104857.6)/10 + " МБ";
				}
				dl.onload = function () {
					text.style.color = "grey";
					if(cookupdate == 0 || err == -1) text.innerHTML = "Установка игры...";
					else text.innerHTML = "Обновление игры...";
					document.getElementById("ploaded").innerHTML = "";
					document.getElementById("ptxt").innerHTML = "Распаковка..."
					document.getElementById("pmax").innerHTML = "";
					prog.value = l = 0;
					jsZip = new JSZip();
					async function fullZip() { 
						const files = await dl.response.arrayBuffer();
						jsZip.loadAsync(files).then(async function (zip) {
							document.getElementById("ploaded").innerHTML = "0 файлов";
							for (const filename of Object.keys(zip.files)) {
								prog.max = Object.keys(zip.files).length;
								if(Object.keys(zip.files).length % 10 == 1) document.getElementById("pmax").innerHTML = Object.keys(zip.files).length+" файл";
								else if(Object.keys(zip.files).length % 10 > 1 && Object.keys(zip.files).length % 10 < 5 && Object.keys(zip.files).length % 10 != 0) document.getElementById("pmax").innerHTML = Object.keys(zip.files).length+" файла";
								else document.getElementById("pmax").innerHTML = Object.keys(zip.files).length+" файлов";
								plsdata = zip.files[filename].async('uint8array').then(async function (plsdatapls) {
									await checkGameAwait();
									await zipFile(plsdatapls, filename).then(d => {
										window.gc();
										l++;
										prog.value = l;
										if(l % 10 == 1) document.getElementById("ploaded").innerHTML = l +" файл";
										else if(l % 10 > 1 && l % 10 < 5 && l % 10 != 0) document.getElementById("ploaded").innerHTML = l +" файла";
										else document.getElementById("ploaded").innerHTML = l +" файлов";
										if(l >= Object.keys(zip.files).length) {
											window.gc();
											if(!window.localStorage.modmenu) {
												window.__TAURI__.fs.removeDir(".GDHM", {recursive: true});
												window.__TAURI__.fs.removeDir("locales", {recursive: true});
												window.__TAURI__.fs.removeDir("ffmpeg", {recursive: true});
												window.__TAURI__.fs.removeFile("ToastedMarshmellow.dll");
												window.__TAURI__.fs.removeFile("RoastedMarshmellow.dll");
												window.__TAURI__.fs.removeFile("libGLESv2.dll");
												window.__TAURI__.fs.removeFile("resources.pak");
												window.__TAURI__.fs.removeFile("icudtl.dat");
												window.__TAURI__.fs.removeFile("msacm32.dll");
												window.__TAURI__.fs.removeFile("chrome_elf.dll");
												window.__TAURI__.fs.removeFile("chrome_100_percent.pak");
												window.__TAURI__.fs.removeFile("chrome_200_percent.pak");
												window.__TAURI__.fs.removeFile("client.exe");
											}
											window.dontupdate = false;
											document.getElementById("pimg").setAttribute("src", "res/svg/play.svg");
											document.getElementById("prdiv").style.opacity="0";
											text.innerHTML = "";
											window.__TAURI__.window.appWindow.requestUserAttention(2);
											document.getElementById("pbtn").setAttribute("onclick", "play()");
											document.getElementById("pimg").classList.add("dl");
											document.getElementById("pimg").classList.remove("spin");
											let permissionGranted = window.__TAURI__.notification.isPermissionGranted();
											if(!permissionGranted) {
											  const permission = window.__TAURI__.notification.requestPermission();
											  permissionGranted = permission === 'granted';
											}
											if(permissionGranted && window.localStorage.usenf == 'true') window.__TAURI__.notification.sendNotification({title: "Игра установлена!", body: "Хей, игрок! Игра была успешно установлена! Приятной игры :)", icon: "res/kitty.png"})
											document.cookie = "update="+result.time+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
										} else rr(true);
									});
								});
							}
						})
					}
					fullZip();
				};
				dl.send();
			}
		} 
	}
	sd.send();
}
function checkGameAwait() {
	return new Promise(async function(r) {
		while(window.dontplayagain) await wait(1000);
		r(true);
	});
}
function zipFile(fileData, filename) {
    return new Promise(resolve => {
		plol = filename.split("/");
		pstr = "";
		if(plol[1]) for(i = 0; i < plol.length; i++) {
			if(plol[i] == plol[plol.length-1] && plol[i] != '') continue;
			if(i > 0) pstr = pstr+"/"+plol[i];
			else pstr = plol[i];
		}
		window.__TAURI__.fs.createDir(pstr, {recursive: true});
		if(fileData.length < 5242880) {
			window.__TAURI__.fs.writeBinaryFile(filename, fileData).then(r => {
				window.gc();
				resolve(r);
			}).catch(e => {
				resolve(e);
			});
		} else {
			arrayb = fileData.buffer;
			window.__TAURI__.fs.removeFile(filename).then(a => {
				fileCheck = sendArrayBufferToRust(filename, arrayb);
				if(fileCheck) resolve(true);
				else {
					window.__TAURI__.fs.removeFile(filename).then(a => {
						fileCheck = sendArrayBufferToRust(filename, arrayb);
						resolve(fileCheck);
					})
				}
			}).catch(e => {
				fileCheck = sendArrayBufferToRust(filename, arrayb);
				if(fileCheck) resolve(true);
				else {
					window.__TAURI__.fs.removeFile(filename).then(a => {
						fileCheck = sendArrayBufferToRust(filename, arrayb);
						resolve(fileCheck);
					});
				}
			});
		}
    })
}
function clientUpdate(ask = false) {
	cook = [];
	sd = new XMLHttpRequest();
	sd.open("GET", gDs+"/download/updater.php", true);
	sd.onload = function () {
		result = JSON.parse(sd.response);
		cookie = document.cookie.split(";");
		cookie.forEach((penis) => {
			variable = penis.split("=");
			cook[variable[0].trim()] = variable[1];
		});
		if(((result.client && result.client > cook["client"]) && cook['client'] != 0) || result.version != window.appVer) {
			if(ask) {
				text.innerHTML = "Обновление клиента!";
				document.getElementById("pbtn").setAttribute("onclick", "clientUpdate()");
				document.getElementById("pimg").setAttribute("src", "res/svg/dl.svg");
				document.getElementById("pimg").classList.remove("dl");
				if(window.localStorage.usenf == 'true') window.__TAURI__.notification.sendNotification({title: "Обновление клиента!", body: "Вышла новая версия клиента, скорее устанавливай обновление!", icon: "res/kitty.png"});
			} else {
				window.dontupdate = true;
				document.getElementById("pbtn").setAttribute("onclick", "javascript:void");
				document.getElementById("pimg").setAttribute("src", "res/svg/load.svg");
				document.getElementById("pimg").classList.remove("dl");
				document.getElementById("pimg").classList.add("spin");
				text.innerHTML = "Обновление клиента...";
				dl = new XMLHttpRequest();
				dl.open("GET", gDs+"/download/updater.php?dl=updater", true);
				dl.responseType = 'blob';
				prog = document.getElementById("progress");
				prog.value = "0";
				document.getElementById("prdiv").style.opacity="1";
				dl.onprogress = function (event) {
					prog.max = event.total;
					prog.value = event.loaded;
					document.getElementById("ploaded").innerHTML = Math.round(event.loaded/104857.6)/10 + " МБ";
					document.getElementById("ptxt").innerHTML = "Загрузка..."
					document.getElementById("pmax").innerHTML = Math.round(event.total/104857.6)/10 + " МБ";
				}
				dl.onload = function () {
					document.getElementById("ploaded").innerHTML = "";
					document.getElementById("ptxt").innerHTML = "Установка..."
					document.getElementById("pmax").innerHTML  = "";
					file = dl.response.arrayBuffer();
					file.then(res=>{filel = new Uint8Array(res)}).then(res=>{
						window.__TAURI__.fs.writeBinaryFile("GCS-Updater.exe", filel).then(res=>{
							document.cookie = "client="+result.client+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
							document.getElementById("ploaded").innerHTML = "";
							document.getElementById("ptxt").innerHTML = "Перезагрузка..."
							document.getElementById("pmax").innerHTML = "";
							prog.value = 0;
							window.__TAURI__.shell.open("GCS-Updater.exe").then(res=>{
								window.__TAURI__.invoke('cgcsv', {ver: result.version});
								window.dontupdate = false;
								prog.value = prog.max;
								window.__TAURI__.process.exit(0);
							});
						})
					})
				}
				dl.send();
			}
		} else {
			if(cook["client"] == 0) document.cookie = "client="+result.client+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
			update(true);
		}
	}
	sd.send();
}
function updateUser() {
	cook = [];
	let internetTImeout = setTimeout(function() {
		document.getElementById("nointernet").style.opacity = "1";
		document.getElementById("nointernet").style.visibility = "initial";
		if(window.localStorage.v2wgame > 0) document.getElementById("nibtn").style.visibility = "initial";
		document.getElementById("nointernet").style.display = "flex";
		updateUser();
		clearTimeout(internetTImeout);
		return;
	}, 10000);
	document.getElementById("loaddiv").style.opacity = "1";
	document.getElementById("loaddiv").style.visibility = "initial";
	if(document.cookie.length) {
		cookie = document.cookie.split(";");
		cookie.forEach((penis) => {
			variable = penis.split("=");
			cook[variable[0].trim()] = variable[1];
		});
	}
	if(!cook["update"]) document.cookie = "update=0; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
	if(!cook["client"]) document.cookie = "client=0; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
	if(cook["auth"] && cook["auth"] != "no") {
		user = cook["user"];
		color = cook["color"];
		id = cook["id"];
		auth = cook["auth"];
		document.getElementById("lbtn").setAttribute("onclick", "settings()");
		document.getElementById("licon").setAttribute("src", "res/svg/gear.svg");
		document.getElementById("licon").setAttribute("title", "Настройки");
		document.getElementById("user").innerHTML = user;
		document.getElementById("user").style.color = "rgb("+color+")";
		document.getElementById("div").classList.remove("show");
		chk = new XMLHttpRequest();
		chk.open("GET", gDs+"/login/api.php?auth="+auth, true);
		chk.onload = async function () {
			result = JSON.parse(chk.response);
			if(result.success) {
				document.getElementById("user").innerHTML = result.user;
				document.getElementById("user").setAttribute("onclick", 'window.__TAURI__.shell.open("'+gDs+'/profile/'+result.user+'")');
				document.getElementById("user").style.color = "rgb("+result.color+")";
				document.getElementById("user").style.cursor = "pointer";
				document.getElementById("nbtn").style.opacity = "1";
				document.getElementById("nbtn").style.visibility = "initial";
				document.cookie = "user="+result.user+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
				document.cookie = "color="+result.color+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
				updateNotifies();
			} else logoutbtn();
			await updateParts();
			if(!window.dontupdate) newUpdate(true);
			document.getElementById("loaddiv").style.opacity = "0";
			document.getElementById("loaddiv").style.visibility = "hidden";
			if(typeof window.localStorage.warn == "undefined") {
				document.getElementById("warndiv").style.opacity = "1";
				document.getElementById("warndiv").style.visibility = "initial";
			}
			clearTimeout(internetTImeout);
			document.getElementById("nointernet").style.opacity = "0";
			document.getElementById("nointernet").style.visibility = "hidden";
			document.getElementById("nointernet").style.display = "none";
			document.getElementById("nibtn").style.visibility = "hidden";
		}
		chk.send();
	} else {
		document.getElementById("lbtn").setAttribute("onclick", "show()");
		document.getElementById("licon").setAttribute("src", "res/svg/login.svg");
		document.getElementById("licon").setAttribute("title", "Вход");
		document.getElementById("user").innerHTML = "гость";
		document.getElementById("user").style.cursor = "auto";
		document.getElementById("user").setAttribute("onclick", '');
		document.getElementById("user").style.color = "rgb(255,255,255)";
		updateParts();
		if(!window.dontupdate) newUpdate(true);
		document.getElementById("loaddiv").style.opacity = "0";
		document.getElementById("loaddiv").style.visibility = "hidden";
		if(typeof window.localStorage.warn == "undefined") {
			document.getElementById("warndiv").style.opacity = "1";
			document.getElementById("warndiv").style.visibility = "initial";
		}
		clearTimeout(internetTImeout);
		document.getElementById("nointernet").style.opacity = "0";
		document.getElementById("nointernet").style.visibility = "hidden";
		document.getElementById("nointernet").style.display = "none";
	}
}
function logoutbtn() {
	document.cookie = "user=no; path=/; expires=Fri, 31 Dec 0000 23:59:59 GMT";
	document.cookie = "color=no; path=/; expires=Fri, 31 Dec 0000 23:59:59 GMT";
	document.cookie = "id=no; path=/; expires=Fri, 31 Dec 0000 23:59:59 GMT";
	document.cookie = "auth=no; path=/; expires=Fri, 31 Dec 0000 23:59:59 GMT";
	document.getElementById("stgdiv").style.opacity = "0";
	document.getElementById("stgdiv").style.visibility = "hidden";
	document.getElementById("nbtn").style.opacity = "0";
	document.getElementById("nbtn").style.visibility = "hidden";
	document.getElementById("lbtn").style.opacity = "1";
	ltext.style.color = "#ffffff";
	ltext.innerHTML = "Войдите в аккаунт";
	updateUser();
}
function loginbtn() {
	fd = new FormData(document.getElementById("form"));
	sd = new XMLHttpRequest();
	sd.open("POST", gDs+"/login/api.php", true);
	sd.onload = function () {
		result = JSON.parse(sd.response);
		if(result.success) {
			document.cookie = "user="+result.user+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
			document.cookie = "color="+result.color+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
			document.cookie = "id="+result.id+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
			document.cookie = "auth="+result.auth+"; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
			updateUser();
		} else {
			ltext.style.color = "#ffbbbb";
			if(result.error == "-1") ltext.innerHTML = "Неверный пароль!";
			if(result.error == "-2") ltext.innerHTML = "Активируйте аккаунт!";
			if(result.error == "-3") ltext.innerHTML = "Что-то пошло не так!";
		}
	}
	if(fd.get("userName").length && fd.get("password").length) sd.send(fd);
}
function play() {
	if(!window.dontplayagain) {
		text.innerHTML = "Загрузка...";
		exists = window.__TAURI__.fs.exists("GreenCatsServer.exe").then((success) => {
			if(success && !window.dontplayagain) window.__TAURI__.shell.open("GreenCatsServer.exe");
			else {
				window.localStorage.v2wgame = 0;
				updateQueueFunction();
				if(!window.dontupdate) newUpdate(true);
			}
		});
	}
}
function show(sh = 'l') {
 	if(sh == 'l') document.getElementById("div").classList.toggle("show");
	else {
		if(document.getElementById("notifydiv").style.opacity == "0") {
			document.getElementById("notifydiv").style.opacity = "1";
			document.getElementById("notifydiv").style.visibility = "initial";
		} else {
			document.getElementById("notifydiv").style.opacity = "0";
			document.getElementById("notifydiv").style.visibility = "hidden";
		}
	}
}
function settings() {
	if(document.getElementById("stgdiv").style.opacity == 1) {
		document.getElementById("stgdiv").style.opacity = "0";
		document.getElementById("stgdiv").style.visibility = "hidden";
		document.getElementById("lbtn").style.opacity = "1";
	} else {
		document.getElementById("stgdiv").style.opacity = "1";
		document.getElementById("stgdiv").style.visibility = "initial";
		document.getElementById("lbtn").style.opacity = "0";
	}
}
function timeConverter(UNIX_timestamp, min = false) {
  a = new Date(UNIX_timestamp * 1000);
  if(!min) months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  else months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  year = a.getFullYear();
  month = months[a.getMonth()];
  date = a.getDate();
  if(!min) time = date + ' ' + month + ' ' + year;
  else {
	  b = new Date();
	  if(a.getFullYear() == b.getFullYear()) time = date + ' ' + month;
	  else time = date + ' ' + month + ' ' + year;
  }
  return time;
}
async function sendArrayBufferToRust(path, arrayBuffer) {
  const chunkSize = 1024 * 1024 * 5; 
  const numChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, arrayBuffer.byteLength);
    const chunk = arrayBuffer.slice(start, end);
	myfile = window.__TAURI__.tauri.invoke("append_chunk_to_file", {path: path, chunk: Array.from(new Uint8Array(chunk))}).catch(e => {
		return false;
	});
	if(!myfile) return false;
	window.gc();
  }
  return true;
}
function warning(answer) {
	if(answer) {
		window.localStorage.warn = true;
		document.getElementById("warndiv").style.opacity = "0";
		document.getElementById("warndiv").style.visibility = "hidden";
	} else window.__TAURI__.process.exit(0);
}
function openDir(dir) {
	if(dir == 'res') {
		window.__TAURI__.path.resourceDir().then(r => {
			window.__TAURI__.shell.open(r);
		})
	}
}
function updateNotifies() {
	notifydiv = document.getElementById('notifies');
	if(document.cookie.length) {
		cookie = document.cookie.split(";");
		cookie.forEach((penis) => {
			variable = penis.split("=");
			cook[variable[0].trim()] = variable[1];
		});
	}
	notifies = new XMLHttpRequest();
	notifies.open("GET", gDs+"/account/notify.php"+"?auth="+encodeURIComponent(cook["auth"]), true);
	notifies.onload = function () {
		nf = JSON.parse(notifies.response);
		if(nf.success) {
			if((window.oldNotifies.last === nf.last) && (window.oldNotifies.counts.new == nf.counts.new)) return;
			window.oldNotifies = nf;
			if(nf.notifies.length > 0) {
				notifydiv.innerHTML = '';
				notifyNames = [];
				nf.notifies.forEach(notify => {
					ncard = document.createElement("div");
					ncard.classList.add('notifycard');
					nname = document.createElement("h2");
					nname.classList.add('profilenick');
					nname.classList.add('notifyname');
					np = document.createElement('p');
					switch(notify.action.type) {
						case '1':
							if(notify.action.v3 == 0) {
								nname.innerHTML = 'Ваш уровень потерял оценку';
								np.innerHTML = 'С вашего уровня <b>'+notify.action.v1.name+'</b> сняли оценку! 😢';
								nfborder = 'bad';
							} else {
								nname.innerHTML = 'Ваш уровень оценили';
								np.innerHTML = 'Ваш уровень <b>'+notify.action.v1.name+'</b> был успешно оценён, поздравляем! 🎉';
								nfborder = 'good';
							}
							break;
						case '2':
							if(notify.action.v3 == '0') {
								nname.innerHTML = 'Ваc разбанили';
								nfborder = 'good';
								switch(notify.action.v1) {
									case '1':
										np.innerHTML = 'Вы были разблокированы в топе игроков! 🥳';
										break;
									case '2':
										np.innerHTML = 'Вы были разблокированы в топе строителей! 🥳';
										break;
									case '3':
										np.innerHTML = 'Вам разблокировали доступ к публикации уровней! 🥳';
										break;
								}
							} else {
								nname.innerHTML = 'Ваc забанили';
								nfborder = 'bad';
								switch(notify.action.v1) {
									case '1':
										np.innerHTML = 'Вы были заблокированы в топе игроков! 😭';
										break;
									case '2':
										np.innerHTML = 'Вы были заблокированы в топе строителей! 😭';
										break;
									case '3':
										np.innerHTML = 'Вам заблокировали доступ к публикации уровней! 😭';
										break;
								}
							}
							break;
						case '3':
							nname.innerHTML = 'Кто-то подал заявку в ваш клан';
							np.innerHTML = 'Один из игроков подал заявку в ваш клан <b>'+notify.action.v2.clan+'</b>! 😊';
							nfborder = 'middle';
							break;
						case '4':
							if(notify.action.v1 == '1') {
								nname.innerHTML = 'Кто-то присоединился к клану';
								np.innerHTML = 'Один из игроков присоединился к вашему клану <b>'+notify.action.v2.clan+'</b>! 😱';
								nfborder = 'good';
							} else {
								nname.innerHTML = 'Кто-то вышел из клана';
								np.innerHTML = 'Один из участников клана <b>'+notify.action.v2.clan+'</b> покинул его! 😔';
								nfborder = 'bad';
							}
							break;
						case '5':
							nname.innerHTML = 'Вас исключили из клана';
							np.innerHTML = 'Вы были исключены из клана <b>'+notify.action.v2.clan+'</b> его владельцем! 😔';
							nfborder = 'bad';
							break;
						case '6':
							if(notify.action.v1 == '1') {
								nname.innerHTML = 'Вашу заявку приняли';
								np.innerHTML = 'Владелец клана <b>'+notify.action.v2.clan+'</b> принял вашу заявку на вступление! 😀';
								nfborder = 'good';
							} else {
								nname.innerHTML = 'Вашу заявку отклонили';
								np.innerHTML = 'Владелец клана <b>'+notify.action.v2.clan+'</b> отклонил вашу заявку на вступление! 😥';
								nfborder = 'bad';
							}
							break;
						default:
							nname.innerHTML = 'Неизвестное уведомление';
							np.innerHTML = 'Вы получили уведомление, которое не поддерживается вашей версией клиента 🤔';
							nfborder = 'middle';
							break;
					}
					if(notify.checked == '0') {
						ncircle = document.createElement('img');
						ncircle.setAttribute('src', 'res/svg/circle.svg');
						ncircle.classList.add('notifycircle');
						ncircle.setAttribute('width', '8px');
						ncircle.id = 'circle'+notify.ID;
						nname.append(ncircle);
					}
					notifyNames.push({nname: nname.innerHTML.replace(/\<[^<>]*\>/g, "").trim(), np: np.innerHTML.replace(/\<[^<>]*\>/g, "").trim()})
					ncard.append(nname);
					ncard.append(np);
					ncom = document.createElement("div");
					ncom.classList.add('notifycomments');
					nc1 = document.createElement('h3');
					nc1.classList.add('comments');
					nc1.classList.add('clickformore');
					nc1.innerHTML = 'Нажмите для большей информации';
					nc1.id = 'cfm'+notify.ID;
					nc2 = document.createElement('h3');
					nc2.classList.add('comments');
					nc2.classList.add('songidyeah');
					nc2.classList.add('notifycom');
					nc2.id = "comment"+notify.ID;
					nc2.innerHTML = '<b>'+timeConverter(notify.time, true)+'</b>';
					ncom.append(nc1);
					ncom.append(nc2);
					ndiv = document.createElement("div");
					ndiv.id = "notify"+notify.ID;
					ndiv.classList.add('profile');
					ndiv.classList.add('nf'+nfborder);
					ndiv.append(ncard);
					ndiv.append(ncom);
					seconddiv = document.createElement('div');
					seconddiv.id = 'detailed'+notify.ID;
					seconddiv.classList.add('detailed');
					seconddiv.append(ndiv);
					notifydiv.append(seconddiv);
					ndiv.onclick = function() {
						detailedNotify(notify.ID);
					}
				});
			lastnew = nf.counts.new % 10;
			if(lastnew == 1 && (nf.counts.new < 10 || nf.counts.new > 19)) newcount = nf.counts.new+' новое уведомление';
			else if((lastnew > 1 && lastnew < 5) && (nf.counts.new < 10 || nf.counts.new > 19)) newcount = nf.counts.new+' новых уведомления';
			else newcount = nf.counts.new+' новых уведомлений';
			document.getElementById("notifycount").innerHTML = '<i>'+nf.counts.all+' всего, '+newcount+'</i>'
			if(nf.last > window.localStorage.last && nf.counts.new > 0) {
				if(nf.counts.new > 1) notifytitle = 'Новые уведомления!';
				else {
					notifytitle = notifyNames[0].nname;
					newcount = notifyNames[0].np;
				}
				if(window.localStorage.usenf == 'true') window.__TAURI__.notification.sendNotification({title: notifytitle, body: newcount, icon: "res/kitty.png"});
			}
			if(nf.counts.new > 0) document.getElementById('mainnfcircle').style.display = 'block';
			else document.getElementById('mainnfcircle').style.display = 'none';
			} else notifydiv.innerHTML = '<img src="res/svg/checked.svg" width="200px" style="filter: invert(0.5);"><h3 style="margin:0px">У вас нет уведомлений. Кайфуем!</h3>';
			window.localStorage.last = Math.floor(Date.now() / 1000);
		} else {
			notifydiv.innerHTML = '<h3 style="margin:0px;color:#ffbbbb">Что-то пошло не так при получении уведомлений!</h3>';
			updateUser();
		} 
	}
	notifies.send(auth);
}
function detailedNotify(id) {
	notifydiv = document.getElementById('notifies');
	if(document.cookie.length) {
		cookie = document.cookie.split(";");
		cookie.forEach((penis) => {
			variable = penis.split("=");
			cook[variable[0].trim()] = variable[1];
		});
	}
	detailed = new XMLHttpRequest();
	detailed.open("GET", gDs+"/account/notify.php"+"?auth="+encodeURIComponent(cook["auth"])+'&notifyID='+id, true);
	if(id != 'all') {
		document.getElementById('notify'+id).onclick = 'javascript:void';
		ddiv = document.getElementById('detailed'+id);
		ldiv = document.createElement('div');
		ldiv.classList.add('notifycard');
		ldiv.classList.add('loadingnotify');
		limg = document.createElement('img');
		limg.classList.add('spin');
		limg.setAttribute('src', 'res/svg/loading.svg');
		limg.setAttribute('width', '50px');
		ldiv.append(limg);
		ddiv.append(ldiv);
	}
	detailed.onload = function () {
		dnf = JSON.parse(detailed.response);
		if(dnf.success) {
			if(id == 'all') updateNotifies();
			else {
				ldiv.remove();
				conp = licon = '';
				detaileddiv = document.createElement('div');
				detaileddiv.id = 'dn'+id;
				detaileddiv.classList.add('detaileddiv');
				content = document.createElement('div');
				content.classList.add('notifycard');
				content.classList.add('rowcard');
				conp = document.createElement('p');
				switch(dnf.action.type) {
					case '1':
						if(dnf.action.v3 == 0) {
							conp.innerHTML = 'Модератор <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> снял оценку с вашего уровня <b>'+dnf.action.v1.name+'</b>!';
							licon = document.createElement('img');
							licon.setAttribute('src', 'res/faces/'+dnf.action.v4+'/'+dnf.action.v2+'.png');
						} else {
							conp.innerHTML = 'Модератор <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> оценил ваш уровень <b>'+dnf.action.v1.name+'</b> на <b>'+dnf.action.v3+'</b> звёзд!';
							licon = document.createElement('img');
							licon.setAttribute('src', 'res/faces/'+dnf.action.v4+'/'+dnf.action.v3+'.png');
						}
						licon.setAttribute('width', '50px');
						break;
					case '2':
						where = ['вас в топе игроков', 'вас в топе строителей', 'вам публикацию уровней'];
						if(dnf.action.v3 == 0) conp.innerHTML = 'Модератор <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> разблокировал '+where[dnf.action.v1-1]+' по причине <b>'+b64(dnf.action.v2)+'</b>!';
						else conp.innerHTML = 'Модератор <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> заблокировал '+where[dnf.action.v1-1]+' по причине <b>'+b64(dnf.action.v2)+'</b>!';
						break;
					case '3':
						conp.innerHTML = 'Игрок <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> подал заявку в ваш клан <b style="cursor: pointer; color: #'+dnf.action.v2.color+';" onclick=\'window.__TAURI__.shell.open("'+gDs+'/clan/'+dnf.action.v2.ID+'/settings&pending")\'>'+dnf.action.v2.clan+'</b> '+timeConverter(dnf.time)+'!<br>Может, это новый участник?';
						break;
					case '4':
						if(dnf.action.v1 == 1) conp.innerHTML = 'Игрок <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> присоединился к вашему клану <b style="cursor: pointer; color: #'+dnf.action.v2.color+';" onclick=\'window.__TAURI__.shell.open("'+gDs+'/clan/'+dnf.action.v2.ID+'")\'>'+dnf.action.v2.clan+'</b> '+timeConverter(dnf.time)+'!';
						else conp.innerHTML = 'Игрок <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> вышел из вашего клана <b style="cursor: pointer; color: #'+dnf.action.v2.color+';" onclick=\'window.__TAURI__.shell.open("'+gDs+'/clan/'+dnf.action.v2.ID+'")\'>'+dnf.action.v2.clan+'</b> '+timeConverter(dnf.time)+'!';
						break;
					case '5':
						conp.innerHTML = 'Вы были исключены из клана <b style="cursor: pointer; color: #'+dnf.action.v2.color+';" onclick=\'window.__TAURI__.shell.open("'+gDs+'/clan/'+dnf.action.v2.ID+'")\'>'+dnf.action.v2.clan+'</b> его владельцем <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> '+timeConverter(dnf.time)+'!';
						break;
					case '6':
						if(dnf.action.v1 == 1) conp.innerHTML = 'Игрок <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> принял вашу заявку на вступление в клан <b style="cursor: pointer; color: #'+dnf.action.v2.color+';" onclick=\'window.__TAURI__.shell.open("'+gDs+'/clan/'+dnf.action.v2.ID+'")\'>'+dnf.action.v2.clan+'</b> '+timeConverter(dnf.time)+'!';
						else conp.innerHTML = 'Игрок <b style="cursor: pointer; color: #007bff;" onclick=\'window.__TAURI__.shell.open("'+gDs+'/profile/'+dnf.mod.accountID+'")\'>'+dnf.mod.username+'</b> отклонил вашу заявку на вступление в клан <b style="cursor: pointer; color: #'+dnf.action.v2.color+';" onclick=\'window.__TAURI__.shell.open("'+gDs+'/clan/'+dnf.action.v2.ID+'")\'>'+dnf.action.v2.clan+'</b> '+timeConverter(dnf.time)+'!';
						break;
					default:
						conp.innerHTML = 'Это всё ещё неизвестное для вашей версии клиента уведомление. Может, стоит обновиться?';
						break;
				}
				content.append(conp);
				if(typeof licon != "undefined") content.append(licon);
				detaileddiv.append(content);
				ntcircle = document.getElementById('circle'+id);
				if(ntcircle != null) {
					ntcircle.remove();
					nf.counts.new--;
				}
				ddiv.append(detaileddiv);
				document.getElementById('cfm'+id).innerHTML = 'ID уведомления: '+id;
				lastnew = nf.counts.new % 10;
				if(lastnew == 1 && (nf.counts.new < 10 || nf.counts.new > 19)) newcount = nf.counts.new+' новое уведомление';
				else if((lastnew > 1 && lastnew < 5) && (nf.counts.new < 10 || nf.counts.new > 19)) newcount = nf.counts.new+' новых уведомления';
				else newcount = nf.counts.new+' новых уведомлений';
				document.getElementById("notifycount").innerHTML = '<i>'+nf.counts.all+' всего, '+newcount+'</i>'
				if(nf.counts.new > 0) document.getElementById('mainnfcircle').style.display = 'block';
				else document.getElementById('mainnfcircle').style.display = 'none';
				document.getElementById('notify'+id).onclick = function() {toggleDetailed(id);}
			}
		}
	}
	detailed.send();
}
function b64(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
function toggleDetailed(id) {
	if(document.getElementById('dn'+id).style.display != 'none') {
		document.getElementById('dn'+id).style.display = 'none';
		document.getElementById('cfm'+id).innerHTML = 'Нажмите для большей информации';
	}
	else {
		document.getElementById('dn'+id).style.display = 'flex';
		document.getElementById('cfm'+id).innerHTML = 'ID уведомления: '+id;
	}
}
function checkProcess(process) {
	return new Promise(resolve => {
		window.__TAURI__.tauri.invoke("check_processes", {process: process}).then(r => {
			resolve(true);
		}).catch(e => {
			resolve(false);
		})
	})
}
function queue() {
	menus = document.querySelectorAll("[div-type='menu']");
	menus.forEach(i => {i.classList.remove("show");});
	document.getElementById('queuediv').classList.toggle('show');
}
function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
function changeLine(isReturn = false) {
	lines = ['Когда-нибудь нас будут обожать...',
	'Пойти купить ружьё и стрелять в толпу!..',
	'И вперёд, по новой жить, и вперёд, по новой...',
	'Выйди из комнаты, сделай вперед шаг...',
	'Это наше новое скандальное видео!..',
	'Ты любишь фанк, детка, рубашечки в клетку...',
	'Нарисуй мне улыбку на моей кислой мордашке...',
	'Ты слышишь: застучали двери, кто теперь поверит?..',
	'Самый лучший друг, мой самый лучший друг...',
	'Ну давай, подписывай пьяный контракт!..',
	'Добрый Санта, прочитай моё письмо...',
	'Что достаточно всего прикосновения...',
	'Кто все эти люди, чтоб учить меня жить?..',
	'Песня про любовь для рабочего района...',
	'Всех, кроме нас, всех, кроме нас!..',
	'Здесь переменами станем мы!..',
	'А по ночам я вижу сны...',
	'Не смейте рушить их хрупкий мир!..',
	'Устрой дестрой, порядок — это отстой!..',
	'Про нас никто не вспомнит...',
	'Снова нас догонит любовь и на куски разорвёт!..',
	'И ничего не случится со мной!..',
	'Разрушь этот скучный порядок вещей!..',
	'Дайте мне ещё одну минуту...',
	'Не повторится мгновение счастья, мне данное свыше...',
	'Кто, если не мы? Никого нет, кроме нас!..',
	'Ледники растают — восполнится Иордан...',
	'Прячет ли дождик беззвучные слезы?..',
	'Мы с тобой весь мир по кругу излазим...',
	'Тогда заберите мое доброе сердце...',
	'Маленькое и хрупкое счастье...',
	'Девочка плачет, сердце разбито...',
	'Над моими попытками замедлиться...',
	'Русский Христос идёт! Русский Христос грядёт!..',
	'Видишь света столб ослепительный?..'];
	rnum = random(0, lines.length-1)
	if(!isReturn) document.getElementById('randomline').innerHTML = lines[rnum];
	else return lines[rnum];
}
function updateQueueFunction() {
	for(const part in window.update_parts) {
		queue_divs = [];
		queue_part = window.update_parts[part];
		queue_divs.card = document.getElementById(queue_part.id);
		queue_divs.progress = document.getElementById(queue_part.id+"-progress");
		queue_divs.button = document.getElementById(queue_part.id+"-menu");
		queue_divs.time = window.localStorage["v2"+queue_part.variable];
		if(queue_divs.progress.tagName != "H3") {
			queue_divs.h3 = document.createElement('h3');
			queue_divs.h3.id = queue_part.id+'-progress';
			queue_divs.progress.replaceWith(queue_divs.h3);
			queue_divs.progress = queue_divs.h3;
		}
		if(queue_divs.time == 0) {
			queue_divs.progress.innerHTML = "Не установлено";
			queue_divs.button.style.display = "none";
		}
		else queue_divs.progress.innerHTML = 'От: <b>'+timeConverter(queue_divs.time)+'</b>';
	}
	document.getElementById('queue-mods-menu-replace-'+window.modmenu).style.display = "none";
	/*
	gcslist = document.getElementById('queue-gcs-progress');
	modslist = document.getElementById('queue-mods-progress');
	clientlist = document.getElementById('queue-client-progress');
	if(gcslist.tagName != 'H3') {
		replacegcs = document.createElement('h3');
		replacegcs.id = 'queue-gcs-progress';
		gcslist.replaceWith(replacegcs);
		gcslist = replacegcs;
	}
	if(modslist.tagName != 'H3') {
		replacemods = document.createElement('h3');
		replacemods.id = 'queue-mods-progress';
		modslist.replaceWith(replacemods);
		modslist = replacemods;
	}
	if(clientlist.tagName != 'H3') {
		replaceclient = document.createElement('h3');
		replaceclient.id = 'queue-client-progress';
		clientlist.replaceWith(replaceclient);
		clientlist = replaceclient;
	}
	clienttime = timeConverter(window.localStorage.v2cw);
	clientlist.innerHTML = 'От <b>'+clienttime+'</b>';
	if(window.localStorage.v2wgame > 0) {
		gcstime = timeConverter(window.localStorage.v2wgame);
		gcslist.innerHTML = 'От <b>'+gcstime+'</b>';
		document.getElementById('queue-gcs-menu-reinstall').style.display = 'flex';
		document.getElementById('queue-gcs-menu-delete').style.display = 'flex';
		document.getElementById('queue-gcs-menu-install').style.display = 'none';
		document.getElementById('queue-gcs-menu').style.display = 'flex';
	} else {
		gcslist.innerHTML = 'Не установлена';
		modslist.innerHTML = 'Игра не установлена';
		if(!window.updatingPart) {
			document.getElementById('queue-gcs-update').style.display = 'flex';
			document.getElementById('queue-gcs-menu').style.display = 'none';
			document.getElementById('queue-mods-menu').style.display = 'none';
			document.getElementById('queue-gcs-menu-reinstall').style.display = 'none';
			document.getElementById('queue-gcs-menu-delete').style.display = 'none';
			document.getElementById('queue-gcs-menu-install').style.display = 'flex';
		}
		window.isinstalled = false;
		window.nomods = true;
	}
	if(window.localStorage.v2modmenu > 0) {
		window.nomods = false;
		document.getElementById("queue-mods-menu-replace-"+window.modmenu).style.display = "none";
	} else {
		window.nomods = true;
		updateNoModsVar();
		if(!window.updatingPart) {
			document.getElementById('queue-mods-menu').style.display = 'none';
			document.getElementById('queue-mods-update').style.display = 'flex';
		}
		return modslist.innerHTML = 'Моды не установлены';
	}
	if(!window.updatingPart) document.getElementById('queue-mods-menu').style.display = 'flex';
	//modslist.innerHTML = '<b>'+modsname+'</b>: <b>'+modstime+'</b>';
	document.getElementById('queue-mods-menu').style.display = 'flex';
	*/
}
function showMenu(menuName) {
	if(window.updatingPart) return;
	menus = document.querySelectorAll("[div-type='menu']");
	menus.forEach(i => {if(i.id != menuName+'-menu-div') i.classList.remove("show");});
	document.getElementById(menuName+'-menu-div').classList.toggle('show');
}
function replaceMods(part) {
	window.updatingPart = true;
	allMenuBtns = document.querySelectorAll('[button-type]');
	allMenuBtns.forEach(e => {e.style.display = "none"});
	menus = document.querySelectorAll("[div-type='menu']");
	menus.forEach(i => {i.classList.remove("show");});
	window.__TAURI__.path.appDataDir().then(ad => {
		window.__TAURI__.fs.exists(ad+"wmods.json").then(a => {
			if(a) {
				window.__TAURI__.fs.readTextFile(ad+"wmods.json").then(partFiles => {
					gcs = JSON.parse(partFiles);
					for(const file in gcs) {
						if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
						else window.__TAURI__.fs.removeFile(gcs[file]);
					}
					window.__TAURI__.fs.removeFile(ad+"wmods.json");
				});
			} else {
				fetch('https://gcs.icu/download/files.php?part='+window.modmenu+'&v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
					for(const file in gcs) {
						if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
						else window.__TAURI__.fs.removeFile(gcs[file]);
					}
				});
			}
			newUpdate(false, part);
		});
	});
}
function reinstall(part) {
	window.updatingPart = true;
	if(part == 'game') {
		allMenuBtns = document.querySelectorAll('[button-type]');
		allMenuBtns.forEach(e => {e.style.display = "none"});
		menus = document.querySelectorAll("[div-type='menu']");
		menus.forEach(i => {i.classList.remove("show");});
		window.__TAURI__.path.appDataDir().then(ad => {
			window.__TAURI__.fs.exists(ad+"wgame.json").then(a => {
				if(a) {
					window.__TAURI__.fs.readTextFile(ad+"wgame.json").then(partFiles => {
						gcs = JSON.parse(partFiles);
						for(const file in gcs) {
							if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: false});
							else window.__TAURI__.fs.removeFile(gcs[file]);
						}
						window.__TAURI__.fs.removeFile(ad+"wmods.json");
					});
				} else {
					fetch('https://gcs.icu/download/files.php?part=wgame&v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
						for(const file in gcs) {
							if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: false});
							else window.__TAURI__.fs.removeFile(gcs[file]);
						}
					});
				}
				newUpdate(false, 'wgame');
			});
		});
	} else if(part == 'cw') {
		allMenuBtns = document.querySelectorAll('[button-type]');
		allMenuBtns.forEach(e => {e.style.display = "none"});
		menus = document.querySelectorAll("[div-type='menu']");
		menus.forEach(i => {i.classList.remove("show");});
		newUpdate(false, 'cw');
	} else {
		allMenuBtns = document.querySelectorAll('[button-type]');
		allMenuBtns.forEach(e => {e.style.display = "none"});
		menus = document.querySelectorAll("[div-type='menu']");
		menus.forEach(i => {i.classList.remove("show");});
		window.__TAURI__.path.appDataDir().then(ad => {
			window.__TAURI__.fs.exists(ad+"wmods.json").then(a => {
				if(a) {
					window.__TAURI__.fs.readTextFile(ad+"wmods.json").then(partFiles => {
						gcs = JSON.parse(partFiles);
						for(const file in gcs) {
							if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
							else window.__TAURI__.fs.removeFile(gcs[file]);
						}
						window.__TAURI__.fs.removeFile(ad+"wmods.json");
					});
				} else {
					fetch('https://gcs.icu/download/files.php?part='+window.modmenu+'&v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
						for(const file in gcs) {
							if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
							else window.__TAURI__.fs.removeFile(gcs[file]);
						}
					});
				}
				newUpdate(false, window.modmenu);
			});
		});
	}
}
function uninstall() {
	if(window.updatingPart) return;
	window.updatingPart = true;
	allMenuBtns = document.querySelectorAll('[button-type]');
	allMenuBtns.forEach(e => {e.style.display = "none"});
	menus = document.querySelectorAll("[div-type='menu']");
	menus.forEach(i => {i.classList.remove("show");});
	window.__TAURI__.path.appDataDir().then(ad => {
		window.__TAURI__.fs.exists(ad+"wgame.json").then(a => {
			if(a) {
				window.__TAURI__.fs.readTextFile(ad+"wgame.json").then(partFiles => {
					gcs = JSON.parse(partFiles);
					for(const file in gcs) {
						if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
						else window.__TAURI__.fs.removeFile(gcs[file]);
					}
					window.__TAURI__.fs.removeFile(ad+"wgame.json");
				});
			} else {
				fetch('https://gcs.icu/download/files.php?part=wgame&v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
					for(const file in gcs) {
						if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
						else window.__TAURI__.fs.removeFile(gcs[file]);
					}
				});
			}
			window.__TAURI__.fs.exists(ad+"wmods.json").then(a => {
				if(a) {
					window.__TAURI__.fs.readTextFile(ad+"wmods.json").then(partFiles => {
						gcs = JSON.parse(partFiles);
						for(const file in gcs) {
							if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
							else window.__TAURI__.fs.removeFile(gcs[file]);
						}
						window.__TAURI__.fs.removeFile(ad+"wmods.json");
					});
				} else {
					fetch('https://gcs.icu/download/files.php?part='+window.modmenu+'&v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
						for(const file in gcs) {
							if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
							else window.__TAURI__.fs.removeFile(gcs[file]);
						}
					});
				}
				window.localStorage.v2wgame = 0;
				window.localStorage.v2wmo = 0;
				window.localStorage.v2wmods = 0;
				window.localStorage.v2whm = 0;
				window.localStorage.v2modmenu = 0;
				newUpdate(true);
			});
		});
	})
}
function uninstallMods() {
	if(window.updatingPart) return;
	window.updatingPart = true;
	allMenuBtns = document.querySelectorAll('[button-type]');
	allMenuBtns.forEach(e => {e.style.display = "none"});
	menus = document.querySelectorAll("[div-type='menu']");
	menus.forEach(i => {i.classList.remove("show");});
	window.__TAURI__.path.appDataDir().then(ad => {
		window.__TAURI__.fs.exists(ad+"wmods.json").then(a => {
			if(a) {
				window.__TAURI__.fs.readTextFile(ad+"wmods.json").then(partFiles => {
					gcs = JSON.parse(partFiles);
					for(const file in gcs) {
						if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
						else window.__TAURI__.fs.removeFile(gcs[file]);
					}
					window.__TAURI__.fs.removeFile(ad+"wmods.json");
				});
			} else {
				fetch('https://gcs.icu/download/files.php?part='+window.modmenu+'&v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
					for(const file in gcs) {
						if(gcs[file].endsWith('/')) window.__TAURI__.fs.removeDir(gcs[file], {recursive: true});
						else window.__TAURI__.fs.removeFile(gcs[file]);
					}
				});
			}
			window.localStorage.v2wmo = 0;
			window.localStorage.v2wmods = 0;
			window.localStorage.v2whm = 0;
			window.localStorage.v2modmenu = 0;
			updateQueueFunction();
		});
	});
}
function updateNoModsVar() {
	if(window.nomods) return window.modmenu = "nomods";
	window.modmenu = window.localStorage.modmenu;
	modsMenu = document.querySelectorAll('[menu-type="queue-mods"]');
	modsMenu.forEach(e => {e.style.display = "flex"});
}
function updateAnimations() {
	animStyle = document.getElementById("animations");
	animStyle.innerHTML = `* {
		--anim-settings: ${window.localStorage.animsettings}s;
		--anim-queue: ${window.localStorage.animqueue}s;
		--anim-menu: ${window.localStorage.animmenu}s;
		--anim-hover: ${window.localStorage.animhover}s;
		--anim-pages: ${window.localStorage.animpages}s;
	}`;
	as = ''; if(window.localStorage.animsettings > 0 && window.localStorage.animsettings != 1) as = "ы"; if(window.localStorage.animsettings == 1) as = 'а';
	aq = ''; if(window.localStorage.animqueue > 0 && window.localStorage.animqueue != 1) aq = "ы"; if(window.localStorage.animqueue == 1) aq = 'а';
	am = ''; if(window.localStorage.animmenu > 0 && window.localStorage.animmenu != 1) am = "ы"; if(window.localStorage.animmenu == 1) am = 'а';
	ah = ''; if(window.localStorage.animhover > 0 && window.localStorage.animhover != 1) ah = "ы"; if(window.localStorage.animhover == 1) ah = 'а';
	ah = ''; if(window.localStorage.animpages > 0 && window.localStorage.animpages != 1) ah = "ы"; if(window.localStorage.animpages == 1) ah = 'а';
	document.getElementById("anim-settings-text").innerHTML = window.localStorage.animsettings+' секунд'+as;
	document.getElementById("anim-queue-text").innerHTML = window.localStorage.animqueue+' секунд'+aq;
	document.getElementById("anim-menu-text").innerHTML = window.localStorage.animmenu+' секунд'+am;
	document.getElementById("anim-hover-text").innerHTML = window.localStorage.animhover+' секунд'+ah;
	document.getElementById("anim-pages-text").innerHTML = window.localStorage.animpages+' секунд'+ah;
}
function changePage(page) {
	settingsMenu = document.getElementById('settings-menu');
	settingsButtons = []
	settingsButtons.first = document.getElementById('settings-menu-first');
	settingsButtons.second = document.getElementById('settings-menu-second');
	settingsMenu.classList = "settings-menu "+page;
	document.querySelector(".settings-buttons button.active").classList.remove('active');
	settingsButtons[page].classList = page+" active";
}
function updateParts() {
	queuediv = document.getElementById('queuediv');
	window.update_parts = [];
	return new Promise(r => {
		fetch('https://gcs.icu/download/parts.php?v='+window.localStorage.v2version).then(response => response.json()).then((gcs) => {
			console.log(gcs);
			if(gcs.success) {
				queuediv.innerHTML = "";
				for(const i in gcs.update_parts) {
					update_divs = [];
					update_part = gcs.update_parts[i];
					window.update_parts.push(update_part);
					// Вся карточка
					update_divs.queuelist = document.createElement('div');
					update_divs.queuelist.classList.add("queuelist");
					update_divs.queuelist.id = update_part.id;
					// Иконка
					update_divs.img = document.createElement('img');
					update_divs.img.src = update_part.icon;
					update_divs.img.setAttribute("width", "35px");
					// Текст (название и дата последнего обновления)
					update_divs.queuename = document.createElement("div");
					update_divs.queuename.classList.add("queuename");
					update_divs.queuename.h2 = document.createElement('h2');
					update_divs.queuename.h2.id = update_part.id+"-name";
					update_divs.queuename.h2.innerHTML = update_part.name;
					update_divs.queuename.h2.notify = document.createElement("div");
					update_divs.queuename.h2.notify.classList.add("qcircle");
					update_divs.queuename.h2.notify.style.display = "none";
					update_divs.queuename.h2.notify.id = update_part.id + "-notify-circle";
					update_divs.queuename.h2.notify.img = document.createElement("img");
					update_divs.queuename.h2.notify.img.src = "res/svg/circle.svg";
					update_divs.queuename.h2.notify.img.classList.add("notifycircle");
					update_divs.queuename.h2.notify.img.setAttribute("width", "8px");
					update_divs.queuename.h2.notify.append(update_divs.queuename.h2.notify.img);
					update_divs.queuename.h2.append(update_divs.queuename.h2.notify);
					update_divs.queuename.h3 = document.createElement("h3");
					update_divs.queuename.h3.id = update_part.id+"-progress";
					update_divs.queuename.h3.innerHTML = "Не установлено";
					update_divs.queuename.append(update_divs.queuename.h2, update_divs.queuename.h3);
					// Кнопки
					update_divs.queuebtns = document.createElement('div');
					update_divs.queuebtns.classList.add("queuebtns");
					for(const btns in update_part.buttons) {
						update_button = update_part.buttons[btns];
						update_divs.button = document.createElement("button");
						update_divs.button.classList.add("btn-queue-menu");
						update_divs.button.title = update_button.name;
						update_divs.button.id = update_part.id + "-" + update_button.id;
						update_divs.button.setAttribute("button-type", "queue-button");
						update_divs.button.setAttribute("button-mode", update_button.id);
						update_divs.button.setAttribute('onclick', update_button.function);
						update_divs.button.img = document.createElement("img");
						update_divs.button.img.src = update_button.icon;
						update_divs.button.append(update_divs.button.img);
						update_divs.queuebtns.append(update_divs.button);
					}
					// Менюшки
					update_divs.menudiv = document.createElement("div");
					update_divs.menudiv.classList.add("dropdown-menu");
					update_divs.menudiv.id = update_part.id+"-menu-div";
					update_divs.menudiv.setAttribute("div-type", "menu");
					for(const menus in update_part.menu_buttons) {
						update_menu = update_part.menu_buttons[menus];
						console.log(update_menu);
						update_divs.menubutton = document.createElement("button");
						update_divs.menubutton.setAttribute("menu-type", update_part.id);
						update_divs.menubutton.classList.add("dropdown-item");
						update_divs.menubutton.id = update_part.id + "-" + update_menu.id;
						update_divs.menubutton.setAttribute("onclick", update_menu.function);
						update_divs.menubutton.icondiv = document.createElement("div");
						update_divs.menubutton.icondiv.classList.add("icon");
						update_divs.menubutton.icondiv.img = document.createElement("img");
						update_divs.menubutton.icondiv.img.src = update_menu.icon;
						update_divs.menubutton.icondiv.img.style.margin = "0px 5px";
						update_divs.menubutton.icondiv.img.setAttribute("width", "16px");
						update_divs.menubutton.icondiv.append(update_divs.menubutton.icondiv.img);
						update_divs.menubutton.append(update_divs.menubutton.icondiv);
						update_divs.menubutton.innerHTML += update_menu.name;
						update_divs.menudiv.append(update_divs.menubutton);
					}
					update_divs.queuebtns.append(update_divs.menudiv);
					
					// Соединяем всё вместе
					update_divs.queuelist.append(update_divs.img);
					update_divs.queuelist.append(update_divs.queuename);
					update_divs.queuelist.append(update_divs.queuebtns);
					queuediv.append(update_divs.queuelist);
				}
				queuediv.innerHTML += "<h4 id='randomline'>"+changeLine(true)+"</h4>";
				r(true);
			}
		})
	})
}