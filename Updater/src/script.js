		function clientUpdate() {
			sd = new XMLHttpRequest();
			sd.open("GET", "https://gcs.icu/download/updater.php", true);
			sd.onload = function () {
				result = JSON.parse(sd.response);
				text.innerHTML = "Обновление клиента...";
				dl = new XMLHttpRequest();
				dl.open("GET", "https://gcs.icu/download/updater.php?dl=client", true);
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
						window.__TAURI__.fs.writeBinaryFile("GCS-Client.exe", filel).then(res=>{
							document.getElementById("ploaded").innerHTML = "";
							document.getElementById("ptxt").innerHTML = "Перезагрузка..."
							document.getElementById("pmax").innerHTML = "";
							prog.value = 0;
							window.__TAURI__.shell.open("GCS-Client.exe").then(res=>{
								prog.value = prog.max;
								window.__TAURI__.process.exit(0);
							});
						})
					})
				}
				dl.send();
			}
			sd.send();
		}