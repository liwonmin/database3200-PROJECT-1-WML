SELECT
  s.title,
  COUNT(*) AS playCount,
  SUM(lh.playDuration) AS totalSecondsPlayed
FROM LISTEN_HISTORY lh
JOIN SONG s ON s.songID = lh.songID
GROUP BY s.songID, s.title
HAVING COUNT(*) >= 3
ORDER BY playCount DESC, totalSecondsPlayed DESC
LIMIT 20;
