export const Accordion = (accordionSelector) => {
    const accordion = document.querySelector(accordionSelector);
    const accordionItems = accordion ? [...accordion.querySelectorAll('.accordion_item')] : [];

    const toggleAccordion = (item, expand) => {
        const button = item.querySelector('.accordion_button');
        const content = item.querySelector('.accordion_collapse');
        button.setAttribute('aria-expanded', expand);

        if (expand) {
            content.classList.add('open');
        } else {
            content.classList.remove('open');
        }
    };

    const init = () =>
        accordionItems.map((item) => {
            const button = item.querySelector('.accordion_button');

            button.addEventListener('click', (e) => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                toggleAccordion(item, !isExpanded);
            });

            button.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    const isExpanded = button.getAttribute('aria-expanded') === 'true';
                    toggleAccordion(item, !isExpanded);
                }
            });
        });

    return { init };
};
