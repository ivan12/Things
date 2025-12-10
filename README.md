# Things
It's a project where you can create whatever content you want, cataloging things with or without images, it has an automatic system of intelligent sorting by category and alphabetical order, you can delete, edit and create new items

# What you need to do in Firebase
To make the project work with Firebase integration you have to **create an account on Firebase, create a new project there, then create a real-time database** (there is no need to pay for a basic plan, the free plan already allows this)
to create the **real-time database you have to go to rules and change the write and read to true** (so that it allows public recording and reading)

# Get the Firebase confg and put in the proj
Once this is created you get your project's settings from the firebase and put **them here in the project first lines of the script.js file**, just replace the attributes of the **firebaseConfig constant**

# Example confg below:

```
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com', 
    databaseURL: 'https://YOUR_PROJECT_ID.firebaseio.com', 
    projectId: 'YOUR_PROJECT_ID', 
    storageBucket: 'YOUR_PROJECT_ID.appspot.com', 
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', 
    appId: 'YOUR_APP_ID', 
};
```