[Русский](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/RU/BUILD-UPDATER.md) | English

## Build Updater — app for updating launcher
Of course you would like to update launcher in future, but there is a problem — launcher can't overwrite itself. What to do? Updater will help you!
<hr>

You need to download source code of Updater [here](https://github.com/MegaSa1nt/GCS-Launcher/tree/updater)
<details>
  <summary><i>How download button looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/2754fa3f-769a-4712-9224-f364a7e8cf05" />
</details>
<hr>

Extract Updater archive somewhere
<details>
  <summary><i>How source code looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/2dd98933-f0e9-4fa0-8753-d7f9913622ed" />
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

After installing dependencies open file `src/script.js`
<details>
  <summary><i>File src/script.js</i></summary>
  <img src="https://github.com/user-attachments/assets/71838c33-613c-4f9d-a455-197ff25a6e5f" />
</details>
<hr>

In line 19 change backend link to your, you made it in previous step
> [!NOTE]
> Make sure it ends with `/`!
<hr>

Updater's code is ready, now we can setup building it

<hr>

Open file `package.json` and change `username` to your username
<details>
  <summary><i>File package.json</i></summary>
  <img src="https://github.com/user-attachments/assets/deb51f7b-873f-4b58-863c-aa52823917e4" />
</details>
<hr>

Open file `src-tauri/tauri.conf.json` and change GDPS name and username to yours in lines 11, 12, 21.
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

Updater is ready to build! In main Updater folder run command `npm run tauri build`
<details>
  <summary><i>Building Launcher</i></summary>
  <img src="https://github.com/user-attachments/assets/928bfaaf-8d40-48a5-bcb2-3f25a7050f19" />
</details>

> [!NOTE]
> This process can take from 5 to 30 minutes, depending on performance of your PC.
<hr>

After building open folder `src-tauri/target/release` and find file `updater.exe`. Save it for future.
<details>
  <summary><i>File updater.exe</i></summary>
  <img src="https://github.com/user-attachments/assets/eb9bedc2-fe47-444f-93e3-53fcc3d2b414" />
</details>
<hr>

Your Updater is ready!

<hr>

### [Next step](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/RU/BUILD-LAUNCHER.md)