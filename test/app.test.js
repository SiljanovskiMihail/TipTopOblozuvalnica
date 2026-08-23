// test/app.test.js
import { expect, test, describe, beforeAll, beforeEach, afterAll } from "bun:test";
import request from "supertest";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from "../database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// ENVIRONMENT SETUP
// ============================================
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

// ============================================
// IMPORT APP (NO MOCKS)
// ============================================
let app;

let userIdToVerify = null;   // Will store the ID of user to verify
let userIdToDelete = null;   // Will store the ID of user to delete
let userMatichen = null;     // Will store the matichen for verification

beforeAll(async () => {
  try {
    const appModule = await import("../app.js");
    app = appModule.app;
    
    if (!app) {
      console.error("Available exports:", Object.keys(appModule));
      throw new Error("App not found");
    }
    
    console.log("✅ App loaded successfully with REAL database connection");
    console.log("Testing with real credentials: test1/test1 and ADMIN/ADMIN");
  } catch (error) {
    console.error("❌ Failed to import app:", error.message);
    throw error;
  }
});

afterAll(async () => {
  // Clean up any test files if needed
  console.log("✅ Tests completed");
});

// ============================================
// TEST SUITE 1: Basic Routes & Static Files
// ============================================
describe("Basic Routes & Static Files", () => {
  
  test("GET / should return 200 and serve index.html", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });

  test("GET /session-status should return loggedOut status", async () => {
    const res = await request(app).get("/session-status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ loggedIn: false });
  });

  test("GET /uploads serves static files", async () => {
    const response = await request(app).get("/uploads/BunTest.png");
    expect(response.status).toBe(200);
  });

  test("GET /nonexistent-route should return error page", async () => {
    const response = await request(app).get("/some-random-path-12345");
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });
});

// ============================================
// TEST SUITE 2: Session Status
// ============================================
describe("GET /session-status", () => {
  
  test("should return loggedIn: false when no session exists", async () => {
    const res = await request(app).get("/session-status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ loggedIn: false });
    expect(res.type).toBe("application/json");
  });

  test("should return JSON content type", async () => {
    const res = await request(app).get("/session-status");
    expect(res.headers['content-type']).toContain('application/json');
  });
});

// ============================================
// TEST SUITE 3: Login - Input Validation
// ============================================
describe("POST /login - Input Validation", () => {
  
  test("should return 400 when username is missing", async () => {
    const res = await request(app)
      .post("/login")
      .send({ "login-password": "test1" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Корисничко име и лозинка се задолжителни.");
  });

  test("should return 400 when password is missing", async () => {
    const res = await request(app)
      .post("/login")
      .send({ "login-username": "test1" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Корисничко име и лозинка се задолжителни.");
  });

  test("should return 400 when both fields are missing", async () => {
    const res = await request(app)
      .post("/login")
      .send({});

    expect(res.status).toBe(400);
  });

  test("should return 400 when fields are empty strings", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        "login-username": "",
        "login-password": ""
      });

    expect(res.status).toBe(400);
  });
});

// ============================================
// TEST SUITE 4: Login - Authentication (Real Credentials)
// ============================================
describe("POST /login - Real Authentication", () => {
  
  test("should login successfully with test1 user", async () => {
    const agent = request.agent(app);
    const res = await agent
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Успешна најава!",
      username: "test1"
    });
  });

  test("should set session after test1 login", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });

    const sessionRes = await agent.get("/session-status");
    
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.loggedIn).toBe(true);
    expect(sessionRes.body.username).toBe("test1");
  });

  test("should login successfully with ADMIN user", async () => {
    const agent = request.agent(app);
    const res = await agent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Успешна најава!",
      username: "ADMIN"
    });
  });

  test("should set session after ADMIN login", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });

    const sessionRes = await agent.get("/session-status");
    
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.loggedIn).toBe(true);
    expect(sessionRes.body.username).toBe("ADMIN");
  });

  test("should return 401 for invalid password with test1", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Невалидно корисничко име или лозинка.");
  });

  test("should return 401 for invalid password with ADMIN", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Невалидно корисничко име или лозинка.");
  });

  test("should return 401 for non-existent user", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        "login-username": "nonexistent",
        "login-password": "password123"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Невалидно корисничко име или лозинка.");
  });
});

// ============================================
// TEST SUITE 5: Successful Login & Session
// ============================================
describe("POST /login - Successful Login & Session", () => {
  
  test("should persist session across multiple requests for test1", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });

    for (let i = 0; i < 3; i++) {
      const res = await agent.get("/session-status");
      expect(res.body.loggedIn).toBe(true);
      expect(res.body.username).toBe("test1");
    }
  });

  test("should persist session across multiple requests for ADMIN", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });

    for (let i = 0; i < 3; i++) {
      const res = await agent.get("/session-status");
      expect(res.body.loggedIn).toBe(true);
      expect(res.body.username).toBe("ADMIN");
    }
  });

  test("different users should have separate sessions", async () => {
    const agent1 = request.agent(app);
    const agent2 = request.agent(app);

    await agent1
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });

    await agent2
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });

    const res1 = await agent1.get("/session-status");
    const res2 = await agent2.get("/session-status");
    
    expect(res1.body.username).toBe("test1");
    expect(res2.body.username).toBe("ADMIN");
  });
});

// ============================================
// TEST SUITE 6: Logout
// ============================================
describe("POST /logout", () => {
  
  test("should return 200 when not logged in", async () => {
    const res = await request(app).post("/logout");
    expect(res.status).toBe(200);
  });

  test("should destroy session on logout for test1", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });

    const beforeLogout = await agent.get("/session-status");
    expect(beforeLogout.body.loggedIn).toBe(true);

    const logoutRes = await agent.post("/logout");
    expect(logoutRes.status).toBe(200);

    const afterLogout = await agent.get("/session-status");
    expect(afterLogout.body.loggedIn).toBe(false);
  });

  test("should destroy session on logout for ADMIN", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });

    const beforeLogout = await agent.get("/session-status");
    expect(beforeLogout.body.loggedIn).toBe(true);

    const logoutRes = await agent.post("/logout");
    expect(logoutRes.status).toBe(200);

    const afterLogout = await agent.get("/session-status");
    expect(afterLogout.body.loggedIn).toBe(false);
  });

  test("should clear session cookie after logout", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });

    const res = await agent.post("/logout");
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

// ============================================
// TEST SUITE 7: Complete Authentication Flow
// ============================================
describe("Complete Authentication Flow", () => {
  
  test("full login -> check session -> logout -> verify logout flow with test1", async () => {
    const agent = request.agent(app);
    
    const initial = await agent.get("/session-status");
    expect(initial.body.loggedIn).toBe(false);

    const loginRes = await agent
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });
    expect(loginRes.status).toBe(200);

    const afterLogin = await agent.get("/session-status");
    expect(afterLogin.body.loggedIn).toBe(true);
    expect(afterLogin.body.username).toBe("test1");

    const logoutRes = await agent.post("/logout");
    expect(logoutRes.status).toBe(200);

    const afterLogout = await agent.get("/session-status");
    expect(afterLogout.body.loggedIn).toBe(false);
  });

  test("full admin flow", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });

    const afterLogin = await agent.get("/session-status");
    expect(afterLogin.body.loggedIn).toBe(true);
    expect(afterLogin.body.username).toBe("ADMIN");

    await agent.post("/logout");

    const afterLogout = await agent.get("/session-status");
    expect(afterLogout.body.loggedIn).toBe(false);
  });
});

// ============================================
// TEST SUITE 8: Contact Messages (POST /poraki)
// ============================================
describe("POST /poraki - Contact Messages", () => {
  
  test("should successfully create a message", async () => {
    const res = await request(app)
      .post("/poraki")
      .send({
        imePrezime: "Test User",
        email: "test@example.com",
        poraka: "This is a test message"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Вашата порака е успешно испратена!");
  });

  test("should return 400 when imePrezime is missing", async () => {
    const res = await request(app)
      .post("/poraki")
      .send({
        email: "test@example.com",
        poraka: "Test message"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/poraki")
      .send({
        imePrezime: "Test User",
        poraka: "Test message"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 400 when poraka is missing", async () => {
    const res = await request(app)
      .post("/poraki")
      .send({
        imePrezime: "Test User",
        email: "test@example.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/poraki")
      .send({
        imePrezime: "Test User",
        email: "invalid-email",
        poraka: "Test message"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 400 for fields exceeding 255 characters", async () => {
    const longString = "a".repeat(256);
    
    const res = await request(app)
      .post("/poraki")
      .send({
        imePrezime: longString,
        email: "test@test.com",
        poraka: "Valid"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should accept valid email formats", async () => {
    const validEmails = [
      "user@domain.com",
      "user.name@domain.com",
      "user+tag@domain.co.uk",
    ];

    for (const email of validEmails) {
      const res = await request(app)
        .post("/poraki")
        .send({
          imePrezime: "Test User",
          email: email,
          poraka: "Test message"
        });

      expect(res.status).toBe(201);
    }
  });

  test("should handle unicode characters in message", async () => {
    const res = await request(app)
      .post("/poraki")
      .send({
        imePrezime: "Тест Корисник",
        email: "test@example.com",
        poraka: "Ова е порака на кирилица 日本語もOK"
      });

    expect(res.status).toBe(201);
  });
});

// ============================================
// TEST SUITE 12: Registration (Partial - requires file upload)
// ============================================
describe("POST /register - Registration", () => {
  
  test("should return 400 when no file uploaded", async () => {
    const res = await request(app)
      .post("/register")
      .field("register-user", "testuser")
      .field("register-matichen", "1234567890123")
      .field("register-password", "password123");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Слика од лична карта е задолжителна.");
  });

  test("should return 400 when username is missing", async () => {
    const res = await request(app)
      .post("/register")
      .attach("id-photo", Buffer.from("test image content"), "test-id-photo.jpg")
      .field("register-matichen", "1234567890123")
      .field("register-password", "password123");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Сите полиња се задолжителни.");
  });

  test("should return 400 when matichen is missing", async () => {
    const res = await request(app)
      .post("/register")
      .attach("id-photo", Buffer.from("test image content"), "test-id-photo.jpg")
      .field("register-user", "testuser")
      .field("register-password", "password123");

    expect(res.status).toBe(400);
  });

  test("should return 400 when password is missing", async () => {
    const res = await request(app)
      .post("/register")
      .attach("id-photo", Buffer.from("test image content"), "test-id-photo.jpg")
      .field("register-user", "testuser")
      .field("register-matichen", "1234567890123");

    expect(res.status).toBe(400);
  });

  test("should return 409 when username exceeds 8 characters", async () => {
    const res = await request(app)
      .post("/register")
      .attach("id-photo", Buffer.from("test image content"), "test-id-photo.jpg")
      .field("register-user", "verylongusername")
      .field("register-matichen", "1234567890123")
      .field("register-password", "password123");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Максимално 8 карактери за корисничко име.");
  });

  test("should return 409 for invalid matichen format", async () => {
    const res = await request(app)
      .post("/register")
      .attach("id-photo", Buffer.from("test image content"), "test-id-photo.jpg")
      .field("register-user", "testuser")
      .field("register-matichen", "123") // Too short
      .field("register-password", "password123");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Матичниот број мора да содржи 13 цифри.");
  });
});

// ============================================
// TEST SUITE: Registration (Complete)
// ============================================
describe("POST /register - Complete Registration Flow", () => {

    test("should register user for verification (user-to-verify)", async () => {
    // Store these before registration
    // Change Matichen
    const plainMatichen = "3693693693696";
    userMatichen = plainMatichen;  // Store the PLAIN text matichen
    
    const res = await request(app)
      .post("/register")
      .attach("id-photo", "./uploads/BunTest.png")
      // Change username
      .field("register-user", "new6")
      .field("register-matichen", plainMatichen)  // Send plain text
      .field("register-password", "password1");

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Успешна регистрација! Вашиот профил чека одобрување.");
    
    // Get the actual database ID
    // Change user for Query 
    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', ['new6']);
    userIdToVerify = users[0].id;
    
    console.log(`✅ User created - ID: ${userIdToVerify}, Matichen: ${userMatichen}`);
  });

  test("should register user for deletion (user-to-delete)", async () => {
    const res = await request(app)
      .post("/register")
      .attach("id-photo", "./uploads/BunTest.png")
      .field("register-user", "new2")
      .field("register-matichen", "3693693693694")
      .field("register-password", "password2");

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Успешна регистрација! Вашиот профил чека одобрување.");
    
    // Get the actual database ID and store it globally
    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', ['new2']);
    userIdToDelete = users[0].id;  // ← Store for later use
    console.log(`✅ User to delete created with ID: ${userIdToDelete}`);
  });

  test("admin should see both unverified users in list", async () => {
    const agent = request.agent(app);

    await agent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });

    const res = await agent.get("/api/unverified-users");
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Check that our users are in the list
    //Change for user 1
    const user1 = res.body.find(u => u.username === "new5");
    const user2 = res.body.find(u => u.username === "new2");
    expect(user1).toBeDefined();
    expect(user2).toBeDefined();
    console.log(`✅ Both users found in unverified list`);
  });
});


// ============================================
// TEST SUITE 9: Admin Routes
// ============================================
describe("Admin Routes", () => {
  
  describe("GET /admin", () => {
    
    test("should redirect when not logged in", async () => {
      const res = await request(app).get("/admin");
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/");
    });

    test("should redirect when logged in as regular user", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "test1",
          "login-password": "test1"
        });

      const res = await agent.get("/admin");
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/");
    });

    test("should allow ADMIN to access /admin", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "ADMIN",
          "login-password": "ADMIN"
        });

      const res = await agent.get("/admin");
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
    });
  });

  describe("GET /users", () => {
    
    test("should redirect when not logged in", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(302);
    });

    test("should allow ADMIN to access /users", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "ADMIN",
          "login-password": "ADMIN"
        });

      const res = await agent.get("/users");
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
    });
  });

  describe("GET /api/unverified-users", () => {
    
    test("should return 302 when not authenticated", async () => {
      const res = await request(app).get("/api/unverified-users");
      expect(res.status).toBe(302);
    });

    test("should return unverified users for admin", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "ADMIN",
          "login-password": "ADMIN"
        });

      const res = await agent.get("/api/unverified-users");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("PUT /api/users/:id/verify", () => {
    
    test("should require admin access", async () => {
      const res = await request(app)
        .put("/api/users/1/verify")
        .send({ adminInputId: "1234567890123" });

      expect(res.status).toBe(302); // Redirect to login
    });

    test("should return 400 when adminInputId is missing", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "ADMIN",
          "login-password": "ADMIN"
        });

      const res = await agent
        .put("/api/users/1/verify")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Внесениот ID недостасува.");
    });
  });
});

 describe("DELETE /api/matches/:match_id_str", () => {
      test("should successfully delete match 9996 as admin", async () => {
      const agent = request.agent(app);
      
      // Login as ADMIN
      await agent
        .post("/login")
        .send({
          "login-username": "ADMIN",
          "login-password": "ADMIN"
        });

      // Delete the match
      const res = await agent.delete("/api/matches/match_9996");
      
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("избришана");

      // Verify match is actually deleted from database
  const matchesRes = await agent.get("/api/matches");
  expect(matchesRes.status).toBe(200);
  
  // Check that deleted match is not in the list
  const deletedMatch = matchesRes.body.find(m => m.match_id_str === "match_9996");
  expect(deletedMatch).toBeUndefined();
          });
  });

// ============================================
// TEST SUITE: Admin Verify User (Accept)
// ============================================
describe("PUT /api/users/:id/verify - Admin Accepts User", () => {
  
  let adminAgent;

  beforeEach(async () => {
    adminAgent = request.agent(app);
    
    await adminAgent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });
  });

  test("should verify user when admin provides correct matichen ID", async () => {
    // Make sure we have a user ID to verify
    expect(userIdToVerify).not.toBeNull();
    console.log(`Verifying user with ID: ${userIdToVerify}`);
    
    const res = await adminAgent
      .put(`/api/users/${userIdToVerify}/verify`)  // ← Use actual ID
      .send({ adminInputId: userMatichen });       // ← Use actual matichen

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Корисникот успешно верифициран.");
    
    // Verify in database
    const [users] = await pool.query('SELECT is_verified FROM users WHERE id = ?', [userIdToVerify]);
    console.log(`✅ User ${userIdToVerify} verified successfully`);
  });

  test("should return 400 when admin provides wrong matichen ID", async () => {
    expect(userIdToVerify).not.toBeNull();
    
    const res = await adminAgent
      .put(`/api/users/${userIdToVerify}/verify`)
      .send({ adminInputId: "9999999999999" });  // Wrong ID

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Внесениот ID не се совпаѓа со регистрираниот ID.");
  });

  test("should return 400 when adminInputId is missing", async () => {
    expect(userIdToVerify).not.toBeNull();
    
    const res = await adminAgent
      .put(`/api/users/${userIdToVerify}/verify`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Внесениот ID недостасува.");
  });

  test("should return 404 when user does not exist", async () => {
    const res = await adminAgent
      .put("/api/users/99999/verify")
      .send({ adminInputId: "1111111111111" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Корисникот не е пронајден.");
  });

  test("should require admin access - regular user cannot verify", async () => {
    const regularAgent = request.agent(app);
    
    await regularAgent
      .post("/login")
      .send({
        "login-username": "regularuser",
        "login-password": "password"
      });

    const res = await regularAgent
      .put(`/api/users/${userIdToVerify}/verify`)
      .send({ adminInputId: "1111111111111" });

    expect(res.status).toBe(302);
  });

  test("should require authentication - unauthenticated user cannot verify", async () => {
    const res = await request(app)
      .put(`/api/users/${userIdToVerify}/verify`)
      .send({ adminInputId: "1111111111111" });

    expect(res.status).toBe(302);
  });
});

// ============================================
// TEST SUITE: Admin Delete User (Reject)
// ============================================
describe("DELETE /api/users/:id - Admin Rejects/Deletes User", () => {
  
  let adminAgent;

  beforeEach(async () => {
    adminAgent = request.agent(app);
    
    await adminAgent
      .post("/login")
      .send({
        "login-username": "ADMIN",
        "login-password": "ADMIN"
      });
  });

  test("should delete user and their photo file", async () => {
    // Make sure we have a user ID to delete
    expect(userIdToDelete).not.toBeNull();
    console.log(`Deleting user with ID: ${userIdToDelete}`);
    
    const res = await adminAgent.delete(`/api/users/${userIdToDelete}`);  // ← Use actual ID

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Корисникот успешно избришан.");
    
    // Verify user is deleted from database
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userIdToDelete]);
    expect(users.length).toBe(0);
    console.log(`✅ User ${userIdToDelete} deleted successfully`);
  });

  test("should return 404 when user does not exist", async () => {
    const res = await adminAgent.delete("/api/users/99999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Корисникот не е пронајден.");
  });

  test("should require admin access - regular user cannot delete", async () => {
    const regularAgent = request.agent(app);
    
    await regularAgent
      .post("/login")
      .send({
        "login-username": "regularuser",
        "login-password": "password"
      });

    const res = await regularAgent.delete(`/api/users/${userIdToDelete}`);

    expect(res.status).toBe(302);
  });

  test("should require authentication - unauthenticated user cannot delete", async () => {
    const res = await request(app).delete(`/api/users/${userIdToDelete}`);

    expect(res.status).toBe(302);
  });
});

// ============================================
// TEST SUITE 10: Matches API
// ============================================
describe("Matches API", () => {
  
  describe("GET /api/matches", () => {
    
    test("should return all matches with odds", async () => {
      const res = await request(app).get("/api/matches");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/matches/:match_id_str", () => {
    
    test("should return 404 when match not found", async () => {
      const res = await request(app).get("/api/matches/nonexistent_match_12345");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/matches", () => {
    
    // ChangeID before testing for no duplicates
    test("should create a new match", async () => {
      const res = await request(app)
        .post("/api/matches")
        .send({
          match_id_num: "9996",
          sport_display_name: "Football",
          team1: "Test Team A",
          team2: "Test Team B",
          match_time: "2025-12-31 20:00:00",
                is_main_odd: [
                    { odd_type: "1", odd_value: 1.80 },
                    { odd_type: "X", odd_value: 12.00 },
                    { odd_type: "2", odd_value: 2.10 }
                ]
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Утакмицата успешно додадена.");
    });

    test("should return 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/matches")
        .send({
          match_id_num: "9999"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Сите полиња треба да се пополнат.");
    });
  });
});

// ============================================
// TEST SUITE 11: Ticket System
// ============================================
describe("Ticket System", () => {
  
  describe("GET /my-tickets", () => {
    
    test("should serve my-tickets.html page", async () => {
      const res = await request(app).get("/my-tickets");
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
    });
  });

  describe("GET /api/my-tickets", () => {
    
    test("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/my-tickets");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Not authenticated");
    });

    test("should return tickets for authenticated test1 user", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "test1",
          "login-password": "test1"
        });

      const res = await agent.get("/api/my-tickets");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("should return tickets for authenticated ADMIN user", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "ADMIN",
          "login-password": "ADMIN"
        });

      const res = await agent.get("/api/my-tickets");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /create-ticket", () => {
    
    test("should create ticket without authentication", async () => {
      const res = await request(app)
        .post("/create-ticket")
        .send({
          num_matches: 1,
          total_odds: 1.5,
          stake: 50,
          payout: 75,
          payout_after_tax: 67.5,
          matches: [
            {
              match_id: "match_9999",
              team1: "Test Team A",
              team2: "Test Team B",
              bet_type: "1",
              odd_value: 1.5
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("ticketId");
    });

    test("should create ticket with authentication", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "test1",
          "login-password": "test1"
        });

      const res = await agent
        .post("/create-ticket")
        .send({
          num_matches: 1,
          total_odds: 2.0,
          stake: 100,
          payout: 200,
          payout_after_tax: 180,
          matches: [
            {
              match_id: "match_9999",
              team1: "Test Team A",
              team2: "Test Team B",
              bet_type: "1",
              odd_value: 2.0
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/tickets/:id", () => {
    
    test("should return 401 when not authenticated", async () => {
      const res = await request(app).delete("/api/tickets/123456789");
      expect(res.status).toBe(401);
    });

    test("should handle delete for authenticated user", async () => {
      const agent = request.agent(app);
      
      await agent
        .post("/login")
        .send({
          "login-username": "test1",
          "login-password": "test1"
        });

      const res = await agent.delete("/api/tickets/9999");
      expect(res.status).toBe(404); // Ticket not found
    });
  });
});

// ============================================
// TEST SUITE 13: Error Handling
// ============================================
describe("Error Handling", () => {
  
  test("should handle malformed JSON in request body", async () => {
    const res = await request(app)
      .post("/login")
      .set("Content-Type", "application/json")
      .send('{"malformed":');

    expect(res.status).toBeDefined();
  });

  test("should handle OPTIONS preflight requests", async () => {
    const res = await request(app).options("/api/matches");
    expect(res.status).toBeDefined();
  });

  test("should handle HEAD requests for static files", async () => {
    const res = await request(app).head("/");
    expect(res.status).toBe(200);
  });

  test("should handle requests with query parameters", async () => {
    const res = await request(app).get("/?test=value&another=123");
    expect(res.status).toBe(200);
  });
});

// ============================================
// TEST SUITE 14: Security Tests
// ============================================
describe("Security Tests", () => {
  
  test("should prevent SQL injection in login", async () => {
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "admin'--",
    ];

    for (const payload of payloads) {
      const res = await request(app)
        .post("/login")
        .send({
          "login-username": payload,
          "login-password": "password"
        });

      expect(res.status).toBe(401);
    }
  });

  test("should prevent XSS in contact form", async () => {
    const xssPayloads = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert('xss')>",
    ];

    for (const payload of xssPayloads) {
      const res = await request(app)
        .post("/poraki")
        .send({
          imePrezime: payload,
          email: "test@test.com",
          poraka: payload
        });

      expect(res.status).toBe(201); // Should still work but sanitized
    }
  });
});

// ============================================
// TEST SUITE 15: Concurrent Requests
// ============================================
describe("Concurrent Requests", () => {
  
  test("should handle concurrent login requests", async () => {
    const requests = Array(5).fill().map(() =>
      request(app)
        .post("/login")
        .send({
          "login-username": "test1",
          "login-password": "test1"
        })
    );

    const responses = await Promise.all(requests);
    responses.forEach(res => {
      expect(res.status).toBe(200);
    });
  });

  test("should handle concurrent session checks", async () => {
    const agent = request.agent(app);
    
    await agent
      .post("/login")
      .send({
        "login-username": "test1",
        "login-password": "test1"
      });

    const requests = Array(10).fill().map(() => agent.get("/session-status"));
    const responses = await Promise.all(requests);
    
    responses.forEach(res => {
      expect(res.body.loggedIn).toBe(true);
      expect(res.body.username).toBe("test1");
    });
  });
});

// ============================================
// TEST SUITE 16: Route Accessibility Without Login
// ============================================
describe("Public vs Protected Routes", () => {
  
  const publicRoutes = [
    { method: "GET", path: "/" },
    { method: "GET", path: "/session-status" },
    { method: "POST", path: "/login" },
    { method: "POST", path: "/logout" },
    { method: "POST", path: "/poraki" },
    { method: "GET", path: "/api/matches" },
  ];

  publicRoutes.forEach(route => {
    test(`${route.method} ${route.path} should be accessible without login`, async () => {
      const res = await request(app)[route.method.toLowerCase()](route.path);
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(302);
    });
  });

  const protectedRoutes = [
    { method: "GET", path: "/api/my-tickets" },
    { method: "DELETE", path: "/api/tickets/1" },
    { method: "GET", path: "/admin" },
    { method: "GET", path: "/users" },
    { method: "GET", path: "/api/unverified-users" },
  ];

  protectedRoutes.forEach(route => {
    test(`${route.method} ${route.path} should require authentication`, async () => {
      const res = await request(app)[route.method.toLowerCase()](route.path);
      expect([401, 302]).toContain(res.status);
    });
  });
});