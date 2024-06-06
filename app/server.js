const express = require('express');
const movieController = require('./controllers/movieController.js');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = require('./config/dbConfig.js');

const app = express();
const port = 3000;

// Configuración de EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/fetch-and-store', movieController.fetchAndStoreMovies);

app.get('/movies', movieController.getMovies);

app.get('/', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM movies');
        await connection.end();

        res.render('home', { movies: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
