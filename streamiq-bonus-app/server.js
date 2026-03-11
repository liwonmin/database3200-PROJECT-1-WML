const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'db');
const DB_PATH = path.join(DB_DIR, 'streamiq_bonus.db');
const INIT_SQL_PATH = path.join(DB_DIR, 'init.sql');
const SEED_SQL_PATH = path.join(DB_DIR, 'seed.sql');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  const initSql = fs.readFileSync(INIT_SQL_PATH, 'utf8');
  db.exec(initSql, (err) => {
    if (err) {
      console.error('Error initializing schema:', err.message);
      return;
    }

    db.get('SELECT COUNT(*) AS count FROM ARTIST', (countErr, row) => {
      if (countErr) {
        console.error('Error checking seed data:', countErr.message);
        return;
      }

      if (row.count === 0) {
        const seedSql = fs.readFileSync(SEED_SQL_PATH, 'utf8');
        db.exec(seedSql, (seedErr) => {
          if (seedErr) {
            console.error('Error seeding database:', seedErr.message);
          } else {
            console.log('Database seeded successfully.');
          }
        });
      }
    });
  });
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

app.get('/', async (req, res) => {
  try {
    const artistCount = await get('SELECT COUNT(*) AS count FROM ARTIST');
    const albumCount = await get('SELECT COUNT(*) AS count FROM ALBUM');
    const recentAlbums = await all(`
      SELECT al.albumID, al.title, al.releaseDate, al.albumType, ar.name AS artistName
      FROM ALBUM al
      JOIN ARTIST ar ON al.artistID = ar.artistID
      ORDER BY al.albumID DESC
      LIMIT 5
    `);

    res.render('home', {
      artistCount: artistCount.count,
      albumCount: albumCount.count,
      recentAlbums
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/artists', async (req, res) => {
  try {
    const artists = await all(`
      SELECT a.*, COUNT(al.albumID) AS albumCount
      FROM ARTIST a
      LEFT JOIN ALBUM al ON a.artistID = al.artistID
      GROUP BY a.artistID
      ORDER BY a.name
    `);
    res.render('artists/index', { artists });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/artists/new', (req, res) => {
  res.render('artists/new');
});

app.post('/artists', async (req, res) => {
  const { name, country, primaryGenre, bio } = req.body;
  try {
    await run(
      'INSERT INTO ARTIST (name, country, primaryGenre, bio) VALUES (?, ?, ?, ?)',
      [name, country || null, primaryGenre || null, bio || null]
    );
    res.redirect('/artists');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/artists/:id/edit', async (req, res) => {
  try {
    const artist = await get('SELECT * FROM ARTIST WHERE artistID = ?', [req.params.id]);
    if (!artist) return res.status(404).send('Artist not found');
    res.render('artists/edit', { artist });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/artists/:id', async (req, res) => {
  const { name, country, primaryGenre, bio } = req.body;
  try {
    await run(
      `UPDATE ARTIST
       SET name = ?, country = ?, primaryGenre = ?, bio = ?
       WHERE artistID = ?`,
      [name, country || null, primaryGenre || null, bio || null, req.params.id]
    );
    res.redirect('/artists');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/artists/:id', async (req, res) => {
  try {
    const albumCount = await get('SELECT COUNT(*) AS count FROM ALBUM WHERE artistID = ?', [req.params.id]);
    if (albumCount.count > 0) {
      return res.status(400).send('Cannot delete artist with existing albums. Delete the albums first.');
    }
    await run('DELETE FROM ARTIST WHERE artistID = ?', [req.params.id]);
    res.redirect('/artists');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/albums', async (req, res) => {
  try {
    const albums = await all(`
      SELECT al.*, ar.name AS artistName
      FROM ALBUM al
      JOIN ARTIST ar ON al.artistID = ar.artistID
      ORDER BY al.title
    `);
    res.render('albums/index', { albums });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/albums/new', async (req, res) => {
  try {
    const artists = await all('SELECT artistID, name FROM ARTIST ORDER BY name');
    res.render('albums/new', { artists });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/albums', async (req, res) => {
  const { title, releaseDate, albumType, coverImageURL, artistID } = req.body;
  try {
    await run(
      `INSERT INTO ALBUM (title, releaseDate, albumType, coverImageURL, artistID)
       VALUES (?, ?, ?, ?, ?)`,
      [title, releaseDate || null, albumType, coverImageURL || null, artistID]
    );
    res.redirect('/albums');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/albums/:id/edit', async (req, res) => {
  try {
    const album = await get('SELECT * FROM ALBUM WHERE albumID = ?', [req.params.id]);
    const artists = await all('SELECT artistID, name FROM ARTIST ORDER BY name');
    if (!album) return res.status(404).send('Album not found');
    res.render('albums/edit', { album, artists });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/albums/:id', async (req, res) => {
  const { title, releaseDate, albumType, coverImageURL, artistID } = req.body;
  try {
    await run(
      `UPDATE ALBUM
       SET title = ?, releaseDate = ?, albumType = ?, coverImageURL = ?, artistID = ?
       WHERE albumID = ?`,
      [title, releaseDate || null, albumType, coverImageURL || null, artistID, req.params.id]
    );
    res.redirect('/albums');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/albums/:id', async (req, res) => {
  try {
    await run('DELETE FROM ALBUM WHERE albumID = ?', [req.params.id]);
    res.redirect('/albums');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`StreamIQ bonus app running at http://localhost:${PORT}`);
});
