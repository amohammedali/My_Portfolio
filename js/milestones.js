// ==========================================
// 7. MILESTONES FILTERING & SCROLL REVEAL
// ==========================================
window.filterMilestones = function (type, btnElement) {
    const cards = document.querySelectorAll('.milestone-card');
    const tabs = document.querySelectorAll('.milestone-tabs button');

    // Update active tab styling
    tabs.forEach(tab => {
        tab.classList.remove('cyber-btn-primary');
        tab.classList.remove('active');
    });
    btnElement.classList.add('cyber-btn-primary');
    btnElement.classList.add('active');

    cards.forEach(card => {
        if (type === 'all' || card.getAttribute('data-type') === type) {
            card.classList.remove('hide');
            // Trigger reflow to restart animation
            void card.offsetWidth;
            card.classList.add('fade-in-up');
        } else {
            card.classList.add('hide');
            card.classList.remove('fade-in-up');
        }
    });
};


