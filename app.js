require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./database.js'); 
const bcrypt = require('bcrypt');
const app = express();
const session = require('express-session');
const multer = require('multer');
const fs = require('fs').promises;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));



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



/*
* =========================================
* MULTER FOR FILE STORAGE
* =========================================
*/
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

// Admin Panel for Users
app.get('/users', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'adminUsers.html'));
});

// API to get all unverified users (is_verified = 0)
app.get('/api/unverified-users', isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, id_photo_path FROM users WHERE is_verified = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching unverified users:', error);
        res.status(500).json({ error: 'Грешка при вчитување на неверифицирани корисници.' });
    }
});

app.put('/api/users/:id/verify', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { adminInputId } = req.body;

    if (!adminInputId) {
        return res.status(400).json({ error: 'Внесениот ID недостасува.' });
    }

    try {
        const [users] = await pool.query('SELECT user_private_id FROM users WHERE id = ?', [id]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ error: 'Корисникот не е пронајден.' });
        }

        // --- NEW HASH COMPARISON LOGIC ---
        // Compare the admin's input ID with the hashed ID from the database
        const match = await bcrypt.compare(adminInputId, user.user_private_id);

        if (!match) {
            return res.status(400).json({ error: 'Внесениот ID не се совпаѓа со регистрираниот ID.' });
        }
        // --- END OF NEW LOGIC ---

        // If the IDs match, proceed with verification
        const [result] = await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Корисникот не е пронајден.' });
        }

        res.json({ message: 'Корисникот успешно верифициран.' });

    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: 'Грешка при верификација на корисникот.' });
    }
});

// API to reject/delete a user
app.delete('/api/users/:id', isAdmin, async (req, res) => {
    const { id } = req.params; // This 'id' is the primary key 'id' from the users table
    try {
        // 1. Get the image path from the database
        const [rows] = await pool.query('SELECT id_photo_path FROM users WHERE id = ?', [id]);
        const user = rows[0];

        // 2. If a user with an image path is found, delete the file
        if (user && user.id_photo_path) {
            const imagePath = path.join(__dirname, 'uploads', 'ids', user.id_photo_path);
            try {
                // Delete the file from the uploads directory
                await fs.unlink(imagePath);
            } catch (fileError) {
                // Log the error but continue, as the database deletion is more critical
                console.error(`[WARN] Failed to delete image file at ${imagePath}:`, fileError);
            }
        }

        // 3. Delete the user record from the database
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Корисникот не е пронајден.' });
        }

        res.json({ message: 'Корисникот успешно избришан.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Грешка при бришење на корисникот.' });
    }
});



/*
* =========================================
* GET SINGLE MATCH BY ID FOR EDIT
* =========================================
*/
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



/*
* =========================================
* ADD NEW MATCH
* =========================================
*/
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



/*
* =========================================
* UPDATE EXXISTING MATCH
* =========================================
*/
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










app.post('/create-ticket', async (req, res) => {
    // Destructure the data from the request body
    const { num_matches, total_odds, stake, payout, payout_after_tax, matches } = req.body;

    // Get user_id from session if logged in, otherwise it's NULL
    const userId = req.session.userId || null;

    // --- Database Transaction ---
    let connection;
    try {
        // 1. Get a connection from the pool
        connection = await pool.getConnection();

        // 2. Start the transaction
        await connection.beginTransaction();

        // 3. Generate the unique, human-readable ticket ID
        function generateTicketId() {
            const chars = '0123456789';
            let result = '';
            for (let i = 0; i < 9; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        // 4. Generate a unique ticket ID and check for its existence in the database.
        let uniqueTicketId;
        let isIdUnique = false;

        do {
            uniqueTicketId = generateTicketId();
            const [rows] = await connection.query('SELECT ticket_id FROM tickets WHERE ticket_id = ?', [uniqueTicketId]);
            if (rows.length === 0) {
                isIdUnique = true;
            }
        } while (!isIdUnique);

        // 4. Insert into the `tickets` table using a stored procedure
        const [ticketResult] = await connection.query('CALL InsertTicket(?, ?, ?, ?, ?, ?, ?)', [
            uniqueTicketId,
            userId,
            num_matches,
            total_odds,
            stake,
            payout,
            payout_after_tax
        ]);

        // The stored procedure for tickets should return the auto-incremented ID
        const newTicketRecordId = ticketResult[0][0].insertId;

        // 5. Insert each match into the `ticket_matches` table using a stored procedure
        const matchPromises = matches.map(match => {
            const parts = match.match_id.split('match_');
            const uniquePart = parts.pop();
            const processedMatchId = 'match_' + uniquePart;

            return connection.query('CALL InsertTicketMatch(?, ?, ?, ?, ?, ?)', [
                newTicketRecordId,
                processedMatchId,
                match.team1,
                match.team2,
                match.bet_type,
                match.odd_value
            ]);
        });
        
        await Promise.all(matchPromises);

        // 6. If all queries were successful, commit the transaction
        await connection.commit();

        // 7. Send success response back to the client
        res.status(201).json({
            success: true,
            message: 'Тикетот е успешно креиран',
            ticketId: uniqueTicketId
        });

    } catch (error) {
        // 8. If any query failed, roll back the entire transaction
        if (connection) {
            await connection.rollback();
        }
        console.error('Transaction failed:', error);
        res.status(500).json({ success: false, message: 'Серверска грешка!' });

    } finally {
        // 9. Always release the connection back to the pool
        if (connection) {
            connection.release();
        }
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




app.get('/my-tickets',(req, res) => {
    res.sendFile(__dirname + '/views/my-tickets.html');
});

app.get('/api/my-tickets', async (req, res) => {
    // Check if the user is logged in
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const userId = req.session.userId;
        // SQL query to get tickets and all their corresponding matches
        const query = `
            SELECT
                t.id, t.ticket_id, t.num_matches, t.total_odds, t.stake, t.payout,
                t.payout_after_tax, t.created_at,
                tm.match_id, tm.team1, tm.team2, tm.bet_type, tm.odd_value
            FROM tickets t
            JOIN ticket_matches tm ON t.id = tm.ticket_id
            WHERE t.user_id = ?
            ORDER BY t.created_at DESC, tm.id ASC;
        `;
        const [rows] = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.json([]); // Return empty array if no tickets found
        }

        // Group matches by ticket ID
        const ticketsMap = new Map();
        rows.forEach(row => {
            if (!ticketsMap.has(row.id)) {
                ticketsMap.set(row.id, {
                    id: row.id,
                    ticket_id: row.ticket_id,
                    num_matches: row.num_matches,
                    total_odds: row.total_odds,
                    stake: row.stake,
                    payout: row.payout,
                    payout_after_tax: row.payout_after_tax,
                    created_at: row.created_at,
                    matches: []
                });
            }
            ticketsMap.get(row.id).matches.push({
                match_id: row.match_id,
                team1: row.team1,
                team2: row.team2,
                bet_type: row.bet_type,
                odd_value: row.odd_value
            });
        });

        res.json(Array.from(ticketsMap.values()));

    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ message: 'Серверска грешка.' });
    }
});

// ENDPOINT 2: Delete a ticket
app.delete('/api/tickets/:id', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Нема авторизација!' });
    }

    try {
        const ticketIdToDelete = req.params.id;
        const userId = req.session.userId;

        // The 'ON DELETE CASCADE' in your table schema is perfect here.
        // Deleting from 'tickets' will automatically remove related 'ticket_matches'.
        // We add 'user_id = ?' to ensure users can only delete their own tickets.
        const [result] = await pool.query('CALL delete_ticket(?, ?)', [ticketIdToDelete, userId]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Ticket deleted successfully.' });
        } else {
            // This happens if the ticket doesn't exist or doesn't belong to the user
            res.status(404).json({ message: 'Тикетот не е пронајден!' });
        }
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Серверска грешка.' });
    }
});








/*
* =========================================
* KONTAKT ROUTE
* =========================================
*/
app.post('/poraki', async (req, res) => {
    const { imePrezime, email, poraka } = req.body;

    if (!imePrezime || !email || !poraka) {
        return res.status(400).json({ success: false, message: 'Сите полиња се задолжителни!' });
    }
    if (imePrezime.length > 255 || email.length > 255 || poraka.length > 255) {
         return res.status(400).json({ success: false, message: 'Максимум 255 карактери!' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Невалиден е-маил формат!' });
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
    const idPhotoPath = req.file.filename.replace(/\\/g, '/');

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





app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'error.html'));
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press CTRL-C to stop the server');
});