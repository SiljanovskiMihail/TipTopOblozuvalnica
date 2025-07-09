document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. Function to load external HTML content into a placeholder ---
    async function loadComponent(placeholderId, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) {
                placeholder.innerHTML = html;
                console.log(`Component '${filePath}' loaded into '${placeholderId}'.`);
            } else {
                console.error(`Placeholder element with ID '${placeholderId}' not found.`);
            }
        } catch (error) {
            console.error(`Failed to load component ${filePath}:`, error);
        }
    }

    // Load the header component first. Execution will pause here until it's done.
    await loadComponent('header-placeholder', '../views/header.html');

    const accountButton = document.getElementById('account-button');
    const dropdownContent = document.getElementById('dropdown-content');

    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const messageLogin = document.getElementById('message-login');
    const loginForm = document.getElementById('login-form');

    const closeButtons = document.querySelectorAll('.modal .close-btn');

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    


    // Modal display functions
    const openModal = (modal) => {
        if (modal) {
            // Close the other modal if it's open
            if (modal === loginModal && registerModal) registerModal.style.display = 'none';
            if (modal === registerModal && loginModal) loginModal.style.display = 'none';

            if (modal === loginModal && loginForm) {
                loginForm.reset(); // This clears username and password fields
                if (messageLogin) {
                    messageLogin.textContent = ''; // This clears the server message
                }
            }

            modal.style.display = 'block'; // Or 'flex' if using flexbox for centering
        }
        // Close the dropdown when any modal is opened
        if (dropdownContent && dropdownContent.classList.contains('show-dropdown')) {
            dropdownContent.classList.remove('show-dropdown');
        }
    };

    const closeModal = () => {
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'none';
    };

    // --- Functions for Logged In/Out States ---

    const updateUIForLoggedInUser = (username) => {
        if (accountButton) accountButton.textContent = username;
        if (dropdownContent) {
            dropdownContent.innerHTML = `
                <a href="/my-tickets.html">Мои тикети</a>
                <a href="#" id="logout-btn">Одјава</a>
            `;
            // Re-attach listener for the NEW logout button
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
    };

    const updateUIForLoggedOutUser = () => {
        if (accountButton) accountButton.textContent = 'Анонимен';
        if (dropdownContent) {
            dropdownContent.innerHTML = `
                <a href="#" id="login-btn">Најава</a>
                <a href="#" id="register-btn">Регисрација</a>
            `;

            // CRUCIAL: Re-attach listeners to the NEWLY CREATED login/register links
            const newLoginBtn = document.getElementById('login-btn');
            const newRegisterBtn = document.getElementById('register-btn');

            if (newLoginBtn) {
                newLoginBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    openModal(loginModal);
                });
            }
            if (newRegisterBtn) {
                newRegisterBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    openModal(registerModal);
                });
            }
        }
    };

    // --- Session & Authentication Handlers ---

    const checkSession = async () => {
        try {
            const response = await fetch('/session-status');
            const data = await response.json();

            if (response.ok && data.loggedIn) {
                updateUIForLoggedInUser(data.username);
            } else {
                updateUIForLoggedOutUser();
            }
        } catch (error) {
            console.error('Error checking session status:', error);
            updateUIForLoggedOutUser(); 
        }
    };

    const handleLogout = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('/logout', { method: 'POST' });
            const result = await response.json();

            if (response.ok) {
                updateUIForLoggedOutUser(); 
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('An error occurred during logout.');
        }
    };

    // Initial check for session status to set up the UI correctly
    checkSession();

    // Dropdown Toggle for "Анонимен" / username button
    if (accountButton && dropdownContent) {
        accountButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            dropdownContent.classList.toggle('show-dropdown');
        });

        // Close the dropdown if the user clicks outside of it
        window.addEventListener('click', (event) => {
            if (dropdownContent && !accountButton.contains(event.target) && !dropdownContent.contains(event.target)) {
                 dropdownContent.classList.remove('show-dropdown');
            }
        });
    }

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());


            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();

                if (response.ok) {
                    messageLogin.textContent = result.message;
                    messageLogin.style.color = 'green';
                    updateUIForLoggedInUser(result.username);
                    closeModal(); 
                } else {
                    messageLogin.textContent = result.message;
                    messageLogin.style.color = 'red';
                }
            } catch (error) {
                console.error('Login failed:', error);
                messageLogin.textContent = 'Грешка во мрежата. Обидете се повторно.'; 
                messageLogin.style.color = 'red';
            }
        });
    }

    // Event listeners to close modals using the 'x' buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside the content area of the modal itself
    window.addEventListener('click', (event) => {
        if (event.target === loginModal || event.target === registerModal) {
            closeModal();
        }
    });

    // Close modal with the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    // Event listeners to switch between forms (Login/Register links inside modals)
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(registerModal); 
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal); 
        });
    }

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    try {
        // Load all scripts concurrently
        await Promise.all([
            loadScript('/views/public/js/register.js'),
            loadScript('/views/public/js/filter.js'),
            loadScript('/views/public/js/bettingslip.js')
        ]);

        console.log("All scripts loaded successfully.");

        // --- 3. Initialize Functionality ---
        // Now that all scripts are loaded, find the critical element ONCE.
        const matchList = document.getElementById('match-list');

        if (matchList) {
            // Call the functions from the loaded scripts, passing the element.
            // This ensures they only run when the element exists.
            initializeFilters(matchList);
            initializeBettingSlip(matchList);
        } else {
            console.error("#match-list element not found after script loading.");
        }

    } catch (error) {
        console.error("Failed to load a required script:", error);
    }

});