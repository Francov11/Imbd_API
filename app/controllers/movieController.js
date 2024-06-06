const axios = require('axios');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig.js');

const fetchAndStoreMovies = async (req, res) => {
    try {
        const response = await axios.get('https://imdb-top-100-movies.p.rapidapi.com/', {
            headers: {
                'x-rapidapi-key': '0c9c4624f4msh7e8076ace145d49p1fddcajsn98d777b6ecc3',
                'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com'
            }
        });

        const movies = response.data;

        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS movies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rank INT,
                title VARCHAR(255),
                description TEXT,
                image VARCHAR(512),
                big_image VARCHAR(512),
                genre VARCHAR(255),
                thumbnail VARCHAR(512),
                rating FLOAT,
                imdbid VARCHAR(255),
                year INT,
                imdb_link VARCHAR(512)
            );
        `);

        for (const movie of movies) {
            await connection.execute(`
                INSERT INTO movies (rank, title, description, image, big_image, genre, thumbnail, rating, imdbid, year, imdb_link)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                movie.rank,
                movie.title,
                movie.description,
                movie.image,
                movie.big_image,
                movie.genre,
                movie.thumbnail,
                parseFloat(movie.rating),
                movie.imdbid,
                movie.year,
                movie.imdb_link
            ]);
        }

        await connection.end();

        res.json({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch and store data' });
    }
};

const getMovies = async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM movies');
        await connection.end();

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
};

module.exports = {
    fetchAndStoreMovies,
    getMovies
};
