// Wrap all the code in a DOMContentLoaded listener.
// This ensures the script runs only after the HTML document is fully loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    // Get the element inside the event listener to make sure it exists.
    const matchList = document.getElementById('match-list');

    // Add a check to ensure the element was found before proceeding.
    if (!matchList) {
        console.error("Error: Element with ID 'match-list' not found in the DOM.");
        return; // Stop the script if the element is not there.
    }

    fetch('/api/matches')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Server error')
                });
            }
            return response.json();
        })
        .then(matches => {
            matchList.innerHTML = '';

            if (matches.length === 0) {
                matchList.innerHTML = '<p>No matches found.</p>';
                return;
            }

            const formatMatchTime = (dateString) => {
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

            matches.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                matchCard.id = `match_${match.match_id_str}`;
                matchCard.dataset.sport = match.sport_display_name.toLowerCase();
                matchCard.dataset.time = match.match_time;

                const mainOddsHtml = [];
                const extraOddsHtml = [];

                // Separate main odds from extra odds
                match.odds.forEach(odd => {
                    const oddValue = parseFloat(odd.odd_value);
                    const displayOddValue = isNaN(oddValue) ? 'N/A' : oddValue.toFixed(2);

                    const oddHtml = `
                        <div class="odd-item-container">
                            <span class="odd-type">${odd.odd_type}</span>
                            <button class="btn-odd"><span class="odd-value">${displayOddValue}</span></button>
                        </div>
                    `;
                    if (odd.is_main_odd) {
                        mainOddsHtml.push(oddHtml);
                    } else {
                        extraOddsHtml.push(oddHtml);
                    }
                });

                // *** FIX START ***
                // Remove 'match_' prefix for display
                const displayMatchId = match.match_id_str.replace('match_', '');
                // *** FIX END ***

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
                        <div class="main-odds">
                            ${mainOddsHtml.join('')}
                        </div>
                        <div class="extra-odds">
                            ${extraOddsHtml.join('')}
                        </div>
                    </div>
                `;
                matchList.appendChild(matchCard);
            });
        })
        .catch(error => {
            console.error('Error fetching matches:', error);
            if (matchList) {
                matchList.innerHTML = `<p class="error-message">Could not load matches: ${error.message}</p>`;
            }
        });
});
