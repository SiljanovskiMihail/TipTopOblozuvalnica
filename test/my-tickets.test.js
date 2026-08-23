import { expect, test, describe, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

try {
    GlobalRegistrator.register();
} catch (e) {}

import { showTicketPopup, initializeMyTickets } from "../views/public/js/my-tickets.js";

describe("My Tickets Module", () => {
    
    // Setup global mocks
    global.fetch = mock();
    
    // Mock window.location.href since we can't actually navigate
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    // Mock sessionStorage
    const storageMock = (() => {
        let store = {};
        return {
            getItem: (key) => store[key] || null,
            setItem: (key, value) => { store[key] = value.toString(); },
            clear: () => { store = {}; }
        };
    })();
    Object.defineProperty(window, 'sessionStorage', { value: storageMock });

    beforeEach(() => {
        fetch.mockClear();
        window.location.href = "";
        sessionStorage.clear();
        document.body.innerHTML = '<div id="my-tickets-container"></div>';
    });

    // --- 1. POPUP TESTS ---
    describe("showTicketPopup", () => {
        test("renders Info popup and resolves true on OK", async () => {
            const promise = showTicketPopup("Hello World", "Title");
            
            const popup = document.querySelector('.ticket-popup');
            expect(popup).not.toBeNull();
            expect(popup.querySelector('h3').textContent).toBe("Title");
            
            // Simulate clicking 'Close/OK'
            popup.querySelector('.popup-ok-btn').click();
            
            const result = await promise;
            expect(result).toBe(true);
            expect(document.querySelector('.ticket-popup')).toBeNull();
        });

        test("resolves false on background click", async () => {
            const promise = showTicketPopup("Confirm?", "Title", true);
            const popup = document.querySelector('.ticket-popup');
            
            // Click the overlay (popup itself), not the content
            popup.click();
            
            const result = await promise;
            expect(result).toBe(false);
        });
    });

    // --- 2. INITIALIZATION & RENDERING TESTS ---
    describe("initializeMyTickets - Loading", () => {
        test("renders tickets successfully", async () => {
            const mockTickets = [{
                id: 1,
                ticket_id: "T-100",
                stake: 100,
                total_odds: 2.5,
                payout_after_tax: 237.5,
                matches: [{ match_id: "match_1", team1: "A", team2: "B", bet_type: "1", odd_value: "2.5" }]
            }];

            fetch.mockResolvedValueOnce({
                status: 200,
                json: async () => mockTickets
            });

            await initializeMyTickets();

            const container = document.getElementById('my-tickets-container');
            expect(container.innerHTML).toContain("T-100");
            expect(container.querySelectorAll('.ticket-card').length).toBe(1);
        });

        test("shows error on 401 Unauthorized", async () => {
            fetch.mockResolvedValueOnce({ status: 401 });

            await initializeMyTickets();

            expect(document.getElementById('my-tickets-container').textContent).toBe("Најавете се.");
        });
    });

    // --- 3. INTERACTION TESTS (Event Delegation) ---
    describe("initializeMyTickets - Actions", () => {
        
        // Helper to setup a rendered card
        const setupCard = async () => {
            fetch.mockResolvedValueOnce({
                status: 200,
                json: async () => [{
                    id: 99, ticket_id: "T-99", stake: 10, total_odds: 2, payout_after_tax: 19,
                    matches: [{ match_id: "1", team1: "A", team2: "B", bet_type: "1", odd_value: "2" }]
                }]
            });
            await initializeMyTickets();
        };

        test("expands card when header is clicked", async () => {
            await setupCard();
            const header = document.querySelector('.ticket-summary-header');
            const card = document.querySelector('.ticket-card');

            header.click();
            expect(card.classList.contains('expanded')).toBe(true);

            header.click();
            expect(card.classList.contains('expanded')).toBe(false);
        });

        test("resend button saves to sessionStorage and redirects", async () => {
            await setupCard();
            const resendBtn = document.querySelector('.btn-resend-ticket');

            resendBtn.click();

            expect(sessionStorage.getItem('resendTicketData')).not.toBeNull();
            expect(window.location.href).toBe("/");
        });

        test("delete button removes card after confirmation", async () => {
            await setupCard();
            const deleteBtn = document.querySelector('.btn-delete-ticket');
            
            // Mock DELETE API
            fetch.mockResolvedValueOnce({ ok: true });

            // Trigger click
            deleteBtn.click();

            // Handle the popup that appears
            const popup = document.querySelector('.ticket-popup');
            popup.querySelector('.popup-yes-btn').click();

            // Wait for microtasks (the fetch and .remove() call)
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(document.querySelector('.ticket-card')).toBeNull();
            expect(document.getElementById('my-tickets-container').innerHTML).toContain("Немате креирано тикети");
        });
    });
});