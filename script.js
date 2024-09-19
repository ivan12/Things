// Config Firebase
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    databaseURL: 'https://YOUR_PROJECT_ID.firebaseio.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Initialize vars
const categoriesOrder = ['Animes', 'Movies', 'Series'];
const MAX_CHARACTERS = 180;
const MAX_CHARACTERS_TITLE = 40;
let deleteIndex = null;
let editIndex = null;
let todos = [];

// Initialize vars DOOM
const createButton = document.getElementById('create-new');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const itemCategory = document.getElementById('item-category');
const itemDescription = document.getElementById('item-description');
const itemImage = document.getElementById('item-image');
const itemTitle = document.getElementById('item-title');
const saveButton = document.getElementById('save-btn');
const todoList = document.getElementById('todo-list');

// set limit chacacters
itemTitle.setAttribute('maxlength', MAX_CHARACTERS_TITLE);
itemDescription.setAttribute('maxlength', MAX_CHARACTERS);

// Loading Page >> load items from firebase
window.onload = function () {
    loadFromFirebase();
};

// Save on Firebase
function saveToFirebase(todo, id = null) {
    if (id) {
        // Edit Item
        firebase
            .database()
            .ref('todos/' + id)
            .set(todo)
            .then(() => {
                console.log('Dados editados no Firebase');
                loadFromFirebase();
            })
            .catch(error => {
                console.error('Erro ao editar os dados:', error);
            });
    } else {
        // Create new Item
        firebase
            .database()
            .ref('todos/')
            .push(todo)
            .then(() => {
                console.log('Dados salvos no Firebase');
                loadFromFirebase();
            })
            .catch(error => {
                console.error('Erro ao salvar os dados:', error);
            });
    }
}

// Load items from Firebase
function loadFromFirebase() {
    firebase
        .database()
        .ref('todos/')
        .on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                // Transform obj in array
                todos = Object.entries(data).map(([id, todo]) => ({ id, ...todo }));
            } else {
                todos = []; // If don't have info Initialize empty array
            }
            renderItems(); // Rerender list
        });
}

// Render All Items
function renderItems() {
    todoList.innerHTML = '';

    // Order By Categories and titles
    if (Array.isArray(todos)) {
        const sortedTodos = todos.sort((a, b) => {
            const categoryA = a.category || '';
            const categoryB = b.category || '';

            const indexA =
                categoriesOrder.indexOf(categoryA) === -1
                    ? Infinity
                    : categoriesOrder.indexOf(categoryA);
            const indexB =
                categoriesOrder.indexOf(categoryB) === -1
                    ? Infinity
                    : categoriesOrder.indexOf(categoryB);

            // Order items with title >> Alphabet
            if (indexA === indexB) {
                return a.title.localeCompare(b.title);
            }
            return indexA - indexB;
        });

        sortedTodos.forEach(todo => {
            const li = document.createElement('li');
            li.classList.add(
                'list-group-item',
                'd-flex',
                'align-items-center',
                'justify-content-between'
            );

            // If dont have img put letters
            let imageContent;
            if (todo.image) {
                imageContent = `<img src="${todo.image}" class="item-img" alt="Imagem" class="rounded-circle img-thumbnail" onclick="showImageModal('${todo.image}')">`;
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
                ${imageContent}
                <div class="flex-grow-1 ms-3 item-midle-area-size">
                    <h5>${todo.title}</h5>
                    <p class="mb-0 desc-size">${todo.description}</p>
                    ${
                        todo.category
                            ? `<span class="badge" style="${getBadgeColor(todo.category)}">${
                                  todo.category
                              }</span>`
                            : ''
                    }
                </div>
                <div class="actions">
                    <button class="btn btn-sm btn-warning" onclick="editItem('${todo.id}')">
                        <i class="bi bi-pencil-fill text-white"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('${todo.id}')">
                        <i class="bi bi-trash-fill text-white"></i>
                    </button>
                </div>
            `;
            todoList.appendChild(li);
        });
        // Add extra space end of the list
        const extraSpace = document.createElement('div');
        extraSpace.classList.add('extra-space');
        todoList.appendChild(extraSpace);
    }
}

// Save Item new/edit
function saveItem() {
    const newTodo = {
        title: itemTitle.value,
        description: itemDescription.value,
        category: itemCategory.value,
    };

    if (itemImage.files[0]) {
        getBase64(itemImage.files[0], base64Image => {
            newTodo.image = base64Image;
            if (editIndex) {
                saveToFirebase(newTodo, editIndex); // Edit item Firebase
            } else {
                saveToFirebase(newTodo); // Save new item Firebase
            }
            editIndex = null; // Reset index edit
            editModal.hide();
        });
    } else {
        if (editIndex) {
            newTodo.image = todos.find(todo => todo.id === editIndex).image;
            saveToFirebase(newTodo, editIndex); // Edit item Firebase
        } else {
            newTodo.image = ''; // No Image in new items
            saveToFirebase(newTodo); // Save new item Firebase
        }
        editIndex = null; // Reset index edit
        editModal.hide();
    }
}

// Delete item on Firebase
function deleteFromFirebase(id) {
    firebase
        .database()
        .ref('todos/' + id)
        .remove()
        .then(() => {
            console.log('Item excluído do Firebase');
        })
        .catch(error => {
            console.error('Erro ao excluir o item:', error);
        });
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
    editModal.show();
}

function getBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function () {
        callback(reader.result);
    };
    reader.readAsDataURL(file);
}

function getBadgeColor(category) {
    switch (category.toUpperCase()) {
        case categoriesOrder[1].toUpperCase():
            return 'background-color: #2f2f2f; color: white;';
        case categoriesOrder[0].toUpperCase():
            return 'background-color: orange; color: white;';
        case categoriesOrder[2].toUpperCase():
            return 'background-color: purple; color: white;';
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

// Monitoring inputs
itemTitle.addEventListener('input', validateForm);
itemDescription.addEventListener('input', validateForm);

// Actions Btns
createButton.addEventListener('click', () => {
    itemTitle.value = '';
    itemDescription.value = '';
    itemCategory.value = '';
    itemImage.value = '';
    editIndex = null;
    editModal.show();
});

// Btn Modal confirm >> delete Item
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

// Modal create/edit >> Btn save
saveButton.addEventListener('click', saveItem);
