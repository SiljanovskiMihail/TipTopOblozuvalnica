export const getPhotoSrc = (path) => {
    return path ? `/uploads/ids/${path}` : 'https://placehold.co/200x150/065f46/ffffff?text=No+Photo';
};

export const createUserCardHTML = (user) => {
    const photoSrc = getPhotoSrc(user.id_photo_path);
    return `
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
            <button class="btn-reject" data-user-id="${user.id}">Одбиј</button>
        </div>
    `;
};

const initializeAdminUsers = () => {
    const unverifiedUsersList = document.getElementById('unverified-users-list');
    const unverifiedUsersMessage = document.getElementById('unverified-users-message');
    const modal = document.getElementById('delete-user-modal');
    const modalTitle = modal?.querySelector('h2');
    const modalCloseBtn = document.getElementById('delete-user-modal-close-btn');
    const modalConfirmContent = document.getElementById('delete-user-confirm-content');
    const modalMessage = document.getElementById('delete-user-confirm-message');
    const showMessage = (element, message, isSuccess) => {
        if (!element) return;
        element.textContent = message;
        element.className = `form-message ${isSuccess ? 'success' : 'error'}`;
    };
    const openModal = (title) => {
        if (modalTitle) modalTitle.textContent = title;
        if (modalConfirmContent) modalConfirmContent.style.display = 'none'; 
        modal.classList.add('modal-visible');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
        modal.classList.remove('modal-visible');
        document.body.style.overflow = '';
        if (modalMessage) modalMessage.textContent = '';
    };
    const fetchAndRenderUnverifiedUsers = async () => {
        try {
            const response = await fetch('/api/unverified-users');
            const users = await response.json();
            
            if (!unverifiedUsersList) return;
            unverifiedUsersList.innerHTML = '';

            if (users.length === 0) {
                unverifiedUsersList.innerHTML = '<p>Нема нови корисници за верификација.</p>';
                return;
            }

            users.forEach(user => {
                const card = document.createElement('div');
                card.className = 'user-card';
                card.dataset.userId = user.id;
                card.innerHTML = createUserCardHTML(user);
                unverifiedUsersList.appendChild(card);
            });
            addEventListeners();
        } catch (error) {
            showMessage(unverifiedUsersMessage, 'Грешка при вчитување.', false);
        }
    };

    const handleAcceptUser = async (userId) => {
        const input = document.getElementById(`admin-id-input-${userId}`);
        const adminInputId = input?.value.trim();

        if (!adminInputId) {
            openModal("Внимавајте");
            showMessage(modalMessage, 'Ве молиме внесете матичен број за верификација.', false);
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminInputId })
            });
            const data = await response.json();

            openModal(response.ok ? "Успешно" : "Грешка");
            showMessage(modalMessage, data.message || data.error, response.ok);
            
            if (response.ok) fetchAndRenderUnverifiedUsers();
        } catch (error) {
            openModal("Системска грешка");
            showMessage(modalMessage, "Проблем со серверот.", false);
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            const data = await response.json();

            openModal("Бришење Корисник");
            showMessage(modalMessage, data.message || data.error, response.ok);

            if (response.ok) {
                document.querySelector(`.user-card[data-user-id="${userId}"]`)?.remove();
            }
        } catch (error) {
            openModal("Грешка при бришење");
            showMessage(modalMessage, data.error || "Неуспешно бришење", false);
        }
    };

    const addEventListeners = () => {
        unverifiedUsersList.onclick = (e) => {
            const userId = e.target.dataset.userId;
            if (e.target.classList.contains('btn-accept')) handleAcceptUser(userId);
            if (e.target.classList.contains('btn-reject')) handleRejectUser(userId);
        };
    };

    modalCloseBtn?.addEventListener('click', closeModal);
    window.onclick = (e) => { if (e.target === modal) closeModal(); };

    fetchAndRenderUnverifiedUsers();
};

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    document.addEventListener('DOMContentLoaded', initializeAdminUsers);
}