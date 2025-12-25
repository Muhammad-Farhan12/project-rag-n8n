// --- KONFIGURASI ---
// Ganti URL ini dengan URL Webhook Production dari n8n kamu (dari Ngrok/Cloudflare)
// Pastikan diakhiri dengan /webhook/webapp-sjk-ask
const WEBHOOK_URL = 'https://felisha-arytenoidal-georgine.ngrok-free.dev/webhook-test/webapp-sjk-ask'; 

const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const sendBtn = document.getElementById('sendBtn');

// Generate Session ID unik untuk setiap kali refresh halaman (agar memori chat terjaga per sesi)
const sessionId = 'web-' + Math.random().toString(36).substring(2, 15);

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Fungsi Utama Mengirim Pesan
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Tampilkan pesan user di layar
    addMessage(text, 'user');
    userInput.value = '';

    // 2. Tampilkan indikator loading
    const loadingId = addMessage("Sedang berpikir...", 'bot', true);

    try {
        // 3. Kirim ke n8n Webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Payload disesuaikan agar terbaca oleh node "Edit Fields" di n8n ($json.body.question)
            body: JSON.stringify({
                question: text,    
                chatId: sessionId,
                source: 'web'
            })
        });

        const rawText = await response.text();

        // 4. Parsing response dari n8n
        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            data = { output: rawText };
        }

        // Hapus loading
        removeMessage(loadingId);

        // Ambil jawaban dari berbagai kemungkinan field output n8n
        const reply = data.output || data.text || data.message || "Maaf, tidak ada jawaban dari server.";

        // 5. Tampilkan balasan AI
        addMessage(reply, 'bot');

    } catch (err) {
        removeMessage(loadingId);
        addMessage("Error: Gagal terhubung ke server n8n. Pastikan workflow aktif.", 'bot');
        console.error(err);
    }
}

// Fungsi Menambah Bubble Chat ke Layar
function addMessage(text, sender, isLoading = false) {
    const div = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    div.id = msgId;
    
    div.classList.add('message');
    div.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

    if (sender === 'bot') {
        // Tambahkan judul kecil untuk bot
        const title = document.createElement('span');
        title.classList.add('bot-title');
        title.innerText = 'AI ADVISOR';
        div.appendChild(title);
    }

    // Tambahkan teks konten
    const content = document.createElement('span');
    content.innerText = text;
    div.appendChild(content);

    // Efek loading (opsional, teks miring)
    if (isLoading) {
        content.style.fontStyle = 'italic';
        content.style.opacity = '0.7';
    }

    chatContainer.appendChild(div);
    scrollToBottom();
    
    return msgId;
}

// Fungsi Menghapus Bubble (untuk loading)
function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) {
        el.remove();
    }
}

// Fungsi Auto Scroll ke Bawah
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}