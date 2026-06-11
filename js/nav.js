// Monitoring Layout Scroll States
const monitoringSections = document.querySelectorAll('section');
const internalAnchors = document.querySelectorAll('.nav-link-cluster a');

window.addEventListener('scroll', () => {
    let activeElementID = 'hero-frame';
    monitoringSections.forEach((section) => {
        const triggerPoint = section.offsetTop - 200;
        if (window.scrollY >= triggerPoint) {
            activeElementID = section.getAttribute('id');
        }
    });

    internalAnchors.forEach((anchor) => {
        anchor.classList.remove('active');
        if (anchor.getAttribute('href') === `#${activeElementID}`) {
            anchor.classList.add('active');
        }
    });
});

