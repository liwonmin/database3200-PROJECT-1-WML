SELECT
  u.username,
  lh.timestamp,
  s.title AS songTitle,
  al.title AS albumTitle,
  ar.name  AS primaryArtist
FROM LISTEN_HISTORY lh
JOIN USER u   ON u.userID = lh.userID
JOIN SONG s   ON s.songID = lh.songID
JOIN ALBUM al ON al.albumID = s.albumID
JOIN ARTIST ar ON ar.artistID = al.artistID
ORDER BY lh.timestamp DESC
LIMIT 25;
