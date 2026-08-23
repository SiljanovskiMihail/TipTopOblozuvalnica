export const showTicketPopup = (message, title = 'Info', isConfirm = false) => {
    const existingPopup = document.querySelector('.ticket-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.className = 'ticket-popup';
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
        const close = (value) => {
            popup.remove();
            resolve(value);
        };
        const confirmBtn = popup.querySelector('.popup-yes-btn') || popup.querySelector('.popup-ok-btn');
        if (confirmBtn) confirmBtn.onclick = () => close(true);

        popup.querySelector('.popup-close-btn').onclick = () => close(false);
        if (isConfirm) {
            popup.querySelector('.popup-cancel-btn').onclick = () => close(false);
        }
        popup.addEventListener('click', e => {
            if (e.target === popup) close(false);
        });
    });
};

export async function initializeMyTickets() {
    const ticketsContainer = document.getElementById('my-tickets-container');
    if (!ticketsContainer) return;

    const renderTickets = (tickets) => {
        if (tickets.length === 0) {
            ticketsContainer.innerHTML = '<p class="no-tickets-message">Немате креирано тикети.</p>';
            return;
        }

        ticketsContainer.innerHTML = ''; 
        tickets.forEach(ticket => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card';
            ticketCard.dataset.ticketId = ticket.id;
            ticketCard.dataset.matches = JSON.stringify(ticket.matches);

            ticketCard.innerHTML = `
                <div class="ticket-summary-header">
                    <div class="info-item">Број на тикет<span>${ticket.ticket_id}</span></div>
                    <div class="info-item">Уплата<span>${ticket.stake} ден.</span></div>
                    <div class="info-item">Коефициент<span>${ticket.total_odds}</span></div>
                    <div class="info-item">Добивка<span>${ticket.payout_after_tax} ден.</span></div>
                </div>
                <div class="ticket-details">
                    ${ticket.matches.map(match => `
                        <div class="match-item">
                            <span class="match-id">${match.match_id.replace('match_', '')}</span>
                            <span class="match-teams">${match.team1} vs ${match.team2}</span>
                            <span class="match-bet">${match.bet_type}</span>
                            <span class="match-odd">${match.odd_value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="ticket-actions">
                    <button class="btn-resend-ticket">Препушти</button>
                    <button class="btn-delete-ticket">Избриши</button>
                </div>
            `;
            ticketsContainer.appendChild(ticketCard);
        });
    };

    ticketsContainer.addEventListener('click', async (e) => {
        const ticketCard = e.target.closest('.ticket-card');
        if (!ticketCard) return;

        const ticketId = ticketCard.dataset.ticketId;

        if (e.target.closest('.ticket-summary-header')) {
            ticketCard.classList.toggle('expanded');
        }

        if (e.target.classList.contains('btn-delete-ticket')) {
            const confirmed = await showTicketPopup('Избриши тикет?', 'Потврда', true);
            if (confirmed) {
                try {
                    const res = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
                    if (res.ok) {
                        ticketCard.remove();
                        if (ticketsContainer.children.length === 0) {
                            ticketsContainer.innerHTML = '<p class="no-tickets-message">Немате креирано тикети.</p>';
                        }
                    }
                } catch (err) {
                    console.error("Delete failed", err);
                }
            }
        }

        if (e.target.classList.contains('btn-resend-ticket')) {
            sessionStorage.setItem('resendTicketData', ticketCard.dataset.matches);
            window.location.href = '/'; 
        }
    });

    try {
        const response = await fetch('/api/my-tickets');
        if (response.status === 401) {
            ticketsContainer.innerHTML = '<p>Најавете се.</p>';
            return;
        }
        const tickets = await response.json();
        renderTickets(tickets);
    } catch (error) {
        ticketsContainer.innerHTML = '<p>Грешка.</p>';
    }
}

window.initializeMyTickets = initializeMyTickets;
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    initializeMyTickets();
}