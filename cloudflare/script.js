// --- KONFIGURASI PROGRESS 6 ---
// Ganti URL ini dengan URL Cloudflare Tunnel kamu
// Pakai domain n8n karena webhook-nya numpang di situ
const WEBHOOK_URL = 'https://n8n.parhanrag.my.id/webhook/webapp-sjk-ask';

const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const sendBtn = document.getElementById('sendBtn');
const currentDateEl = document.getElementById('currentDate');
const currentDayEl = document.getElementById('currentDay');

// Setup Tanggal Realtime (Ala Persona Menu)
const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const now = new Date();
currentDateEl.innerText = `${now.getMonth() + 1}/${now.getDate()}`;
currentDayEl.innerText = days[now.getDay()];

// Session ID Unik
const sessionId = 'p4g-' + Math.random().toString(36).substring(2, 15);

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Tampilkan pesan User
    addMessage(text, 'user');
    userInput.value = '';

    // 2. Tampilkan Loading (Ala TV Static Text)
    const loadingId = addMessage("Analyzing...", 'bot', true);

    try {
        // 3. Kirim ke Cloudflare Tunnel -> n8n
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: text,    
                chatId: sessionId,
                source: 'web'
            })
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            data = { output: rawText };
        }

        // Hapus loading
        removeMessage(loadingId);

        // Ambil jawaban
        const reply = data.output || data.text || "I couldn't reach the TV world...";
        
        // 4. Tampilkan Balasan AI
        addMessage(reply, 'bot');

    } catch (err) {
        removeMessage(loadingId);
        addMessage("Connection to Midnight Channel Failed!", 'bot');
        console.error(err);
    }
}

function addMessage(text, sender, isLoading = false) {
    const div = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    div.id = msgId;
    
    div.classList.add('message');
    div.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

    let innerHTML = '';
    
    if (sender === 'bot') {
        innerHTML += `<div class="avatar-icon">${isLoading ? '...' : 'TED'}</div>`;
    }

    // Markdown simple parser (untuk Bold **text**)
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    innerHTML += `<div class="bubble-content">${formattedText}</div>`;
    
    div.innerHTML = innerHTML;

    chatContainer.appendChild(div);
    scrollToBottom();
    
    // Play sound effect sound (optional, browser policy might block)
    // new Audio('assets/pop.mp3').play().catch(() => {});

    return msgId;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}