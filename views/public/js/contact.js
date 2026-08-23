export function initializeContact() {
    const messageTextarea = document.getElementById('contact-message');
    const charCountDisplay = document.getElementById('char-count');

    if (messageTextarea && charCountDisplay) {
        const maxLength = messageTextarea.maxLength || 500; 
        const updateCounter = () => {
            charCountDisplay.textContent = `${messageTextarea.value.length} / ${maxLength}`;
        };
        messageTextarea.addEventListener('input', updateCounter);
        updateCounter();
    }

    const popupOverlay = document.getElementById('popup-overlay');
    const popupMessageText = document.getElementById('popup-message-text');
    const closeBtn = document.querySelector('.close-btn');
    const showPopup = (message, isSuccess) => {
        if (popupOverlay && popupMessageText) {
            popupMessageText.textContent = message;
            popupMessageText.className = isSuccess ? 'success' : 'error';
            popupOverlay.classList.add('show');
        }
    };
    const hidePopup = () => {
        if (popupOverlay) popupOverlay.classList.remove('show');
    };

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => { if (e.target === popupOverlay) hidePopup(); });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', hidePopup);
    }

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const dataToSend = {
                imePrezime: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                poraka: document.getElementById('contact-message').value
            };

            try {
                const response = await fetch('/poraki', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend)
                });

                const result = await response.json();
                if (response.ok) {
                    showPopup(result.message || 'Успешно!', true);
                    contactForm.reset();
                    if (charCountDisplay) charCountDisplay.textContent = `0 / ${messageTextarea.maxLength}`;
                } else {
                    showPopup(result.message || 'Грешка!', false);
                }
            } catch (error) {
                showPopup('Мрежна грешка', false);
            }
        });
    }
}

window.initializeContact = initializeContact;
initializeContact();