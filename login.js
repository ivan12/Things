// Google login
document.getElementById('googleLoginBtn').addEventListener('click', function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
            const userTemp = result.user;
            localStorage.setItem('user', JSON.stringify(userTemp));
            redirectToDashboard();
        })
        .catch(error => {
            console.error('Error during Google login:', error.message);
            alert('Google login failed: ' + error.message);
        });
});
/*
// Facebook login
document.getElementById('facebookLoginBtn').addEventListener('click', function () {
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            setUserInfos(user);
            redirectToDashboard();
        })
        .catch(error => {
            console.error('Error during Facebook login:', error.message);
            alert('Facebook login failed: ' + error.message);
        });
});
*/
// Check if the user logged >> redirect!
firebase.auth().onAuthStateChanged(userTemp => {
    if (userTemp) {
        localStorage.setItem('user', JSON.stringify(userTemp));
        redirectToDashboard();
    } else {
        console.info('No user is logged in');
    }
});
