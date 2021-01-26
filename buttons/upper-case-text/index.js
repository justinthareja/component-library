window.addEventListener("DOMContentLoaded", (event) => {
    var $buttons = document.querySelectorAll("button");

    Array.from($buttons).forEach(($button) => {
        $button.textContent = $button.textContent.toUpperCase();
    });
})