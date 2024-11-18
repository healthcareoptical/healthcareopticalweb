const EN_URL = './languages/en.json';
const ZH_URL = './languages/zh.json'
const HOME_URL = './pages/home.html'
const ABOUT_US_URL = '';
const CONTACT_US_URL = '';
const PRODUCT_URL = '';
const LOGIN_URL = '';

async function getContent() {
    try {
        const url = localStorage.getItem('lang') === 'zh' ? ZH_URL : EN_URL;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const allElements = document.querySelectorAll('[property-name]');

        for (let i = 0; i < allElements.length; i++) {
            const value = data[allElements[i].getAttribute('property-name')];
            allElements[i].innerText = value;
        }

    } catch (error) {
        console.error("Error fetching the JSON file:", error);
    }
}

async function switchPage(page, firstLoad=false ) {  
    if (!firstLoad){
        event.preventDefault();
    }
    try {
        const response = await fetch(page); 
        if (!response.ok) {
            throw new Error(`Page not found: ${page}`);
        }
        const data = await response.text();
        document.getElementById('container').innerHTML = data;
        getContent();
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('container').innerHTML = `<p>Error loading ${page} content.</p>`;
    }
}
