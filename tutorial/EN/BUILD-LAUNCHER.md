[Русский](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/RU/BUILD-LAUNCHER.md) | English

## Setup and build launcher
Now we need to build launcher itself
<hr>

Download launcher's source code [here](https://github.com/MegaSa1nt/GCS-Launcher/tree/new)
<details>
  <summary><i>How download button looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/2754fa3f-769a-4712-9224-f364a7e8cf05" />
</details>
<hr>

Extract archive somewhere
<details>
  <summary><i>How source code looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/8b7fbc8c-92bc-4e3b-b738-1bf90b2a056d" />
</details>
<hr>

Open Command Prompt in this folder (Shift + RMB -> Open in terminal) and run command `npm i`
<details>
  <summary><i>How terminal looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/2bfb77c9-c3fa-4fe0-b568-b938351fb34d" />
</details>

> [!TIP]  
> If you don't have `node.js`, you can [install it](https://nodejs.org/en/)
<hr>

Open file `src/libs/library.js` and find line `library.getSettings`, in this example its on line 111
<details>
  <summary><i>File src/libs/library.js</i></summary>
  <img src="https://github.com/user-attachments/assets/324099c3-847d-44e8-8a33-35fe4a97210b" />
</details>

- `updates_api_url` — link to updates backend, you made it in first step
- `dashboard_api_url` — link to `api` folder in your GDPS's Dashboard. *Example: https://example.com/dashboard/api/*
- `gdps_name` — name of your GDPS, will show in launcher
- `game_exe` — launcher will open this file. Must be in same folder as launcher
> [!NOTE]
> Make sure `updates_api_url` and `dashboard_api_url` ends with `/`!
<hr>

Launcher's code is ready, now we can setup building it
<hr>

Open file `package.json` and change `gdps` to your GDPS's name
<details>
  <summary><i>File package.json</i></summary>
  <img src="https://github.com/user-attachments/assets/b6bd595c-8799-4a35-8d8b-f925483289c0" />
</details>
<hr>

Open file `src-tauri/tauri.conf.json` and change GDPS name and username to yours in lines 13, 14, 38.
<details>
  <summary><i>File src-tauri/tauri.conf.json</i></summary>
  <img src="https://github.com/user-attachments/assets/a9d723c0-72dd-4003-a73d-dd19876eaca0" />
</details>
<hr>

Open file `src-tauri/Cargo.toml` and change GDPS name and username to yours in lines 2, 4, 5.
<details>
  <summary><i>File src-tauri/Cargo.toml</i></summary>
  <img src="https://github.com/user-attachments/assets/3e8b90b9-a601-4a74-9343-ec0dbef3ecc4" />
</details>
<hr>

Put file `updater.exe` into folder `src-tauri`, you made this file in previous step
<details>
  <summary><i>Updater in launcher's folder</i></summary>
  <img src="https://github.com/user-attachments/assets/85ac010f-6491-4837-9a8b-76d26140f750" />
</details>
<hr>

Launcher is ready for building! Open file `run.bat` and choose second variant
<details>
  <summary><i>Building launcher</i></summary>
  <img src="https://github.com/user-attachments/assets/f646516d-8b2f-450a-bddb-823854c6bc59" />
</details>

> [!NOTE]
> This process can take from 5 to 30 minutes, depending on performance of your PC.

<hr>

After building launcher's installer will appear in folder `src-tauri/target/release/bundle/nsis`, you need to open it for installing launcher

Install your launcher to some folder
<details>
  <summary><i>Installed launcher</i></summary>
  <img src="https://github.com/user-attachments/assets/cbc94d51-b8d4-4818-b530-020905531c3a" />
</details>

> [!WARNING]
> Make sure there is no cyrillic characters or spaces in path to game as it could cause some problems.

<hr>

Pack all launcher files **EXCEPT `updater.exe`**
<details>
  <summary><i>Packed launcher</i></summary>
  <img src="https://github.com/user-attachments/assets/bf5eda9b-b98c-4b65-82b8-e150eeecbc53" />
</details>

> [!WARNING]
> Do **NOT** add `updater.exe` to archive, as it will cause problems when updating.

<hr>

Upload launcher archive to updates backend
<details>
  <summary><i>Uploading launcher</i></summary>
  <img src="https://github.com/user-attachments/assets/9dfcf4fa-42aa-4491-95a2-89ff760cab86" />
</details>
<hr>

After uploading go to updates backend files and find file `launcher_version`, open it
<details>
  <summary><i>File launcher_version</i></summary>
  <img src="https://github.com/user-attachments/assets/e1ddcb18-9c7c-4dee-8403-3633ac4b1cc3" />
</details>
<hr>

Replace version in it with your launcher's version, find it in`package.json`
<details>
  <summary><i>Launcher version</i></summary>
  <img src="https://github.com/user-attachments/assets/849db386-12a2-4a79-b0cc-80934a0bef47" />
</details>
<hr>

### Your launcher is ready to work!