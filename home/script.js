// Initialize vars
const MAX_CHARACTERS = 180;
const MAX_CHARACTERS_TITLE = 40;
let allUsers = [];
let categorieFolderSelected = '';
let categories = [];
let categoriesOrder = [];
let deleteIndex = null;
let editIndex = null;
let filteredCategories = [];
let idItemSelectedChatModal = null;
let todos = [];

let setDefaultCategoriesNewUsers = [
    'Animes',
    'Books',
    'Collectibles',
    'Games',
    'Movies',
    'Notes',
    'Series',
];

const iconList = [
    'bi bi-folder-fill',
    'bi bi-star-fill',
    'bi bi-book-fill',
    'bi bi-film',
    'bi bi-camera-fill',
    'bi bi-music-note-beamed',
    'bi bi-collection-fill',
    'bi bi-file-earmark-text-fill',
    'bi bi-briefcase-fill',
    'bi bi-tv-fill',
];

// Category icon mapping - Exact icons from preview image
const categoryIcons = {
    'Movies': 'bi bi-camera-reels-fill',        // Film reel icon
    'Books': 'bi bi-book-half',                 // Open book icon
    'Series': 'bi bi-tv-fill',                  // TV icon
    'Games': 'bi bi-controller',                // Game controller
    'Animes': 'bi bi-person-bounding-box',      // Anime character
    'Notes': 'bi bi-file-earmark-text-fill',    // Document icon
    'Collectibles': 'bi bi-gem',                // Diamond/gem icon
    '': 'bi bi-folder-fill'                     // Default folder
};

// Get icon for category
function getCategoryIcon(category) {
    return categoryIcons[category] || 'bi bi-folder-fill';
}

// Initialize vars DOM
const categoriesButton = document.getElementById('categories-btn');
const categoriesModal = new bootstrap.Modal(document.getElementById('categoriesModal'));
const createButton = document.getElementById('create-new');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const editModalLabel = document.getElementById('editModalLabel');
const itemCategory = document.getElementById('item-category');
const itemDescription = document.getElementById('item-description');
const itemImage = document.getElementById('item-image');
const itemTitle = document.getElementById('item-title');
const logoutBtn = document.getElementById('logoutBtn');
const saveButton = document.getElementById('save-btn');
const todoList = document.getElementById('todo-list');
const usersButton = document.getElementById('users-btn');
const usersList = document.getElementById('usersList');
const usersModal = new bootstrap.Modal(document.getElementById('usersModal'));
const navHome = document.getElementById('nav-home');
const navCategories = document.getElementById('nav-categories');
const navUsers = document.getElementById('nav-users');
const navCreate = document.getElementById('nav-create');
const navLabel = document.getElementById('mobile-nav-label');
let lastNavTarget = 'home';
let modalResetTimer = null;

// Set limit characters
itemTitle.setAttribute('maxlength', MAX_CHARACTERS_TITLE);
itemDescription.setAttribute('maxlength', MAX_CHARACTERS);

// Authentication observer
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        // Handled by utils.js
        console.log('User check in script.js: not logged in');
    }
});

// Logout listener
logoutBtn.addEventListener('click', () => {
    firebase
        .auth()
        .signOut()
        .then(() => {
            // Handled by utils.js
            console.log('Signed out');
        })
        .catch(error => {
            console.error('Error signing out:', error);
        });
});

// Save / Edit item in Firebase
function saveToFirebase(todo, id = null) {
    const ref = firebase.database().ref(userPrefix + '_todos');
    if (id) {
        // Edit Item
        ref.child(id)
            .set(todo)
            .then(() => {
                console.info('Edited in firebase successfully!');
                loadFromFirebase();
            })
            .catch(error => {
                console.error('Error edit in Firebase:', error);
            });
    } else {
        // Create new Item
        ref.push(todo)
            .then(() => {
                console.info('Saved in firebase successfully!');
                loadFromFirebase();
            })
            .catch(error => {
                console.error('Error save in Firebase:', error);
            });
    }
}

// Delete item Firebase
function deleteFromFirebase(id) {
    firebase
        .database()
        .ref(userPrefix + '_todos/' + id)
        .remove()
        .then(() => {
            console.info('Deleted in Firebase successfully!');
            loadFromFirebase();
        })
        .catch(error => {
            console.error('Error delete in Firebase:', error);
        });
}

// Load items Firebase
function loadFromFirebase(userId = null, reloadCategories = true) {
    const ref = firebase.database().ref((userId || userPrefix) + '_todos');
    ref.once('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            todos = Object.entries(data).map(([id, todo]) => ({ id, ...todo }));
        } else {
            todos = [];
        }
        if (reloadCategories) loadCategories();
        updateCurrentUserName(userId);
    });
}

function renderCategoriesFolders() {
    categorieFolderSelected = '';
    lastNavTarget = 'home';
    const categoryMap = {};

    // Group items by category
    todos.forEach(todo => {
        if (todo.category) {
            if (!categoryMap[todo.category]) {
                categoryMap[todo.category] = [];
            }
            categoryMap[todo.category].push(todo);
        }
        if (todo.category == '') {
            if (!categoryMap['']) {
                categoryMap[''] = [];
            }
            categoryMap[''].push(todo);
        }
    });

    // Clear the todoList container
    todoList.innerHTML = '';

    // Create a grid container for the categories
    const gridContainer = document.createElement('div');
    gridContainer.classList.add('category-grid');

    // Create category "folders"
    Object.keys(categoryMap).forEach(category => {
        const folder = document.createElement('div');
        folder.classList.add('category-folder', 'text-center');
        folder.setAttribute('data-category', category);

        const iconClass = getCategoryIcon(category);
        const count = categoryMap[category].length;
        folder.innerHTML = `
            <div class="folder-container">
                <span class="folder-count">${count}</span>
                <div class="folder-bg">
                    <i class="bi bi-folder-fill"></i>
                </div>
                <div class="folder-icon-overlay">
                    <i class="${iconClass}"></i>
                </div>
            </div>
            <h5>${category ? category : 'No Category'}</h5>
        `;

        // Click event to show the items in the category
        folder.addEventListener('click', () => {
            renderItemsByCategory(category);
        });

        gridContainer.appendChild(folder);
    });

    // Append the grid to the todoList container
    todoList.appendChild(gridContainer);
}

function renderItemsByCategory(category) {
    let filteredTodos = todos.filter(todo => todo.category === category);
    categorieFolderSelected = category;
    setActiveNav(null);

    // Clear the todoList container
    todoList.innerHTML = '';

    // Create a "Back" button to go back to category view
    const backButton = document.createElement('button');
    backButton.classList.add('btn', 'btn-secondary', 'mb-4');
    backButton.textContent = 'Back to Categories';
    backButton.addEventListener('click', () => {
        renderCategoriesFolders(), (categorieFolderSelected = '');
    });

    // order by title
    filteredTodos.sort((a, b) => a.title.localeCompare(b.title));

    todoList.appendChild(backButton);

    // Render the items in the selected category
    filteredTodos.forEach(todo => {
        const sanitizedTodoId = sanitizeId(todo.id);
        const li = document.createElement('li');
        li.classList.add(
            'list-group-item',
            'd-flex',
            'align-items-start',
            'justify-content-between',
            'flex-column',
            'flex-md-row'
        );

        let imageContent;
        if (todo.image) {
            imageContent = `<img src="${todo.image}" class="item-img" alt="Image" onclick="showImageModal('${todo.image}')">`;
        } else {
            const initials = getInitials(todo.title);
            const backgroundColor = getBadgeColor(todo.category || 'sem categoria');
            imageContent = `
                <div class="rounded-circle text-white d-flex justify-content-center align-items-center" 
                     style="width: 100px; height: 100px; ${backgroundColor} font-size: 24px;">
                    ${initials}
                </div>`;
        }

        li.innerHTML = `
            <div class="d-flex items-area">
                ${imageContent}
                <div class="flex-grow-1 ms-3 item-midle-area-size">
                    <h5>${todo.title}</h5>
                    <div class="rating mt-2" data-todo-id="${sanitizedTodoId}">
                    ${[1, 2, 3, 4, 5]
                .map(
                    star =>
                        `<span class="star" data-value="${star}" 
                                 style="color: ${star <= (todo.rating ?? 3) ? 'orange' : 'gray'}">
                                 &#9733;
                           </span>`
                )
                .join('')}  
                    </div>
                    <p class="desc-size">${todo.description}</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="badge" style="${getBadgeColor(todo.category)}">${todo.category
            }</span>
                        <button data-msg-id="${sanitizedTodoId}" class="btn btn-sm btn-default ms-auto" onclick="openChatModal('${sanitizedTodoId}')">
                            <i class="bi bi-chat-dots"></i> <span class="message-count">0</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Action buttons (edit/delete)
        if (currentUser === null) {
            li.innerHTML += `
                <div class="actions mt-3 mt-md-0">
                    <button class="btn btn-sm btn-warning" onclick="editItem('${sanitizedTodoId}')">
                        <i class="bi bi-pencil-fill text-white"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ms-2" onclick="deleteItem('${sanitizedTodoId}')">
                        <i class="bi bi-trash-fill text-white"></i>
                    </button>
                </div>
            `;
        }

        todoList.appendChild(li);
        initializeRatingStars(sanitizedTodoId, todo);
        updateMessageCount(sanitizedTodoId);
    });
}

// Transform id to firebase
function sanitizeId(id) {
    return id.replace(/[.#$[\]]/g, '_');
}

function initializeRatingStars(sanitizedTodoId, todo) {
    const stars = document.querySelectorAll(`[data-todo-id="${sanitizedTodoId}"] .star`);
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const ratingValue = star.dataset.value;
            saveRatingToFirebase(sanitizedTodoId, todo, ratingValue);
            stars.forEach(s => {
                s.textContent = s.dataset.value <= ratingValue ? '★' : '☆';
            });
        });
    });
}

function updateMessageCount(todoId) {
    const ref = firebase.database().ref(`${todoId}_messages`);
    ref.on('value', snapshot => {
        const messageCount = snapshot.numChildren();
        const messageCountElement = document.querySelector(
            `[data-msg-id="${todoId}"] .message-count`
        );
        if (messageCountElement) {
            messageCountElement.textContent = messageCount;
        }
    });
}

// Msgs Modal
function saveRatingToFirebase(sanitizedTodoId, todo, rating) {
    const ref = firebase.database().ref(userPrefix + '_todos');
    console.log('saveRatingToFirebase todo >> ', todo);
    console.log('saveRatingToFirebase rating >> ', rating);
    ref.child(sanitizedTodoId)
        .set({
            ...todo,
            rating: rating,
        })
        .then(() => {
            console.info('Edited rating firebase successfully!');
            loadFromFirebase(null, false);
        })
        .catch(error => {
            console.error('Error edit rating in Firebase:', error);
        });
}

// Função para abrir o modal de chat e carregar mensagens
function openChatModal(todoId) {
    idItemSelectedChatModal = todoId;
    const chatModal = new bootstrap.Modal(document.getElementById('chatModal'));
    loadMessages(todoId); // Função que carrega mensagens do Firebase
    chatModal.show();
}

// Função para carregar mensagens do Firebase
function loadMessages(todoId) {
    const ref = firebase.database().ref(`${todoId}_messages`);
    ref.once('value', snapshot => {
        const data = snapshot.val();
        const messageList = document.getElementById('messageList');
        messageList.innerHTML = ''; // Limpa mensagens anteriores

        if (data) {
            Object.values(data).forEach(msg => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `<strong>${msg.userName}:</strong> ${msg.text}`;
                messageList.appendChild(li);
            });
        }
    });
}

// Função para adicionar uma nova mensagem e avaliação
function addMessage() {
    const newMessage = document.getElementById('newMessage').value;

    if (newMessage.trim() === '') {
        alert('Mensagem é obrigatória!');
        return;
    }

    const ref = firebase.database().ref(`${idItemSelectedChatModal}_messages`);
    ref.push({
        userName: userName, // Nome do usuário logado
        text: newMessage,
        timestamp: Date.now(),
    });

    document.getElementById('newMessage').value = '';
    loadMessages(idItemSelectedChatModal); // Recarrega mensagens
}

// Utils
function deleteItem(id) {
    deleteIndex = id;
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    confirmDeleteModal.show();
}

function editItem(id) {
    const todo = todos.find(todo => todo.id === id);
    itemTitle.value = todo.title;
    itemDescription.value = todo.description;
    itemCategory.value = todo.category || '';
    itemImage.value = '';
    editIndex = id;
    loadCategoriesIntoDropdown(todo.category);
    editModal.show();
}

function getBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function () {
        callback(reader.result);
    };
    reader.readAsDataURL(file);
}
// ['Animes', 'Books', 'Collectibles', 'Games', 'Movies', 'Notes', 'Series'];
//      0        1          2            3         4        5        6
function getBadgeColor(category) {
    switch (category.toUpperCase()) {
        case categoriesOrder[0].toUpperCase():
            return 'background-color: orange; color: white;';
        case categoriesOrder[1].toUpperCase():
            return 'background-color: purple; color: white;';
        case categoriesOrder[2].toUpperCase():
            return 'background-color: #556B2F; color: white;';
        case categoriesOrder[3].toUpperCase():
            return 'background-color: #c94f5b; color: white;';
        case categoriesOrder[4].toUpperCase():
            return 'background-color: #2f2f2f; color: white;';
        case categoriesOrder[5].toUpperCase():
            return 'background-color: #2F4F4F; color: white;';
        case categoriesOrder[6].toUpperCase():
            return 'background-color: #B8860B; color: white;';
        default:
            return 'background-color: #808080; color: white;';
    }
}

function getInitials(title) {
    const words = title.trim().split(/\s+/);
    const initials = words
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join('');
    return initials;
}

function showImageModal(imageSrc) {
    const modalImage = document.getElementById('modal-image');
    modalImage.src = imageSrc;

    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
}

function validateForm() {
    const titleValid = itemTitle.value.trim().length > 0;
    const descriptionValid = itemDescription.value.trim().length > 0;
    // Disable btn save
    saveButton.disabled = !(titleValid && descriptionValid);
}

function loadAllUsers() {
    firebase
        .database()
        .ref()
        .once('value', snapshot => {
            allUsers = Object.keys(snapshot.val() || {})
                .filter(key => key.endsWith('_todos'))
                .map(key => ({
                    id: key.replace('_todos', ''),
                    name: key.replace('_todos', ''),
                }));
            renderUsersList();
        });
}

function renderUsersList() {
    usersList.innerHTML = '';
    allUsers.sort((a, b) => a.name.localeCompare(b.name));
    allUsers.forEach(user => {
        if (user.id !== userPrefix) {
            // Don't show current user in the list
            const li = document.createElement('li');
            li.classList.add(
                'list-group-item',
                'd-flex',
                'justify-content-between',
                'align-items-center'
            );
            li.innerHTML = `
                ${user.name}
                <button class="btn btn-sm btn-primary view-user-btn" data-user-id="${user.id}">
                    <i class="bi bi-eye"></i>
                </button>
            `;
            usersList.appendChild(li);
        }
    });

    // Add event listeners to view buttons
    document.querySelectorAll('.view-user-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const userId = this.getAttribute('data-user-id');
            viewUserItems(userId);
        });
    });
}

function viewUserItems(userId) {
    currentUser = userId;
    loadFromFirebase(userId);
    usersModal.hide();
    // Disable edit and delete buttons
    document
        .querySelectorAll('.btn-warning, .btn-danger')
        .forEach(btn => (btn.style.display = 'none'));
    // Show back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to My List';
    backButton.classList.add('btn', 'btn-secondary', 'mb-3');
    backButton.addEventListener('click', () => {
        currentUser = null;
        loadFromFirebase();
        backButton.remove();
        document
            .querySelectorAll('.btn-warning, .btn-danger')
            .forEach(btn => (btn.style.display = 'inline-block'));
    });
    todoList.parentNode.insertBefore(backButton, todoList);
}

function updateCurrentUserName(userId = null) {
    const currentUserNameElement = document.getElementById('currentUserName');
    currentUserNameElement.textContent = userId ? `${userId}'s Items` : 'My Items';
}

// Categories

// Load categories from Firebase for the current user
function loadCategories(refreshView = true) {
    const ref = firebase.database().ref(userPrefix + '_categories');
    ref.once('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            categories = Object.keys(data).map(key => data[key]); // Load categories as an array
            categoriesOrder = [...categories];
        } else {
            categories = []; // No categories yet
        }
        if (categories.length <= 0) {
            categories = [...setDefaultCategoriesNewUsers];
            saveCategories();
        }
        renderCategoriesList(); // Render the categories in the modal
        if (refreshView) renderCategoriesFolders();
    });
}

// Function to render the list of categories in the modal
function renderCategoriesList() {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';
    categories.forEach((category, index) => {
        const li = document.createElement('li');
        li.classList.add(
            'list-group-item',
            'd-flex',
            'justify-content-between',
            'align-items-center'
        );
        li.innerHTML = `
            <span>${category}</span>
            <div>
                <button class="btn btn-sm btn-warning me-2" onclick="editCategory(${index})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${index})">Delete</button>
            </div>
        `;
        categoriesList.appendChild(li);
    });
}

// Add a new category to the list
function addCategory() {
    const newCategoryInput = document.getElementById('newCategoryInput');
    const newCategory = newCategoryInput.value.trim();

    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory); // Add to categories array
        newCategoryInput.value = ''; // Clear input field
        saveCategories(); // Re-render the updated list
    } else if (categories.includes(newCategory)) {
        alert('Category already exists!');
    } else {
        alert('Please enter a category name.');
    }
}

// Edit an existing category
function editCategory(index) {
    const newCategoryName = prompt('Edit category name:', categories[index]);
    if (newCategoryName && newCategoryName.trim() !== '') {
        categories[index] = newCategoryName.trim(); // Update the category name
        saveCategories(); // Re-render the list
    }
}

// Delete a category from the list
function deleteCategory(index) {
    categories.splice(index, 1); // Remove the category
    saveCategories();
}

// Save categories to Firebase
function saveCategories() {
    const ref = firebase.database().ref(userPrefix + '_categories');
    const categoriesObj = {};
    categories.forEach((category, index) => {
        categoriesObj[index] = category; // Save each category with an index
    });
    ref.set(categoriesObj)
        .then(() => {
            // refresh list
            renderCategoriesList();
        })
        .catch(error => {
            console.error('Error saving categories:', error);
        });
}

function loadCategoriesIntoDropdown(selectedCategory = '') {
    const categorySelect = document.getElementById('item-category');
    categorySelect.innerHTML = ''; // Clear previous options

    // Add the "No Category" option
    const noCategoryOption = document.createElement('option');
    noCategoryOption.value = '';
    noCategoryOption.text = 'No Category';
    categorySelect.appendChild(noCategoryOption);

    // Load categories from Firebase (assuming they are already loaded into the `categories` array)
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.text = category;
        option.selected = category == categorieFolderSelected;

        // If this is the selected category for the item, mark it as selected
        if (category === selectedCategory) {
            option.selected = true;
        }

        categorySelect.appendChild(option);
    });
}

// Event Listeners
itemTitle.addEventListener('input', validateForm);
itemDescription.addEventListener('input', validateForm);

createButton.addEventListener('click', () => {
    itemTitle.value = '';
    itemDescription.value = '';
    itemCategory.value = '';
    itemImage.value = '';
    editIndex = null;
    editModalLabel.innerHTML = 'Create Item';
    loadCategoriesIntoDropdown();
    editModal.show();
});

document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (deleteIndex !== null) {
        deleteFromFirebase(deleteIndex);
        deleteIndex = null;
    }
    const confirmDeleteModal = bootstrap.Modal.getInstance(
        document.getElementById('confirmDeleteModal')
    );
    confirmDeleteModal.hide();
});

saveButton.addEventListener('click', () => {
    const newTodo = {
        title: itemTitle.value,
        description: itemDescription.value,
        category: itemCategory.value,
    };

    if (itemImage.files[0]) {
        getBase64(itemImage.files[0], base64Image => {
            newTodo.image = base64Image;
            if (editIndex) {
                saveToFirebase(newTodo, editIndex);
            } else {
                saveToFirebase(newTodo);
            }
            editIndex = null;
            editModal.hide();
        });
    } else {
        if (editIndex) {
            newTodo.image = todos.find(todo => todo.id === editIndex).image;
            saveToFirebase(newTodo, editIndex);
        } else {
            newTodo.image = '';
            saveToFirebase(newTodo);
        }
        editIndex = null;
        editModal.hide();
    }
});

usersButton.addEventListener('click', () => {
    loadAllUsers();
    usersModal.show();
});

document.getElementById('categories-btn').addEventListener('click', () => {
    // If inside a folder, don't reset the view; otherwise refresh categories grid
    const refreshView = !categorieFolderSelected;
    loadCategories(refreshView); // Load categories when the modal opens
    categoriesModal.show();
});

function setActiveNav(btn) {
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    btn?.classList.add('active');
    if (navLabel && btn) {
        navLabel.textContent = btn.querySelector('span')?.textContent || '';
    }
}

function isAnyModalOpen() {
    const modalIds = ['categoriesModal', 'usersModal', 'editModal'];
    return modalIds.some(id => document.getElementById(id)?.classList.contains('show'));
}

function closeAllModals() {
    try {
        categoriesModal?.hide();
        usersModal?.hide();
        editModal?.hide();
    } catch (e) {
        console.warn('Close modals warning:', e);
    }
}

navHome?.addEventListener('click', () => {
    closeAllModals();
    categorieFolderSelected = '';
    renderCategoriesFolders();
    setActiveNav(navHome);
    lastNavTarget = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navCategories?.addEventListener('click', () => {
    closeAllModals();
    categoriesButton.click();
    setActiveNav(navCategories);
    lastNavTarget = 'categories';
    if (modalResetTimer) clearTimeout(modalResetTimer);
});

navUsers?.addEventListener('click', () => {
    closeAllModals();
    usersButton.click();
    setActiveNav(navUsers);
    lastNavTarget = 'users';
    if (modalResetTimer) clearTimeout(modalResetTimer);
});

navCreate?.addEventListener('click', () => {
    closeAllModals();
    createButton.click();
    setActiveNav(navCreate);
    lastNavTarget = 'create';
    if (modalResetTimer) clearTimeout(modalResetTimer);
});

// When modals close, reset nav selection (home if on root, none if inside a folder)
function handleModalHide() {
    if (modalResetTimer) {
        clearTimeout(modalResetTimer);
    }

    if (categorieFolderSelected) {
        setActiveNav(null);
        return;
    }

    modalResetTimer = setTimeout(() => {
        if (!categorieFolderSelected && !isAnyModalOpen()) {
            setActiveNav(navHome);
            lastNavTarget = 'home';
        }
    }, 3000);
}

document.getElementById('categoriesModal')?.addEventListener('hidden.bs.modal', handleModalHide);
document.getElementById('usersModal')?.addEventListener('hidden.bs.modal', handleModalHide);
document.getElementById('editModal')?.addEventListener('hidden.bs.modal', handleModalHide);

function clearModalTimerOnShow() {
    if (modalResetTimer) {
        clearTimeout(modalResetTimer);
    }
}

document.getElementById('categoriesModal')?.addEventListener('show.bs.modal', clearModalTimerOnShow);
document.getElementById('usersModal')?.addEventListener('show.bs.modal', clearModalTimerOnShow);
document.getElementById('editModal')?.addEventListener('show.bs.modal', clearModalTimerOnShow);

window.addEventListener('load', function () {
    loadFromFirebase();
});
