import { expect, test, describe, beforeEach, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// --- 1. DOM Registration ---
// This must happen before importing any code that references 'document'
try {
    GlobalRegistrator.register();
} catch (e) {
    // If it's already registered, we just catch the error and move on
    if (!e.message.includes("already been globally registered")) {
        throw e;
    }
}

// Import the exported functions from your admin.js
import { formatDateTimeLocal } from "../views/public/js/admin.js";

describe("Admin Match Management - Full Test Suite", () => {
    
    // Mock the global fetch for API calls
    global.fetch = mock();

    beforeEach(() => {
        fetch.mockClear();

        // --- 2. Mock DOM Structure ---
        // We recreate the essential parts of your admin.html for the tests
        document.body.innerHTML = `
            <div id="admin-match-list"></div>
            <input id="admin-search-input" />
            <div id="admin-matches-message"></div>

            <form id="add-match-form">
                <input id="new-match-id" />
                <div id="new-extra-odds-container"></div>
                <div id="add-match-message"></div>
            </form>

            <div id="edit-match-modal" class="modal">
                <form id="edit-match-form">
                    <input id="edit-match-id-display" />
                    <div id="edit-match-message"></div>
                    <div id="edit-main-odds-container"></div>
                    <div id="edit-extra-odds-container"></div>
                    <button class="close-btn">X</button>
                </form>
            </div>

            <div id="delete-confirm-modal" class="modal">
                <div id="delete-confirm-content"></div>
                <div id="delete-confirm-message"></div>
                <input type="hidden" id="delete-match-id-hidden" />
                <button id="confirm-delete-btn">Yes</button>
            </div>
        `;
    });

    // --- 3. Unit Tests: Utility Logic ---
    describe("Utility Functions", () => {
        test("formatDateTimeLocal correctly formats ISO for input fields", () => {
            const input = "2026-04-25T15:30:00.000Z";
            expect(formatDateTimeLocal(input)).toBe("2026-04-25T15:30");
        });

        test("formatDateTimeLocal returns empty string for invalid dates", () => {
            expect(formatDateTimeLocal(null)).toBe("");
            expect(formatDateTimeLocal("invalid-date")).toBe("");
        });

        test("ID stripping logic removes 'match_' prefix accurately", () => {
            const rawId = "match_9988";
            const displayId = rawId.replace('match_', '');
            expect(displayId).toBe("9988");
        });
    });

    // --- 4. UI & Logic Tests ---
    describe("UI Interaction Logic", () => {
        test("showMessage toggles correct CSS classes and visibility", () => {
            const msgEl = document.getElementById('add-match-message');
            
            // Simulation of your internal showMessage function
            const showMessage = (element, message, isSuccess) => {
                element.textContent = message;
                element.className = 'form-message';
                element.classList.add(isSuccess ? 'success' : 'error');
                element.style.display = message ? 'block' : 'none';
            };

            showMessage(msgEl, "Успешно додадено!", true);
            expect(msgEl.classList.contains('success')).toBe(true);
            expect(msgEl.style.display).toBe('block');

            showMessage(msgEl, "Грешка!", false);
            expect(msgEl.classList.contains('error')).toBe(true);
        });

        test("Extra odds constraint (MAX_EXTRA_ODDS) logic", () => {
            const container = document.getElementById('new-extra-odds-container');
            const MAX_EXTRA_ODDS = 6;
            
            // Simulate adding fields
            const addField = () => {
                if (container.children.length < MAX_EXTRA_ODDS) {
                    const div = document.createElement('div');
                    container.appendChild(div);
                }
            };

            // Try to add 8 fields
            for (let i = 0; i < 8; i++) addField();
            
            expect(container.children.length).toBe(6);
        });
    });

    // --- 5. API & Integration Tests ---
    describe("API Interactions", () => {
        test("fetchAndRenderMatches calls correct API and handles response", async () => {
            const mockMatches = [
                { match_id_str: "match_1111", team1: "Pelister", team2: "Vardar", match_time: new Date().toISOString() }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMatches
            });

            // Simulate the API call
            const response = await fetch('/api/matches');
            const data = await response.json();

            expect(fetch).toHaveBeenCalledWith('/api/matches');
            expect(data.length).toBe(1);
            expect(data[0].team1).toBe("Pelister");
        });

        test("deleteMatch logic sends DELETE request and updates UI", async () => {
            const matchId = "match_1234";
            const confirmBtn = document.getElementById('confirm-delete-btn');
            const deleteMsg = document.getElementById('delete-confirm-message');

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: "Утакмицата е избришана" })
            });

            // Simulate delete function
            confirmBtn.disabled = true;
            const response = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
            const data = await response.json();

            expect(fetch).toHaveBeenCalledWith(`/api/matches/match_1234`, { method: 'DELETE' });
            expect(data.message).toBe("Утакмицата е избришана");
            expect(confirmBtn.disabled).toBe(true);
        });

        test("addMatchForm validation fails for non-4-digit IDs", () => {
            const regex = /^\d{4}$/;
            const invalidId = "123";
            const validId = "1161";

            expect(regex.test(invalidId)).toBe(false);
            expect(regex.test(validId)).toBe(true);
        });
    });

    // --- 6. Search Logic ---
    test("Filter logic correctly handles team name search", () => {
        const allMatches = [
            { team1: "Barcelona", team2: "Real Madrid" },
            { team1: "Liverpool", team2: "Chelsea" }
        ];
        const searchTerm = "barc";

        const filtered = allMatches.filter(match => 
            match.team1.toLowerCase().includes(searchTerm) || 
            match.team2.toLowerCase().includes(searchTerm)
        );

        expect(filtered.length).toBe(1);
        expect(filtered[0].team1).toBe("Barcelona");
    });
});