Русский | [English](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/EN/BUILD-LAUNCHER.md)

## Настройка и сборка лаунчера
Начинается мякотка гайда — сам лаунчер
<hr>

Скачайте исходники лаунчера, они находятся [вот тут](https://github.com/MegaSa1nt/GCS-Launcher/tree/new)
<details>
  <summary><i>Как выглядит кнопка скачивания</i></summary>
  <img src="https://github.com/user-attachments/assets/2754fa3f-769a-4712-9224-f364a7e8cf05" />
</details>
<hr>

Распакуйте содержимое архива в любой удобной вам папке
<details>
  <summary><i>Как выглядит распакованные исходники</i></summary>
  <img src="https://github.com/user-attachments/assets/8b7fbc8c-92bc-4e3b-b738-1bf90b2a056d" />
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

Откройте файл `src/libs/library.js` и прокрутите до строки `library.getSettings`, в данном случае она на строке 111
<details>
  <summary><i>Файл src/libs/library.js</i></summary>
  <img src="https://github.com/user-attachments/assets/b974b00c-65ec-45ff-8524-6f687a959b31" />
</details>

- `updates_api_url` — ссылка на бэкэнд обновлений, вы сделали её в первом шаге
- `dashboard_api_url` — ссылка на папку `api` в Dashboard'е вашей приватки. *Пример: https://example.com/dashboard/api/*
- `gdps_name` — название вашей приватки, будет отображаться в лаунчере
- `game_exe` — файл, который будет запускать лаунчер. Обязан быть в той же папке, что и лаунчер
> [!NOTE]
> Убедитесь, что ссылки в `updates_api_url` и `dashboard_api_url` оканчиваются на `/`!
<hr>

Код лаунчера готов, теперь можно настроить сборку лаунчера
<hr>

Зайдите в файл `package.json` и замените `gdps` на название вашей приватки
<details>
  <summary><i>Файл package.json</i></summary>
  <img src="https://github.com/user-attachments/assets/b6bd595c-8799-4a35-8d8b-f925483289c0" />
</details>
<hr>

Зайдите в файл `src-tauri/tauri.conf.json` и в строках 13, 14, 38 замените название приватки и никнейм на ваши.
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

Закиньте файл `updater.exe`, который вы создали в предыдущем шаге, в папку `src-tauri`
<details>
  <summary><i>Апдейтер в папке лаунчера</i></summary>
  <img src="https://github.com/user-attachments/assets/85ac010f-6491-4837-9a8b-76d26140f750" />
</details>
<hr>

Лаунчер готов к сборке! Откройте файл `run.bat` и выберите второй пункт
<details>
  <summary><i>Сборка лаунчера</i></summary>
  <img src="https://github.com/user-attachments/assets/f646516d-8b2f-450a-bddb-823854c6bc59" />
</details>

> [!NOTE]
> Данный процесс может занять от 5 до 30 минут в зависимости от мощности вашего компьютера.

<hr>

После сборки лаунчера в папке `src-tauri/target/release/bundle/nsis` появится установщик вашего лаунчера, именно его нужно открывать при первой установке лаунчера

Установите ваш лаунчер в какую-либо папку
<details>
  <summary><i>Установленный лаунчер</i></summary>
  <img src="https://github.com/user-attachments/assets/cbc94d51-b8d4-4818-b530-020905531c3a" />
</details>

> [!WARNING]
> Удостоверьтесь, что в пути к лаунчеру нет кириллицы или пробелов, так как это может вызвать проблемы с игрой.

<hr>

Запакуйте все файлы лаунчера, **КРОМЕ `updater.exe`**
<details>
  <summary><i>Запакованный лаунчер</i></summary>
  <img src="https://github.com/user-attachments/assets/bf5eda9b-b98c-4b65-82b8-e150eeecbc53" />
</details>

> [!WARNING]
> **НЕ** добавляйте файл `updater.exe` в архив, так как это вызовет проблемы при обновлении лаунчера.

<hr>

Загрузите архив с лаунчером в бэкэнд обновлений
<details>
  <summary><i>Загрузка обновления лаунчера</i></summary>
  <img src="https://github.com/user-attachments/assets/9dfcf4fa-42aa-4491-95a2-89ff760cab86" />
</details>
<hr>

После завершения загрузки обновления зайдите в файлы бэкэнда обновлений и найдите файл `launcher_version`, откройте его
<details>
  <summary><i>Файл launcher_version</i></summary>
  <img src="https://github.com/user-attachments/assets/e1ddcb18-9c7c-4dee-8403-3633ac4b1cc3" />
</details>
<hr>

Замените в нём версию на ту, что находится в вашем лаунчере в файле `package.json`
<details>
  <summary><i>Версия лаунчера</i></summary>
  <img src="https://github.com/user-attachments/assets/849db386-12a2-4a79-b0cc-80934a0bef47" />
</details>
<hr>

### Ваш лаунчер готов к использованию!