SELECT
  s.title AS songTitle,
  ar.name AS primaryArtist,
  al.title AS albumTitle,
  s.isExplicit,
  s.duration,
  al.releaseDate,
  ar.primaryGenre
FROM SONG s
JOIN ALBUM al ON al.albumID = s.albumID
JOIN ARTIST ar ON ar.artistID = al.artistID
WHERE
  (s.isExplicit = 1 OR s.duration >= 180)
  AND (al.releaseDate >= '2000-01-01' OR al.releaseDate IS NULL)
  AND (ar.primaryGenre LIKE '%pop%' OR ar.primaryGenre LIKE '%hip%' OR ar.primaryGenre LIKE '%elect%')
ORDER BY al.releaseDate DESC, s.duration DESC
LIMIT 25;