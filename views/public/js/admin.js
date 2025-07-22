// views/public/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Selectors ---
    const addMatchForm = document.getElementById('add-match-form');
    const addMatchMessage = document.getElementById('add-match-message');
    const adminMatchList = document.getElementById('admin-match-list');
    const adminSearchInput = document.getElementById('admin-search-input');

    // Add Form Specific
    const newMatchIdInput = document.getElementById('new-match-id');
    const newExtraOddsContainer = document.getElementById('new-extra-odds-container');
    const addExtraOddBtn = document.getElementById('add-extra-odd-btn');

    // Edit Modal Specific
    const editMatchModal = document.getElementById('edit-match-modal');
    const editMatchForm = document.getElementById('edit-match-form');
    const editMatchIdDisplay = document.getElementById('edit-match-id-display');
    const editMatchIdHidden = document.getElementById('edit-match-id-hidden');
    const editSportNameInput = document.getElementById('edit-sport-name');
    const editTeam1Input = document.getElementById('edit-team1');
    const editTeam2Input = document.getElementById('edit-team2');
    const editMatchTimeInput = document.getElementById('edit-match-time');
    const editMatchMessage = document.getElementById('edit-match-message');
    const modalCloseBtn = editMatchModal.querySelector('.close-btn');
    
    // Selectors for Edit Modal Odds
    const editMainOddsContainer = document.getElementById('edit-main-odds-container');
    const editExtraOddsContainer = document.getElementById('edit-extra-odds-container');
    const addEditOddFieldBtn = document.getElementById('add-edit-odd-field-btn');

    // --- NEW: Selectors for Delete Confirmation Modal ---
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const deleteMatchInfo = document.getElementById('delete-match-info');
    const deleteConfirmMessage = document.getElementById('delete-confirm-message');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const deleteMatchIdHidden = document.getElementById('delete-match-id-hidden');
    const deleteModalCloseBtn = document.getElementById('delete-modal-close-btn');
    const deleteConfirmContent = document.getElementById('delete-confirm-content'); // For hiding buttons

    const MAX_EXTRA_ODDS = 6;

    // --- State for all fetched matches ---
    let allMatches = [];

    // --- Utility Functions ---
    const formatDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    };

    const showMessage = (element, message, isSuccess) => {
        element.textContent = message;
        element.className = 'form-message'; // Reset classes
        element.classList.add(isSuccess ? 'success' : 'error');
        element.style.display = message ? 'block' : 'none'; // Show/hide based on message
    };

    // --- Dynamic Odd Field Management ---
    // ... (This section remains unchanged)
    const addExtraOddField = () => {
        if (newExtraOddsContainer.children.length >= MAX_EXTRA_ODDS) {
            showMessage(addMatchMessage, `Може да додадете најмногу ${MAX_EXTRA_ODDS} дополнителни коефициенти.`, false);
            return;
        }
        const oddInputGroup = document.createElement('div');
        oddInputGroup.className = 'odd-input-group';
        oddInputGroup.innerHTML = `
            <input type="text" class="odd-type-input" placeholder="Тип (пр: ГГ, 3+)..." required>
            <input type="number" step="0.01" class="odd-value-input" placeholder="Коефициент..." required>
            <button type="button" class="remove-odd-btn">X</button>
        `;
        newExtraOddsContainer.appendChild(oddInputGroup);
        oddInputGroup.querySelector('.remove-odd-btn').addEventListener('click', () => oddInputGroup.remove());
    };
    if(addExtraOddBtn) addExtraOddBtn.addEventListener('click', addExtraOddField);

    const updateAddOddButtonState = () => {
        const canAddMore = editExtraOddsContainer.children.length < MAX_EXTRA_ODDS;
        addEditOddFieldBtn.disabled = !canAddMore;
        if (!canAddMore) {
            showMessage(editMatchMessage, `Достигнат е максимумот од ${MAX_EXTRA_ODDS} дополнителни коефициенти.`, false);
        } else {
            if (editMatchMessage.textContent.includes('Достигнат е максимумот')) {
                showMessage(editMatchMessage, '', true);
            }
        }
    };

    const createMainOddField = (oddType, oddValue) => {
        const oddInputGroup = document.createElement('div');
        oddInputGroup.className = 'odd-input-group';
        oddInputGroup.innerHTML = `
            <input type="text" class="odd-type-input" value="${oddType}" readonly>
            <input type="number" step="0.01" class="odd-value-input" placeholder="Коефициент..." value="${oddValue}" required>
            `;
        editMainOddsContainer.appendChild(oddInputGroup);
    };

    const createExtraOddField = (oddType = '', oddValue = '') => {
        const oddInputGroup = document.createElement('div');
        oddInputGroup.className = 'odd-input-group';
        oddInputGroup.innerHTML = `
            <input type="text" class="odd-type-input" placeholder="Тип (пр: ГГ, 3+)..." value="${oddType}" required>
            <input type="number" step="0.01" class="odd-value-input" placeholder="Коефициент..." value="${oddValue}" required>
            <button type="button" class="remove-odd-btn">X</button>
        `;
        editExtraOddsContainer.appendChild(oddInputGroup);
        
        oddInputGroup.querySelector('.remove-odd-btn').addEventListener('click', () => {
            oddInputGroup.remove();
            updateAddOddButtonState();
        });
        
        updateAddOddButtonState();
    };

    if(addEditOddFieldBtn) addEditOddFieldBtn.addEventListener('click', () => createExtraOddField());

    // --- API Calls and Rendering ---
    // ... (renderMatches, fetchAndRenderMatches, filterAndRenderAdminMatches remain unchanged)
    const renderMatches = (matchesToRender) => {
        adminMatchList.innerHTML = '';
        if (matchesToRender.length === 0) {
            adminMatchList.innerHTML = '<p>Нема пронајдени утакмици за управување.</p>';
            return;
        }

        matchesToRender.sort((a, b) => new Date(b.match_time) - new Date(a.match_time));

        matchesToRender.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.dataset.matchId = match.match_id_str;
            const displayMatchId = match.match_id_str.replace('match_', '');

            matchCard.innerHTML = `
                <div class="match-card-header">
                    <div class="match-meta">
                        <div class="meta-item">
                            <span class="match-id-display">${displayMatchId}</span>
                            <span>${new Date(match.match_time).toLocaleString('mk-MK')}</span>
                        </div>
                        <div class="meta-item"><span>${match.sport_display_name}</span></div>
                    </div>
                    <div class="match-teams">
                        <div class="team-name">${match.team1}</div>
                        <div class="vs">vs</div>
                        <div class="team-name">${match.team2}</div>
                    </div>
                </div>
                <div class="match-actions">
                    <button class="btn-edit" data-match-id="${match.match_id_str}">Измени</button>
                    <button class="btn-delete" data-match-id="${match.match_id_str}">Избриши</button>
                </div>
            `;
            adminMatchList.appendChild(matchCard);
        });

        addEventListenersToAdminMatchButtons();
    };

    const fetchAndRenderMatches = async () => {
        try {
            const response = await fetch('/api/matches');
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch');
            const matches = await response.json();
            
            allMatches = matches;
            filterAndRenderAdminMatches();
        } catch (error) {
            console.error('Error fetching matches for admin:', error);
            showMessage(document.getElementById('admin-matches-message'), `Грешка при вчитување: ${error.message}`, false);
        }
    };

    const filterAndRenderAdminMatches = () => {
        const searchTerm = adminSearchInput ? adminSearchInput.value.toLowerCase() : '';
        let filtered = allMatches;

        if (searchTerm) {
            filtered = allMatches.filter(match => 
                match.team1.toLowerCase().includes(searchTerm) || 
                match.team2.toLowerCase().includes(searchTerm)
            );
        }
        renderMatches(filtered);
    };

    // --- MODIFIED: Event Listener setup ---
    const addEventListenersToAdminMatchButtons = () => {
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', (e) => openEditModal(e.target.dataset.matchId));
        });
        document.querySelectorAll('.btn-delete').forEach(button => {
            // CHANGED: Instead of confirm(), call our new modal function
            button.addEventListener('click', (e) => openDeleteModal(e.target.dataset.matchId));
        });
    };
    
    // --- NEW: Function to open the delete modal ---
    const openDeleteModal = (matchId) => {
        const match = allMatches.find(m => m.match_id_str === matchId);
        if (!match) {
            return;
        }

        // Reset modal state
        deleteMatchIdHidden.value = matchId;
        const displayId = matchId.replace('match_', '');
        deleteMatchInfo.innerHTML = `ID: ${displayId} (${match.team1} vs ${match.team2})`;
        showMessage(deleteConfirmMessage, '', true); // Clear previous messages
        deleteConfirmContent.style.display = 'block'; // Show the confirmation text and buttons

        // Show the modal
        deleteConfirmModal.classList.add('modal-visible');
    };

    // --- MODIFIED: The deleteMatch function now updates the modal instead of alerting ---
    const deleteMatch = async (matchId) => {
        confirmDeleteBtn.disabled = true; // Prevent double clicks
        showMessage(deleteConfirmMessage, 'Бришење во тек...', true);

        try {
            const response = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Show success message inside the modal
            showMessage(deleteConfirmMessage, data.message, true);
            deleteConfirmContent.style.display = 'none'; // Hide "Are you sure?" and Yes/No buttons
            
            fetchAndRenderMatches(); // Refresh the main list

        } catch (error) {
            console.error('Error deleting match:', error);
            // Show error message inside the modal
            showMessage(deleteConfirmMessage, `Грешка при бришење: ${error.message}`, false);
            confirmDeleteBtn.disabled = false; // Re-enable button on failure
        }
    };
    
    // ... (openEditModal remains unchanged)
    const openEditModal = async (matchId) => {
        try {
            const response = await fetch(`/api/matches/${matchId}`);
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch details');
            const match = await response.json();

            editMatchIdDisplay.value = match.match_id_str.replace('match_', '');
            editMatchIdHidden.value = match.match_id_str;
            editSportNameInput.value = match.sport_display_name;
            editTeam1Input.value = match.team1;
            editTeam2Input.value = match.team2;
            editMatchTimeInput.value = formatDateTimeLocal(match.match_time);

            editMainOddsContainer.innerHTML = '';
            editExtraOddsContainer.innerHTML = '';
            showMessage(editMatchMessage, '', true);

            match.odds.forEach(odd => {
                if (odd.is_main_odd) {
                    createMainOddField(odd.odd_type, odd.odd_value);
                } else {
                    createExtraOddField(odd.odd_type, odd.odd_value);
                }
            });

            updateAddOddButtonState();
            editMatchModal.classList.add('modal-visible');
        } catch (error) {
            console.error('Error opening edit modal:', error);
        }
    };

    // --- Form Submission Handlers ---
    // ... (addMatchForm and editMatchForm handlers remain unchanged)
    if(addMatchForm) {
        addMatchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage(addMatchMessage, 'Додавам утакмица...', true);

            const matchIdValue = newMatchIdInput.value.trim();
            newMatchIdInput.setCustomValidity('');

            if (!matchIdValue) {
                newMatchIdInput.setCustomValidity('ID на Утакмица е задолжително.');
                newMatchIdInput.reportValidity();
                showMessage(addMatchMessage, 'Ве молиме пополнете го ID на Утакмица.', false);
                return;
            }
            if (!/^\d{4}$/.test(matchIdValue)) {
                newMatchIdInput.setCustomValidity('ID на Утакмица мора да биде точно 4 цифри.');
                newMatchIdInput.reportValidity();
                showMessage(addMatchMessage, 'ID на Утакмица мора да биде точно 4 цифри.', false);
                return;
            }

            const odds = [];
            document.querySelectorAll('.main-odd-value-input').forEach(input => {
                if (input.value) {
                    odds.push({
                        odd_type: input.dataset.oddType,
                        odd_value: parseFloat(input.value),
                        is_main_odd: true
                    });
                }
            });

            newExtraOddsContainer.querySelectorAll('.odd-input-group').forEach(group => {
                const type = group.querySelector('.odd-type-input').value;
                const value = group.querySelector('.odd-value-input').value;
                if (type && value) {
                    odds.push({
                        odd_type: type,
                        odd_value: parseFloat(value),
                        is_main_odd: false
                    });
                }
            });

            const body = {
                match_id_num: matchIdValue,
                sport_display_name: document.getElementById('new-sport-name').value,
                team1: document.getElementById('new-team1').value,
                team2: document.getElementById('new-team2').value,
                match_time: document.getElementById('new-match-time').value,
                odds: odds
            };

            try {
                const response = await fetch('/api/matches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                showMessage(addMatchMessage, data.message, true);
                addMatchForm.reset();
                newExtraOddsContainer.innerHTML = '';
                fetchAndRenderMatches();
            } catch (error) {
                console.error('Error adding match:', error);
                showMessage(addMatchMessage, `Грешка: ${error.message}`, false);
            }
        });
    }

    if(editMatchForm) {
        editMatchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage(editMatchMessage, 'Зачувувам промени...', true);

            const odds = [];
            
            editMainOddsContainer.querySelectorAll('.odd-input-group').forEach(group => {
                const type = group.querySelector('.odd-type-input').value;
                const value = group.querySelector('.odd-value-input').value;
                if (type && value) {
                    odds.push({
                        odd_type: type,
                        odd_value: parseFloat(value),
                        is_main_odd: true
                    });
                }
            });

            editExtraOddsContainer.querySelectorAll('.odd-input-group').forEach(group => {
                const type = group.querySelector('.odd-type-input').value;
                const value = group.querySelector('.odd-value-input').value;
                if (type && value) {
                    odds.push({
                        odd_type: type,
                        odd_value: parseFloat(value),
                        is_main_odd: false
                    });
                }
            });

            const body = {
                sport_display_name: editSportNameInput.value,
                team1: editTeam1Input.value,
                team2: editTeam2Input.value,
                match_time: editMatchTimeInput.value,
                odds: odds
            };
            
            const matchId = editMatchIdHidden.value;

            try {
                const response = await fetch(`/api/matches/${matchId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                
                showMessage(editMatchMessage, data.message, true);
                setTimeout(() => {
                    editMatchModal.classList.remove('modal-visible');
                    showMessage(editMatchMessage, '', true);
                }, 1500);
                fetchAndRenderMatches();
            } catch (error) {
                console.error('Error updating match:', error);
                showMessage(editMatchMessage, `Грешка: ${error.message}`, false);
            }
        });
    }

    // --- NEW: Event listeners for the delete modal buttons ---
    if(confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            const matchId = deleteMatchIdHidden.value;
            if (matchId) {
                deleteMatch(matchId);
            }
        });
    }
    if(cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => deleteConfirmModal.classList.remove('modal-visible'));
    if(deleteModalCloseBtn) deleteModalCloseBtn.addEventListener('click', () => deleteConfirmModal.classList.remove('modal-visible'));


    // --- MODIFIED: Window click listener to close *either* modal ---
    window.addEventListener('click', (event) => {
        if (event.target === editMatchModal) {
            editMatchModal.classList.remove('modal-visible');
        }
        if (event.target === deleteConfirmModal) {
            deleteConfirmModal.classList.remove('modal-visible');
        }
        if(modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
            editMatchModal.classList.remove('modal-visible');
    });
}
    });

    // --- Search Input Listener ---
    if (adminSearchInput) {
        adminSearchInput.addEventListener('keyup', filterAndRenderAdminMatches);
    }

    // --- Initial Load ---
    fetchAndRenderMatches();
});