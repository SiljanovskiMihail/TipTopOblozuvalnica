import { expect, test, describe, beforeEach, afterEach, beforeAll, afterAll, mock, spyOn } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

try {
    GlobalRegistrator.register();
} catch (e) {}

// We need to import the function to trigger it
global.import = mock().mockResolvedValue({});

import { initApp } from "../views/public/js/scripts.js";

describe("Main Scripts Module", () => {
    const originalConsoleError = console.error;

    beforeAll(() => {
        // Suppress error logs about missing modules
        console.error = mock((...args) => {
            if (typeof args[0] === 'string' && args[0].includes('Failed to load a required script')) {
                return; 
            }
            originalConsoleError(...args);
        });

        // ⬅️ Suppress all console.log during tests
        console.log = mock(() => {});
        
        // ⬅️ Optionally suppress warnings too
        console.warn = mock((...args) => {
            if (typeof args[0] === 'string' && args[0].includes('Component')) {
                return; // Suppress component-related warnings
            }
            originalConsoleWarn(...args);
        });
    });
    
    // Use mock((url) => { ... }) instead of mockImplementation
    global.fetch = mock((url) => {
        // Handle HTML component requests
        if (typeof url === 'string' && url.endsWith('.html')) {
            return Promise.resolve({
                ok: true,
                text: () => Promise.resolve('<div id="mock-header">Header Content</div>')
            });
        }

        // Handle JSON API requests
        if (typeof url === 'string' && url.includes('/session-status')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ loggedIn: false, username: 'Anonymous' })
            });
        }

        // Fallback for other fetches (login, etc.)
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: "Success", username: "TestUser" })
        });
    });

    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    beforeEach(async () => {
        fetch.mockClear();
        document.body.innerHTML = `
            <div id="header-placeholder"></div>
            <div id="account-button"></div>
            <div id="dropdown-content"></div>
            <div id="login-modal" style="display:none;"><form id="login-form"><div id="message-login"></div></form></div>
            <div id="register-modal" style="display:none;"></div>
            <div id="match-list"></div>
        `;
        
        // Boot the app
        await initApp();
        document.dispatchEvent(new window.Event('DOMContentLoaded'));
        
        // Wait for the async chain (loadComponent + checkSession) to settle
        await new Promise(resolve => setTimeout(resolve, 20));
    });

    test("app initializes and loads header", () => {
        const header = document.getElementById('header-placeholder');
        expect(header.innerHTML).toContain('mock-header');
    });

    test("session check updates account button text", () => {
        const btn = document.getElementById('account-button');
        // Because our smart mock returns loggedIn: false
        expect(btn.textContent).toBe("Анонимен");
    });

    test("login form updates UI on success", async () => {
        const form = document.getElementById('login-form');
        const msg = document.getElementById('message-login');
        
        // Trigger login
        form.dispatchEvent(new window.Event('submit'));
        
        // Wait for fetch and DOM updates
        await new Promise(resolve => setTimeout(resolve, 20));

        expect(msg.textContent).toBe("Success");
        expect(document.getElementById('account-button').textContent).toBe("TestUser");
    });

    // --- 1. Component Loading ---
    test("loads header component into placeholder", () => {
        const header = document.getElementById('header-placeholder');
        expect(header.innerHTML).toContain('mock-header');
    });

    // --- 2. UI Auth States ---
    describe("UI Authentication Updates", () => {
        test("updates UI for regular logged-in user", () => {
            window.updateUIForLoggedInUser("JohnDoe");
            
            const btn = document.getElementById('account-button');
            const dropdown = document.getElementById('dropdown-content');
            
            expect(btn.textContent).toBe("JohnDoe");
            expect(dropdown.innerHTML).toContain("/my-tickets");
            expect(dropdown.innerHTML).not.toContain("/admin");
        });

        test("updates UI for ADMIN user with admin links", () => {
            window.updateUIForLoggedInUser("ADMIN");
            
            const dropdown = document.getElementById('dropdown-content');
            expect(dropdown.innerHTML).toContain("/admin");
            expect(dropdown.innerHTML).toContain("/users");
        });
    });

    // --- 3. Modal Logic ---
    describe("Modal Operations", () => {
        test("opens login modal and clears previous messages", () => {
            const loginBtn = document.createElement('a');
            loginBtn.id = 'login-btn';
            document.getElementById('dropdown-content').appendChild(loginBtn);
            
            const messageLogin = document.getElementById('message-login');
            messageLogin.textContent = "Old Error";

            // Click the login button via delegation
            loginBtn.click();

            const modal = document.getElementById('login-modal');
            expect(modal.style.display).toBe('block');
            expect(messageLogin.textContent).toBe("");
        });

        test("closes modal on Escape key", () => {
            const modal = document.getElementById('login-modal');
            modal.style.display = 'block';

            document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
            
            expect(modal.style.display).toBe('none');
        });
    });

    // --- 4. Auth Actions ---
    describe("Auth Actions", () => {
        test("handles successful login", async () => {
            // Mock the login POST
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: "Success", username: "TestUser" })
            });

            const form = document.getElementById('login-form');
            form.dispatchEvent(new window.Event('submit'));

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(document.getElementById('account-button').textContent).toBe("TestUser");
            expect(document.getElementById('login-modal').style.display).toBe('none');
        });

        test("handles logout and redirects", async () => {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'logout-btn';
            document.getElementById('dropdown-content').appendChild(logoutBtn);

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: "Logged out" })
            });

            logoutBtn.click();

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(window.location.href).toBe("/");
            expect(document.getElementById('account-button').textContent).toBe("Анонимен");
        });
    });
});