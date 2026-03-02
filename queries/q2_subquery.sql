SELECT
  s.songID,
  s.title,
  s.duration,
  s.albumID
FROM SONG s
WHERE s.duration >
  (SELECT AVG(s2.duration)
   FROM SONG s2
   WHERE s2.albumID = s.albumID)
ORDER BY s.albumID, s.duration DESC
LIMIT 25;
