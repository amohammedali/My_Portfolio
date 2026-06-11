// Skills Tab Switching Logic
window.switchSkillTab = function (targetId, event) {
    // Update tabs
    document.querySelectorAll('.skill-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update panes
    document.querySelectorAll('.skill-pane').forEach(pane => {
        pane.classList.remove('active-pane');
    });
    document.getElementById('skill-' + targetId).classList.add('active-pane');
};

// Intersection Observer for scroll entrance animations
const revealObserverOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after revealing to prevent repeating animation when scrolling back up
            observer.unobserve(entry.target);
        }
    });
}, revealObserverOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
});


