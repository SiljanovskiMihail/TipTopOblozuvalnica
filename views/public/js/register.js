export function initializeRegister() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const messageArea = document.getElementById('message-area');

        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData 
            });

            const result = await response.json();

            if (response.ok) {
                messageArea.textContent = result.message;
                messageArea.style.color = 'green';
                registerForm.reset(); 
    registerForm.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
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
}

window.initializeRegister = initializeRegister;
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    initializeRegister();
}