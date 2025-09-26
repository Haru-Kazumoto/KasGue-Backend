import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

app.use(express.json());

app.get('/check/server', function(req, response) {
    response.send('Server is running');
});

app.get("/check/db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

app.listen(PORT, function() {
    console.log("Server is running on port " + PORT);
});