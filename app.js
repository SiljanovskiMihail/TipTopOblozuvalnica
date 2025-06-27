const express = require('express');
const path = require('path');
const pool = require('./database.js');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000; 

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/api/poraki', async (req, res) => {
    const { imePrezime, email, poraka } = req.body;

    if (!imePrezime || !email || !poraka) {
        return res.status(400).json({ success: false, message: 'All fields (imePrezime, email, poraka) are required.' });
    }
    if (imePrezime.length > 255 || email.length > 255 || poraka.length > 255) {
         return res.status(400).json({ success: false, message: 'Input fields cannot exceed 255 characters.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    try {
        const [rows, fields] = await pool.execute(
            'CALL InsertPoraka(?, ?, ?)',
            [imePrezime, email, poraka]
        );

        const insertedId = rows[0] && rows[0][0] ? rows[0][0].id : null;

        res.status(201).json({
            success: true,
            message: 'Вашата порака е успешно испратена!',
            id: insertedId 
        });

    } catch (error) {
        console.error('Error calling stored procedure InsertPoraka:', error.message);
        res.status(500).json({
            success: false,
            message: 'Вашата порака не е испратена!'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press CTRL-C to stop the server');
});
