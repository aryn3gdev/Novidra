const SB_URL = 'https://pvfbfdldcouzenwftogb.supabase.co'; 
const SB_KEY = 'sb_publishable_cPV-m7kqxEQq5QcS2bh7qA_6yptdu2T';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

let isLoginMode = true;
let currentUserData = null;

window.onload = async () => {
    await checkLoginStatus();
    if (document.getElementById('videoContainer')) loadVideosFromDB();
};

// --- AUTH ---
async function checkLoginStatus() {
    const { data: { session } } = await _supabase.auth.getSession();
    const userBtn = document.getElementById('userBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (session) {
        const { data: channel } = await _supabase.from('channels').select('*').eq('id', session.user.id).single();
        if (channel) {
            currentUserData = channel;
            userBtn.innerHTML = `👤 ${channel.username}`;
            if(uploadBtn) uploadBtn.style.display = 'inline-block';
        }
    }
}

async function handleAuth() {
    const username = document.getElementById('uName').value.trim();
    const email = username + "@novidra.com"; 
    const password = document.getElementById('uPass').value.trim();

    if (isLoginMode) {
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message); else location.reload();
    } else {
        const { data, error } = await _supabase.auth.signUp({ email, password });
        if (error) return alert(error.message);
        await _supabase.from('channels').insert([{ id: data.user.id, username: username }]);
        alert("Account Created! You can now log in.");
        swapAuth();
    }
}

// --- DATABASE & STORAGE ---
async function loadVideosFromDB() {
    const container = document.getElementById('videoContainer');
    const { data: videos } = await _supabase.from('videos').select('*, channels(username)').order('created_at', { ascending: false });
    
    container.innerHTML = "";
    videos.forEach(v => {
        container.innerHTML += `
            <div class="video-card" onclick="window.location.href='watch.html?vid=${v.id}'">
                <div class="thumb" style="background: #111; display:flex; align-items:center; justify-content:center; color:var(--accent)">▶ PLAY</div>
                <p class="v-title">${v.title}</p>
                <p class="v-stats">${v.channels.username} • ${v.views} views</p>
            </div>`;
    });
}

async function uploadVideo() {
    const title = document.getElementById('vidTitle').value;
    const file = document.getElementById('vidFile').files[0];
    const status = document.getElementById('uploadStatus');
    
    if (!title || !file) return alert("Fill in everything!");
    
    status.innerText = "Uploading... please don't close this tab.";
    document.getElementById('pubBtn').disabled = true;

    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await _supabase.storage.from('media').upload(fileName, file);

    if (error) return alert(error.message);

    const { data: urlData } = _supabase.storage.from('media').getPublicUrl(fileName);
    
    await _supabase.from('videos').insert([{ 
        user_id: currentUserData.id, 
        title: title, 
        video_url: urlData.publicUrl 
    }]);

    alert("Success!");
    window.location.href = 'index.html';
}

async function loadWatchPage(vid) {
    const { data: video } = await _supabase.from('videos').select('*, channels(username)').eq('id', vid).single();
    if (video) {
        document.getElementById('mainPlayer').src = video.video_url;
        document.getElementById('vWatchTitle').innerText = video.title;
        document.getElementById('vWatchStats').innerText = `Uploaded by ${video.channels.username}`;
        // Increment views
        await _supabase.from('videos').update({ views: video.views + 1 }).eq('id', vid);
    }
}

// --- UI ---
function toggleModal() {
    const m = document.getElementById('modalOverlay');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}
function handleUserClick() {
    if (currentUserData) {
        const dd = document.getElementById('userDropdown');
        dd.style.display = (dd.style.display === 'flex') ? 'none' : 'flex';
    } else toggleModal();
}
function logout() { _supabase.auth.signOut().then(() => location.reload()); }
function swapAuth() {
    isLoginMode = !isLoginMode;
    document.getElementById('mTitle').innerText = isLoginMode ? "Join Novidra" : "Create Channel";
}
