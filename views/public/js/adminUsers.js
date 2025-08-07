// views/public/js/adminUsers.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Selectors ---
    const unverifiedUsersList = document.getElementById('unverified-users-list');
    const unverifiedUsersMessage = document.getElementById('unverified-users-message');

    // Delete User Modal Selectors
    const deleteUserModal = document.getElementById('delete-user-modal');
    const deleteUserModalCloseBtn = document.getElementById('delete-user-modal-close-btn');
    const deleteUserInfo = document.getElementById('delete-user-info');
    const confirmDeleteUserBtn = document.getElementById('confirm-delete-user-btn');
    const cancelDeleteUserBtn = document.getElementById('cancel-delete-user-btn');
    const deleteUserConfirmMessage = document.getElementById('delete-user-confirm-message');
    const deleteUserIdHidden = document.getElementById('delete-user-id-hidden');

    // --- Utility Functions ---
    const showMessage = (element, message, isSuccess) => {
        element.textContent = message;
        element.className = 'form-message'; // Reset classes
        element.classList.add(isSuccess ? 'success' : 'error');
    };

    const openModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.add('modal-visible');
            document.body.style.overflow = 'hidden'; // Disable body scroll
        }
    };

    const closeModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Re-enable body scroll
            // Clear any messages in the modal
            if (deleteUserConfirmMessage) {
                showMessage(deleteUserConfirmMessage, '', true);
            }
        }
    };

    // --- API Calls and Rendering ---

    /**
     * Fetches unverified users from the API and renders them.
     */
    const fetchAndRenderUnverifiedUsers = async () => {
        try {
            const response = await fetch('/api/unverified-users');
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch unverified users');
            const users = await response.json();

            unverifiedUsersList.innerHTML = ''; // Clear existing list
            showMessage(unverifiedUsersMessage, '', true); // Clear previous messages

            if (users.length === 0) {
                unverifiedUsersList.innerHTML = '<p>Нема нови корисници за верификација.</p>';
                return;
            }

            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.dataset.userId = user.id; // Store the primary key ID

                // Corrected photoSrc to handle the path stored in the database
                const photoSrc = user.id_photo_path ? `/uploads/ids/${user.id_photo_path}` : 'https://placehold.co/200x150/065f46/ffffff?text=No+Photo';

                userCard.innerHTML = `
                    <div class="user-photo-container">
                        <img src="${photoSrc}" alt="ID Photo for ${user.username}" class="user-photo" onerror="this.onerror=null;this.src='https://placehold.co/200x150/065f46/ffffff?text=No+Photo';">
                    </div>
                    <div class="user-info">
                        <p>Корисничко име: <strong>${user.username}</strong></p>
                        <div class="admin-id-check-container">
                            <label for="admin-id-input-${user.id}">Внеси Матичен на корисник:</label>
                            <input type="text" id="admin-id-input-${user.id}" class="admin-id-input" placeholder="Верификација..." required>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn-accept" data-user-id="${user.id}">Прифати</button>
                        <button class="btn-reject" data-user-id="${user.id}" data-username="${user.username}">Одбиј</button>
                    </div>
                `;
                unverifiedUsersList.appendChild(userCard);
            });

            addEventListenersToUserButtons();
        } catch (error) {
            console.error('Error fetching unverified users:', error);
            showMessage(unverifiedUsersMessage, `Грешка при вчитување на корисници: ${error.message}`, false);
        }
    };

    /**
     * Adds event listeners to the Accept and Reject buttons.
     */
    const addEventListenersToUserButtons = () => {
        document.querySelectorAll('.btn-accept').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.dataset.userId;
                handleAcceptUser(userId);
            });
        });

        document.querySelectorAll('.btn-reject').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.dataset.userId;
                const username = e.target.dataset.username;
                openDeleteUserConfirmModal(userId, username);
            });
        });
    };

    /**
     * Handles accepting a user.
     * @param {number} userId - The ID of the user to verify.
     */
    const handleAcceptUser = async (userId) => {
        // Find the specific input field for this user ID
        const adminInput = document.getElementById(`admin-id-input-${userId}`);
        if (!adminInput) {
            console.error(`Admin input field not found for user ID: ${userId}`);
            return;
        }

        const adminInputId = adminInput.value.trim();
        if (!adminInputId) {
            showMessage(unverifiedUsersMessage, 'Ве молиме внесете ID од сликата за да го прифатите корисникот.', false);
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/verify`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ adminInputId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showMessage(unverifiedUsersMessage, data.message, true);
            fetchAndRenderUnverifiedUsers(); // Refresh list
        } catch (error) {
            console.error('Error accepting user:', error);
            showMessage(unverifiedUsersMessage, `Грешка при прифаќање: ${error.message}`, false);
        }
    };

    /**
     * Handles rejecting (deleting) a user.
     * @param {number} userId - The ID of the user to delete.
     */
    const handleRejectUser = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            const userCardToRemove = document.querySelector(`.user-card[data-user-id="${userId}"]`);
            if (userCardToRemove) {
                userCardToRemove.remove();
                console.log(`[UI] User card for ID ${userId} removed successfully.`);
            }
            showMessage(deleteUserConfirmMessage, data.message, true); // Show message in modal

        } catch (error) {
            console.error('Error rejecting user:', error);
            showMessage(deleteUserConfirmMessage, `Грешка при одбивање: ${error.message}`, false);
        }
    };

    // --- Delete Confirmation Modal Logic ---

    const openDeleteUserConfirmModal = (userId, username) => {
        if (deleteUserInfo) {
            deleteUserInfo.textContent = username; // Display username in confirmation text
        }
        if (deleteUserIdHidden) {
            deleteUserIdHidden.value = userId; // Store user ID in hidden input
        }
        showMessage(deleteUserConfirmMessage, '', true); // Clear any previous messages
        openModal(deleteUserModal);
    };

    // Event listeners for delete modal buttons
    if (deleteUserModalCloseBtn) {
        deleteUserModalCloseBtn.addEventListener('click', () => closeModal(deleteUserModal));
    }

    if (cancelDeleteUserBtn) {
        cancelDeleteUserBtn.addEventListener('click', () => closeModal(deleteUserModal));
    }

    if (confirmDeleteUserBtn) {
        confirmDeleteUserBtn.addEventListener('click', () => {
            const userIdToDelete = deleteUserIdHidden.value;
            if (userIdToDelete) {
                handleRejectUser(userIdToDelete);
            }
        });
    }

    // Close modal if clicking outside content
    window.addEventListener('click', (event) => {
        if (event.target === deleteUserModal) {
            closeModal(deleteUserModal);
        }
    });

    // --- Initial Load ---
    fetchAndRenderUnverifiedUsers();
});