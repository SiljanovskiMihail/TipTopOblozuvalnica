import { expect, test, describe, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Initialize the DOM environment
try {
    GlobalRegistrator.register();
} catch (e) {
    // Already registered
}

// Import functions from your file
import { formatMatchTime, initializeMatches } from "../views/public/js/matches.js";

// Preserve the real Date for cleanup
const OriginalDate = global.Date;

describe("Matches Module - Detailed Test Suite", () => {
    
    // Create a global fetch mock
    global.fetch = mock();

    beforeEach(() => {
        // 1. Reset fetch mock
        fetch.mockClear();

        // 2. Reset the DOM body
        document.body.innerHTML = '<div id="match-list"></div>';

        // 3. Mock "Now" to a fixed date (Friday, May 1, 2026)
        const mockNow = new OriginalDate("2026-05-01T12:00:00Z");
        global.Date = class extends OriginalDate {
            constructor(arg) {
                if (arg) return new OriginalDate(arg);
                return mockNow;
            }
            static now() { return mockNow.getTime(); }
        };
    });

    afterEach(() => {
        // Restore real Date after every test
        global.Date = OriginalDate;
    });

    // --- GROUP 1: Date Formatting Logic ---
    describe("formatMatchTime()", () => {
        test("identifies 'Today' correctly", () => {
            const result = formatMatchTime("2026-05-01T15:30:00Z");
            expect(result).toContain("Today");
            expect(result).toContain("15:30");
        });

        test("identifies 'Tomorrow' correctly", () => {
            const result = formatMatchTime("2026-05-02T10:00:00Z");
            expect(result).toContain("Tomorrow");
        });

        test("formats distant dates using locale string", () => {
            const result = formatMatchTime("2026-12-25T20:00:00Z");
            expect(result).not.toContain("Today");
            expect(result).not.toContain("Tomorrow");
            // Check for the month/year or typical date format
            expect(result).toContain("2026");
        });
    });

    // --- GROUP 2: API & DOM Rendering ---
    describe("initializeMatches()", () => {
        
        test("renders full match data with Main and Extra odds", async () => {
            const mockData = [{
                match_id_str: "match_xyz123",
                team1: "Arsenal",
                team2: "Chelsea",
                match_time: "2026-05-01T20:00:00Z",
                sport_display_name: "Football",
                odds: [
                    { odd_type: "1", odd_value: "1.95", is_main_odd: true },
                    { odd_type: "Over 2.5", odd_value: "2.10", is_main_odd: false }
                ]
            }];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            await initializeMatches();

            const list = document.getElementById('match-list');
            const card = list.querySelector('.match-card');

            // Verify Header & IDs
            expect(card.id).toBe("match_match_xyz123");
            expect(list.innerHTML).toContain("xyz123"); // ID cleaning check
            expect(list.innerHTML).toContain("Arsenal");

            // Verify Odds Placement
            const mainOdds = card.querySelector('.main-odds');
            const extraOdds = card.querySelector('.extra-odds');
            expect(mainOdds.textContent).toContain("1.95");
            expect(extraOdds.textContent).toContain("2.10");
        });

        test("renders 'N/A' for invalid odd values", async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{
                    match_id_str: "1", team1: "A", team2: "B",
                    match_time: "2026-05-01T12:00:00Z", sport_display_name: "F",
                    odds: [{ odd_type: "1", odd_value: "BrokenData", is_main_odd: true }]
                }]
            });

            await initializeMatches();
            expect(document.querySelector('.odd-value').textContent).toBe("N/A");
        });

        test("shows 'No matches found.' for empty API response", async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => []
            });

            await initializeMatches();
            expect(document.getElementById('match-list').textContent).toBe("No matches found.");
        });

        test("handles API errors gracefully", async () => {
            const errorSpy = spyOn(console, "error").mockImplementation(() => {});
            
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: "Maintenance" })
            });

            await initializeMatches();

            const list = document.getElementById('match-list');
            expect(list.innerHTML).toContain("Could not load matches: Maintenance");
            
            errorSpy.mockRestore();
        });

test("dispatches 'matchesLoaded' event to window", async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{
            match_id_str: "1",
            team1: "A",
            team2: "B",
            match_time: "2026-05-01T15:00:00Z",
            sport_display_name: "Football",
            odds: []
        }]
    });

    const eventPromise = new Promise((resolve) => {
        window.addEventListener('matchesLoaded', () => resolve(true), { once: true });
    });

    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Event 'matchesLoaded' never fired")), 500)
    );

    await initializeMatches();
    
    const result = await Promise.race([eventPromise, timeout]);
    expect(result).toBe(true);
});
    });
});