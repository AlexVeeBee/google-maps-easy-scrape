const getSavedTheme = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['theme'], (result) => {
            console.log('theme value currently is', result.theme);
            resolve(result.theme);
        });
    });
}
const saveCurrentTheme = (theme) => { chrome.storage.sync.set({ theme: theme }, () => { console.log('Theme saved', theme); }); }
function getBrowserTheme() { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function setTheme(theme) { document.body.setAttribute('theme', theme == 'system' ? getBrowserTheme() : theme); }
document.addEventListener('DOMContentLoaded', function() { 
    document.body.setAttribute('theme', getBrowserTheme());

    // load saved theme
    getSavedTheme().then((theme) => {
        setTheme(theme);
    });
});