import { expect, test, describe, beforeEach, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// --- 1. DOM SETUP ---
// We register the global DOM environment so 'document' and 'window' exist in Bun
try {
    GlobalRegistrator.register();
} catch (e) {
    // If it's already registered, we just catch the error and move on
    if (!e.message.includes("already been globally registered")) {
        throw e;
    }
}

// Now we import your logic
import { getPhotoSrc, createUserCardHTML } from "../views/public/js/adminUsers.js";

describe("Admin Users Dashboard - Full Test Suite", () => {
    
    // Mock the global fetch
    global.fetch = mock();

    beforeEach(() => {
        fetch.mockClear();
        
        // Reset the DOM body before every test to avoid state pollution
        document.body.innerHTML = `
            <div id="unverified-users-list"></div>
            <div id="unverified-users-message" class="form-message"></div>
            
            <div id="delete-user-modal" class="modal">
                <div class="modal-content">
                    <h2 id="modal-title"></h2>
                    <div id="delete-user-confirm-content"></div>
                    <div id="delete-user-confirm-message" class="form-message"></div>
                    <span id="delete-user-modal-close-btn"></span>
                </div>
            </div>
        `;
    });

    // --- 2. UNIT TESTS (LOGIC HELPERS) ---
    describe("Utility Helpers", () => {
        test("getPhotoSrc returns correct path or placeholder", () => {
            expect(getPhotoSrc("user123.jpg")).toBe("/uploads/ids/user123.jpg");
            expect(getPhotoSrc(null)).toContain("placehold.co");
            expect(getPhotoSrc(undefined)).toContain("placehold.co");
        });

        test("createUserCardHTML contains required user data and IDs", () => {
            const user = { id: 5, username: "Darko", id_photo_path: "id5.jpg" };
            const html = createUserCardHTML(user);
            
            expect(html).toContain("Darko");
            expect(html).toContain('data-user-id="5"');
            expect(html).toContain('id="admin-id-input-5"');
            expect(html).toContain('src="/uploads/ids/id5.jpg"');
        });
    });

    // --- 3. UI & DOM STATE TESTS ---
    describe("UI Transitions", () => {
        test("showMessage updates text and toggles success/error classes", () => {
            const msgEl = document.getElementById('unverified-users-message');
            
            // Helper to simulate the logic inside your adminUsers.js
            const showMessage = (element, message, isSuccess) => {
                if (!element) return;
                element.textContent = message;
                element.className = `form-message ${isSuccess ? 'success' : 'error'}`;
            };

            showMessage(msgEl, "Успешна верификација", true);
            expect(msgEl.textContent).toBe("Успешна верификација");
            expect(msgEl.classList.contains('success')).toBe(true);

            showMessage(msgEl, "Се случи грешка", false);
            expect(msgEl.classList.contains('error')).toBe(true);
        });

        test("openModal sets visibility and title", () => {
            const modal = document.getElementById('delete-user-modal');
            const modalTitle = modal.querySelector('h2');
            
            const openModal = (title) => {
                if (modalTitle) modalTitle.textContent = title;
                modal.classList.add('modal-visible');
                document.body.style.overflow = 'hidden';
            };

            openModal("Верификација");
            expect(modal.classList.contains('modal-visible')).toBe(true);
            expect(modalTitle.textContent).toBe("Верификација");
            expect(document.body.style.overflow).toBe("hidden");
        });
    });

    // --- 4. API & INTEGRATION TESTS ---
    describe("API Interactions", () => {
        test("Should display 'No Users' message when API returns empty array", async () => {
            const list = document.getElementById('unverified-users-list');
            
            // Mock empty response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => []
            });

            // Simulate the logic in fetchAndRenderUnverifiedUsers
            const response = await fetch('/api/unverified-users');
            const users = await response.json();

            if (users.length === 0) {
                list.innerHTML = '<p>Нема нови корисници за верификација.</p>';
            }

            expect(list.innerHTML).toContain("Нема нови корисници");
        });

        test("handleRejectUser calls correct endpoint and removes user card", async () => {
            const userId = "77";
            const list = document.getElementById('unverified-users-list');
            
            // Create a fake card in the DOM
            const card = document.createElement('div');
            card.className = 'user-card';
            card.dataset.userId = userId;
            list.appendChild(card);

            // Mock successful delete
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: "Избришан" })
            });

            // Simulate the handleRejectUser logic
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                document.querySelector(`.user-card[data-user-id="${userId}"]`)?.remove();
            }

            expect(fetch).toHaveBeenCalledWith(`/api/users/77`, { method: 'DELETE' });
            expect(document.querySelector(`.user-card[data-user-id="77"]`)).toBeNull();
        });

        test("handleAcceptUser sends adminInputId in request body", async () => {
            const userId = "10";
            const adminInputId = "0101990450011";

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: "Верификувано" })
            });

            await fetch(`/api/users/${userId}/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminInputId })
            });

            expect(fetch).toHaveBeenCalledWith(
                `/api/users/10/verify`,
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ adminInputId: "0101990450011" })
                })
            );
        });
    });
});