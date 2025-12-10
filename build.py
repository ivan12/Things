import re
import os
import shutil

def minify_css(css_content):
    """Minify CSS by removing comments, whitespace, and unnecessary characters"""
    css_content = re.sub(r'/\*[\s\S]*?\*/', '', css_content)
    css_content = re.sub(r'\s+', ' ', css_content)
    css_content = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css_content)
    css_content = re.sub(r';\}', '}', css_content)
    return css_content.strip()

def minify_js(js_content):
    """Basic JS minification"""
    js_content = re.sub(r'//.*?$', '', js_content, flags=re.MULTILINE)
    js_content = re.sub(r'/\*[\s\S]*?\*/', '', js_content)
    js_content = re.sub(r'\s+', ' ', js_content)
    js_content = re.sub(r'\s*([{}();,=+\-*/<>!&|])\s*', r'\1', js_content)
    return js_content.strip()

# Paths
project_root = r"c:\Documents\Projects Ivan\Things"
home_dir = os.path.join(project_root, "home")
dist_dir = os.path.join(project_root, "dist")

# Ensure dist exists
if not os.path.exists(dist_dir):
    os.makedirs(dist_dir)

print("Building Things App...")

# 1. Minify Dashboard CSS (home/home.css)
print("Minifying Dashboard CSS...")
with open(os.path.join(home_dir, "home.css"), 'r', encoding='utf-8') as f:
    css_content = f.read()
with open(os.path.join(dist_dir, "home.min.css"), 'w', encoding='utf-8') as f:
    f.write(minify_css(css_content))

# 2. Minify Dashboard JS (home/script.js) - REMOVING HARDCODED REDIRECTS
print("Minifying Dashboard JS...")
with open(os.path.join(home_dir, "script.js"), 'r', encoding='utf-8') as f:
    js_content = f.read()
# Remove hardcoded redirects before minification
js_content = js_content.replace("window.location.href = '/things/';", "// Redirect handled by utils.js")
with open(os.path.join(dist_dir, "script.min.js"), 'w', encoding='utf-8') as f:
    f.write(minify_js(js_content))

# 3. Minify Login CSS (login.css)
print("Minifying Login CSS...")
with open(os.path.join(project_root, "login.css"), 'r', encoding='utf-8') as f:
    css_content = f.read()
with open(os.path.join(dist_dir, "login.min.css"), 'w', encoding='utf-8') as f:
    f.write(minify_css(css_content))

# 4. Minify Login JS (login.js) - REMOVING REDUNDANT AUTH CHECK
print("Minifying Login JS...")
with open(os.path.join(project_root, "login.js"), 'r', encoding='utf-8') as f:
    js_content = f.read()
# Remove the auth listener part since utils.js handles it
js_content = re.sub(r'firebase\.auth\(\)\.onAuthStateChanged[\s\S]*?\}\);', '', js_content)
with open(os.path.join(dist_dir, "login.min.js"), 'w', encoding='utf-8') as f:
    f.write(minify_js(js_content))

# 5. Copy and Process utils.js (home/dist/utils.js has the correct logic, let's use that as base or rewrite)
# Actually, let's write the correct utils.js content directly to ensure it's perfect
print("Creating utils.js...")
utils_content = """
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
    userPrefix = userTemp?.displayName.replace(/[\\s~`!@#$%^&*(){}\\[\\];:"'<,.>?\\/\\\\|_+=-]/g, '');
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
"""
with open(os.path.join(dist_dir, "utils.js"), 'w', encoding='utf-8') as f:
    f.write(utils_content)

# 6. Copy Assets
print("Copying assets...")
# Copy imgs folder from ROOT
if os.path.exists(os.path.join(dist_dir, "imgs")):
    shutil.rmtree(os.path.join(dist_dir, "imgs"))
shutil.copytree(os.path.join(project_root, "imgs"), os.path.join(dist_dir, "imgs"))
# Copy user.css
shutil.copy(os.path.join(project_root, "user.css"), os.path.join(dist_dir, "user.css"))

# 7. Generate HTML Files
import time
timestamp = int(time.time())

# Dashboard HTML (dist/dashboard.html)
print("Generating dashboard.html...")
with open(os.path.join(home_dir, "home.html"), 'r', encoding='utf-8') as f:
    dashboard_html = f.read()

# Update references for dist with cache busting
dashboard_html = dashboard_html.replace('../user.css', f'user.css?v={timestamp}')
dashboard_html = dashboard_html.replace('home.css', f'home.min.css?v={timestamp}')
dashboard_html = dashboard_html.replace('../utils.js', f'utils.js?v={timestamp}')
dashboard_html = dashboard_html.replace('script.js', f'script.min.js?v={timestamp}')

with open(os.path.join(dist_dir, "dashboard.html"), 'w', encoding='utf-8') as f:
    f.write(dashboard_html)

# Login HTML (dist/index.html)
print("Generating index.html (Login)...")
with open(os.path.join(project_root, "index.html"), 'r', encoding='utf-8') as f:
    login_html = f.read()

# Update references for dist with cache busting
login_html = login_html.replace('login.css', f'login.min.css?v={timestamp}')
login_html = login_html.replace('login.js', f'login.min.js?v={timestamp}')
login_html = login_html.replace('utils.js', f'utils.js?v={timestamp}')

with open(os.path.join(dist_dir, "index.html"), 'w', encoding='utf-8') as f:
    f.write(login_html)

print("Build complete!")
