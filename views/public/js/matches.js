export const formatMatchTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let day;
    if (date.toDateString() === today.toDateString()) {
        day = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        day = 'Tomorrow';
    } else {
        day = date.toLocaleDateString();
    }

    const time = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return `${day}, ${time}`;
};

export async function initializeMatches() {
    const matchList = document.getElementById('match-list');
    if (!matchList) return;

    try {
        const response = await fetch('/api/matches');
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
        }
        
        const matches = await response.json();
        matchList.innerHTML = '';


        matches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.id = `match_${match.match_id_str}`;
            matchCard.dataset.sport = match.sport_display_name.toLowerCase();
            matchCard.dataset.time = match.match_time;

            const mainOddsHtml = [];
            const extraOddsHtml = [];

            match.odds.forEach(odd => {
                const oddValue = parseFloat(odd.odd_value);
                const displayOddValue = isNaN(oddValue) ? 'N/A' : oddValue.toFixed(2);

                const oddHtml = `
                    <div class="odd-item-container">
                        <span class="odd-type">${odd.odd_type}</span>
                        <button class="btn-odd"><span class="odd-value">${displayOddValue}</span></button>
                    </div>
                `;
                if (odd.is_main_odd) mainOddsHtml.push(oddHtml);
                else extraOddsHtml.push(oddHtml);
            });

            const displayMatchId = match.match_id_str.replace('match_', '');

            matchCard.innerHTML = `
                <div class="match-card-header">
                    <div class="match-meta">
                        <div class="meta-item">
                            <span class="match-id-display">${displayMatchId}</span>
                            <span id="match-date-${displayMatchId}">${formatMatchTime(match.match_time)}</span>
                        </div>
                        <div class="meta-item">
                            <span>${match.sport_display_name}</span>
                        </div>
                    </div>
                    <div class="match-teams">
                        <div class="team-name">${match.team1}</div>
                        <div class="vs">vs</div>
                        <div class="team-name">${match.team2}</div>
                    </div>
                </div>
                <div class="match-odds football-bets-container">
                    <div class="main-odds">${mainOddsHtml.join('')}</div>
                    <div class="extra-odds">${extraOddsHtml.join('')}</div>
                </div>
            `;
            matchList.appendChild(matchCard);
        });

        window.dispatchEvent(new window.Event('matchesLoaded', { bubbles: true }));

                if (matches.length === 0) {
            matchList.innerHTML = '<p>No matches found.</p>';
            return;
        }


    } catch (error) {
        console.error('Error fetching matches:', error);
        matchList.innerHTML = `<p class="error-message">Could not load matches: ${error.message}</p>`;
    }
}

window.initializeMatches = initializeMatches;
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    initializeMatches();
}