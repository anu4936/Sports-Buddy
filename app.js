
// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getDatabase, ref, push, set, onValue } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa08-pQi7_xLbeHcG9ga3j5QmkKEVqoT8",
  authDomain: "sports-buddy-89097.firebaseapp.com",
  projectId: "sports-buddy-89097",
  storageBucket: "sports-buddy-89097.appspot.com",
  messagingSenderId: "730114483301",
  appId: "1:730114483301:web:75f5f059981f8afcb7528c",
  measurementId: "G-60SS3GWFPN",
  databaseURL: "https://sports-buddy-89097-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const analytics = getAnalytics(app);

// Load events when user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.includes('dashboard.html')) {
    loadUserEvents();
  }
});

// Make functions globally accessible
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.addSport = addSport;
window.adminLogin = adminLogin;
window.addCategory = addCategory;
window.addCity = addCity;
window.addArea = addArea;
window.loadUserEvents = loadUserEvents;

// USER REGISTER
function registerUser() {
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  console.log('Attempting registration for:', email);
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Save user info to Database
      setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString()
      }).then(() => {
        console.log("User data saved to Firestore successfully");
        alert("Registration successful!");
        window.location.href = "login.html";
      }).catch(err => {
        console.error("Firestore save error:", err);
        alert("Registration successful but failed to save user data: " + err.message);
      });
    })
    .catch(err => alert(err.message));
}

// USER LOGIN
function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  console.log('Attempting login for:', email);
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('Login successful for user:', userCredential.user.email);
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      console.error('Login error:', err);
      alert(err.message);
    });
}

// LOGOUT
function logoutUser() {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => alert("Error logging out: " + err.message));
}

// ADD SPORT
function addSport() {
  const sportName = document.getElementById('sportName').value.trim();
  const location = document.getElementById('location').value.trim();
  const time = document.getElementById('time').value.trim();
  const user = auth.currentUser;

  console.log('Current user:', user);
  console.log('Adding sport:', { sportName, location, time });

  if (user) {
    const sportRef = push(ref(rtdb, 'sports/' + user.uid));
    set(sportRef, { sportName, location, time, createdBy: user.email })
      .then(() => {
        console.log("Sport event saved to Realtime DB successfully");
        alert("Sport event added!");
        document.getElementById('sportName').value = '';
        document.getElementById('location').value = '';
        document.getElementById('time').value = '';
        loadUserEvents(); // Refresh the events list
      })
      .catch(err => {
        console.error("Realtime DB save error:", err);
        alert("Failed to add sport event: " + err.message);
      });
  } else {
    alert("Please login first.");
  }
}

// ADMIN LOGIN
function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === "admin123") {
    document.getElementById('adminSection').style.display = 'block';
  } else {
    alert("Invalid Admin Password!");
  }
}

// ADMIN ADD FUNCTIONS
function addCategory() {
  const category = document.getElementById('category').value.trim();
  const categoryRef = push(ref(rtdb, 'categories'));
  set(categoryRef, { category })
    .then(() => alert("Category added!"))
    .catch(err => alert("Failed to add category: " + err.message));
}

function addCity() {
  const city = document.getElementById('city').value.trim();
  const cityRef = push(ref(rtdb, 'cities'));
  set(cityRef, { city })
    .then(() => alert("City added!"))
    .catch(err => alert("Failed to add city: " + err.message));
}

function addArea() {
  const area = document.getElementById('area').value.trim();
  const areaRef = push(ref(rtdb, 'areas'));
  set(areaRef, { area })
    .then(() => alert("Area added!"))
    .catch(err => alert("Failed to add area: " + err.message));
}

// LOAD USER EVENTS
function loadUserEvents() {
  const user = auth.currentUser;
  if (user) {
    const eventsRef = ref(rtdb, 'sports/' + user.uid);
    onValue(eventsRef, (snapshot) => {
      const eventsList = document.getElementById('sportsList');
      eventsList.innerHTML = '';
      
      if (snapshot.exists()) {
        const events = snapshot.val();
        Object.keys(events).forEach(key => {
          const event = events[key];
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${event.sportName}</strong><br>
            📍 Location: ${event.location}<br>
            ⏰ Time: ${event.time}<br>
            <small>Created by: ${event.createdBy}</small>
          `;
          li.style.cssText = 'margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;';
          eventsList.appendChild(li);
        });
      } else {
        eventsList.innerHTML = '<li>No events added yet.</li>';
      }
    });
  }
}
