// --- KONFIGURASI URL ---
// 1. URL untuk KIRIM Pesan (POST)
const chatUrl = "https://felisha-arytenoidal-georgine.ngrok-free.dev/webhook/tanya-AL"; 
// Saat Website Dibuka: fokus ke input agar siap mengetik
window.onload = function() {
    const input = document.getElementById('questionInput');
    if (input) input.focus();
};

async function kirimPertanyaan() {
    const input = document.getElementById('questionInput');
    const msg = input.value;
    if(!msg.trim()) return;

    // Tampilkan pesan user langsung
    addBubble(msg, 'user', 'new');
    input.value = "";
    
    // Tampilkan loading bot
    const loadingBubble = addBubble("Sedang mengetik...", 'bot', 'loading');
    scrollToBottom();

    try {
        const res = await fetch(chatUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ pertanyaan: msg })
        });
        const data = await res.json();

        // Hapus loading, ganti dengan jawaban asli
        loadingBubble.remove();
        addBubble(data.jawaban, 'bot', 'new');
        
        // Tidak lagi menggunakan riwayat, cukup tampilkan jawaban

    } catch (e) {
        loadingBubble.innerText = "Error: " + e.message;
    }
}

// Fungsi Bikin Bubble Chat
function addBubble(text, type, id) {
    const container = document.getElementById('responseArea');
    const div = document.createElement('div');
    div.className = `message-bubble ${type === 'user' ? 'user-bubble' : 'bot-bubble'}`;
    div.innerText = text;
    div.id = "msg-" + id; // ID unik untuk fitur scroll
    container.appendChild(div);
    return div;
}

function scrollToBottom() {
    const container = document.getElementById('responseArea');
    container.scrollTop = container.scrollHeight;
}

// Fitur Klik Sidebar -> Scroll ke Chat
function scrollToMessage(id) {
    const element = document.getElementById("msg-" + id);
    if(element) element.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Enter untuk kirim
document.getElementById("questionInput").addEventListener("keypress", function(e) {
    if(e.key === "Enter") kirimPertanyaan();
});