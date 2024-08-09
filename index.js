const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// コードスニペットを保存するエンドポイント
app.post('/snippets', async (req, res) => {
  const { title, html, css, js } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO snippets (title, html, css, js) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, html, css, js]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// コードスニペットを取得するエンドポイント
app.get('/snippets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM snippets WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Snippet not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// サーバーを起動する
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
