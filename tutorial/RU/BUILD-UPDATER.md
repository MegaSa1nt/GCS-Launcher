Русский | [English](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/EN/BUILD-UPDATER.md)

## Сборка Апдейтера — программы для обновления лаунчера
В будущем вы конечно же захотите обновить лаунчер до последней версии, но вот беда — лаунчер не может перезаписать самого себя. Что делать? Вам поможет Апдейтер — программа для обновления лаунчера
<hr>

Вам нужно скачать исходники Апдейтера, они находятся [вот тут](https://github.com/MegaSa1nt/GCS-Launcher/tree/updater)
<details>
  <summary><i>Как выглядит кнопка скачивания</i></summary>
  <img src="https://github.com/user-attachments/assets/2754fa3f-769a-4712-9224-f364a7e8cf05" />
</details>
<hr>

Распакуйте содержимое архива в любой удобной вам папке
<details>
  <summary><i>Как выглядят распакованные исходники</i></summary>
  <img src="https://github.com/user-attachments/assets/2dd98933-f0e9-4fa0-8753-d7f9913622ed" />
</details>
<hr>

Откройте в этой папке командную строку (Shift + ПКМ -> Открыть в терминале) и выполните команду `npm i`
<details>
  <summary><i>Как выглядит терминал после выполнения</i></summary>
  <img src="https://github.com/user-attachments/assets/2bfb77c9-c3fa-4fe0-b568-b938351fb34d" />
</details>

> [!TIP]  
> Если у вас не установлен `node.js`, то вы можете его установить [по этой ссылке](https://nodejs.org/en/)
<hr>

После установки зависимостей откройте файл `src/script.js`
<details>
  <summary><i>Файл src/script.js</i></summary>
  <img src="https://github.com/user-attachments/assets/49b84989-97cc-4fc0-89e3-7d32cab1c038" />
</details>
<hr>

На строке 19 замените ссылку на ваш бэкэнд обновлений, который вы сделали в предыдущем шаге
> [!NOTE]
> Убедитесь, что ссылка оканчивается на `/`!
<hr>

Код Апдейтера готов, теперь можно настроить сборку программы

<hr>

Зайдите в файл `package.json` и замените `username` на ваш никнейм
<details>
  <summary><i>Файл package.json</i></summary>
  <img src="https://github.com/user-attachments/assets/b9df8380-8e6f-461b-bcd7-17bb3fb898ca" />
</details>
<hr>

Зайдите в файл `src-tauri/tauri.conf.json` и в строках 11, 12, 21 замените название приватки и никнейм на ваши.
<details>
  <summary><i>Файл src-tauri/tauri.conf.json</i></summary>
  <img src="https://github.com/user-attachments/assets/a9d723c0-72dd-4003-a73d-dd19876eaca0" />
</details>
<hr>

Зайдите в файл `src-tauri/Cargo.toml` и в строках 2, 4, 5 замените название приватки и никнейм на ваши.
<details>
  <summary><i>Файл src-tauri/Cargo.toml</i></summary>
  <img src="https://github.com/user-attachments/assets/3e8b90b9-a601-4a74-9343-ec0dbef3ecc4" />
</details>
<hr>

Апдейтер готов к сборке! В главной папке Апдейтера выполните команду `npm run tauri build`
<details>
  <summary><i>Сборка Апдейтера</i></summary>
  <img src="https://github.com/user-attachments/assets/928bfaaf-8d40-48a5-bcb2-3f25a7050f19" />
</details>

> [!NOTE]
> Данный процесс может занять от 5 до 30 минут в зависимости от мощности вашего компьютера.
<hr>

После сборки зайдите в папку `src-tauri/target/release` и найдите файл `updater.exe`. Сохраните его на будущее.
<details>
  <summary><i>Файл updater.exe</i></summary>
  <img src="https://github.com/user-attachments/assets/a66bf96e-545a-4c92-8c6c-de12328d0952" />
</details>
<hr>

Ваш Апдейтер готов!

<hr>

### [Перейти к следующему шагу](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/RU/BUILD-LAUNCHER.md)