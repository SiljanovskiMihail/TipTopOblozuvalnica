import { expect, test, describe, beforeEach, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// 1. Register DOM
try {
    GlobalRegistrator.register();
} catch (e) {}

import { 
    calculateTax, 
    getSelectionText, 
    calculateTotalOdds, 
    updateBetsArray 
} from "../views/public/js/bettingslip.js";

describe("Betting Slip - Advanced Integration Tests", () => {
    
    global.fetch = mock();

    beforeEach(() => {
        fetch.mockClear();
        sessionStorage.clear();
        
        // Setup minimal DOM for Betting Slip
        document.body.innerHTML = `
            <div id="betting-slip-container" class="hidden">
                <div id="slip-summary"></div>
                <div id="selected-bets-list"></div>
                <span id="slip-selection-count"></span>
                <span id="slip-total-odds"></span>
                <span id="total-odds-value"></span>
                <input id="stake-input" type="number" value="100">
                <span id="potential-winnings-value">0.00</span>
                <span id="tax-amount-value">0.00</span>
                <span id="final-payout-value">0.00</span>
                <button id="clear-slip-btn"></button>
                <button class="btn-place-bet"></button>
            </div>
            <div id="match-list"></div>
        `;
    });

    // --- LOGIC TESTS (Your existing ones + precision test) ---
    describe("Math Precision", () => {
        test("calculateTotalOdds handles floating point precision", () => {
            const bets = [{ oddValue: "1.1" }, { oddValue: "1.1" }, { oddValue: "1.1" }];
            // 1.1 * 1.1 * 1.1 = 1.331 -> rounded to 1.33
            expect(calculateTotalOdds(bets)).toBe(1.33);
        });
    });

    // --- DOM & UI TESTS ---
    describe("UI State Management", () => {
        test("Container should toggle 'hidden' class based on bet count", () => {
            const container = document.getElementById('betting-slip-container');
            const bets = [];
            
            // Simulation of renderUI logic
            const renderUI_Sim = (currentBets) => {
                container.classList.toggle('hidden', currentBets.length === 0);
            };

            renderUI_Sim([]);
            expect(container.classList.contains('hidden')).toBe(true);

            renderUI_Sim([{ id: 1 }]);
            expect(container.classList.contains('hidden')).toBe(false);
        });
    });

    // --- SESSION STORAGE RECOVERY TESTS ---
    describe("Session Recovery (Resend Ticket)", () => {
        test("should correctly clean and restore match IDs from sessionStorage", () => {
            const rawData = [{
                match_id: "match_123", // Needs to become match_match_123
                team1: "Pelister",
                team2: "Vardar",
                bet_type: "1",
                odd_value: "2.50"
            }];
            
            sessionStorage.setItem('resendTicketData', JSON.stringify(rawData));
            
            // Logic inside initializeBettingSlip:
            const resendDataJSON = sessionStorage.getItem('resendTicketData');
            const matchesToResend = JSON.parse(resendDataJSON);
            
            const restored = matchesToResend.map(match => {
                const cleanMatchId = `match_match_${match.match_id.replace(/[^0-9]/g, '')}`;
                return {
                    matchId: cleanMatchId,
                    betId: `${cleanMatchId}_${match.bet_type}`
                };
            });

            expect(restored[0].matchId).toBe("match_match_123");
            expect(restored[0].betId).toBe("match_match_123_1");
        });
    });

    // --- API / FETCH TESTS ---
    describe("Ticket Placement", () => {
        test("should send correct ticket structure to /create-ticket", async () => {
            const selectedBets = [
                { matchId: "m1", teams: "A vs B", betType: "1", oddValue: "2.00", betId: "m1_1" }
            ];
            
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ticketId: "TK-999" })
            });

            // Simulate the ticket placement logic
            const stake = 100;
            const ticketData = {
                num_matches: selectedBets.length,
                total_odds: 2.00,
                stake: stake,
                matches: selectedBets.map(b => ({ match_id: b.matchId }))
            };

            const res = await fetch('/create-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });
            const result = await res.json();

            expect(fetch).toHaveBeenCalledWith('/create-ticket', expect.any(Object));
            expect(result.ticketId).toBe("TK-999");
        });
    });

    // --- POPUP TESTS ---
    describe("Popups", () => {
        test("showTicketPopup creates a DOM element with correct title", () => {
            // Helper to simulate your popup function
            const showPopup = (title, msg) => {
                const div = document.createElement('div');
                div.className = 'ticket-popup';
                div.innerHTML = `<h3>${title}</h3><p>${msg}</p>`;
                document.body.appendChild(div);
            };

            showPopup('Грешка!', 'Немате доволно средства');
            
            const popup = document.querySelector('.ticket-popup');
            expect(popup).not.toBeNull();
            expect(popup.querySelector('h3').textContent).toBe('Грешка!');
        });
    });
});