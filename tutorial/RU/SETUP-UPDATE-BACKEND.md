Русский | [English](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/EN/SETUP-UPDATE-BACKEND.md)

## Установка бэкэнда обновлений
Для того, чтобы лаунчер мог скачивать обновления, нужно установить место, откуда лаунчер будет скачивать обновления
<hr>

Для начала скачаем [сам бэкэнд](https://github.com/MegaSa1nt/GCS-Client-backend/releases/latest), он находится под кнопкой `Source code`
<details>
  <summary><i>Как выглядит кнопка скачивания</i></summary>
  <img src="https://github.com/user-attachments/assets/a9d27b90-cc95-4194-8299-d442d071ddba" />
</details>
<hr>

Установите его на ваш сервер. Нужно, чтобы можно было открыть бэкэнд в браузере, к примеру, https://updates.gcs.icu
> [!NOTE]  
> Эту часть я объяснять не буду, так как у всех все сервера устроены по-разному, кто-то захочет установить его на бесплатный хостинг, по типу Replit, и так далее.
<hr>

В файлах бэкэнда есть файл `.env.example`, переименуйте его в `.env` и откройте
<details>
  <summary><i>Как выглядит файл .env.example</i></summary>
  <img src="https://github.com/user-attachments/assets/d0d134f2-441d-4f08-aa39-789296e58157" />
</details>

- Первый параметр `PORT` отвечает за порт, на котором будет запущен бэкэнд. Изменяйте его если знаете, что он будет запущен на другом порту или порт `8080` чем-либо занят.
- Второй параметр `TOKEN` отвечает за токен для идентификации. Рекомендуется генерировать токен от 32 символов.
> [!CAUTION]  
> Ни в коем случае не показывайте этот токен **никому**! В противном случае злоумышленник может опубликовать обновление приватки со встроенным вирусом.
<hr>

После того, как мы настроили эти два параметра, можно смело перезапускать бэкэнд.

<hr>

Откройте бэкэнд в браузере. Перед собой вы увидите поле для ввода и кнопку `Login`, в поле нужно ввести токен, который вы указали в `.env`
<details>
  <summary><i>Как должен выглядеть бэкэнд в браузере</i></summary>
  <img src="https://github.com/user-attachments/assets/c93591e0-1574-4781-9d4c-ae1530164749" />
</details>
<hr>

После ввода токена вы увидите 2 кнопки для публикации нового обновления самой приватки и его лаунчера
<details>
  <summary><i>Как выглядит бэкэнд после авторизации</i></summary>
  <img src="https://github.com/user-attachments/assets/b08199b3-96eb-4f18-a510-97be9529c879" />
</details>
<hr>

Пока что нам нужна только первая кнопка, загрузите в неё архив с вашей приваткой
<details>
  <summary><i>Как выглядит загрузка обновления вашей приватки</i></summary>
  <img src="https://github.com/user-attachments/assets/ceb8a1e6-44c4-40f5-ab69-0bda6c7d7ce4" />
</details>

> [!IMPORTANT]
> Игра должна быть в **корневой папке** архива! Никаких подпапок не должно быть, иначе игра просто не сможет запуститься.
> <details>
>   <summary><i>Как НЕ должен выглядить архив</i></summary>
>   <img src="https://github.com/user-attachments/assets/555b164b-e2fd-41df-b8fc-b6ae4e88763e" />
> </details>
> <details>
>   <summary><i>Как должен выглядить архив</i></summary>
>   <img src="https://github.com/user-attachments/assets/cc2b60b9-fca2-4403-bf8f-5c3526588666" />
> </details>
<hr>

После загрузки архива бэкэнд напишет `File uploaded`, и теперь вам нужно зайти в консоль бэкэнда
<details>
  <summary><i>Как выглядит загруженное обновление</i></summary>
  <img src="https://github.com/user-attachments/assets/f4eb829f-7060-452f-a0c1-6ed2332727f7" />
</details>
<hr>

В консоли будет очень много строк, так как бэкэнд обрабатывает каждый файл, вам нужно дождаться надписи `Everything is done`
<details>
  <summary><i>Как выглядит обработанное и готовое к скачиванию обновление</i></summary>
  <img src="https://github.com/user-attachments/assets/a39ef59d-5f5c-450d-87f7-700a19305317" />
</details>
<hr>

> [!TIP]
> Для обновления приватки вам нужно будет повторить эти действия.
> 
> Если при обновлении возникла какая-то ошибка и бэкэнд перестал что-либо делать или вовсе выключился/перезапустился, пришлите ошибку в [issues репозитория](https://github.com/MegaSa1nt/GCS-Client-backend/issues)
<hr>

Поздравляю, ваш бэкэнд лаунчера готов к использованию! Теперь просто запомните ссылку на него.

<hr>

### [Перейти к следующему шагу](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/RU/BUILD-UPDATER.md)