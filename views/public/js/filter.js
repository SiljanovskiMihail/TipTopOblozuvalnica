    // Match filtering elements
    function initializeFilters(matchList) {
    const sportFilter = document.getElementById('sport-filter');
    const timeSort = document.getElementById('time-sort');
    const searchInput = document.getElementById('search-input');
    const allMatchCards = matchList ? Array.from(matchList.children) : [];

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
    }