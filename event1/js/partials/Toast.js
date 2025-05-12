export const Toast = (() => {
    const showToast = (message) => {
        const toastElement = document.getElementById('toast');
        toastElement.textContent = message;
        toastElement.classList.add('show');
        toastElement.setAttribute('aria-live', 'assertive');

        setTimeout(() => {
            toastElement.classList.remove('show');
            toastElement.removeAttribute('aria-live');
        }, 3000);
    };

    return { showToast };
})();
