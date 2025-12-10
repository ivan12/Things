// Config Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyAwRzDQd9ap2X7VlpRgPfqWkPf8Ofqq9K4',
    authDomain: 'things-203b1.firebaseapp.com',
    databaseURL: 'https://things-203b1-default-rtdb.firebaseio.com',
    projectId: 'things-203b1',
    storageBucket: 'things-203b1.appspot.com',
    messagingSenderId: '952814001057',
    appId: '1:952814001057:web:dcda5e9effa13c928d89e0',
    measurementId: 'G-LYJC166QS1',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// vars
let currentUser = null; // Store the currently logged-in user
let userName = null;
let userPhoto = null;
let userPrefix = null;
let user = null;

// Check if the user is logged in before loading any data
firebase.auth().onAuthStateChanged(userTemp => {
    const currentPage = window.location.pathname.split('/').pop(); // Get the current page name (e.g., 'index.html' or 'login.html')

    if (!userTemp) {
        if (currentPage && currentPage !== 'index.html') {
            console.info('security barrier....sorry...redirect...');
            window.location.href = '/things/';
        }
    }
});

// Redirect to the dashboard
function redirectToDashboard() {
    window.location.href = './home/home.html'; // Redirect to your dashboard or home page
}

function setUserInfos(userTemp) {
    userPrefix = userTemp?.displayName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '');
    userName = userTemp?.displayName;
    userPhoto = userTemp?.photoURL;

    const userNameElement = document.getElementById('userName');
    const userPhotoElement = document.getElementById('userPhoto');

    if (userNameElement) userNameElement.innerHTML = userName;

    if (userPhotoElement) userPhotoElement.src = userPhoto || './imgs/default-photo.jpg'; // Set default if no photo
}

function setTitlePage() {
    const titilePageElement = document.getElementById('titlePage');
    if (titilePageElement) titilePageElement.innerHTML = 'Things';
}

// Logout function
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    firebase
        .auth()
        .signOut()
        .then(() => {
            window.location.href = '/things/';
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
});

window.addEventListener('load', function () {
    user = JSON.parse(localStorage.getItem('user'));
    setUserInfos(user);
});

// Call the function to inject the navbar
document.addEventListener('DOMContentLoaded', setTitlePage);
