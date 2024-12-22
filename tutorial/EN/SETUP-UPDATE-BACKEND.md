[Русский](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/RU/SETUP-UPDATE-BACKEND.md) | English

## Setup update backend
To be able to download GDPS updates, we need to host it on our server
<hr>

At first download [backend](https://github.com/MegaSa1nt/GCS-Client-backend/releases/latest), it will be available under button `Source code`
<details>
  <summary><i>How download button looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/a9d27b90-cc95-4194-8299-d442d071ddba" />
</details>
<hr>

Install it on your server. It should be available in browser, for example, https://updates.gcs.icu
> [!NOTE]  
> I won't explain this part, as all servers act different, someone would try to install it to free hosting as Replit, and etc.
<hr>

There is file `.env.example` in backend files, rename it to `.env` and open
<details>
  <summary><i>How file .env.example looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/d0d134f2-441d-4f08-aa39-789296e58157" />
</details>
<hr>

- First parameter `PORT` is port, which will be used by backend. Change it if you know, that you will run backend on different port or port `8080` is already used.
- Second parameter `TOKEN` is authentication token. It's recommended to generate token with 32 characters length or higher.
> [!CAUTION]  
> **NEVER** share this token with anyone! Otherwise bad guy could upload GDPS update with virus in it.
<hr>

After setting these two parameters, we can restart backend.

<hr>

Open backend in browser. You will see login input and button `Login`, enter token you put into `.env` to login input
<details>
  <summary><i>How backend should look in browser</i></summary>
  <img src="https://github.com/user-attachments/assets/061daeaf-74c5-443d-89c3-69220a76572e" />
</details>
<hr>

After authenticating you will see 2 buttons for publishing new GDPS and launcher updates
<details>
  <summary><i>How backend looks like after authenticating</i></summary>
  <img src="https://github.com/user-attachments/assets/b08199b3-96eb-4f18-a510-97be9529c879" />
</details>
<hr>

For now we only need first button, upload archive with your GDPS in it
<details>
  <summary><i>How uploading update looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/ceb8a1e6-44c4-40f5-ab69-0bda6c7d7ce4" />
</details>

> [!IMPORTANT]
> Game must be in **root archive folder**! There must not be any subfolders as game simply won't run.
> <details>
>   <summary><i>How archive should NOT look like</i></summary>
>   <img src="https://github.com/user-attachments/assets/85c6f3d6-4598-405d-915f-33741784d351" />
> </details>
> <details>
>   <summary><i>How archive should look like</i></summary>
>   <img src="https://github.com/user-attachments/assets/ca16add1-bfad-4b7d-af48-bd1f0f3bb7d8" />
> </details>
<hr>

After uploading backend will return `File uploaded` and now you need to open backend's console
<details>
  <summary><i>How uploaded update looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/f4eb829f-7060-452f-a0c1-6ed2332727f7" />
</details>
<hr>

There will be many lines in console, as backend is processing every file, wait for `Everything is done` text
<details>
  <summary><i>How processed and ready to download update looks like</i></summary>
  <img src="https://github.com/user-attachments/assets/a39ef59d-5f5c-450d-87f7-700a19305317" />
</details>
<hr>

> [!TIP]
> For updating GDPS you need to repeat these steps.
> 
> If error appeared and backend stopped doing anything or even crashed/restarted, please send error to [repository issues](https://github.com/MegaSa1nt/GCS-Client-backend/issues)
<hr>

Congratulations, your backend is ready to work! Now just remember its link.

### [Next step](https://github.com/MegaSa1nt/GCS-Client/blob/new/tutorial/RU/BUILD-UPDATER.md)