# StreamIQ Bonus App

This is a basic Node + Express + SQLite app that completes the optional bonus requirement for the CS3200 project.

## What it does
- Full CRUD for `ARTIST`
- Full CRUD for `ALBUM`
- `ALBUM.artistID` is a foreign key to `ARTIST.artistID`
- Uses EJS views for a simple interface

## Run it
```bash
npm install
npm start
```

Then open `http://localhost:3000`

## Notes
- The app automatically creates `db/streamiq_bonus.db`
- It also seeds sample artist and album data the first time it runs
- This app is intentionally simple so it matches the assignment bonus scope

## Important note about your current schema
Your repo's `schemas/create_tables` file appears to have a syntax issue in `PLAYLIST_SONG` because `UNIQUE (playlistID, position)` is placed before the column definitions without a separating comma. This bonus app avoids that problem by using the `ARTIST` and `ALBUM` part of your model, which already satisfies the foreign key requirement.
