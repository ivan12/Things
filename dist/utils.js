
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
let currentUser = null;
let userName = null;
let userPhoto = null;
let userPrefix = null;
let user = null;

// Check if the user is logged in before loading any data
firebase.auth().onAuthStateChanged(userTemp => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (userTemp) {
        // User is logged in
        user = userTemp;
        setUserInfos(user);
        
        // If on login page (index.html or root), go to dashboard
        if (page === 'index.html' || page === '') {
            console.log('Redirecting to dashboard...');
            window.location.href = './dashboard.html';
        }
    } else {
        // User is logged out
        console.log('User not logged in');
        
        // If on dashboard, go to login
        if (page === 'dashboard.html') {
            console.log('Redirecting to login...');
            window.location.href = './index.html';
        }
    }
});

// Redirect to the dashboard
function redirectToDashboard() {
    window.location.href = './dashboard.html';
}

function setUserInfos(userTemp) {
    userPrefix = userTemp?.displayName.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '');
    userName = userTemp?.displayName;
    userPhoto = userTemp?.photoURL;

    const userNameElement = document.getElementById('userName');
    const userPhotoElement = document.getElementById('userPhoto');

    if (userNameElement) userNameElement.innerHTML = userName;

    if (userPhotoElement) userPhotoElement.src = userPhoto || './imgs/default-photo.jpg';
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
            window.location.href = './index.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
});

window.addEventListener('load', function () {
    user = JSON.parse(localStorage.getItem('user'));
    setUserInfos(user);
});

document.addEventListener('DOMContentLoaded', setTitlePage);
