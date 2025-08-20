// --- 6. Betting Slip Logic ---
/**
 * @param {HTMLElement} matchList The container element for all the matches.
 * This is the main function that initializes all the logic for the betting slip.
 * It manages adding/removing bets, calculating totals, and handling the "place bet" action.
 */
function initializeBettingSlip(matchList) {
    // Array to hold the selected bets. Each element will be an object.
    let selectedBets = [];

    // Get references to all the necessary HTML elements for the betting slip.
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

    /* Helper function to wait for a specific element to be in the DOM.
     * This is useful when elements are loaded dynamically after the initial page load.
     * It uses a MutationObserver to efficiently watch for changes to the DOM.
     * @param {string} selector The CSS selector of the element to wait for.
     * @returns {Promise<HTMLElement>} A promise that resolves with the element once it's found.
     */
    const waitForDomLoad = (selector) => {
        return new Promise(resolve => {
            // If the element already exists, resolve immediately.
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            // Create a new MutationObserver to watch for DOM changes.
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    // Once found, disconnect the observer and resolve the promise.
                    observer.disconnect();
                    resolve(element);
                }
            });

            // Start observing the document body for added nodes.
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    };

    /* --- Custom Pop-up Function (Improved Consistency) ---
     * Creates and displays a custom pop-up dialog.
     * @param {string} message The message to display in the pop-up.
     * @param {string} title The title of the pop-up. Defaults to 'Info'.
     * @param {boolean} isConfirm If true, shows "ДА" and "НЕ" buttons. Defaults to false.
     * @returns {Promise<boolean>} A promise that resolves with true for a positive action or false for a negative one.
     */
    const showTicketPopup = (message, title = 'Info', isConfirm = false) => {
        // Remove any existing pop-ups to prevent duplicates.
        const existingPopup = document.querySelector('.ticket-popup');
        if (existingPopup) existingPopup.remove();
        
        // Create the pop-up element and add its HTML content.
        const popup = document.createElement('div');
        popup.classList.add('ticket-popup');
        popup.innerHTML = `
            <div class="ticket-popup-content">
                <button class="popup-close-btn">&times;</button>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="popup-actions">
                    <button class="${isConfirm ? 'popup-yes-btn' : 'popup-ok-btn'}">${isConfirm ? 'ДА' : 'Затвори'}</button>
                    ${isConfirm ? '<button class="popup-cancel-btn">НЕ</button>' : ''}
                </div>
            </div>
        `;
        document.body.appendChild(popup);

        // Return a promise to handle user interaction with the pop-up.
        return new Promise((resolve) => {
            const close = (value) => {
                popup.remove();
                resolve(value);
            };
            const confirmBtn = popup.querySelector('.popup-yes-btn') || popup.querySelector('.popup-ok-btn');
            if (confirmBtn) {
                confirmBtn.onclick = () => close(true);
            }
            popup.querySelector('.popup-close-btn').onclick = () => close(false);
            if (isConfirm) {
                popup.querySelector('.popup-cancel-btn').onclick = () => close(false);
            }
            // Close pop-up if the user clicks outside the content.
            popup.addEventListener('click', e => {
                if (e.target === popup) close(false);
            });
        });
    };

    /**
     * Recalculates and updates all the total values on the betting slip.
     */
    const updateTotals = () => {
        const TAX_RATE = 0.15; // Define the tax rate as a constant.
        // Calculate the total odds by multiplying all selected odds.
        const totalOdds = selectedBets.reduce((total, bet) => total * parseFloat(bet.oddValue), 1);
        // Get the stake amount from the input field, defaulting to 0.
        const stake = parseFloat(stakeInput ? stakeInput.value : '0') || 0;
        // Calculate potential winnings.
        const potentialWinnings = totalOdds * stake;
        // Calculate the taxable amount (winnings minus stake, or 0 if winnings are less than stake).
        const taxableAmount = Math.max(0, potentialWinnings - stake);
        // Calculate the tax amount.
        const taxAmount = taxableAmount * TAX_RATE;
        // Calculate the final payout after tax.
        const finalPayout = potentialWinnings - taxAmount;
        
        // Update the text content of various HTML elements with the new calculated values.
        let selectionText = `${selectedBets.length} Утакмици`;
        if (selectedBets.length === 0) selectionText = "0 Утакмици";
        else if (selectedBets.length === 1) selectionText = "1 Утакмица";
        if (slipSelectionCount) slipSelectionCount.textContent = selectionText;
        if (slipTotalOdds) slipTotalOdds.textContent = totalOdds.toFixed(2);
        if (totalOddsValue) totalOddsValue.textContent = totalOdds.toFixed(2);
        if (potentialWinningsValue) potentialWinningsValue.textContent = potentialWinnings.toFixed(2);
        if (taxAmountValue) taxAmountValue.textContent = taxAmount.toFixed(2);
        if (finalPayoutValue) finalPayoutValue.textContent = finalPayout.toFixed(2);
    };

    /**
     * Renders the list of selected bets and updates the visual state of the betting slip.
     */
    const updateBettingSlip = () => {
        // Toggle the visibility of the betting slip based on how many bets are selected.
        if (selectedBets.length === 0) {
            if (bettingSlipContainer) {
                bettingSlipContainer.classList.add('hidden');
                bettingSlipContainer.classList.remove('expanded');
            }
        } else {
            if (bettingSlipContainer) bettingSlipContainer.classList.remove('hidden');
        }
        
        // Clear the existing list of bets and re-render the list from the `selectedBets` array.
        if (selectedBetsList) {
            selectedBetsList.innerHTML = '';
            selectedBets.forEach(bet => {
                const slipItem = document.createElement('div');
                slipItem.classList.add('slip-item');
                slipItem.dataset.betId = bet.betId; // Store the betId for easy removal.
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
        
        // Deselect all previously selected buttons on the main match list.
        document.querySelectorAll('.match-card .btn-odd.selected').forEach(btn => btn.classList.remove('selected'));

        // Then, add the 'selected' class only to the buttons that are in our `selectedBets` array.
        selectedBets.forEach(bet => {
            // Find the match card using the bet's ID directly.
            const matchCard = document.getElementById(bet.matchId);
            if (matchCard) {
                // Find the specific button that matches the bet type and add the 'selected' class.
                const targetButton = Array.from(matchCard.querySelectorAll('.btn-odd')).find(btn => {
                    const oddTypeEl = btn.closest('.odd-item-container')?.querySelector('.odd-type');
                    return oddTypeEl && oddTypeEl.textContent.trim() === bet.betType;
                });
                if (targetButton) {
                    targetButton.classList.add('selected');
                }
            }
        });
        
        // After updating the UI, call `updateTotals` to refresh the numbers.
        updateTotals();
    };

    /* Add a click event listener to the slip summary.
     * Toggles the "expanded" class to show or hide the full betting slip.
     */
    if (slipSummary && bettingSlipContainer) {
        slipSummary.addEventListener('click', () => {
            if (selectedBets.length > 0) bettingSlipContainer.classList.toggle('expanded');
        });
    }

    /* Add a click event listener to the main match list.
     * This uses event delegation to handle clicks on any odd button within the list.
     */
    if (matchList) {
        matchList.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.btn-odd');
            // If the clicked element is not a betting odd button, exit.
            if (!clickedButton) return;
            
            // Get the necessary data from the button and its parent elements.
            const matchCard = clickedButton.closest('.match-card');
            const oddItemContainer = clickedButton.closest('.odd-item-container');
            // Get the raw ID from the match card.
            const matchId = matchCard.id;
            const betType = oddItemContainer.querySelector('.odd-type').textContent.trim();
            const oddValue = clickedButton.querySelector('.odd-value').textContent;
            const teams = Array.from(matchCard.querySelectorAll('.team-name')).map(el => el.textContent).join(' vs ');
            // Create a unique betId using the raw match ID.
            const betId = `${matchId}_${betType}`;

            // Check if a bet for the same match already exists in the slip.
            const existingBetIndex = selectedBets.findIndex(b => b.matchId === matchId);
            
            // If the button is already selected, remove the bet from the array.
            if (clickedButton.classList.contains('selected')) {
                selectedBets = selectedBets.filter(b => b.betId !== betId);
            } else {
                // If a bet for this match exists, remove the old one first.
                if (existingBetIndex !== -1) {
                    selectedBets.splice(existingBetIndex, 1);
                }
                // Add the new bet to the array.
                selectedBets.push({ matchId, teams, betType, oddValue, betId });
            }
            // Update the UI to reflect the changes.
            updateBettingSlip();
        });
    }

    /* Add a click event listener to the betting slip list.
     * This handles the removal of a bet by clicking the "x" button.
     */
    if (selectedBetsList) {
        selectedBetsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-bet-btn')) {
                const slipItem = event.target.closest('.slip-item');
                const betIdToRemove = slipItem.dataset.betId;
                // Filter the `selectedBets` array to remove the bet with the matching ID.
                selectedBets = selectedBets.filter(b => b.betId !== betIdToRemove);
                updateBettingSlip();
            }
        });
    }

    /* Add a click event listener to the "Place Bet" button.
     * This validates the user's input and sends the bet data to the server.
     */
    const placeBetBtn = document.querySelector('.btn-place-bet');
    if (placeBetBtn) {
        placeBetBtn.addEventListener('click', async () => {
            const stake = parseFloat(stakeInput.value);
            // Validation checks.
            if (!stake || stake <= 0) {
                showTicketPopup('Ве молиме внесете износ на уплата!', 'Грешка!');
                return;
            }
            if (selectedBets.length === 0) {
                showTicketPopup('Ве молиме изберете утакмица!', 'Грешка!');
                return;
            }
            
            // Create a JSON object with all the ticket data to be sent to the server.
            const ticketData = {
                num_matches: selectedBets.length,
                total_odds: parseFloat(totalOddsValue.textContent),
                stake: stake,
                payout: parseFloat(potentialWinningsValue.textContent),
                payout_after_tax: parseFloat(finalPayoutValue.textContent),
                matches: selectedBets.map(bet => {
                    // Split teams string and format for the request.
                    const [team1, team2] = bet.teams.split(' vs ');
                    return { match_id: bet.matchId, team1: team1.trim(), team2: team2.trim(), bet_type: bet.betType, odd_value: parseFloat(bet.oddValue) };
                })
            };
            
            // Use a try/catch block for robust error handling during the fetch request.
            try {
                // Send the ticket data to the server via a POST request.
                const response = await fetch('/create-ticket', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ticketData) });
                const result = await response.json();
                
                // Show a success or error pop-up based on the server response.
                if (response.ok) {
                    showTicketPopup(`Број на тикет: ${result.ticketId}`, 'Тикетот е креиран!');
                    if (clearSlipBtn) clearSlipBtn.click(); // Automatically clear the slip on success.
                } else {
                    showTicketPopup(`Грешка: ${result.message}`, 'Грешка');
                }
            } catch (error) {
                console.error('Failed to create ticket:', error);
                showTicketPopup('Грешка при креирање на тикетот!', 'Грешка!');
            }
        });
    }

    // Add an event listener to the stake input to update totals in real time.
    if (stakeInput) {
        stakeInput.addEventListener('input', updateTotals);
    }

    // Add an event listener to the "Clear Slip" button.
    if (clearSlipBtn) {
        clearSlipBtn.addEventListener('click', () => {
            selectedBets = []; // Reset the bets array.
            if(stakeInput) stakeInput.value = ''; // Clear the stake input.
            updateBettingSlip(); // Update the UI.
        });
    }

    // --- INITIALIZATION LOGIC ---
    /* This section handles recovering ticket data from session storage.
     * It's used to "resend" a ticket if the page was reloaded or navigated away from.
     */
    const resendDataJSON = sessionStorage.getItem('resendTicketData');
    if (resendDataJSON) {
        try {
            // Parse the JSON data from session storage.
            const matchesToResend = JSON.parse(resendDataJSON);
            selectedBets = matchesToResend.map(match => {
                // --- USER REQUESTED CHANGE ---
                // This will create a new prefix on top of any existing prefix,
                // which may not match the actual ID on the match card element.
                const cleanMatchId = `match_match_${match.match_id.replace(/[^0-9]/g, '')}`;

                return {
                    matchId: cleanMatchId,
                    teams: `${match.team1} vs ${match.team2}`,
                    betType: match.bet_type,
                    oddValue: match.odd_value,
                    betId: `${cleanMatchId}_${match.bet_type}`
                };
            });
            sessionStorage.removeItem('resendTicketData'); // Remove the data to avoid resending it again.

            // Wait for the match cards to be loaded in the DOM before updating the slip.
            waitForDomLoad('.match-card').then(() => {
                updateBettingSlip();
                if (selectedBets.length > 0 && bettingSlipContainer) {
                    // Expand the slip if bets were recovered.
                    bettingSlipContainer.classList.add('expanded');
                }
            });
        } catch (error) {
            console.error("Failed to parse resent ticket data:", error);
            sessionStorage.removeItem('resendTicketData'); // Clear the data if parsing fails.
        }
    } else {
        // If there's no stored data, just perform a normal update.
        updateBettingSlip();
    }
}
