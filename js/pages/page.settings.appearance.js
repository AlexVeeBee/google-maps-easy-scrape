/// <reference path="../ui.components.js" />
const sendMessage = (message) => {
    window.parent.postMessage(message, '*');
}

const flashbangMeme = (stack) => {
    const m_body = `
    <a href="https://www.youtube.com/watch?v=QOhmcbfwxnA" target="_blank">
        <img src="/images/flashbang.jpg" alt="Flashbang" style="width: 100%; max-width: 300px;">
    </a>

    `;
    const m_footer = `
    <div style="display: flex; justify-content: space-between; gap: 12px;">
        <button class="btn btn-primary btn-modal" id="cloasemodal" data-dismiss="modal">What have i done?</button>
        <button class="btn btn-primary btn-modal" id="returntodarn" data-dismiss="modal">Return to the dark side!</button>
    </div>
        `;
    const modal = new modalCreator(
        "flashbang",
        "Flashbang!",
        m_body,
        m_footer,
        {}
    )
    const m = modal.create();
    modal.show();
    $(`#${m.id} #cloasemodal`).click(function() {
        modalAPI.removeModal(m.id);
    });
    $(`#${m.id} #returntodarn`).click(function() {
        modalAPI.removeModal(m.id);
        setTheme('dark');
        sendMessage({ type: 'setTheme', theme: 'dark' });
    });
}


document.addEventListener('DOMContentLoaded', async function() {
    const group = new buttonGroup('themeSelect');
    group.init();
    group.setValue(getBrowserTheme());
    group.on('change', function(event) {
        const theme = event.detail.value;
        setTheme(theme);
        sendMessage({ type: 'setTheme', theme: theme });
        if (theme === 'light') {
            flashbangMeme();
        }
    });
    const currentTheme = await getSavedTheme();
    group.setValue(currentTheme);

    // setting-lang

    // iframe
    // send event to set theme
});