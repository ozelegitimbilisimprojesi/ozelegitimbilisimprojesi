const themeBtn = document.getElementById('themeBtn');
const body = document.body;

// Tema: kaydedilmiş değeri uygula
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeBtn.textContent = '☀️';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    themeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// i18n
const langBtn = document.getElementById('langBtn');
let currentLang = localStorage.getItem('lang') || 'tr';

function setLangFlag(lang) {
    langBtn.textContent = lang === 'tr' ? '🇪🇳' : '🇹🇷';
    langBtn.setAttribute('aria-label', lang);
}

function getNested(obj, key) {
    return key.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

function applyTranslations(data) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = getNested(data, key);
        if (val !== undefined) {
            if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
                el.placeholder = val;
            } else {
                el.innerHTML = val;
            }
        }
    });
}

async function loadTranslations(lang) {
    try {
        const res = await fetch(`locales/${lang}.json`);
        if (!res.ok) throw new Error('Translation file not found');
        const data = await res.json();
        applyTranslations(data);
        document.documentElement.lang = lang;
        localStorage.setItem('lang', lang);
        currentLang = lang;
        setLangFlag(lang);
    } catch (e) {
        console.error('i18n load error', e);
    }
}

// Başlangıçta çevirileri yükle
setLangFlag(currentLang);
loadTranslations(currentLang);

langBtn.addEventListener('click', () => {
    const newLang = currentLang === 'tr' ? 'en' : 'tr';
    loadTranslations(newLang);
});


// Supabase bağlantı ayarları
const _supabaseUrl = 'https://omjjijecfzokgethebuo.supabase.co';
const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tamppamVjZnpva2dldGhlYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzM1MjksImV4cCI6MjA4ODkwOTUyOX0.NPw5dk6WimNs1Tce4X9NQoN77y6hvXhPQjQvuiEElfw';
const _supabase = supabase.createClient(_supabaseUrl, _supabaseKey);

// Formu seçelim
const contactForm = document.querySelector('#myContactForm');

// Gönderme olayını dinleyelim
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller

    // Formdaki verileri alalım
    const ad = document.querySelector('#ad').value;
    const eposta = document.querySelector('#eposta').value;
    const mesaj = document.querySelector('#mesaj').value;

    // Supabase'e veriyi gönderelim
    const { data, error } = await _supabase
        .from('İletisim') // Tablo adın neyse o (az önce 'iletisim' yapmıştık)
        .insert([
            { ad: ad, eposta: eposta, mesaj: mesaj }
        ]);

    if (error) {
        console.error('Hata oluştu:', error);
        alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
    } else {
        alert('Mesajınız başarıyla iletildi!');
        contactForm.reset(); // Formu temizler
    }
});