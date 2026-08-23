window.updateUIForLoggedInUser = (username) => {
    const accountButton = document.getElementById('account-button');
    const dropdownContent = document.getElementById('dropdown-content');

    if (accountButton) accountButton.textContent = username;

    const loggedInHtml = (username === 'ADMIN') ?
        `<a href="/admin">Утакмици</a><a href="/users">Корисници</a><a href="#" id="logout-btn">Одјава</a>` :
        `<a href="/my-tickets">Мои тикети</a><a href="#" id="logout-btn">Одјава</a>`;

    if (dropdownContent) {
        dropdownContent.innerHTML = loggedInHtml;
    }
};

export const initApp = async () => {

document.addEventListener('DOMContentLoaded', async () => {
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
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDropdownContent = document.getElementById('mobile-dropdown-content');
    const handleDropdownClick = (event) => {
        const targetLink = event.target.closest('a');
        if (!targetLink) return; 

        const action = targetLink.getAttribute('id');
        if (action === 'login-btn') {
            event.preventDefault();
            openModal(loginModal);
        } else if (action === 'register-btn') {
            event.preventDefault();
            openModal(registerModal);
        } else if (action === 'logout-btn') {
            event.preventDefault();
            handleLogout(event);
        }
    };

    if (dropdownContent) {
        dropdownContent.addEventListener('click', handleDropdownClick);
    }
    if (mobileDropdownContent) {
        mobileDropdownContent.addEventListener('click', handleDropdownClick);
    }

    const openModal = (modal) => {
        if (modal) {
            if (modal === loginModal && registerModal) registerModal.style.display = 'none';
            if (modal === registerModal && loginModal) loginModal.style.display = 'none';

            if (modal === loginModal && loginForm) {
                loginForm.reset();
                if (messageLogin) {
                    messageLogin.textContent = '';
                }
            }
            modal.style.display = 'block';
        }
        if (dropdownContent && dropdownContent.classList.contains('show-dropdown')) {
            dropdownContent.classList.remove('show-dropdown');
        }
        if (mobileDropdownContent && mobileDropdownContent.classList.contains('show-dropdown')) {
            mobileDropdownContent.classList.remove('show-dropdown');
        }
    };

    const closeModal = () => {
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'none';
    };

    window.updateUIForLoggedInUser = (username) => {
        if (accountButton) accountButton.textContent = username;
        if (mobileMenuToggle) mobileMenuToggle.textContent = username;

        const loggedInHtml = (username === 'ADMIN') ?
            `<a href="/admin">Утакмици</a><a href="/users">Корисници</a><a href="#" id="logout-btn">Одјава</a>` :
            `<a href="/my-tickets">Мои тикети</a><a href="#" id="logout-btn">Одјава</a>`;

        if (dropdownContent) {
            dropdownContent.innerHTML = loggedInHtml;
        }
        if (mobileDropdownContent) {
            const mobileLinks = `<a href="../views/promoci.html">Промоции</a><a href="../views/contact.html">Контакт</a><hr class="separator">`;
            mobileDropdownContent.innerHTML = mobileLinks + loggedInHtml;
        }
    };

    const updateUIForLoggedOutUser = () => {
        if (accountButton) accountButton.textContent = 'Анонимен';

        const loggedOutHtml = `<a href="#" id="login-btn">Најава</a><a href="#" id="register-btn">Регисрација</a>`;

        if (dropdownContent) {
            dropdownContent.innerHTML = loggedOutHtml;
        }
        if (mobileDropdownContent) {
            const mobileLinks = `<a href="../views/promoci.html">Промоции</a><a href="../views/contact.html">Контакт</a><hr class="separator">`;
            mobileDropdownContent.innerHTML = mobileLinks + loggedOutHtml;
        }
    };

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
                window.location.href = '/';
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('An error occurred during logout.');
        }
    };

    checkSession();

    if (accountButton && dropdownContent) {
        accountButton.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdownContent.classList.toggle('show-dropdown');
        });

        window.addEventListener('click', (event) => {
            if (dropdownContent && !accountButton.contains(event.target) && !dropdownContent.contains(event.target)) {
                dropdownContent.classList.remove('show-dropdown');
            }
        });
    }

    if (mobileMenuToggle && mobileDropdownContent) {
        mobileMenuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            mobileDropdownContent.classList.toggle('show-dropdown');
        });
    }

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

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal || event.target === registerModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

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
        await Promise.all([
            import('/views/public/js/register.js'),
            import('/views/public/js/filter.js'),
            import('/views/public/js/matches.js'),
            import('/views/public/js/bettingslip.js')
        ]);

        console.log("All scripts loaded successfully.");

        const matchList = document.getElementById('match-list');

if (matchList) {
        if (typeof window.initializeFilters === 'function') {
            window.initializeFilters(matchList);
        }
        if (typeof window.initializeBettingSlip === 'function') {
            window.initializeBettingSlip(matchList);
        }
    }
        else {
            console.error("#match-list element not found after script loading.");
        }

    } catch (error) {
        console.error("Failed to load a required script:", error);
    }
});
};
if (typeof window !== 'undefined') {
    initApp().catch(console.error); 
}