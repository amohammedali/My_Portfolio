// Profile 3D Tracking Logic
const profileWrapper = document.querySelector('.profile-3d-wrapper');
const profileFrame = document.querySelector('.animated-profile-frame');

if (profileWrapper && profileFrame) {
    profileWrapper.addEventListener('mousemove', (e) => {
        const rect = profileWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 25 degrees)
        const rotateX = ((y - centerY) / centerY) * -25;
        const rotateY = ((x - centerX) / centerX) * 25;

        profileFrame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        profileFrame.style.transition = 'none'; // Remove transition for instant tracking
    });

    profileWrapper.addEventListener('mouseleave', () => {
        profileFrame.style.transform = `rotateX(0deg) rotateY(0deg)`;
        profileFrame.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Smooth snap back
    });
}


