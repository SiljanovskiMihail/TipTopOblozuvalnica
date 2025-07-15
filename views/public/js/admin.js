// views/public/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Selectors ---
    const addMatchForm = document.getElementById('add-match-form');
    const addMatchMessage = document.getElementById('add-match-message');
    const adminMatchList = document.getElementById('admin-match-list');
    
    // Add Form Specific
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
    const editOddsContainer = document.getElementById('edit-odds-container');
    const addEditOddFieldBtn = document.getElementById('add-edit-odd-field-btn');
    const editMatchMessage = document.getElementById('edit-match-message');
    const modalCloseBtn = editMatchModal.querySelector('.close-btn');

    const MAX_EXTRA_ODDS = 6;

    // --- Utility Functions ---
    const formatDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const showMessage = (element, message, isSuccess) => {
        element.textContent = message;
        element.className = 'form-message'; // Reset classes
        element.classList.add(isSuccess ? 'success' : 'error');
    };

    // --- Dynamic Odd Field Management ---

    // For "Add New Match" form (Extra Odds)
    const addExtraOddField = () => {
        if (newExtraOddsContainer.children.length >= MAX_EXTRA_ODDS) {
            showMessage(addMatchMessage, `Може да додадете најмногу ${MAX_EXTRA_ODDS} дополнителни коефициенти.`, false);
            return;
        }
        const oddInputGroup = document.createElement('div');
        oddInputGroup.className = 'odd-input-group';
        oddInputGroup.innerHTML = `
            <input type="text" class="odd-type-input" placeholder="Тип (пр: ГГ, 3+)" required>
            <input type="number" step="0.01" class="odd-value-input" placeholder="Вредност" required>
            <button type="button" class="remove-odd-btn">X</button>
        `;
        newExtraOddsContainer.appendChild(oddInputGroup);
        oddInputGroup.querySelector('.remove-odd-btn').addEventListener('click', () => oddInputGroup.remove());
    };

    addExtraOddBtn.addEventListener('click', addExtraOddField);

    // For "Edit Match" modal (All Odds)
    const addOddFieldForEdit = (container, oddType = '', oddValue = '', isMainOdd = false) => {
        const oddInputGroup = document.createElement('div');
        oddInputGroup.className = 'odd-input-group';
        // In the edit modal, all odds are treated the same way for simplicity of the UI
        oddInputGroup.innerHTML = `
            <input type="text" class="odd-type-input" placeholder="Тип" value="${oddType}" required>
            <input type="number" step="0.01" class="odd-value-input" placeholder="Вредност" value="${oddValue}" required>
            <label class="checkbox-container">Главна
                <input type="checkbox" class="is-main-odd-input" ${isMainOdd ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
            <button type="button" class="remove-odd-btn">X</button>
        `;
        container.appendChild(oddInputGroup);
        oddInputGroup.querySelector('.remove-odd-btn').addEventListener('click', () => oddInputGroup.remove());
    };
    
    addEditOddFieldBtn.addEventListener('click', () => addOddFieldForEdit(editOddsContainer));


    // --- API Calls and Rendering ---

    const fetchAndRenderMatches = async () => {
        try {
            const response = await fetch('/api/matches');
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch');
            const matches = await response.json();
            
            adminMatchList.innerHTML = '';
            if (matches.length === 0) {
                adminMatchList.innerHTML = '<p>Нема пронајдени утакмици за управување.</p>';
                return;
            }

            matches.forEach(match => {
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
        } catch (error) {
            console.error('Error fetching matches for admin:', error);
            showMessage(document.getElementById('admin-matches-message'), `Грешка при вчитување: ${error.message}`, false);
        }
    };

    const addEventListenersToAdminMatchButtons = () => {
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', (e) => openEditModal(e.target.dataset.matchId));
        });
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm(`Дали сте сигурни дека сакате да ја избришете утакмицата ID: ${e.target.dataset.matchId}?`)) {
                    deleteMatch(e.target.dataset.matchId);
                }
            });
        });
    };

    const openEditModal = async (matchId) => {
        try {
            const response = await fetch(`/api/matches/${matchId}`);
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch details');
            const match = await response.json();

            editMatchIdDisplay.value = match.match_id_str;
            editMatchIdHidden.value = match.match_id_str;
            editSportNameInput.value = match.sport_display_name;
            editTeam1Input.value = match.team1;
            editTeam2Input.value = match.team2;
            editMatchTimeInput.value = formatDateTimeLocal(match.match_time);

            editOddsContainer.innerHTML = '';
            match.odds.forEach(odd => {
                addOddFieldForEdit(editOddsContainer, odd.odd_type, odd.odd_value, odd.is_main_odd);
            });

            showMessage(editMatchMessage, '', true); // Clear previous messages
            editMatchModal.classList.add('modal-visible');
        } catch (error) {
            console.error('Error opening edit modal:', error);
            alert(`Грешка при вчитување на утакмица: ${error.message}`);
        }
    };

    const deleteMatch = async (matchId) => {
        try {
            const response = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            alert(data.message);
            fetchAndRenderMatches();
        } catch (error) {
            console.error('Error deleting match:', error);
            alert(`Грешка при бришење: ${error.message}`);
        }
    };

    // --- Form Submission Handlers ---

    // ADD MATCH
    addMatchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage(addMatchMessage, 'Додавам утакмица...', true);

        const odds = [];
        // Collect main odds
        document.querySelectorAll('.main-odd-value-input').forEach(input => {
            if (input.value) {
                odds.push({
                    odd_type: input.dataset.oddType,
                    odd_value: parseFloat(input.value),
                    is_main_odd: true
                });
            }
        });

        // Collect extra odds
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
            match_id_num: parseInt(document.getElementById('new-match-id').value),
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

    // EDIT MATCH
    editMatchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showMessage(editMatchMessage, 'Зачувувам промени...', true);

        const odds = [];
        editOddsContainer.querySelectorAll('.odd-input-group').forEach(group => {
            const type = group.querySelector('.odd-type-input').value;
            const value = group.querySelector('.odd-value-input').value;
            const isMain = group.querySelector('.is-main-odd-input').checked;
            if (type && value) {
                odds.push({
                    odd_type: type,
                    odd_value: parseFloat(value),
                    is_main_odd: isMain
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
            fetchAndRenderMatches();
        } catch (error) {
            console.error('Error updating match:', error);
            showMessage(editMatchMessage, `Грешка: ${error.message}`, false);
        }
    });

    // --- Modal Closing Logic ---
    modalCloseBtn.addEventListener('click', () => editMatchModal.classList.remove('modal-visible'));
    window.addEventListener('click', (event) => {
        if (event.target === editMatchModal) {
            editMatchModal.classList.remove('modal-visible');
        }
    });

    // --- Initial Load ---
    fetchAndRenderMatches();
});
