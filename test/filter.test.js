import { expect, test, describe, beforeEach, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register DOM
try {
    GlobalRegistrator.register();
} catch (e) {}

import { initializeFilters } from "../views/public/js/filter.js";

describe("Filter & Sort Detailed Tests", () => {
    let matchList;
    const OriginalDate = global.Date;

    beforeEach(() => {
        // Set a fixed "now" for date tests
        const mockNow = new Date("2026-05-01T12:00:00Z");
        // We use a simple mock because Date is a global object
        global.Date = class extends Date {
            constructor(date) {
                if (date) return new Date(date);
                return mockNow;
            }
        };

        global.Date = class extends OriginalDate {
            constructor(arg) {
                if (arg) {
                    return new OriginalDate(arg);
                }
                return mockNow;
            }
            // Ensure static methods like Date.now() or Date.parse() still work
            static now() {
                return mockNow.getTime();
            }
        };

        document.body.innerHTML = `
            <select id="sport-filter">
                <option value="all">All</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
            </select>
            <input id="search-input" value="">
            <select id="time-sort">
                <option value="time-asc">Soonest</option>
                <option value="time-desc">Latest</option>
            </select>
            
            <div id="match-list">
                <!-- Match 1: Денес (Football) -->
                <div class="match-card" data-sport="football" data-time="2026-05-01T15:00:00Z">
                    <span class="team-name">Real Madrid</span>
                    <div class="match-meta"><div class="meta-item"><span></span><span></span></div></div>
                </div>
                <!-- Match 2: Утре (Basketball) -->
                <div class="match-card" data-sport="basketball" data-time="2026-05-02T10:00:00Z">
                    <span class="team-name">Lakers</span>
                    <div class="match-meta"><div class="meta-item"><span></span><span></span></div></div>
                </div>
            </div>
        `;
        matchList = document.getElementById('match-list');
    });

    

    // --- 1. Date Display Logic ---
    test("should format dates as 'Денес' and 'Утре' correctly", () => {
        initializeFilters(matchList);

        const todaySpan = document.querySelector('[data-sport="football"] .match-meta span:last-child');
        const tomorrowSpan = document.querySelector('[data-sport="basketball"] .match-meta span:last-child');

        expect(todaySpan.textContent).toContain("Денес");
        expect(tomorrowSpan.textContent).toContain("Утре");
    });

    // --- 2. Sport Filtering ---
    test("should filter by sport only", () => {
        const sportFilter = document.getElementById('sport-filter');
        sportFilter.value = "basketball";
        
        initializeFilters(matchList);

        const madridCard = document.querySelector('[data-sport="football"]');
        const lakersCard = document.querySelector('[data-sport="basketball"]');

        expect(madridCard.classList.contains('hidden')).toBe(true);
        expect(lakersCard.classList.contains('hidden')).toBe(false);
    });

    // --- 3. Sorting Logic (DOM Order) ---
    test("should reorder DOM elements when sorting descending", () => {
        const timeSort = document.getElementById('time-sort');
        timeSort.value = "time-desc"; // Latest first
        
        initializeFilters(matchList);

        const cards = matchList.querySelectorAll('.match-card');
        // Latest (Lakers - May 2nd) should now be the first child
        expect(cards[0].querySelector('.team-name').textContent).toBe("Lakers");
    });

    // --- 4. Combined Filter Logic ---
    test("should hide matches if name matches but sport doesn't", () => {
        const searchInput = document.getElementById('search-input');
        const sportFilter = document.getElementById('sport-filter');

        searchInput.value = "Real";      // Name matches Madrid
        sportFilter.value = "basketball"; // But looking for Basketball
        
        initializeFilters(matchList);

        const madridCard = document.querySelector('[data-sport="football"]');
        const lakersCard = document.querySelector('[data-sport="basketball"]');

        // Neither should be visible because no card satisfies BOTH
        expect(madridCard.classList.contains('hidden')).toBe(true);
        expect(lakersCard.classList.contains('hidden')).toBe(true);
    });

    // --- 5. Event Listener Verification ---
    test("should update display when search input triggers keyup", () => {
        initializeFilters(matchList);
        
        const searchInput = document.getElementById('search-input');
        const madridCard = document.querySelector('[data-sport="football"]');

        searchInput.value = "NonExistentTeam";
        // Dispatch event to simulate typing
        searchInput.dispatchEvent(new window.Event('keyup'));

        expect(madridCard.classList.contains('hidden')).toBe(true);
    });
});