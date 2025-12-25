// --- KONFIGURASI URL ---
// URL Webhook (Production)
const chatUrl = "https://felisha-arytenoidal-georgine.ngrok-free.dev/webhook/tanya-AL"; 

// Saat Website Dibuka: fokus ke input agar siap mengetik
window.onload = function() {
    const input = document.getElementById('questionInput');
    if (input) input.focus();
};

async function kirimPertanyaan() {
    const input = document.getElementById('questionInput');
    const msg = input.value;
    
    // Jangan kirim kalau kosong
    if(!msg.trim()) return;

    // 1. Tampilkan pesan user di layar
    addBubble(msg, 'user', 'new');
    input.value = ""; // Kosongkan input
    
    // 2. Tampilkan loading bubble ("Sedang mengetik...")
    const loadingBubble = addBubble("Sedang mengetik...", 'bot', 'loading');
    scrollToBottom();

    try {
        // 3. Kirim ke n8n
        const res = await fetch(chatUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Header ini PENTING agar ngrok free tidak menampilkan halaman warning HTML
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ "pertanyaan": msg })
        });

        // Cek jika HTTP Error (bukan 200 OK)
        if (!res.ok) {
            throw new Error(`Server Error: ${res.status}`);
        }

        const data = await res.json();

        // 4. Hapus loading, ganti dengan jawaban asli dari bot
        loadingBubble.remove();
        
        // Pastikan node n8n mengembalikan JSON dengan key "jawaban"
        const jawabanFinal = data.jawaban || "Maaf, bot tidak mengembalikan jawaban.";
        addBubble(jawabanFinal, 'bot', 'new');
        
        scrollToBottom();

    } catch (e) {
        // Jika error (fetch gagal/n8n mati)
        loadingBubble.innerText = "Error: " + e.message;
        console.error(e);
    }
}

// Fungsi Bikin Bubble Chat
function addBubble(text, type, id) {
    const container = document.getElementById('responseArea');
    const div = document.createElement('div');
    div.className = `message-bubble ${type === 'user' ? 'user-bubble' : 'bot-bubble'}`;
    div.innerText = text;
    div.id = "msg-" + id; 
    container.appendChild(div);
    return div;
}

// Fungsi Scroll Otomatis ke Bawah
function scrollToBottom() {
    const container = document.getElementById('responseArea');
    container.scrollTop = container.scrollHeight;
}

// Event Listener: Tekan Enter untuk kirim
document.getElementById("questionInput").addEventListener("keypress", function(e) {
    if(e.key === "Enter") kirimPertanyaan();
});