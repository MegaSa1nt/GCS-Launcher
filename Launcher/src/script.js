gDs = "https://gcs.icu"; // Your GDPS link to dashboard (doesn't work with default Cvolton's dashboard)
const wait = ms => new Promise(r => setTimeout(r, ms));
function update(ask = false, err = '') {
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
									await zipFile(plsdatapls, filename);
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
									}
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
		while(window.dontplayagain) await wait(2001);
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
		prog.value = l;
		if(l % 10 == 1) document.getElementById("ploaded").innerHTML = l +" файл";
		else if(l % 10 > 1 && l % 10 < 5 && l % 10 != 0) document.getElementById("ploaded").innerHTML = l +" файла";
		else document.getElementById("ploaded").innerHTML = l +" файлов";
		if(fileData.length < 5242880) {
			window.__TAURI__.fs.writeBinaryFile(filename, fileData).then(r => {
				window.gc();
				resolve(r);
			}).catch(e => {
				resolve(false);
			});
		} else {
			arrayb = fileData.buffer;
			resolve(sendArrayBufferToRust(filename, arrayb));
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
		if((result.client && result.client > cook["client"]) && cook['client'] != 0) {
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
	updateOnlineStatus();
	if(condition.length && condition == 'offline') {
		document.getElementById("nointernet").style.opacity = "1";
		document.getElementById("nointernet").style.visibility = "initial";
		setTimeout(function(){updateUser();}, 5000);
		return;
	}
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
		chk.onload = function () {
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
			document.getElementById("loaddiv").style.opacity = "0";
			document.getElementById("loaddiv").style.visibility = "hidden";
			if(typeof window.localStorage.warn == "undefined") {
				document.getElementById("warndiv").style.opacity = "1";
				document.getElementById("warndiv").style.visibility = "initial";
			}
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
		document.getElementById("loaddiv").style.opacity = "0";
		document.getElementById("loaddiv").style.visibility = "hidden";
		if(typeof window.localStorage.warn == "undefined") {
			document.getElementById("warndiv").style.opacity = "1";
			document.getElementById("warndiv").style.visibility = "initial";
		}
	}
	document.getElementById("nointernet").style.opacity = "0";
	document.getElementById("nointernet").style.visibility = "hidden";
	if(!window.dontupdate) clientUpdate(true);
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
			else if(!window.dontupdate) update(true, "-1");
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
function updateOnlineStatus() {
    condition = navigator.onLine ? "online" : "offline";
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