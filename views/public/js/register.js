const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // FormData will now include the file
    const formData = new FormData(registerForm);
    const messageArea = document.getElementById('message-area');

    try {
        const response = await fetch('/register', {
            method: 'POST',
            // DO NOT set Content-Type header manually.
            // The browser will set it to 'multipart/form-data' automatically.
            body: formData 
        });

        const result = await response.json();

        if (response.ok) {
            messageArea.textContent = result.message;
            messageArea.style.color = 'green';
            registerForm.reset();
        } else {
            messageArea.textContent = result.message;
            messageArea.style.color = 'red';
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        messageArea.textContent = 'Грешка во мрежата. Обидете се повторно.';
        messageArea.style.color = 'red';
    }
});