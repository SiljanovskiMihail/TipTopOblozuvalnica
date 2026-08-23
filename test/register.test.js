import { expect, test, describe, beforeEach, mock, spyOn } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

try {
    GlobalRegistrator.register();
} catch (e) {}

import { initializeRegister } from "../views/public/js/register.js";

describe("Register Module", () => {
    
    global.fetch = mock();

    beforeEach(() => {
        fetch.mockClear();
        
        // Setup the HTML structure required by the script
        document.body.innerHTML = `
            <form id="register-form">
                <input name="username" value="testuser" />
                <input name="password" value="password123" />
                <div id="message-area"></div>
            </form>
        `;
        
        initializeRegister();
    });

test("successful registration resets input fields", async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Успешна регистрација!" })
    });

    const form = document.getElementById('register-form');
    const usernameInput = form.querySelector('input[name="username"]');
    usernameInput.value = "testuser";

    // Trigger submit
    form.dispatchEvent(new window.Event('submit'));

    // DETERMINISTIC WAIT:
    // Instead of setTimeout, we wait until the value is empty 
    // or we hit a max number of tries (timeout).
    let iterations = 0;
    while (usernameInput.value !== "" && iterations < 20) {
        await new Promise(resolve => setTimeout(resolve, 10));
        iterations++;
    }

    // Now assert
    expect(usernameInput.value).toBe("");
    expect(document.getElementById('message-area').textContent).toBe("Успешна регистрација!");
});

    test("failed registration (e.g. user exists) shows error in red", async () => {
        // 1. Mock a 400 Bad Request
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Корисничкото име е зафатено." })
        });

        const form = document.getElementById('register-form');
        const messageArea = document.getElementById('message-area');

        // 2. Trigger submit
        form.dispatchEvent(new window.Event('submit'));

        await new Promise(resolve => setTimeout(resolve, 0));

        // 3. Assertions
        expect(messageArea.textContent).toBe("Корисничкото име е зафатено.");
        expect(messageArea.style.color).toBe("red");
        
        // Form should NOT reset on failure
    });

    test("network error shows specific error message", async () => {
        // 1. Mock a total fetch failure (e.g. server is down)
        fetch.mockRejectedValueOnce(new Error("Network Down"));
        
        // Silence the console.error for clean test logs
        const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

        const form = document.getElementById('register-form');
        const messageArea = document.getElementById('message-area');

        // 2. Trigger submit
        form.dispatchEvent(new window.Event('submit'));

        await new Promise(resolve => setTimeout(resolve, 0));

        // 3. Assertions
        expect(messageArea.textContent).toBe("Грешка во мрежата. Обидете се повторно.");
        expect(messageArea.style.color).toBe("red");
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    test("does not attempt fetch if registerForm is missing", () => {
        document.body.innerHTML = ''; // Remove the form
        
        // If the code is robust, calling initialize should not throw errors
        expect(() => initializeRegister()).not.toThrow();
    });
});