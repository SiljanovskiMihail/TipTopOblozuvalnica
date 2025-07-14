        // Betting Slip elements (assuming these are *not* dynamically loaded after DOMContentLoaded)


    // --- 6. Betting Slip Logic ---
    function initializeBettingSlip(matchList) {
    let selectedBets = [];

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

    const updateTotals = () => {

        const TAX_RATE = 0.15;
        const totalOdds = selectedBets.reduce((total, bet) => total * parseFloat(bet.oddValue), 1);
        const stake = parseFloat(stakeInput ? stakeInput.value : '0') || 0;
        const potentialWinnings = totalOdds * stake;
        const taxAmount = (potentialWinnings - stake) * TAX_RATE;
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
    }