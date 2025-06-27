document.addEventListener('DOMContentLoaded', async () => {
    // Function to load external HTML content into a placeholder
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
            } else {
                console.error(`Placeholder element with ID '${placeholderId}' not found.`);
            }
        } catch (error) {
            console.error(`Failed to load component ${filePath}:`, error);
        }
    }

    // Load the header component. Make sure the path is correct.
    await loadComponent('header-placeholder', '../views/header.html');

    // --- Dropdown Menu Logic (This was missing) ---
    const accountButton = document.getElementById('account-button');
    const dropdownContent = document.getElementById('dropdown-content');

    if (accountButton && dropdownContent) {
        accountButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the window click listener from closing it immediately
            dropdownContent.classList.toggle('show-dropdown');
        });

        // Close the dropdown if the user clicks outside of it
        window.addEventListener('click', (event) => {
            if (!accountButton.contains(event.target)) {
                dropdownContent.classList.remove('show-dropdown');
            }
        });
    }

    // --- Modal Logic ---
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    const closeButtons = document.querySelectorAll('.close-btn');

    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Function to open a modal
    const openModal = (modal) => {
        if (modal) {
            modal.style.display = 'block'; // Set display to 'block' to show the modal
        }
        if (dropdownContent) {
            dropdownContent.classList.remove('show-dropdown'); // Close dropdown when opening modal
        }
    };

    // Function to close any open modal
    const closeModal = () => {
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'none';
    };

    // Event listeners to open modals
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(registerModal);
        });
    }

    // Event listeners to close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target == loginModal || event.target == registerModal) {
            closeModal();
        }
    });

    // Close modal with the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    // Event listeners to switch between forms
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
            openModal(registerModal);
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
            openModal(loginModal);
        });
    }

    // --- Element Selectors for Match List and Filters ---
    const sportFilter = document.getElementById('sport-filter');
    const timeSort = document.getElementById('time-sort');
    const searchInput = document.getElementById('search-input');
    const matchList = document.getElementById('match-list');
    
    
    // Ensure matchList exists before trying to access its children
    const allMatchCards = matchList ? Array.from(matchList.children) : [];

    // Dynamic date and time logic
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
        const selectedSport = sportFilter ? sportFilter.value : 'all'; // Default if filter not found
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : ''; // Default if input not found
        const sortOrder = timeSort ? timeSort.value : 'time-asc'; // Default if sort not found

        let filteredMatches = allMatchCards.filter(matchCard => {
            const matchSport = matchCard.dataset.sport;
            const teamNames = Array.from(matchCard.querySelectorAll('.team-name')).map(el => el.textContent.toLowerCase()).join(' ');
            const sportMatch = selectedSport === 'all' || matchSport === selectedSport;
            const searchMatch = searchTerm === '' || teamNames.includes(searchTerm);
            return sportMatch && searchMatch;
        });

        allMatchCards.forEach(card => {
            if (filteredMatches.includes(card)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        filteredMatches.sort((a, b) => {
            const timeA = new Date(a.dataset.time).getTime();
            const timeB = new Date(b.dataset.time).getTime();
            return sortOrder === 'time-asc' ? timeA - timeB : timeB - timeA;
        });

        // Re-append filtered and sorted matches to maintain order in the DOM
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


    // === Betting Slip Logic for Collapsible Panel ===
    const bettingSlipContainer = document.getElementById('betting-slip-container');
    const slipSummary = document.getElementById('slip-summary');
    const selectedBetsList = document.getElementById('selected-bets-list');

    // Summary Bar Elements
    const slipSelectionCount = document.getElementById('slip-selection-count');
    const slipTotalOdds = document.getElementById('slip-total-odds');

    // Detailed View Elements
    const totalOddsValue = document.getElementById('total-odds-value');
    const stakeInput = document.getElementById('stake-input');
    const potentialWinningsValue = document.getElementById('potential-winnings-value');
    const clearSlipBtn = document.getElementById('clear-slip-btn');
    
    // Get the new elements for tax and final payout
    const taxAmountValue = document.getElementById('tax-amount-value');
    const finalPayoutValue = document.getElementById('final-payout-value');

    let selectedBets = [];

    //
    // === THIS IS THE CORRECTED FUNCTION ===
    //
    const updateTotals = () => {
        const TAX_RATE = 0.15; // Define the 15% tax rate

        // Perform all calculations
        const totalOdds = selectedBets.reduce((total, bet) => total * parseFloat(bet.oddValue), 1);
        const stake = parseFloat(stakeInput ? stakeInput.value : '0') || 0;
        const potentialWinnings = totalOdds * stake;
        const taxAmount = potentialWinnings * TAX_RATE;
        const finalPayout = potentialWinnings - taxAmount;

        // Determine selection text
        let selectionText = `${selectedBets.length} Утакмици`;
        if (selectedBets.length === 0) {
            selectionText = "0 Утакмици";
        } else if (selectedBets.length === 1) {
            selectionText = "1 Утакмица";
        }

        // Update all displays
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

    // Initial update
    updateBettingSlip();
});