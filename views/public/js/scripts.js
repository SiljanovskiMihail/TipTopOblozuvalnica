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

    const loginForm = document.getElementById('login-form');

    const closeButtons = document.querySelectorAll('.modal .close-btn');

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Betting Slip elements (assuming these are *not* dynamically loaded after DOMContentLoaded)
    const bettingSlipContainer = document.getElementById('betting-slip-container');
    const slipSummary = document.getElementById('slip-summary');
    const selectedBetsList = document.getElementById('selected-bets-list');
    const slipSelectionCount = document.getElementById('slip-selection-count');
    const slipTotalOdds = document.getElementById('slip-total-odds');
    const totalOddsValue = document.getElementById('total-odds-value');
    const stakeInput = document.getElementById('stake-input');
    const potentialWinningsValue = document.getElementById('potential-winnings-value');
    const clearSlipBtn = document.getElementById('clear-slip-btn');
    const taxAmountValue = document.getElementById('tax-amount-value');
    const finalPayoutValue = document.getElementById('final-payout-value');

    // Match filtering elements
    const sportFilter = document.getElementById('sport-filter');
    const timeSort = document.getElementById('time-sort');
    const searchInput = document.getElementById('search-input');
    const matchList = document.getElementById('match-list');
    const allMatchCards = matchList ? Array.from(matchList.children) : [];


    // Modal display functions
    const openModal = (modal) => {
        if (modal) {
            // Close the other modal if it's open
            if (modal === loginModal && registerModal) registerModal.style.display = 'none';
            if (modal === registerModal && loginModal) loginModal.style.display = 'none';

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
                    alert(result.message);
                    updateUIForLoggedInUser(result.username);
                    closeModal(); 
                } else {
                    alert(`Error: ${result.message}`);
                }
            } catch (error) {
                console.error('Login failed:', error);
                alert('An error occurred during login.');
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


    // --- 5. Match List and Filtering Logic ---
    allMatchCards.forEach(match => {
        const dateTimeString = match.dataset.time;
        if (!dateTimeString) return;
        const matchDate = new Date(dateTimeString);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        const time = matchDate.toLocaleTimeString('en-GB', timeOptions);

        const dateDisplay = match.querySelector('.match-meta .meta-item span:last-child');
        if (dateDisplay) {
            if (matchDate.toDateString() === now.toDateString()) {
                dateDisplay.textContent = `Today, ${time}`;
            } else if (matchDate.toDateString() === tomorrow.toDateString()) {
                dateDisplay.textContent = `Tomorrow, ${time}`;
            } else {
                const dateOptions = { month: 'short', day: 'numeric' };
                const date = matchDate.toLocaleDateString('en-US', dateOptions);
                dateDisplay.textContent = `${date}, ${time}`;
            }
        }
    });

    // Combined filter, search, and sort function
    const updateMatchDisplay = () => {
        const selectedSport = sportFilter ? sportFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const sortOrder = timeSort ? timeSort.value : 'time-asc';

        let filteredMatches = allMatchCards.filter(matchCard => {
            const matchSport = matchCard.dataset.sport;
            const teamNames = Array.from(matchCard.querySelectorAll('.team-name')).map(el => el.textContent.toLowerCase()).join(' ');
            const sportMatch = selectedSport === 'all' || matchSport === selectedSport;
            const searchMatch = searchTerm === '' || teamNames.includes(searchTerm);
            return sportMatch && searchMatch;
        });

        allMatchCards.forEach(card => {
            card.classList.toggle('hidden', !filteredMatches.includes(card)); 
        });

        filteredMatches.sort((a, b) => {
            const timeA = new Date(a.dataset.time).getTime();
            const timeB = new Date(b.dataset.time).getTime();
            return sortOrder === 'time-asc' ? timeA - timeB : timeB - timeA;
        });

        if (matchList) {
            filteredMatches.forEach(matchCard => matchList.appendChild(matchCard));
        }
    };

    // Event listeners for filters and search
    if (sportFilter) sportFilter.addEventListener('change', updateMatchDisplay);
    if (searchInput) searchInput.addEventListener('keyup', updateMatchDisplay);
    if (timeSort) timeSort.addEventListener('change', updateMatchDisplay);

    // Initial call to update display
    if (matchList) updateMatchDisplay();


    // --- 6. Betting Slip Logic ---
    let selectedBets = [];

    const updateTotals = () => {
        const TAX_RATE = 0.15;
        const totalOdds = selectedBets.reduce((total, bet) => total * parseFloat(bet.oddValue), 1);
        const stake = parseFloat(stakeInput ? stakeInput.value : '0') || 0;
        const potentialWinnings = totalOdds * stake;
        const taxAmount = potentialWinnings * TAX_RATE;
        const finalPayout = potentialWinnings - taxAmount;

        let selectionText = `${selectedBets.length} Утакмици`;
        if (selectedBets.length === 0) {
            selectionText = "0 Утакмици";
        } else if (selectedBets.length === 1) {
            selectionText = "1 Утакмица";
        }

        if (slipSelectionCount) slipSelectionCount.textContent = selectionText;
        if (slipTotalOdds) slipTotalOdds.textContent = totalOdds.toFixed(2);
        if (totalOddsValue) totalOddsValue.textContent = totalOdds.toFixed(2);
        if (potentialWinningsValue) potentialWinningsValue.textContent = potentialWinnings.toFixed(2);
        if (taxAmountValue) taxAmountValue.textContent = taxAmount.toFixed(2);
        if (finalPayoutValue) finalPayoutValue.textContent = finalPayout.toFixed(2);
    };

    const updateBettingSlip = () => {
        if (selectedBets.length === 0) {
            if (bettingSlipContainer) {
                bettingSlipContainer.classList.add('hidden');
                bettingSlipContainer.classList.remove('expanded');
            }
            updateTotals();
            return;
        }

        if (bettingSlipContainer) {
            bettingSlipContainer.classList.remove('hidden');
        }

        if (selectedBetsList) {
            selectedBetsList.innerHTML = '';
            selectedBets.forEach(bet => {
                const slipItem = document.createElement('div');
                slipItem.classList.add('slip-item');
                slipItem.dataset.betId = bet.betId;
                slipItem.innerHTML = `
                    <div class="slip-item-info">
                        <div class="teams">${bet.teams}</div>
                        <div class="bet-type">Тип: ${bet.betType}</div>
                    </div>
                    <span class="odd-value">${bet.oddValue}</span>
                    <button class="remove-bet-btn">&times;</button>
                `;
                selectedBetsList.appendChild(slipItem);
            });
        }
        updateTotals();
    };

    // Event listener to expand/collapse the slip
    if (slipSummary && bettingSlipContainer) {
        slipSummary.addEventListener('click', () => {
            if (selectedBets.length > 0) {
                bettingSlipContainer.classList.toggle('expanded');
            }
        });
    }

    // Main event listener for clicks on match odds
    if (matchList) {
        matchList.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.btn-odd');
            if (!clickedButton) return;

            const matchCard = clickedButton.closest('.match-card');
            const oddItemContainer = clickedButton.closest('.odd-item-container');

            const matchId = matchCard.id;
            const betType = oddItemContainer.querySelector('.odd-type').textContent.trim();
            const oddValue = clickedButton.querySelector('.odd-value').textContent;
            const teams = Array.from(matchCard.querySelectorAll('.team-name')).map(el => el.textContent).join(' vs ');
            const betId = `${matchId}_${betType}`;

            const existingBetFromMatch = selectedBets.find(b => b.matchId === matchId);

            if (clickedButton.classList.contains('selected')) {
                clickedButton.classList.remove('selected');
                selectedBets = selectedBets.filter(b => b.betId !== betId);
            } else {
                if (existingBetFromMatch) {
                    selectedBets = selectedBets.filter(b => b.matchId !== matchId);
                    const oldSelectedButton = matchCard.querySelector('.btn-odd.selected');
                    if(oldSelectedButton) oldSelectedButton.classList.remove('selected');
                }
                clickedButton.classList.add('selected');
                selectedBets.push({ matchId, teams, betType, oddValue, betId });
            }
            updateBettingSlip();
        });
    }

    // Event listener for removing a bet from the slip list
    if (selectedBetsList) {
        selectedBetsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-bet-btn')) {
                const slipItem = event.target.closest('.slip-item');
                const betIdToRemove = slipItem.dataset.betId;

                selectedBets = selectedBets.filter(b => b.betId !== betIdToRemove);

                const lastHyphenIndex = betIdToRemove.lastIndexOf('_');
                const matchId = betIdToRemove.substring(0, lastHyphenIndex);
                const matchCard = document.getElementById(matchId);
                if (matchCard) {
                    const buttonToDeselect = Array.from(matchCard.querySelectorAll('.btn-odd')).find(btn => {
                        const oddTypeElement = btn.closest('.odd-item-container')?.querySelector('.odd-type');
                        const type = oddTypeElement ? oddTypeElement.textContent.trim() : '';
                        return `${matchId}_${type}` === betIdToRemove;
                    });
                    if (buttonToDeselect) buttonToDeselect.classList.remove('selected');
                }
                updateBettingSlip();
            }
        });
    }

    // Event listeners for the stake input and clear button
    if (stakeInput) {
        stakeInput.addEventListener('keyup', updateTotals);
        stakeInput.addEventListener('change', updateTotals);
    }

    if (clearSlipBtn) {
        clearSlipBtn.addEventListener('click', () => {
            selectedBets = [];
            document.querySelectorAll('.btn-odd.selected').forEach(btn => btn.classList.remove('selected'));
            updateBettingSlip();
        });
    }

    updateBettingSlip();

    const registerScript = document.createElement('script');
    registerScript.src = '/views/public/js/register.js'; 
    registerScript.defer = true; 
    document.body.appendChild(registerScript);
});