require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./database.js'); 
const bcrypt = require('bcrypt');
const app = express();
const session = require('express-session');
const multer = require('multer');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname));



/*
* =========================================
* SESSION MIDDLEWARE SETUP (In-Memory)
* =========================================
*/
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));






// 1. Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/ids/'); // Make sure this directory exists!
    },
    filename: function (req, file, cb) {
        // Create a unique filename to avoid overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });






/*
* =========================================
* INDEX ROUTE
* =========================================
*/
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});




// Admin access control middleware
function isAdmin(req, res, next) {
    if (req.session.loggedIn && req.session.username === 'ADMIN') {
        next(); 
    } else {
        console.log(`Access denied for user: ${req.session.username || 'Guest'}`);
        res.redirect('/'); 
    }
}



/*
* =========================================
* ADMIN ROUTE
* =========================================
*/
app.get('/admin', isAdmin,(req, res) => {
    res.sendFile(__dirname + '/views/adminPanel.html');
});



// New: GET single match by ID (for edit modal)
app.get('/api/matches/:match_id_str', async (req, res) => {
    const { match_id_str } = req.params;
    try {
        const sql = `
            SELECT
                m.*,
                o.id AS odd_db_id,
                o.odd_type,
                o.odd_value,
                o.is_main_odd
            FROM
                matches m
            LEFT JOIN
                odds o ON m.match_id_str = o.match_id_str
            WHERE
                m.match_id_str = ?
            ORDER BY
                o.is_main_odd DESC,
                CASE o.odd_type
                    WHEN '1' THEN 1
                    WHEN 'X' THEN 2
                    WHEN '2' THEN 3
                    ELSE 4
                END,
                o.odd_type;
        `;
        const [rows] = await pool.query(sql, [match_id_str]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Match not found.' });
        }

        const match = {
            match_id_str: rows[0].match_id_str,
            match_time: rows[0].match_time,
            sport_display_name: rows[0].sport_display_name,
            team1: rows[0].team1,
            team2: rows[0].team2,
            odds: []
        };

        rows.forEach(row => {
            if (row.odd_type) {
                match.odds.push({
                    odd_db_id: row.odd_db_id,
                    odd_type: row.odd_type,
                    odd_value: parseFloat(row.odd_value),
                    is_main_odd: !!row.is_main_odd
                });
            }
        });

        res.json(match);
    } catch (err) {
        console.error('Database query error (GET single match):', err);
        res.status(500).json({ error: 'Грешка при превземање на утакмиците.' });
    }
});


// New: POST (Add) a new match and its odds
// POST (Add) a new match and its odds
app.post('/api/matches', async (req, res) => {
    // Note: The frontend now sends match_id_num, which is just the number.
    const { match_id_num, sport_display_name, team1, team2, match_time, odds } = req.body;

    if (!match_id_num || !sport_display_name || !team1 || !team2 || !match_time) {
        return res.status(400).json({ error: 'Сите полиња треба да се пополнат.' });
    }

    try {
        // Convert the odds array to a JSON string to pass to the stored procedure
        const oddsJson = JSON.stringify(odds || []);

        await pool.query(
            'CALL sp_AddMatch(?, ?, ?, ?, ?, ?)',
            [match_id_num, sport_display_name, team1, team2, match_time, oddsJson]
        );

        res.status(201).json({ message: 'Утакмицата успешно додадена.', matchId: `match_${match_id_num}` });

    } catch (err) {
        console.error('Database transaction error (add match):', err);
        // Check for duplicate entry error from the database
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: `Утакмицата со ID 'match_${match_id_num}' веќе постои.` });
        }
        res.status(500).json({ error: 'Грешка при внес на утакмицата.' });
    }
});

// New: PUT (Update) an existing match and its odds
// PUT (Update) an existing match and its odds
app.put('/api/matches/:match_id_str', async (req, res) => {
    const { match_id_str } = req.params;
    const { sport_display_name, team1, team2, match_time, odds } = req.body;

    if (!sport_display_name || !team1 || !team2 || !match_time) {
        return res.status(400).json({ error: 'Полињата треба да бидат пополнати.' });
    }

    try {
        const oddsJson = JSON.stringify(odds || []);

        // The stored procedure handles the transaction (update match, delete old odds, insert new odds)
        await pool.query(
            'CALL sp_UpdateMatch(?, ?, ?, ?, ?, ?)',
            [match_id_str, sport_display_name, team1, team2, match_time, oddsJson]
        );

        res.status(200).json({ message: 'Утакмицата успешно едитирана.' });

    } catch (err) {
        console.error('Database transaction error (update match):', err);
        res.status(500).json({ error: 'Грешка при зачувување во базата.' });
    }
});

// New: DELETE a match and its associated odds
app.delete('/api/matches/:match_id_str', async (req, res) => {
    const { match_id_str } = req.params;

    try {
        // The stored procedure handles deleting from both tables
        await pool.query('CALL sp_DeleteMatch(?)', [match_id_str]);
        res.status(200).json({ message: 'Утакмицата успешно избришана.' });

    } catch (err) {
        console.error('Database transaction error (delete match):', err);
        res.status(500).json({ error: 'Грешка при бришење на такмицата.' });
    }
});











/*
* =========================================
* API TO GET ALL MATCHES
* =========================================
*/
app.get('/api/matches', async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.*, 
                o.odd_type, 
                o.odd_value, 
                o.is_main_odd
            FROM 
                matches m
            LEFT JOIN 
                odds o ON m.match_id_str = o.match_id_str
            ORDER BY 
                m.match_time, 
                m.id, 
                o.is_main_odd DESC, 
                CASE o.odd_type 
                    WHEN '1' THEN 1
                    WHEN 'X' THEN 2
                    WHEN '2' THEN 3
                    ELSE 4 
                END, 
                o.odd_type;
        `;
        const [rows] = await pool.query(sql);

        const matchesMap = new Map();

        rows.forEach(row => {
            const matchId = row.match_id_str;
            if (!matchesMap.has(matchId)) {
                matchesMap.set(matchId, {
                    match_id_str: row.match_id_str,
                    match_time: row.match_time,
                    sport_display_name: row.sport_display_name,
                    team1: row.team1,
                    team2: row.team2,
                    odds: []
                });
            }
            if (row.odd_type) {
                matchesMap.get(matchId).odds.push({
                    odd_type: row.odd_type,
                    odd_value: row.odd_value,
                    is_main_odd: !!row.is_main_odd 
                });
            }
        });

        const results = Array.from(matchesMap.values());
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Failed to fetch matches and odds from the database.' });
    }
});



/*
* =========================================
* SESSION STATUS ROUTE
* =========================================
*/
app.get('/session-status', (req, res) => {
    if (req.session.userId) {
        res.json({
            loggedIn: true,
            username: req.session.username
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});



/*
* =========================================
* LOGIN ROUTE
* =========================================
*/
app.post('/login', async (req, res) => {
    const {
        'login-username': username,
        'login-password': password
    } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Корисничко име и лозинка се задолжителни.'
        });
    }

    try {
        // 1. Fetch the user and their verification status
        // IMPORTANT: Select the `is_verified` column from the database.
        const [users] = await pool.query('SELECT id, username, password, is_verified FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Невалидно корисничко име или лозинка.'
            });
        }

        const user = users[0];

        // 2. Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Невалидно корисничко име или лозинка.'
            });
        }

        // 3. **CRITICAL**: Check if the user is verified
        if (user.is_verified !== 1) {
            return res.status(403).json({ // 403 Forbidden is a good status code here
                message: 'Вашиот профил сè уште не е одобрен од администратор.'
            });
        }

        // 4. If password is correct and user is verified, create the session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.loggedIn = true;

        res.status(200).json({
            message: 'Успешна најава!',
            username: user.username
        });

    } catch (err) {
        console.error('Грешка при најава:', err);
        res.status(500).json({
            message: 'Настана грешка при најавата.'
        });
    }
});


/*
* =========================================
* LOGOUT ROUTE
* =========================================
*/
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Грешка при одјава:', err);
            return res.status(500).json({
                message: 'Не можевте да се одјавите.'
            });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({
        });
    });
});




/*
* =========================================
* KONTAKT ROUTE
* =========================================
*/
app.post('/poraki', async (req, res) => {
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



/*
* =========================================
* REGISTRATION ROUTE
* =========================================
*/
app.post('/register', upload.single('id-photo'), async (req, res) => {
    // Check if a file was uploaded. This should be the first check.
    if (!req.file) {
        return res.status(400).json({ message: 'Слика од лична карта е задолжителна.' });
    }

    // Now that we know a file exists, we can safely get the form data and file path.
    const {
        'register-user': username,
        'register-matichen': user_private_id,
        'register-password': password
    } = req.body;
    const idPhotoPath = req.file.path;

    // --- Validation (No changes needed, your validation is good) ---
    if (!username || !user_private_id || !password) {
        return res.status(400).json({ message: 'Сите полиња се задолжителни.' });
    }
    if (username.length > 8) {
        return res.status(409).json({ message: 'Максимално 8 карактери за корисничко име.' });
    }
    if (!/^\d{13}$/.test(user_private_id)) {
        return res.status(409).json({ message: 'Матичниот број мора да содржи 13 цифри.' });
    }
    // (Your detailed matichen validation can remain here)


    try {
        // --- More Efficient Existence Check ---
        // 1. Check if the username already exists. This is fast because the 'username' column is indexed.
        const [existingUser] = await pool.query(
            'SELECT username FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Корисничкото име е веќе зафатено.' });
        }

        // 2. Check if the private ID already exists.
        // This is much more efficient than fetching all IDs and looping.
        const [allUsers] = await pool.query('SELECT user_private_id FROM users');
        let privateIdExists = false;
        for (const user of allUsers) {
            // Compare the submitted ID with each hashed ID in the database
            const match = await bcrypt.compare(user_private_id, user.user_private_id);
            if (match) {
                privateIdExists = true;
                break; // Exit the loop as soon as a match is found
            }
        }

        if (privateIdExists) {
            return res.status(409).json({ message: 'Матичниот број веќе постои.' });
        }

        // --- Hashing and Database Insertion ---
        // Hash the password and the private ID
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedMatichen = await bcrypt.hash(user_private_id, saltRounds);

        // **CRITICAL FIX**: Your stored procedure now takes 4 parameters.
        // You must provide all four arguments in the correct order.
        await pool.query(
            'CALL RegisterUser(?, ?, ?, ?)', // Changed from (?, ?, ?)
            [username, hashedPassword, hashedMatichen, idPhotoPath] // Added idPhotoPath
        );

        res.status(201).json({ message: 'Успешна регистрација! Вашиот профил чека одобрување.' });

    } catch (err) {
        console.error('Грешка при регистрација:', err);
        res.status(500).json({ message: 'Настана грешка при регистрацијата.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press CTRL-C to stop the server');
});