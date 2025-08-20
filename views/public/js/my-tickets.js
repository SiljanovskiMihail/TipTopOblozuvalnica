document.addEventListener('DOMContentLoaded', () => {

    const ticketsContainer = document.getElementById('my-tickets-container');
    if (!ticketsContainer) return;

    // --- Custom Pop-up Function (copied from bettingslip.js for standalone use) ---
const showTicketPopup = (message, title = 'Info', isConfirm = false) => {
    // Find if a popup already exists and remove it
    const existingPopup = document.querySelector('.ticket-popup');
    if(existingPopup) existingPopup.remove();

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
        // Use the correct class name based on the state
        const confirmBtn = popup.querySelector('.popup-yes-btn') || popup.querySelector('.popup-ok-btn');
        if (confirmBtn) {
            confirmBtn.onclick = () => close(true);
        }

        popup.querySelector('.popup-close-btn').onclick = () => close(false);
        if (isConfirm) {
            popup.querySelector('.popup-cancel-btn').onclick = () => close(false);
        }
        popup.addEventListener('click', e => {
            if (e.target === popup) close(false);
        });
    });
};

    const fetchAndRenderTickets = async () => {
        try {
            const response = await fetch('/api/my-tickets');
            if (response.status === 401) {
                ticketsContainer.innerHTML = '<p class="no-tickets-message">Треба да се најавите за да ги видите вашите тикети.</p>';
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch tickets.');
            
            const tickets = await response.json();
            renderTickets(tickets);

        } catch (error) {
            console.error(error);
            ticketsContainer.innerHTML = '<p class="no-tickets-message">Грешка при вчитување на тикетите.</p>';
        }
    };

    const renderTickets = (tickets) => {
        if (tickets.length === 0) {
            ticketsContainer.innerHTML = '<p class="no-tickets-message">Немате креирано тикети.</p>';
            return;
        }

        ticketsContainer.innerHTML = ''; // Clear loader
        tickets.forEach(ticket => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card';
            // Store data directly on the element for easy access
            ticketCard.dataset.ticketId = ticket.id;
            ticketCard.dataset.matches = JSON.stringify(ticket.matches);

            const createdAt = new Date(ticket.created_at).toLocaleString('mk-MK');

            ticketCard.innerHTML = `
                <div class="ticket-summary-header">
                    <div class="info-item">ID на тикет<span>${ticket.ticket_id}</span></div>
                    <div class="info-item">Уплата<span>${ticket.stake} ден.</span></div>
                    <div class="info-item">Вкупен коефициент<span>${ticket.total_odds}</span></div>
                    <div class="info-item">Можна добивка<span>${ticket.payout_after_tax} ден.</span></div>
                </div>
                <div class="ticket-details">
                    ${ticket.matches.map(match => {
                        return `
                            <div class="match-item">
                                <span class="match-id">${match.match_id.replace('match_', '')}</span>
                                <span class="match-teams">${match.team1} vs ${match.team2}</span>
                                <span class="match-bet">${match.bet_type}</span>
                                <span class="match-odd">${match.odd_value}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="ticket-actions">
                    <button class="btn-resend-ticket">Препушти</button>
                    <button class="btn-delete-ticket">Избриши</button>
                </div>
            `;
            ticketsContainer.appendChild(ticketCard);
        });
    };

    // --- Event Delegation for Clicks ---
    ticketsContainer.addEventListener('click', async (e) => {
        const ticketCard = e.target.closest('.ticket-card');
        if (!ticketCard) return;

        const ticketId = ticketCard.dataset.ticketId;

        // 1. Handle Header Click to Expand/Collapse
        if (e.target.closest('.ticket-summary-header')) {
            ticketCard.classList.toggle('expanded');
        }

        // 2. Handle Delete Button Click
        if (e.target.classList.contains('btn-delete-ticket')) {
            const confirmed = await showTicketPopup('Дали сте сигурни дека сакате да го избришете тикетот?', 'Потврда', true);
            if (confirmed) {
                try {
                    const response = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (response.ok) {
                        showTicketPopup('Тикетот е успешно избришан.', 'Успех');
                        ticketCard.remove(); // Remove from view
                        if (ticketsContainer.children.length === 0) {
                            ticketsContainer.innerHTML = '<p class="no-tickets-message">Немате креирано тикети.</p>';
                        }
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    showTicketPopup(`Грешка: ${error.message}`, 'Грешка');
                }
            }
        }
        
        // 3. Handle Resend Button Click
        if (e.target.classList.contains('btn-resend-ticket')) {
            const matchesJSON = ticketCard.dataset.matches;
            // Store the match data in sessionStorage to be read by the betting slip on the main page
            sessionStorage.setItem('resendTicketData', matchesJSON);
            // Redirect to the main page where the betting slip is
            window.location.href = '/'; 
        }
    });

    // Initial load
    fetchAndRenderTickets();
});
