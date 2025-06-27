// views/public/js/betting-slip.js

// This array stores the currently selected bets.
// It's declared at the module scope so its state persists
// across different calls to initBettingSlipLogic (e.g., if the home page is reloaded).
let selectedBets = [];

/**
 * Initializes all logic related to the betting slip:
 * - Hides/shows the slip based on selections.
 * - Adds/removes bets.
 * - Updates total odds, stake, potential winnings, tax, and final payout.
 * - Handles expand/collapse functionality.
 * This function should be called AFTER the HTML elements for the betting slip
 * and the match list (if applicable for interactions) are loaded into the DOM.
 */
export function initBettingSlipLogic() {
    console.log('[INIT] Initializing Betting Slip Logic...');

    // Get all necessary DOM elements for the betting slip
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

    // Console logs to check if elements are found
    console.log(`[DEBUG - Betting Slip] bettingSlipContainer found: ${!!bettingSlipContainer}`);
    console.log(`[DEBUG - Betting Slip] slipSummary found: ${!!slipSummary}`);
    console.log(`[DEBUG - Betting Slip] selectedBetsList found: ${!!selectedBetsList}`);
    console.log(`[DEBUG - Betting Slip] stakeInput found: ${!!stakeInput}`);

    /**
     * Updates all calculated totals and displays them in the betting slip.
     */
    const updateTotals = () => {
        const TAX_RATE = 0.15; // Define the 15% tax rate

        // Perform all calculations
        const totalOdds = selectedBets.reduce((total, bet) => total * parseFloat(bet.oddValue), 1);
        const stake = parseFloat(stakeInput ? stakeInput.value : '0') || 0;
        const potentialWinnings = totalOdds * stake;
        const taxAmount = potentialWinnings * TAX_RATE;
        const finalPayout = potentialWinnings - taxAmount;

        // Determine selection text based on number of bets
        let selectionText = `${selectedBets.length} Утакмици`;
        if (selectedBets.length === 0) {
            selectionText = "0 Утакмици";
        } else if (selectedBets.length === 1) {
            selectionText = "1 Утакмица";
        }

        // Update all display elements, with null checks
        if (slipSelectionCount) slipSelectionCount.textContent = selectionText;
        if (slipTotalOdds) slipTotalOdds.textContent = totalOdds.toFixed(2);
        if (totalOddsValue) totalOddsValue.textContent = totalOdds.toFixed(2);
        if (potentialWinningsValue) potentialWinningsValue.textContent = potentialWinnings.toFixed(2);
        if (taxAmountValue) taxAmountValue.textContent = taxAmount.toFixed(2);
        if (finalPayoutValue) finalPayoutValue.textContent = finalPayout.toFixed(2);
        console.log('[BETSLIP] Totals updated.');
    };

    /**
     * Updates the visual display of the betting slip, including showing/hiding
     * the container and populating the list of selected bets.
     */
    const updateBettingSlip = () => {
        if (selectedBets.length === 0) {
            if (bettingSlipContainer) {
                bettingSlipContainer.classList.add('hidden'); // Add 'hidden' class to hide
                bettingSlipContainer.classList.remove('expanded'); // Also collapse it
                console.log('[BETSLIP] Slip hidden (0 selections).');
            }
            updateTotals(); // Always update totals even when hidden
            return;
        }

        // If there are selections, ensure the slip container is visible
        if (bettingSlipContainer) {
            bettingSlipContainer.classList.remove('hidden');
            console.log('[BETSLIP] Slip visible (>0 selections).');
        }

        // Populate the list of selected bets
        if (selectedBetsList) {
            selectedBetsList.innerHTML = ''; // Clear previous list items
            selectedBets.forEach(bet => {
                const slipItem = document.createElement('div');
                slipItem.classList.add('slip-item');
                slipItem.dataset.betId = bet.betId; // Store betId for easy removal
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
            console.log('[BETSLIP] Selected bets list updated.');
        }
        
        updateTotals(); // Update totals after refreshing the list
    };

    // --- Event Listeners for Betting Slip UI ---

    // Event listener to expand/collapse the slip when clicking the summary bar
    if (slipSummary && bettingSlipContainer) {
        slipSummary.addEventListener('click', () => {
            if (selectedBets.length > 0) { // Only toggle if there are bets selected
                bettingSlipContainer.classList.toggle('expanded');
                console.log(`[BETSLIP] Slip summary clicked. Expanded: ${bettingSlipContainer.classList.contains('expanded')}`);
            } else {
                console.log('[BETSLIP] Cannot expand slip, no selections.');
            }
        });
    }

    // Main event listener for clicks on match odds buttons (delegated to matchList)
    // The matchList element is assumed to be part of the dynamically loaded main content (e.g., main-home.html).
    // This listener needs to be re-attached whenever main-home.html is loaded.
    const matchList = document.getElementById('match-list');
    if (matchList) {
        matchList.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.btn-odd');
            if (!clickedButton) return; // Not an odd button click

            const matchCard = clickedButton.closest('.match-card');
            const oddItemContainer = clickedButton.closest('.odd-item-container');
            
            if (!matchCard || !oddItemContainer) { 
                console.warn('[BETSLIP] Could not find parent elements for clicked odd button.');
                return;
            }

            // Extract bet details
            const matchId = matchCard.id;
            const betType = oddItemContainer.querySelector('.odd-type')?.textContent?.trim();
            const oddValue = clickedButton.querySelector('.odd-value')?.textContent;
            const teams = Array.from(matchCard.querySelectorAll('.team-name')).map(el => el.textContent).join(' vs ');
            const betId = `${matchId}_${betType}`; // Unique ID for the bet

            if (!betType || !oddValue) { 
                 console.warn('[BETSLIP] Missing bet type or odd value for clicked button.');
                 return;
            }

            // Check if a bet for this match already exists in the slip
            const existingBetFromMatch = selectedBets.find(b => b.matchId === matchId);
            
            if (clickedButton.classList.contains('selected')) {
                // If button is already selected, deselect it and remove bet
                clickedButton.classList.remove('selected');
                selectedBets = selectedBets.filter(b => b.betId !== betId);
                console.log(`[BETSLIP] Bet removed: ${betId}`);
            } else {
                // If button is not selected, select it and add/replace bet
                if (existingBetFromMatch) {
                    // Remove old bet for this match if it exists
                    selectedBets = selectedBets.filter(b => b.matchId !== matchId);
                    // Deselect the old button visually
                    const oldSelectedButton = matchCard.querySelector('.btn-odd.selected');
                    if(oldSelectedButton) oldSelectedButton.classList.remove('selected');
                    console.log(`[BETSLIP] Existing bet for match ${matchId} replaced.`);
                }
                clickedButton.classList.add('selected'); // Select the new button
                selectedBets.push({ matchId, teams, betType, oddValue, betId }); // Add new bet
                console.log(`[BETSLIP] Bet added: ${betId}`);
            }
            updateBettingSlip(); // Update the slip display
        });
        console.log('[BETSLIP] Match list event listener attached.');
    } else {
        console.warn('[WARNING] Match list (id="match-list") not found for betting slip interactions. Odds selection will not work.');
    }

    // Event listener for removing a bet from the slip list (from inside the slip UI)
    if (selectedBetsList) {
        selectedBetsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-bet-btn')) {
                const slipItem = event.target.closest('.slip-item');
                if (!slipItem) return;
                const betIdToRemove = slipItem.dataset.betId;
                
                selectedBets = selectedBets.filter(b => b.betId !== betIdToRemove);

                // Find the original match card and deselect the corresponding button
                // This logic is crucial to keep the UI in sync
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
                console.log(`[BETSLIP] Bet removed from slip: ${betIdToRemove}`);
                updateBettingSlip(); // Update the slip display
            }
        });
        console.log('[BETSLIP] Selected bets list event listener attached.');
    }

    // Event listeners for the stake input and clear button
    if (stakeInput) {
        stakeInput.addEventListener('keyup', updateTotals);
        stakeInput.addEventListener('change', updateTotals);
        console.log('[BETSLIP] Stake input listeners attached.');
    } else {
        console.warn('[WARNING] Stake input not found for betting slip totals calculation.');
    }

    if (clearSlipBtn) {
        clearSlipBtn.addEventListener('click', () => {
            selectedBets = []; // Clear all bets
            // Deselect all currently selected odds buttons (only those visible on the current page)
            document.querySelectorAll('.btn-odd.selected').forEach(btn => btn.classList.remove('selected'));
            console.log('[BETSLIP] Betting slip cleared and odds deselected.');
            updateBettingSlip(); // Update the slip display (will hide it)
        });
        console.log('[BETSLIP] Clear slip button listener attached.');
    } else {
        console.warn('[WARNING] Clear slip button not found.');
    }

    // Initial update to ensure the slip starts in the correct state (hidden if no bets)
    updateBettingSlip();
    console.log('[INIT] Betting slip logic initialized successfully.');
}