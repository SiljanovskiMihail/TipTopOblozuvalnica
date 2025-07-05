document.addEventListener('DOMContentLoaded', () => {

    
    // ===========================================
    // Character Counter Logic (as previously consolidated)
    // ===========================================
    const messageTextarea = document.getElementById('contact-message');
    const charCountDisplay = document.getElementById('char-count');

    if (messageTextarea && charCountDisplay) {
        const maxLength = messageTextarea.maxLength;

        messageTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCountDisplay.textContent = `${currentLength} / ${maxLength}`;
        });
        charCountDisplay.textContent = `${messageTextarea.value.length} / ${maxLength}`;
    } else {
        console.warn("Character counter elements not found. Check IDs: 'contact-message', 'char-count'");
    }

    // ===========================================
    // Pop-up Message Logic (NEW)
    // ===========================================
    const popupOverlay = document.getElementById('popup-overlay');
    const popupMessageText = document.getElementById('popup-message-text');
    const closeBtn = document.querySelector('.close-btn'); 

    function showPopup(message, isSuccess) {
        if (popupOverlay && popupMessageText) {
            popupMessageText.textContent = message;
            popupMessageText.className = isSuccess ? 'success' : 'error';
            popupOverlay.classList.add('show');
        }
    }

    function hidePopup() {
        if (popupOverlay && popupMessageText) {
            popupOverlay.classList.remove('show');
            setTimeout(() => {
                popupMessageText.textContent = '';
                popupMessageText.className = '';
            }, 300); 
        }
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) { 
                hidePopup();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hidePopup();
        });
    }


    // ===========================================
    // Form Submission Logic (Modified to use new pop-up functions)
    // ===========================================
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const imePrezimeInput = document.getElementById('contact-name').value;
            const emailInput = document.getElementById('contact-email').value;
            const porakaInput = document.getElementById('contact-message').value;

            const dataToSend = {
                imePrezime: imePrezimeInput,
                email: emailInput,
                poraka: porakaInput
            };

            try {
                const response = await fetch('/poraki', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSend)
                });

                const result = await response.json();

                if (response.ok) {
                    showPopup(result.message || 'Пораката е успешно испратена!', true);
                    contactForm.reset(); 
                    charCountDisplay.textContent = `${messageTextarea.value.length} / ${messageTextarea.maxLength}`; 

                } else {
                    showPopup(result.message || 'Грешка при испраќање на пораката. Обидете се повторно.', false);
                    console.error('Server error:', result.error || result.message);
                }

            } catch (error) {
                showPopup('Мрежна грешка: Не може да се поврзе со серверот.', false);
                console.error('Network error:', error);
            }
        });
    } else {
        console.warn("Contact form not found. Check class: '.contact-form'");
    }
}); 