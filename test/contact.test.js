import { expect, test, describe, beforeEach, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register DOM environment
try {
    GlobalRegistrator.register();
} catch (e) {}

import { initializeContact } from "../views/public/js/contact.js";

describe("Contact Form Detailed Tests", () => {
    
    global.fetch = mock();

    beforeEach(() => {
        fetch.mockClear();
        document.body.innerHTML = `
            <form class="contact-form">
                <input id="contact-name" value="Ivan">
                <input id="contact-email" value="ivan@test.com">
                <textarea id="contact-message" maxlength="100"></textarea>
                <div id="char-count">0 / 100</div>
                <button type="submit">Send</button>
            </form>
            <div id="popup-overlay">
                <div class="popup-content">
                    <span id="popup-message-text"></span>
                    <button class="close-btn">X</button>
                </div>
            </div>
        `;
        initializeContact();
    });

    // --- 1. Character Counter ---
    test("Character counter should update on input", () => {
        const textarea = document.getElementById('contact-message');
        const counter = document.getElementById('char-count');

        textarea.value = "Здраво"; // 6 chars
        textarea.dispatchEvent(new window.Event('input'));

        expect(counter.textContent).toBe("6 / 100");
    });

    // --- 2. Successful Submission & Cleanup ---
    test("Form reset and character counter reset on success", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "Пораката е испратена!" })
        });

        const form = document.querySelector('.contact-form');
        const textarea = document.getElementById('contact-message');
        const counter = document.getElementById('char-count');

        textarea.value = "Test message";
        form.dispatchEvent(new window.Event('submit'));

        await new Promise(r => setTimeout(r, 10));

        expect(form.reset).toBeDefined(); 
        expect(textarea.value).toBe(""); // Form should be empty
        expect(counter.textContent).toBe("0 / 100");
    });

    // --- 3. Error Handling (Server 400/500) ---
    test("Should show error popup when server returns error", async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Невалиден емаил" })
        });

        const form = document.querySelector('.contact-form');
        const popupText = document.getElementById('popup-message-text');

        form.dispatchEvent(new window.Event('submit'));

        await new Promise(r => setTimeout(r, 10));

        expect(popupText.textContent).toBe("Невалиден емаил");
        expect(popupText.className).toBe("error");
    });

    // --- 4. Network Failure (Catch Block) ---
    test("Should show 'Мрежна грешка' on fetch crash", async () => {
        fetch.mockRejectedValueOnce(new Error("Network Down"));

        const form = document.querySelector('.contact-form');
        const popupText = document.getElementById('popup-message-text');

        form.dispatchEvent(new window.Event('submit'));

        await new Promise(r => setTimeout(r, 10));

        expect(popupText.textContent).toBe("Мрежна грешка");
    });

    // --- 5. Popup Dismissal ---
    test("Close button should hide the popup", () => {
        const overlay = document.getElementById('popup-overlay');
        const closeBtn = document.querySelector('.close-btn');

        overlay.classList.add('show');
        closeBtn.click();

        expect(overlay.classList.contains('show')).toBe(false);
    });

    test("Clicking outside the popup content should hide the popup", () => {
        const overlay = document.getElementById('popup-overlay');
        
        overlay.classList.add('show');
        
        // Simulate click on the overlay background, not the content
        overlay.dispatchEvent(new window.MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));

        expect(overlay.classList.contains('show')).toBe(false);
    });

    // --- 6. Payload Verification ---
    test("Submission sends the correct JSON data structure", async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        const nameInput = document.getElementById('contact-name');
        nameInput.value = "Марко";
        
        document.querySelector('.contact-form').dispatchEvent(new window.Event('submit'));

        await new Promise(r => setTimeout(r, 10));

        const call = fetch.mock.calls[0];
        const body = JSON.parse(call[1].body);

        expect(body).toHaveProperty('imePrezime', 'Марко');
        expect(body).toHaveProperty('email', 'ivan@test.com');
    });
});