# Playlistah ```1.0```

*Collaborative Playlists for Youtube*

BETA:       https://playlistah.herokuapp.com/
RELEASE:    https://playlistah.davegabe.it/
---
## Features

- **Create playlists**:     Choose a name and create or join a playlist.
- **Add videos**:           Directly search on YouTube and add videos!
- **Remove videos**:        If you're a guest, you can remove only your videos. If you're the admin, you can remove everything. It's all about power.
- **Youtube player**:       You can directly play the playlist!
- **Temporary playlists**:  Ephemeral playlists? Thats it! Just add, play and see the videos disappear one by one. Enjoy the ephemerality! (Yah, it's also useful for streamers... I guess)
- **Sockets**:              When someone changes something in the playlist, you'll directly get the update.
- **Responsive**:           Better user experience from any device.
---
## Future Improvements

- **Votes for positions in playlist**

- **Downloader(?)**
---
## Setup

- Clone repo
- Install dependencies
- Create a mongodb
- Create .env file with:
    - DB_HOST: url db
    - DB_USER: user db
    - DB_PASS: password db
    - COOKIE_SECRET: key used for encrypting cookie
    - GAPI_KEY: key for Youtube APIs (https://developers.google.com/youtube/registering_an_application)
- That's it. Now ```npm run``` and you'll find it at *localhost:2728*
