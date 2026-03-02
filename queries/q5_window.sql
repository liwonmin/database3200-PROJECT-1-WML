WITH plays AS (
  SELECT
    u.userID,
    u.username,
    s.songID,
    s.title,
    COUNT(*) AS playCount
  FROM LISTEN_HISTORY lh
  JOIN USER u ON u.userID = lh.userID
  JOIN SONG s ON s.songID = lh.songID
  GROUP BY u.userID, u.username, s.songID, s.title
),
ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY userID ORDER BY playCount DESC, title ASC) AS rn
  FROM plays
)
SELECT
  username,
  title AS songTitle,
  playCount
FROM ranked
WHERE rn <= 3
ORDER BY username, playCount DESC, songTitle;