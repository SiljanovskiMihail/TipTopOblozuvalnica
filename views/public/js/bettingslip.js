export const calculateTax = (potentialWinnings, stake, rate = 0.15) => {
    const profit = Math.max(0, potentialWinnings - stake);
    return profit * rate;
};
export const getSelectionText = (count) => {
    if (count === 0) return "0 Утакмици";
    if (count === 1) return "1 Утакмица";
    return `${count} Утакмици`;
};
export const calculateTotalOdds = (bets) => {
    if (bets.length === 0) return 1.00;
    const total = bets.reduce((acc, bet) => acc * parseFloat(bet.oddValue), 1);
    return parseFloat(total.toFixed(2));
};
export const updateBetsArray = (currentBets, newBet) => {
    const filteredBets = currentBets.filter(bet => bet.matchId !== newBet.matchId);
    const isExactDuplicate = currentBets.some(bet => bet.betId === newBet.betId);
    return isExactDuplicate ? filteredBets : [...filteredBets, newBet];
};

export function initializeBettingSlip(matchListFromArgs) {
    let selectedBets = [];

    const elements = {
        container: document.getElementById('betting-slip-container'),
        summary: document.getElementById('slip-summary'),
        list: document.getElementById('selected-bets-list'),
        count: document.getElementById('slip-selection-count'),
        slipTotalOdds: document.getElementById('slip-total-odds'), 
        totalOddsValue: document.getElementById('total-odds-value'), 
        stake: document.getElementById('stake-input'),
        potential: document.getElementById('potential-winnings-value'),
        tax: document.getElementById('tax-amount-value'),
        payout: document.getElementById('final-payout-value'),
        clearBtn: document.getElementById('clear-slip-btn'),
        placeBtn: document.querySelector('.btn-place-bet'),
        matchList: matchListFromArgs || document.getElementById('match-list')
    };

    const waitForDomLoad = (selector) => {
        return new Promise(resolve => {
            if (document.querySelector(selector)) return resolve(document.querySelector(selector));
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    };

    const showTicketPopup = (message, title = 'Info', isConfirm = false) => {
        const existingPopup = document.querySelector('.ticket-popup');
        if (existingPopup) existingPopup.remove();
        
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

        return new Promise((resolve) => {
            const close = (value) => { popup.remove(); resolve(value); };
            const confirmBtn = popup.querySelector('.popup-yes-btn') || popup.querySelector('.popup-ok-btn');
            if (confirmBtn) confirmBtn.onclick = () => close(true);
            popup.querySelector('.popup-close-btn').onclick = () => close(false);
            if (isConfirm) popup.querySelector('.popup-cancel-btn').onclick = () => close(false);
            popup.onclick = e => { if (e.target === popup) close(false); };
        });
    };

    const updateTotals = () => {
        const odds = calculateTotalOdds(selectedBets);
        const stake = parseFloat(elements.stake?.value || '0') || 0;
        const totalWinnings = odds * stake;
        const tax = calculateTax(totalWinnings, stake);
        const final = totalWinnings - tax;

        if (elements.count) elements.count.textContent = getSelectionText(selectedBets.length);
        if (elements.slipTotalOdds) elements.slipTotalOdds.textContent = odds.toFixed(2);
        if (elements.totalOddsValue) elements.totalOddsValue.textContent = odds.toFixed(2);
        if (elements.potential) elements.potential.textContent = totalWinnings.toFixed(2);
        if (elements.tax) elements.tax.textContent = tax.toFixed(2);
        if (elements.payout) elements.payout.textContent = final.toFixed(2);
    };

    const renderUI = () => {
        if (!elements.container) return;
        elements.container.classList.toggle('hidden', selectedBets.length === 0);
        
        if (elements.list) {
            elements.list.innerHTML = selectedBets.map(bet => `
                <div class="slip-item" data-bet-id="${bet.betId}">
                    <div class="slip-item-info">
                        <div class="teams">${bet.teams}</div>
                        <div class="bet-type">Тип: ${bet.betType}</div>
                    </div>
                    <span class="odd-value">${bet.oddValue}</span>
                    <button class="remove-bet-btn" data-id="${bet.betId}">&times;</button>
                </div>
            `).join('');
        }

        document.querySelectorAll('.match-card .btn-odd.selected').forEach(btn => btn.classList.remove('selected'));
        selectedBets.forEach(bet => {
            const card = document.getElementById(bet.matchId);
            if (card) {
                const btn = Array.from(card.querySelectorAll('.btn-odd')).find(b => 
                    b.closest('.odd-item-container')?.querySelector('.odd-type')?.textContent.trim() === bet.betType
                );
                if (btn) btn.classList.add('selected');
            }
        });
        updateTotals();
    };

    if (elements.matchList) {
        elements.matchList.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-odd');
            if (!btn) return;
            const card = btn.closest('.match-card');
            const betType = btn.closest('.odd-item-container').querySelector('.odd-type').textContent.trim();
            const newBet = {
                matchId: card.id,
                teams: Array.from(card.querySelectorAll('.team-name')).map(el => el.textContent).join(' vs '),
                betType: betType,
                oddValue: btn.querySelector('.odd-value').textContent,
                betId: `${card.id}_${betType}`
            };
            selectedBets = updateBetsArray(selectedBets, newBet);
            renderUI();
        });
    }

    if (elements.list) {
        elements.list.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-bet-btn')) {
                selectedBets = selectedBets.filter(b => b.betId !== e.target.dataset.id);
                renderUI();
            }
        });
    }

    if (elements.placeBtn) {
        elements.placeBtn.addEventListener('click', async () => {
            const stake = parseFloat(elements.stake.value);
            if (!stake || stake <= 0) return showTicketPopup('Ве молиме внесете износ на уплата!', 'Грешка!');
            if (selectedBets.length === 0) return showTicketPopup('Ве молиме изберете утакмица!', 'Грешка!');

            const ticketData = {
                num_matches: selectedBets.length,
                total_odds: calculateTotalOdds(selectedBets),
                stake,
                payout: parseFloat(elements.potential.textContent),
                payout_after_tax: parseFloat(elements.payout.textContent),
                matches: selectedBets.map(b => {
                    const [t1, t2] = b.teams.split(' vs ');
                    return { match_id: b.matchId, team1: t1.trim(), team2: t2.trim(), bet_type: b.betType, odd_value: parseFloat(b.oddValue) };
                })
            };

            try {
                const res = await fetch('/create-ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ticketData)
                });
                const result = await res.json();
                if (res.ok) {
                    showTicketPopup(`Број на тикет: ${result.ticketId}`, 'Тикетот е креиран!');
                    selectedBets = [];
                    if (elements.stake) elements.stake.value = '';
                    renderUI();
                } else {
                    showTicketPopup(`Грешка: ${result.message}`, 'Грешка');
                }
            } catch (err) {
                showTicketPopup('Грешка при креирање на тикетот!', 'Грешка!');
            }
        });
    }

    if (elements.summary) {
        elements.summary.addEventListener('click', () => {
            if (selectedBets.length > 0) elements.container.classList.toggle('expanded');
        });
    }

    if (elements.stake) elements.stake.addEventListener('input', updateTotals);
    
    if (elements.clearBtn) {
        elements.clearBtn.addEventListener('click', () => {
            selectedBets = [];
            if (elements.stake) elements.stake.value = '';
            renderUI();
        });
    }

    const resendDataJSON = sessionStorage.getItem('resendTicketData');
    if (resendDataJSON) {
        try {
            const matchesToResend = JSON.parse(resendDataJSON);
            selectedBets = matchesToResend.map(match => {
                const cleanMatchId = `match_match_${match.match_id.replace(/[^0-9]/g, '')}`;

                return {
                    matchId: cleanMatchId,
                    teams: `${match.team1} vs ${match.team2}`,
                    betType: match.bet_type,
                    oddValue: match.odd_value,
                    betId: `${cleanMatchId}_${match.bet_type}`
                };
            });
            sessionStorage.removeItem('resendTicketData');

            waitForDomLoad('.match-card').then(() => {
                renderUI();
                if (selectedBets.length > 0 && elements.container) {
                    elements.container.classList.add('expanded');
                }
            });
        } catch (error) {
            console.error("Failed to parse resent ticket data:", error);
            sessionStorage.removeItem('resendTicketData');
        }
    } else {
        renderUI();
    }
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    const defaultList = document.getElementById('match-list');
    initializeBettingSlip(defaultList);
}