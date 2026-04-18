let isLoginMode = true;

window.onload = () => {
    checkLoginStatus();
    generateVideos();
};

// --- AUTH LOGIC ---

// 1. Checks if a user is already saved in the browser
function checkLoginStatus() {
    const activeUser = localStorage.getItem('currentUser');
    const userBtn = document.getElementById('userBtn');
    if (activeUser) {
        userBtn.innerText = "👤 " + activeUser;
    } else {
        userBtn.innerText = "👤 Sign In";
    }
}

// 2. Handles the Login/Signup button click
function handleAuth() {
    const user = document.getElementById('uName').value.trim();
    const pass = document.getElementById('uPass').value.trim();

    if (!user || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    if (isLoginMode) {
        // LOGIN PROCESS
        const storedData = localStorage.getItem('novidra_user_' + user);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.password === pass) {
                localStorage.setItem('currentUser', user);
                checkLoginStatus();
                toggleModal();
                alert("Welcome back to Novidra, " + user + "!");
            } else {
                alert("Incorrect password.");
            }
        } else {
            alert("User not found. Try signing up!");
        }
    } else {
        // SIGNUP PROCESS
        if (localStorage.getItem('novidra_user_' + user)) {
            alert("Username already exists!");
            return;
        }
        const newUser = { username: user, password: pass };
        localStorage.setItem('novidra_user_' + user, JSON.stringify(newUser));
        alert("Account created successfully! Please sign in.");
        swapAuth(); // Switch back to login view
    }
}

// 3. UI Helpers
function toggleModal() {
    const m = document.getElementById('modalOverlay');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function swapAuth() {
    isLoginMode = !isLoginMode;
    const mTitle = document.getElementById('mTitle');
    const swapText = document.getElementById('swapText');
    
    if (isLoginMode) {
        mTitle.innerText = "Join Novidra";
        swapText.innerText = "Create account";
    } else {
        mTitle.innerText = "Create Account";
        swapText.innerText = "Already have an account? Login";
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload(); 
}

// --- SIDEBAR & CONTENT ---

document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('open');
};

function generateVideos() {
    const container = document.getElementById('videoContainer');
    for(let i=1; i<=12; i++) {
        container.innerHTML += `
            <div class="video-card">
                <div class="thumb"></div>
                <p class="v-title">Novidra Originals: Episode ${i}</p>
                <p class="v-stats">Novidra • ${i*5}K views</p>
            </div>`;
    }
}
