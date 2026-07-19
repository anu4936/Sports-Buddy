// Firebase Imports
import { initializeApp } from 
'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 
'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';


import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue
} from 
'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';


import { getAnalytics } from 
'https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js';


// Firebase Configuration

const firebaseConfig = {

  apiKey: "AIzaSyAa08-pQi7_xLbeHcG9ga3j5QmkKEVqoT8",

  authDomain: "sports-buddy-89097.firebaseapp.com",

  projectId: "sports-buddy-89097",

storageBucket: "sports-buddy-89097.firebasestorage.app",

  messagingSenderId: "730114483301",

  appId: "1:730114483301:web:75f5f059981f8afcb7528c",

  measurementId: "G-60SS3GWFPN",

  databaseURL:
  "https://sports-buddy-89097-default-rtdb.asia-southeast1.firebasedatabase.app"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const rtdb = getDatabase(app);

const analytics = getAnalytics(app);



// Global Functions

window.registerUser = registerUser;

window.loginUser = loginUser;

window.logoutUser = logoutUser;

window.addSport = addSport;

window.editEvent = editEvent;

window.adminLogin = adminLogin;

window.addCategory = addCategory;

window.addCity = addCity;

window.addArea = addArea;



// Check Login User

onAuthStateChanged(auth,(user)=>{

    if(user && window.location.pathname.includes("dashboard.html")){

        loadUserEvents();

    }

});



// ================= USER REGISTER =================
async function registerUser() {

    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    try {
        await createUserWithEmailAndPassword(auth, email, password);

        alert("Registration Successful!");
        window.location.href = "login.html";

    } catch (error) {
        alert(error.code + "\n" + error.message);
    }
}

async function loginUser() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {

        await signInWithEmailAndPassword(auth, email, password);

        alert("Login Successful!");
        window.location.href = "dashboard.html";

    } catch (error) {

        console.log(error.code);
        console.log(error.message);

        alert(error.code + "\n" + error.message);
    }
}
// ================= LOGOUT =================


function logoutUser(){


    signOut(auth)

    .then(()=>{

        window.location.href="index.html";

    })

    .catch(error=>{

        alert(error.message);

    });


}




// ================= ADD SPORTS EVENT =================


function addSport(){


    const sportName =
    document.getElementById("sportName").value.trim();


    const location =
    document.getElementById("location").value.trim();


    const time =
    document.getElementById("time").value.trim();



    const user = auth.currentUser;


    if(!user){

        alert("Please Login First");

        return;

    }



    const eventRef =
    push(ref(rtdb,"sports/"+user.uid));



    set(eventRef,{

        sportName:sportName,

        location:location,

        time:time,

        createdBy:user.email

    })

    .then(()=>{


        alert("Sport Event Added Successfully!");


    })

    .catch(error=>{

        alert(error.message);

    });


}






// ================= DISPLAY EVENTS =================


function loadUserEvents(){


const user = auth.currentUser;


if(!user)return;



const sportsRef =
ref(rtdb,"sports/"+user.uid);



onValue(sportsRef,(snapshot)=>{


const list =
document.getElementById("sportsList");


if(!list)return;



list.innerHTML="";



snapshot.forEach((child)=>{


const sport = child.val();



const li=document.createElement("li");



li.innerHTML=`

<b>${sport.sportName}</b><br>

Location: ${sport.location}<br>

Time: ${sport.time}<br>


<button onclick="editEvent(
'${child.key}',
'${sport.sportName}',
'${sport.location}',
'${sport.time}'
)">

Update

</button>

`;



list.appendChild(li);



});


});


}







// ================= UPDATE EVENT =================


function editEvent(id,oldSport,oldLocation,oldTime){


const newSport =
prompt("Enter sport name",oldSport);



const newLocation =
prompt("Enter location",oldLocation);



const newTime =
prompt("Enter time",oldTime);



const user=auth.currentUser;



update(

ref(rtdb,"sports/"+user.uid+"/"+id),

{

sportName:newSport,

location:newLocation,

time:newTime

}

)

.then(()=>{

alert("Event Updated Successfully!");

})


.catch(error=>{

alert(error.message);

});


}







// ================= ADMIN LOGIN =================


function adminLogin(){


const pass =
document.getElementById("adminPass").value;



if(pass==="admin123"){


document.getElementById("adminSection").style.display="block";


}

else{


alert("Invalid Admin Password");


}


}






// ================= ADD CATEGORY =================


function addCategory(){


const category =
document.getElementById("category").value.trim();



if(category===""){

alert("Enter Category");

return;

}



const categoryRef =
push(ref(rtdb,"categories"));



set(categoryRef,{

categoryName:category,

createdAt:new Date().toISOString()

})

.then(()=>{

alert("Category Added Successfully!");

});

}






// ================= ADD CITY =================


function addCity(){


const city =
document.getElementById("city").value.trim();



if(city===""){

alert("Enter City");

return;

}



const cityRef =
push(ref(rtdb,"cities"));



set(cityRef,{

cityName:city,

createdAt:new Date().toISOString()

})

.then(()=>{

alert("City Added Successfully!");

});

}






// ================= ADD AREA =================


function addArea(){


const area =
document.getElementById("area").value.trim();



if(area===""){

alert("Enter Area");

return;

}



const areaRef =
push(ref(rtdb,"areas"));



set(areaRef,{

areaName:area,

createdAt:new Date().toISOString()

})

.then(()=>{

alert("Area Added Successfully!");

});


}






// Dashboard Form Submit

document.addEventListener("DOMContentLoaded",()=>{


const form =
document.getElementById("sportForm");



if(form){


form.addEventListener("submit",(e)=>{


e.preventDefault();


addSport();


});


}


});
