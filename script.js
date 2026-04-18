const SB_URL = 'https://pvfbfdldcouzenwftogb.supabase.co'; 
const SB_KEY = 'sb_publishable_cPV-m7kqxEQq5QcS2bh7qA_6yptdu2T';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

let isLoginMode = true;
let currentUserData = null;

// This runs as soon as the page loads
window.onload = async () => {
    console.log("Novidra Initializing...");
    await checkLoginStatus();
    if (document.getElementById('videoContainer')) {
        loadVideosFromDB();
    }
};

async function checkLoginStatus() {
    const { data: { session }, error } = await _supabase.auth.getSession();
    const userBtn = document.getElementById('userBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (session) {
        console.log("Session found for:", session.user.email);
        const { data: channel, error: chError } = await _supabase
            .from('channels')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (channel) {
            currentUserData = channel;
            userBtn.innerText = "👤 " + channel.username;
            if(uploadBtn) uploadBtn.style.display = 'inline-block';
        } else {
            console.error("User logged in, but no channel found in DB:", chError);
        }
    } else {
        console.log("No active session.");
    }
}

async function handleAuth() {
    const username = document.getElementById('uName').value.trim();
    const password = document.getElementById('uPass').value.trim();
    const email = username + "@novidra.com"; 

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    if (isLoginMode) {
        console.log("Attempting Login...");
        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert("Login Error: " + error.message);
        } else {
            console.log("Login Success!");
            location.reload(); // Refresh to update the UI
        }
    } else {
        console.log("Attempting Signup...");
        const { data, error } = await _supabase.auth.signUp({ email, password });
        
        if (error) {
            alert("Signup Error: " + error.message);
            return;
        }

        // CREATE THE CHANNEL RECORD
        console.log("Auth success, creating channel profile...");
        const { error: dbErr } = await _supabase.from('channels').insert([
            { id: data.user.id, username: username }
        ]);

        if (dbErr) {
            alert("Channel Error: " + dbErr.message);
        } else {
            alert("Success! Now please Login.");
            swapAuth(); // Switch to login mode
        }
    }
}

// --- UI FUNCTIONS ---
function toggleModal() {
    const m = document.getElementById('modalOverlay');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function handleUserClick() {
    if (currentUserData) {
        const dd = document.getElementById('userDropdown');
        dd.style.display = (dd.style.display === 'flex') ? 'none' : 'flex';
    } else {
        toggleModal();
    }
}

function swapAuth() {
    isLoginMode = !isLoginMode;
    document.getElementById('mTitle').innerText = isLoginMode ? "Join Novidra" : "Create Channel";
    document.getElementById('swapText').innerText = isLoginMode ? "Create channel" : "Login instead";
}

async function logout() {
    await _supabase.auth.signOut();
    location.reload();
}
