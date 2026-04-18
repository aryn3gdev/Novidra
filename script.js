let isLoginMode = true;

window.onload = () => {
    checkLoginStatus();
    generateVideos();
};

// --- AUTH LOGIC ---

function checkLoginStatus() {
    const activeUser = localStorage.getItem('currentUser');
    const userBtn = document.getElementById('userBtn');
    if (activeUser) {
        userBtn.innerText = "👤 " + activeUser;
    } else {
        userBtn.innerText = "👤 Sign In";
    }
}

// Logic to decide if we show the Login Modal or the Dropdown Menu
function handleUserClick() {
    const activeUser = localStorage.getItem('currentUser');
    if (activeUser) {
        // Toggle the dropdown menu
        const dropdown = document.getElementById('userDropdown');
        dropdown.style.display = (dropdown.style.display === 'flex') ? 'none' : 'flex';
    } else {
        // Open the sign-in modal
        toggleModal();
    }
}

function handleAuth() {
    const user = document.getElementById('uName').value.trim();
    const pass = document.getElementById('uPass').value.trim();

    if (!user || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    if (isLoginMode) {
        const storedData = localStorage.getItem('novidra_user_' + user);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.password === pass) {
                localStorage.setItem('currentUser', user);
                checkLoginStatus();
                toggleModal();
                alert("Welcome to Novidra, " + user + "!");
            } else {
                alert("Incorrect password.");
            }
        } else {
            alert("User not found.");
        }
    } else {
        if (localStorage.getItem('novidra_user_' + user)) {
            alert("Username taken!");
            return;
        }
        const newUser = { username: user, password: pass };
        localStorage.setItem('novidra_user_' + user, JSON.stringify(newUser));
        alert("Account created! Now Sign In.");
        swapAuth();
    }
}

// --- UI HELPERS ---

function toggleModal() {
    const m = document.getElementById('modalOverlay');
    // Toggle between none and flex
    if (m.style.display === 'flex') {
        m.style.display = 'none';
    } else {
        m.style.display = 'flex';
    }
}

function swapAuth() {
    isLoginMode = !isLoginMode;
    const mTitle = document.getElementById('mTitle');
    const swapText = document.getElementById('swapText');
    
    mTitle.innerText = isLoginMode ? "Join Novidra" : "Create Account";
    swapText.innerText = isLoginMode ? "Create account" : "Already have an account? Login";
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload(); 
}

function swapAccount() {
    localStorage.removeItem('currentUser');
    checkLoginStatus();
    document.getElementById('userDropdown').style.display = 'none';
    toggleModal();
}

// --- SIDEBAR & CONTENT ---

document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('open');
};

// Close dropdown if user clicks outside of the button
window.onclick = function(event) {
    if (!event.target.matches('#userBtn')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && dropdown.style.display === 'flex') {
            dropdown.style.display = 'none';
        }
    }
}

function generateVideos() {
    const container = document.getElementById('videoContainer');
    // Clear container first
    container.innerHTML = "";
    for(let i=1; i<=12; i++) {
        container.innerHTML += `
            <div class="video-card">
                <div class="thumb"></div>
                <p class="v-title">Novidra Originals: Episode ${i}</p>
                <p class="v-stats">Novidra Official • ${i*5}K views</p>
            </div>`;
    }
}
