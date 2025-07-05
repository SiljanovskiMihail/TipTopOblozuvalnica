
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (event) => {
        // 1. Prevent the default browser behavior (page reload)
        event.preventDefault();

        // 2. Gather the form data
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        // A simple element to display messages. Add this to your HTML.
        const messageArea = document.getElementById('message-area'); 

        try {
            // 3. Send the data to the server using fetch
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // 4. Handle the server's response
            if (response.ok) { 
                messageArea.textContent = result.message;
                messageArea.style.color = 'green';
                registerForm.reset(); // Clear the form on success
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
