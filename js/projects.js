// ==========================================
// 6. REALTIME CARDS INTERACTIVE TILT ENGINE
// ==========================================
const frontPlates = document.querySelectorAll('.glass-plate-front');

frontPlates.forEach((plate) => {
    plate.addEventListener('mousemove', (e) => {
        const borderBox = plate.getBoundingClientRect();
        const mousePosX = e.clientX - borderBox.left;
        const mousePosY = e.clientY - borderBox.top;

        const percentageX = (mousePosX / borderBox.width) - 0.5;
        const percentageY = (mousePosY / borderBox.height) - 0.5;

        const rotationPitchX = (-percentageY * 25).toFixed(2);
        const rotationYawY = (percentageX * 25).toFixed(2);

        plate.style.transform = `perspective(1000px) rotateX(${rotationPitchX}deg) rotateY(${rotationYawY}deg) translateZ(15px)`;
    });

    plate.addEventListener('mouseleave', () => {
        plate.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
});

// Initialize Engine Pipelines
processGraphicsPipeline();

window.addEventListener('resize', () => {
    globalCamera.aspect = window.innerWidth / window.innerHeight;
    globalCamera.updateProjectionMatrix();
    coreRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Custom Video Controls Logic for EduCMS
const educmsVideo = document.getElementById('educms-video');
if (educmsVideo) {
    const videoContainer = document.getElementById('educms-video-container');
    const fullscreenToggleBtn = document.getElementById('fullscreen-toggle-btn');
    const fullscreenBackdrop = document.getElementById('fullscreen-backdrop');
    const centerControlsWrapper = document.getElementById('center-controls-wrapper');
    const centerPlayOverlay = document.getElementById('center-play-overlay');
    const bottomControls = document.getElementById('bottom-controls-overlay');
    const stopBtn = document.getElementById('stop-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressThumb = document.getElementById('progress-thumb');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    let fadeTimeout;
    let isDragging = false;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function togglePlay() {
        if (educmsVideo.paused) {
            educmsVideo.play();
            centerPlayOverlay.innerHTML = '<i class="fas fa-pause"></i>';
            videoContainer.classList.add('playing');
            resetFadeTimeout();
        } else {
            educmsVideo.pause();
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
        }
    }

    function resetFadeTimeout() {
        if (!educmsVideo.paused) {
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
            clearTimeout(fadeTimeout);
            fadeTimeout = setTimeout(() => {
                if (!videoContainer.matches(':hover') && !isDragging) {
                    centerControlsWrapper.classList.add('fade-out');
                    bottomControls.classList.add('fade-out');
                }
            }, 2000);
        }
    }

    const tapLeft = document.getElementById('tap-zone-left');
    const tapRight = document.getElementById('tap-zone-right');

    function triggerRipple(element) {
        element.classList.remove('animate-ripple');
        void element.offsetWidth; // trigger reflow
        element.classList.add('animate-ripple');
    }

    let tapTimer;
    let tapCount = 0;

    function handleTap(e, direction) {
        e.stopPropagation();
        tapCount++;
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
                togglePlay();
            }, 250);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            if (direction === 'left') {
                educmsVideo.currentTime = Math.max(0, educmsVideo.currentTime - 5);
                if (tapLeft) triggerRipple(tapLeft);
            } else {
                educmsVideo.currentTime = Math.min(educmsVideo.duration, educmsVideo.currentTime + 5);
                if (tapRight) triggerRipple(tapRight);
            }
            resetFadeTimeout();
        }
    }

    if (tapLeft) tapLeft.addEventListener('click', (e) => handleTap(e, 'left'));
    if (tapRight) tapRight.addEventListener('click', (e) => handleTap(e, 'right'));

    if (bottomControls) {
        bottomControls.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // If click falls through directly to container (e.g. middle part), toggle play
    videoContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    videoContainer.addEventListener('mousemove', () => {
        resetFadeTimeout();
    });

    videoContainer.addEventListener('mouseleave', () => {
        if (!educmsVideo.paused && !isDragging) {
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.add('fade-out');
            bottomControls.classList.add('fade-out');
        }
    });

    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            educmsVideo.pause();
            educmsVideo.currentTime = 0;
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            progressFill.style.width = '0%';
            if (progressThumb) progressThumb.style.left = '0%';
        });
    }

    function updateProgressFromEvent(e) {
        const rect = progressContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        educmsVideo.currentTime = pos * educmsVideo.duration;
    }

    progressContainer.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDragging = true;
        updateProgressFromEvent(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateProgressFromEvent(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resetFadeTimeout();
        }
    });

    educmsVideo.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const percent = (educmsVideo.currentTime / educmsVideo.duration) * 100;
            progressFill.style.width = percent + '%';
            if (progressThumb) progressThumb.style.left = percent + '%';
        }
        timeCurrent.innerText = formatTime(educmsVideo.currentTime);
    });

    educmsVideo.addEventListener('loadedmetadata', () => {
        timeTotal.innerText = formatTime(educmsVideo.duration);
    });

    function toggleFullscreen() {
        if (videoContainer.classList.contains('fullscreen-mode')) {
            videoContainer.classList.remove('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.remove('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
        } else {
            videoContainer.classList.add('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.add('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
        }
    }

    if (fullscreenToggleBtn) {
        fullscreenToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullscreen();
        });
    }

    if (fullscreenBackdrop) {
        fullscreenBackdrop.addEventListener('click', (e) => {
            e.stopPropagation();
            if (videoContainer.classList.contains('fullscreen-mode')) {
                toggleFullscreen();
            }
        });
    }
}

// EduCMS 3D Flip Logic
const educmsImages = [
    'assets/EduCMS-College_System/container/admin_dashboard.png',
    'assets/EduCMS-College_System/container/admin_departments.png',
    'assets/EduCMS-College_System/container/Admin_login.png',
    'assets/EduCMS-College_System/container/admin_subjects.png',
    'assets/EduCMS-College_System/container/faculty_login.png',
    'assets/EduCMS-College_System/container/hod_login.png',
    'assets/EduCMS-College_System/container/placement_Status.png',
    'assets/EduCMS-College_System/container/staff_register.png',
    'assets/EduCMS-College_System/container/Student_dashboard.png',
    'assets/EduCMS-College_System/container/student_digital_id.png',
    'assets/EduCMS-College_System/container/student_leaderboard.png',
    'assets/EduCMS-College_System/container/student_login.png'
];

document.querySelectorAll('.educms-flip-container').forEach(container => {
    let flipTimeout;
    let isHovered = false;
    let currentImageSrc = container.querySelector('.educms-flip-img').src;

    function scheduleNextFlip() {
        clearTimeout(flipTimeout);
        const interval = Math.floor(Math.random() * 2000) + 3000; // 3 to 5 seconds
        flipTimeout = setTimeout(performFlip, interval);
    }

    container.addEventListener('mouseenter', () => {
        isHovered = true;
        clearTimeout(flipTimeout); // Pause cycle
    });

    container.addEventListener('mouseleave', () => {
        isHovered = false;
        scheduleNextFlip(); // Resume cycle
    });

    function performFlip() {
        if (isHovered) return;

        const inner = container.querySelector('.educms-flip-inner');
        const img = container.querySelector('.educms-flip-img');

        // Pick next random image that isn't the current one
        let nextImageSrc;
        do {
            nextImageSrc = educmsImages[Math.floor(Math.random() * educmsImages.length)];
        } while (currentImageSrc.endsWith(nextImageSrc));

        // Start flip animation (0 to 90deg)
        container.classList.add('flipping');
        inner.classList.remove('flip-full');
        inner.classList.add('flip-half');

        // Swap src midway through animation
        setTimeout(() => {
            img.src = nextImageSrc;
            currentImageSrc = nextImageSrc;

            // Complete flip animation (90 to 0deg)
            inner.classList.remove('flip-half');
            inner.classList.add('flip-full');

            setTimeout(() => {
                container.classList.remove('flipping');
                scheduleNextFlip();
            }, 300); // 300ms for second half of flip
        }, 300); // 300ms for first half of flip
    }

    scheduleNextFlip();
});

// Carousel Logic
document.querySelectorAll('.carousel-container').forEach(container => {
    const prevBtn = container.querySelector('.carousel-prev');
    const nextBtn = container.querySelector('.carousel-next');
    const images = container.querySelectorAll('.carousel-img');
    let currentIndex = 0;

    if (prevBtn && nextBtn && images.length > 0) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            images[currentIndex].style.opacity = '0';
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            images[currentIndex].style.opacity = '1';
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            images[currentIndex].style.opacity = '0';
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].style.opacity = '1';
        });
    }
});

// Global Flip Reset Logic
const flipperDecks = document.querySelectorAll('.flipper-spatial-deck');
flipperDecks.forEach(deck => {
    deck.addEventListener('click', () => {
        // Find any video in this deck and reset it immediately
        const video = deck.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
            const centerPlay = deck.querySelector('.center-play-overlay');
            if (centerPlay) centerPlay.innerHTML = '<i class="fas fa-play"></i>';
            const videoContainer = deck.querySelector('.overlay-video-container');
            if (videoContainer) videoContainer.classList.remove('playing');
            const pFill = deck.querySelector('.progress-fill-slim');
            if (pFill) pFill.style.width = '0%';
        }

        // Find any carousel in this deck and reset to first image
        const carouselImgs = deck.querySelectorAll('.carousel-img');
        if (carouselImgs.length > 0) {
            carouselImgs.forEach((img, idx) => {
                img.style.opacity = idx === 0 ? '1' : '0';
            });
        }
    });
});

// EduCMS Lightbox Logic
const lightbox = document.getElementById('educms-lightbox');
const lightboxImg = document.getElementById('educms-lightbox-img');
const closeBtn = document.getElementById('educms-lightbox-close');
const zoomInBtn = document.getElementById('educms-lightbox-zoom-in');
const zoomOutBtn = document.getElementById('educms-lightbox-zoom-out');
const prevBtn = document.getElementById('educms-lightbox-prev');
const nextBtn = document.getElementById('educms-lightbox-next');
const counter = document.getElementById('educms-lightbox-counter');

let currentWidth = 920;
let currentHeight = 540;
let currentLightboxIndex = 0;
let isAnimating = false;

const updateCounter = () => {
    if (counter) {
        counter.textContent = `${currentLightboxIndex + 1} / ${educmsImages.length}`;
    }
};

const changeLightboxImage = (direction) => {
    if (isAnimating || !lightbox.classList.contains('active')) return;
    isAnimating = true;

    if (direction === 'next') {
        currentLightboxIndex = (currentLightboxIndex + 1) % educmsImages.length;
        lightboxImg.classList.add('educms-slide-out-left');
    } else {
        currentLightboxIndex = (currentLightboxIndex - 1 + educmsImages.length) % educmsImages.length;
        lightboxImg.classList.add('educms-slide-out-right');
    }

    setTimeout(() => {
        lightboxImg.src = educmsImages[currentLightboxIndex];
        updateCounter();

        if (direction === 'next') {
            lightboxImg.classList.remove('educms-slide-out-left');
            lightboxImg.classList.add('educms-slide-in-right');
        } else {
            lightboxImg.classList.remove('educms-slide-out-right');
            lightboxImg.classList.add('educms-slide-in-left');
        }

        // Force reflow
        void lightboxImg.offsetWidth;

        lightboxImg.classList.remove('educms-slide-in-right', 'educms-slide-in-left');
        lightboxImg.classList.add('educms-slide-active');

        setTimeout(() => {
            lightboxImg.classList.remove('educms-slide-active');
            isAnimating = false;
        }, 175);
    }, 175);
};

if (lightbox) {
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.removeEventListener('keydown', lightboxKeydownHandler);
    };

    const lightboxKeydownHandler = (e) => {
        if (e.key === 'ArrowLeft') changeLightboxImage('prev');
        if (e.key === 'ArrowRight') changeLightboxImage('next');
        if (e.key === 'Escape') closeLightbox();
    };

    document.querySelectorAll('.educms-hover-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Re-read the img dynamically at the exact moment of the click
            const img = overlay.previousElementSibling.querySelector('.educms-flip-img');
            if (img) {
                // Find index using safe string matching, NOT new URL()
                const currentSrc = img.getAttribute('src') || img.src || '';
                const idx = educmsImages.findIndex(src => currentSrc.includes(src) || src.includes(currentSrc));
                currentLightboxIndex = idx !== -1 ? idx : 0;
                
                lightboxImg.src = educmsImages[currentLightboxIndex] || currentSrc;
                updateCounter();

                currentWidth = 920;
                currentHeight = 540;
                lightboxImg.style.width = `${currentWidth}px`;
                lightboxImg.style.height = `${currentHeight}px`;

                const rect = overlay.getBoundingClientRect();
                const containerCenterX = rect.left + rect.width / 2;
                const containerCenterY = rect.top + rect.height / 2;
                const content = lightbox.querySelector('.educms-lightbox-content');
                
                const originX = containerCenterX - (window.innerWidth / 2) + (content.offsetWidth / 2 || 460);
                const originY = containerCenterY - (window.innerHeight / 2) + (content.offsetHeight / 2 || 270);
                
                content.style.transformOrigin = `${originX}px ${originY}px`;

                lightbox.classList.add('active');
                document.addEventListener('keydown', lightboxKeydownHandler);
            }
        });
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    closeBtn.addEventListener('click', closeLightbox);

    if (prevBtn) prevBtn.addEventListener('click', () => changeLightboxImage('prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => changeLightboxImage('next'));

    zoomInBtn.addEventListener('click', () => {
        currentWidth += 20;
        currentHeight += 20;
        lightboxImg.style.width = `${currentWidth}px`;
        lightboxImg.style.height = `${currentHeight}px`;
    });

    zoomOutBtn.addEventListener('click', () => {
        currentWidth -= 20;
        currentHeight -= 20;
        lightboxImg.style.width = `${currentWidth}px`;
        lightboxImg.style.height = `${currentHeight}px`;
    });
}

// ==========================================
// AuraEMS Specific Logic
// ==========================================

// Custom Video Controls Logic for AuraEMS
const auraemsVideo = document.getElementById('auraems-video');
if (auraemsVideo) {
    const videoContainer = document.getElementById('auraems-video-container');
    const fullscreenToggleBtn = document.getElementById('auraems-fullscreen-toggle-btn');
    const fullscreenBackdrop = document.getElementById('auraems-fullscreen-backdrop');
    const centerControlsWrapper = document.getElementById('auraems-center-controls-wrapper');
    const centerPlayOverlay = document.getElementById('auraems-center-play-overlay');
    const bottomControls = document.getElementById('auraems-bottom-controls-overlay');
    const stopBtn = document.getElementById('auraems-stop-btn');
    const progressContainer = document.getElementById('auraems-progress-container');
    const progressFill = document.getElementById('auraems-progress-fill');
    const progressThumb = document.getElementById('auraems-progress-thumb');
    const timeCurrent = document.getElementById('auraems-time-current');
    const timeTotal = document.getElementById('auraems-time-total');
    let fadeTimeout;
    let isDragging = false;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function togglePlay() {
        if (auraemsVideo.paused) {
            auraemsVideo.play();
            centerPlayOverlay.innerHTML = '<i class="fas fa-pause"></i>';
            videoContainer.classList.add('playing');
            resetFadeTimeout();
        } else {
            auraemsVideo.pause();
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
        }
    }

    function resetFadeTimeout() {
        if (!auraemsVideo.paused) {
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
            clearTimeout(fadeTimeout);
            fadeTimeout = setTimeout(() => {
                if (!videoContainer.matches(':hover') && !isDragging) {
                    centerControlsWrapper.classList.add('fade-out');
                    bottomControls.classList.add('fade-out');
                }
            }, 2000);
        }
    }

    const tapLeft = document.getElementById('auraems-tap-zone-left');
    const tapRight = document.getElementById('auraems-tap-zone-right');

    function triggerRipple(element) {
        element.classList.remove('animate-ripple');
        void element.offsetWidth; // trigger reflow
        element.classList.add('animate-ripple');
    }

    let tapTimer;
    let tapCount = 0;

    function handleTap(e, direction) {
        e.stopPropagation();
        tapCount++;
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
                togglePlay();
            }, 250);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            if (direction === 'left') {
                auraemsVideo.currentTime = Math.max(0, auraemsVideo.currentTime - 5);
                if (tapLeft) triggerRipple(tapLeft);
            } else {
                auraemsVideo.currentTime = Math.min(auraemsVideo.duration, auraemsVideo.currentTime + 5);
                if (tapRight) triggerRipple(tapRight);
            }
            resetFadeTimeout();
        }
    }

    if (tapLeft) tapLeft.addEventListener('click', (e) => handleTap(e, 'left'));
    if (tapRight) tapRight.addEventListener('click', (e) => handleTap(e, 'right'));

    if (bottomControls) {
        bottomControls.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // If click falls through directly to container (e.g. middle part), toggle play
    videoContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    videoContainer.addEventListener('mousemove', () => {
        resetFadeTimeout();
    });

    videoContainer.addEventListener('mouseleave', () => {
        if (!auraemsVideo.paused && !isDragging) {
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.add('fade-out');
            bottomControls.classList.add('fade-out');
        }
    });

    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            auraemsVideo.pause();
            auraemsVideo.currentTime = 0;
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            progressFill.style.width = '0%';
            if (progressThumb) progressThumb.style.left = '0%';
        });
    }

    function updateProgressFromEvent(e) {
        const rect = progressContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        auraemsVideo.currentTime = pos * auraemsVideo.duration;
    }

    progressContainer.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDragging = true;
        updateProgressFromEvent(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateProgressFromEvent(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resetFadeTimeout();
        }
    });

    auraemsVideo.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const percent = (auraemsVideo.currentTime / auraemsVideo.duration) * 100;
            progressFill.style.width = percent + '%';
            if (progressThumb) progressThumb.style.left = percent + '%';
        }
        timeCurrent.innerText = formatTime(auraemsVideo.currentTime);
    });

    auraemsVideo.addEventListener('loadedmetadata', () => {
        timeTotal.innerText = formatTime(auraemsVideo.duration);
    });

    function toggleFullscreen() {
        if (videoContainer.classList.contains('fullscreen-mode')) {
            videoContainer.classList.remove('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.remove('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
        } else {
            videoContainer.classList.add('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.add('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
        }
    }

    if (fullscreenToggleBtn) {
        fullscreenToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullscreen();
        });
    }

    if (fullscreenBackdrop) {
        fullscreenBackdrop.addEventListener('click', (e) => {
            e.stopPropagation();
            if (videoContainer.classList.contains('fullscreen-mode')) {
                toggleFullscreen();
            }
        });
    }
}

// AuraEMS 3D Flip Logic
const auraemsImages = [
    'assets/Employee_system/container/admin_dashboard.png',
    'assets/Employee_system/container/admin_leave.png',
    'assets/Employee_system/container/admin_login.png',
    'assets/Employee_system/container/admin_report.png',
    'assets/Employee_system/container/attendence_page.png',
    'assets/Employee_system/container/department_page.png',
    'assets/Employee_system/container/employee_attendence.png',
    'assets/Employee_system/container/employee_dashboard.png',
    'assets/Employee_system/container/employee_edit page.png',
    'assets/Employee_system/container/employee_leave page.png',
    'assets/Employee_system/container/employee_login.png',
    'assets/Employee_system/container/employee_page.png'
];

document.querySelectorAll('.auraems-flip-container').forEach((container, index) => {
    let flipTimeout;
    let isHovered = false;
    let currentImageSrc = container.querySelector('.auraems-flip-img').src;
    // Container 1 cycles every 3 seconds, Container 2 every 4 seconds, Container 3 every 5 seconds
    const interval = (index + 3) * 1000;

    function scheduleNextFlip() {
        clearTimeout(flipTimeout);
        flipTimeout = setTimeout(performFlip, interval);
    }

    container.addEventListener('mouseenter', () => {
        isHovered = true;
        clearTimeout(flipTimeout); // Pause cycle
    });

    container.addEventListener('mouseleave', () => {
        isHovered = false;
        scheduleNextFlip(); // Resume cycle
    });

    function performFlip() {
        if (isHovered) return;

        const inner = container.querySelector('.auraems-flip-inner');
        const img = container.querySelector('.auraems-flip-img');

        // Pick next random image that isn't the current one
        let nextImageSrc;
        do {
            nextImageSrc = auraemsImages[Math.floor(Math.random() * auraemsImages.length)];
        } while (currentImageSrc.endsWith(nextImageSrc));

        // Start flip animation (0 to 90deg)
        container.classList.add('flipping');
        inner.classList.remove('flip-full');
        inner.classList.add('flip-half');

        // Swap src midway through animation
        setTimeout(() => {
            img.src = nextImageSrc;
            currentImageSrc = nextImageSrc;

            // Complete flip animation (90 to 0deg)
            inner.classList.remove('flip-half');
            inner.classList.add('flip-full');

            setTimeout(() => {
                container.classList.remove('flipping');
                scheduleNextFlip();
            }, 300); // 300ms for second half of flip
        }, 300); // 300ms for first half of flip
    }

    scheduleNextFlip();
});

// AuraEMS Lightbox Logic
const auraemsLightbox = document.getElementById('auraems-lightbox');
const auraemsLightboxImg = document.getElementById('auraems-lightbox-img');
const auraemsCloseBtn = document.getElementById('auraems-lightbox-close');
const auraemsZoomInBtn = document.getElementById('auraems-lightbox-zoom-in');
const auraemsZoomOutBtn = document.getElementById('auraems-lightbox-zoom-out');
const auraemsPrevBtn = document.getElementById('auraems-lightbox-prev');
const auraemsNextBtn = document.getElementById('auraems-lightbox-next');
const auraemsCounter = document.getElementById('auraems-lightbox-counter');

let auraemsCurrentWidth = 920;
let auraemsCurrentHeight = 540;
let auraemsCurrentLightboxIndex = 0;
let auraemsIsAnimating = false;

const auraemsUpdateCounter = () => {
    if (auraemsCounter) {
        auraemsCounter.textContent = `${auraemsCurrentLightboxIndex + 1} / ${auraemsImages.length}`;
    }
};

const auraemsChangeLightboxImage = (direction) => {
    if (auraemsIsAnimating || !auraemsLightbox.classList.contains('active')) return;
    auraemsIsAnimating = true;

    if (direction === 'next') {
        auraemsCurrentLightboxIndex = (auraemsCurrentLightboxIndex + 1) % auraemsImages.length;
        auraemsLightboxImg.classList.add('auraems-slide-out-left');
    } else {
        auraemsCurrentLightboxIndex = (auraemsCurrentLightboxIndex - 1 + auraemsImages.length) % auraemsImages.length;
        auraemsLightboxImg.classList.add('auraems-slide-out-right');
    }

    setTimeout(() => {
        auraemsLightboxImg.src = auraemsImages[auraemsCurrentLightboxIndex];
        auraemsUpdateCounter();

        if (direction === 'next') {
            auraemsLightboxImg.classList.remove('auraems-slide-out-left');
            auraemsLightboxImg.classList.add('auraems-slide-in-right');
        } else {
            auraemsLightboxImg.classList.remove('auraems-slide-out-right');
            auraemsLightboxImg.classList.add('auraems-slide-in-left');
        }

        // Force reflow
        void auraemsLightboxImg.offsetWidth;

        auraemsLightboxImg.classList.remove('auraems-slide-in-right', 'auraems-slide-in-left');
        auraemsLightboxImg.classList.add('auraems-slide-active');

        setTimeout(() => {
            auraemsLightboxImg.classList.remove('auraems-slide-active');
            auraemsIsAnimating = false;
        }, 175);
    }, 175);
};

if (auraemsLightbox) {
    const auraemsCloseLightbox = () => {
        auraemsLightbox.classList.remove('active');
        document.removeEventListener('keydown', auraemsLightboxKeydownHandler);
    };

    const auraemsLightboxKeydownHandler = (e) => {
        if (e.key === 'ArrowLeft') auraemsChangeLightboxImage('prev');
        if (e.key === 'ArrowRight') auraemsChangeLightboxImage('next');
        if (e.key === 'Escape') auraemsCloseLightbox();
    };

    document.querySelectorAll('.auraems-hover-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Re-read the img dynamically at the exact moment of the click
            const img = overlay.previousElementSibling.querySelector('.auraems-flip-img');
            if (img) {
                // Find index using safe string matching
                const currentSrc = img.getAttribute('src') || img.src || '';
                const idx = auraemsImages.findIndex(src => currentSrc.includes(src) || src.includes(currentSrc));
                auraemsCurrentLightboxIndex = idx !== -1 ? idx : 0;
                
                auraemsLightboxImg.src = auraemsImages[auraemsCurrentLightboxIndex] || currentSrc;
                auraemsUpdateCounter();

                auraemsCurrentWidth = 920;
                auraemsCurrentHeight = 540;
                auraemsLightboxImg.style.width = `${auraemsCurrentWidth}px`;
                auraemsLightboxImg.style.height = `${auraemsCurrentHeight}px`;

                const rect = overlay.getBoundingClientRect();
                const containerCenterX = rect.left + rect.width / 2;
                const containerCenterY = rect.top + rect.height / 2;
                const content = auraemsLightbox.querySelector('.auraems-lightbox-content');
                
                const originX = containerCenterX - (window.innerWidth / 2) + (content.offsetWidth / 2 || 460);
                const originY = containerCenterY - (window.innerHeight / 2) + (content.offsetHeight / 2 || 270);
                
                content.style.transformOrigin = `${originX}px ${originY}px`;

                auraemsLightbox.classList.add('active');
                document.addEventListener('keydown', auraemsLightboxKeydownHandler);
            }
        });
    });

    auraemsLightbox.addEventListener('click', (e) => {
        if (e.target === auraemsLightbox) {
            auraemsCloseLightbox();
        }
    });

    auraemsCloseBtn.addEventListener('click', auraemsCloseLightbox);

    if (auraemsPrevBtn) auraemsPrevBtn.addEventListener('click', () => auraemsChangeLightboxImage('prev'));
    if (auraemsNextBtn) auraemsNextBtn.addEventListener('click', () => auraemsChangeLightboxImage('next'));

    auraemsZoomInBtn.addEventListener('click', () => {
        auraemsCurrentWidth += 20;
        auraemsCurrentHeight += 20;
        auraemsLightboxImg.style.width = `${auraemsCurrentWidth}px`;
        auraemsLightboxImg.style.height = `${auraemsCurrentHeight}px`;
    });

    auraemsZoomOutBtn.addEventListener('click', () => {
        auraemsCurrentWidth -= 20;
        auraemsCurrentHeight -= 20;
        auraemsLightboxImg.style.width = `${auraemsCurrentWidth}px`;
        auraemsLightboxImg.style.height = `${auraemsCurrentHeight}px`;
    });
}

// WanderVista 3D Flip Logic
const wandervistaImages = [
    'assets/Tourism_system/container/book_a_tour.png',
    'assets/Tourism_system/container/booking.png',
    'assets/Tourism_system/container/credit.png',
    'assets/Tourism_system/container/dashboard.png',
    'assets/Tourism_system/container/destination.png',
    'assets/Tourism_system/container/payment.png',
    'assets/Tourism_system/container/register_page.png'
];

document.querySelectorAll('.wandervista-flip-container').forEach(container => {
    let flipTimeout;
    let isHovered = false;
    let currentImageSrc = container.querySelector('.wandervista-flip-img').src;
    const containerId = container.getAttribute('data-container');
    const intervalTime = containerId === '1' ? 3000 : (containerId === '2' ? 4000 : 5000);

    function scheduleNextFlip() {
        clearTimeout(flipTimeout);
        flipTimeout = setTimeout(performFlip, intervalTime);
    }

    container.addEventListener('mouseenter', () => {
        isHovered = true;
        clearTimeout(flipTimeout);
    });

    container.addEventListener('mouseleave', () => {
        isHovered = false;
        scheduleNextFlip();
    });

    function performFlip() {
        if (isHovered) return;

        const inner = container.querySelector('.wandervista-flip-inner');
        const img = container.querySelector('.wandervista-flip-img');

        let nextImageSrc;
        do {
            nextImageSrc = wandervistaImages[Math.floor(Math.random() * wandervistaImages.length)];
        } while (currentImageSrc.endsWith(nextImageSrc));

        inner.classList.remove('flip-full');
        inner.classList.add('flip-half');

        setTimeout(() => {
            img.src = nextImageSrc;
            currentImageSrc = nextImageSrc;

            inner.classList.remove('flip-half');
            inner.classList.add('flip-full');

            setTimeout(() => {
                scheduleNextFlip();
            }, 300);
        }, 300);
    }

    scheduleNextFlip();
});

// WanderVista Lightbox Logic
const wvLightbox = document.getElementById('wandervista-lightbox');
if (wvLightbox) {
    const wvLightboxImg = document.getElementById('wandervista-lightbox-img');
    const wvCloseBtn = document.getElementById('wandervista-lightbox-close');
    const wvZoomInBtn = document.getElementById('wandervista-lightbox-zoom-in');
    const wvZoomOutBtn = document.getElementById('wandervista-lightbox-zoom-out');
    const wvPrevBtn = document.getElementById('wandervista-lightbox-prev');
    const wvNextBtn = document.getElementById('wandervista-lightbox-next');
    const wvCounter = document.getElementById('wandervista-lightbox-counter');

    let wvCurrentWidth = 920;
    let wvCurrentHeight = 540;
    let wvCurrentIndex = 0;
    let wvIsAnimating = false;

    const updateWvCounter = () => {
        if (wvCounter) {
            wvCounter.textContent = `${wvCurrentIndex + 1} / ${wandervistaImages.length}`;
        }
    };

    const changeWvImage = (direction) => {
        if (wvIsAnimating || !wvLightbox.classList.contains('active')) return;
        wvIsAnimating = true;

        if (direction === 'next') {
            wvCurrentIndex = (wvCurrentIndex + 1) % wandervistaImages.length;
            wvLightboxImg.classList.add('wandervista-slide-out-left');
            
            setTimeout(() => {
                wvLightboxImg.src = wandervistaImages[wvCurrentIndex];
                wvLightboxImg.classList.remove('wandervista-slide-out-left');
                wvLightboxImg.classList.add('wandervista-slide-in-right');
                updateWvCounter();
                setTimeout(() => {
                    wvLightboxImg.classList.remove('wandervista-slide-in-right');
                    wvIsAnimating = false;
                }, 300);
            }, 300);
        } else {
            wvCurrentIndex = (wvCurrentIndex - 1 + wandervistaImages.length) % wandervistaImages.length;
            wvLightboxImg.classList.add('wandervista-slide-out-right');
            
            setTimeout(() => {
                wvLightboxImg.src = wandervistaImages[wvCurrentIndex];
                wvLightboxImg.classList.remove('wandervista-slide-out-right');
                wvLightboxImg.classList.add('wandervista-slide-in-left');
                updateWvCounter();
                setTimeout(() => {
                    wvLightboxImg.classList.remove('wandervista-slide-in-left');
                    wvIsAnimating = false;
                }, 300);
            }, 300);
        }
    };

    const closeWvLightbox = () => {
        if (wvIsAnimating) return;
        wvLightbox.classList.remove('active');
        document.removeEventListener('keydown', wvKeydownHandler);
    };

    const wvKeydownHandler = (e) => {
        if (e.key === 'ArrowLeft') changeWvImage('prev');
        if (e.key === 'ArrowRight') changeWvImage('next');
        if (e.key === 'Escape') closeWvLightbox();
    };

    document.querySelectorAll('.wandervista-hover-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const img = overlay.previousElementSibling.querySelector('.wandervista-flip-img');
            if (img) {
                const currentSrc = img.getAttribute('src') || img.src || '';
                const idx = wandervistaImages.findIndex(src => currentSrc.includes(src) || src.includes(currentSrc));
                wvCurrentIndex = idx !== -1 ? idx : 0;
                
                wvLightboxImg.src = wandervistaImages[wvCurrentIndex] || currentSrc;
                updateWvCounter();

                wvCurrentWidth = 920;
                wvCurrentHeight = 540;
                wvLightboxImg.style.width = `${wvCurrentWidth}px`;
                wvLightboxImg.style.height = `${wvCurrentHeight}px`;

                wvLightbox.classList.add('active');
                document.addEventListener('keydown', wvKeydownHandler);
            }
        });
    });

    wvLightbox.addEventListener('click', (e) => {
        if (e.target === wvLightbox) {
            closeWvLightbox();
        }
    });

    wvCloseBtn.addEventListener('click', closeWvLightbox);
    if (wvPrevBtn) wvPrevBtn.addEventListener('click', () => changeWvImage('prev'));
    if (wvNextBtn) wvNextBtn.addEventListener('click', () => changeWvImage('next'));

    wvZoomInBtn.addEventListener('click', () => {
        wvCurrentWidth += 20;
        wvCurrentHeight += 20;
        wvLightboxImg.style.width = `${wvCurrentWidth}px`;
        wvLightboxImg.style.height = `${wvCurrentHeight}px`;
    });

    wvZoomOutBtn.addEventListener('click', () => {
        wvCurrentWidth -= 20;
        wvCurrentHeight -= 20;
        wvLightboxImg.style.width = `${wvCurrentWidth}px`;
        wvLightboxImg.style.height = `${wvCurrentHeight}px`;
    });
}

// Custom Video Controls Logic for WanderVista
const wandervistaVideo = document.getElementById('wandervista-video');
if (wandervistaVideo) {
    const videoContainer = document.getElementById('wandervista-video-container');
    const fullscreenToggleBtn = document.getElementById('wandervista-fullscreen-toggle-btn');
    const fullscreenBackdrop = document.getElementById('wandervista-fullscreen-backdrop');
    const centerControlsWrapper = document.getElementById('wandervista-center-controls-wrapper');
    const centerPlayOverlay = document.getElementById('wandervista-center-play-overlay');
    const bottomControls = document.getElementById('wandervista-bottom-controls-overlay');
    const stopBtn = document.getElementById('wandervista-stop-btn');
    const progressContainer = document.getElementById('wandervista-progress-container');
    const progressFill = document.getElementById('wandervista-progress-fill');
    const progressThumb = document.getElementById('wandervista-progress-thumb');
    const timeCurrent = document.getElementById('wandervista-time-current');
    const timeTotal = document.getElementById('wandervista-time-total');
    let fadeTimeout;
    let isDragging = false;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function togglePlay() {
        if (wandervistaVideo.paused) {
            wandervistaVideo.play();
            centerPlayOverlay.innerHTML = '<i class="fas fa-pause"></i>';
            videoContainer.classList.add('playing');
            resetFadeTimeout();
        } else {
            wandervistaVideo.pause();
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
        }
    }

    function resetFadeTimeout() {
        if (!wandervistaVideo.paused) {
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
            clearTimeout(fadeTimeout);
            fadeTimeout = setTimeout(() => {
                if (!videoContainer.matches(':hover') && !isDragging) {
                    centerControlsWrapper.classList.add('fade-out');
                    bottomControls.classList.add('fade-out');
                }
            }, 2000);
        }
    }

    const tapLeft = document.getElementById('wandervista-tap-zone-left');
    const tapRight = document.getElementById('wandervista-tap-zone-right');

    function triggerRipple(element) {
        element.classList.remove('animate-ripple');
        void element.offsetWidth; // trigger reflow
        element.classList.add('animate-ripple');
    }

    let tapTimer;
    let tapCount = 0;

    function handleTap(e, direction) {
        e.stopPropagation();
        tapCount++;
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
                togglePlay();
            }, 250);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            if (direction === 'left') {
                wandervistaVideo.currentTime = Math.max(0, wandervistaVideo.currentTime - 5);
                if (tapLeft) triggerRipple(tapLeft);
            } else {
                wandervistaVideo.currentTime = Math.min(wandervistaVideo.duration, wandervistaVideo.currentTime + 5);
                if (tapRight) triggerRipple(tapRight);
            }
            resetFadeTimeout();
        }
    }

    if (tapLeft) tapLeft.addEventListener('click', (e) => handleTap(e, 'left'));
    if (tapRight) tapRight.addEventListener('click', (e) => handleTap(e, 'right'));

    if (bottomControls) {
        bottomControls.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    videoContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    videoContainer.addEventListener('mousemove', () => {
        resetFadeTimeout();
    });

    videoContainer.addEventListener('mouseleave', () => {
        if (!wandervistaVideo.paused && !isDragging) {
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.add('fade-out');
            bottomControls.classList.add('fade-out');
        }
    });

    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wandervistaVideo.pause();
            wandervistaVideo.currentTime = 0;
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            progressFill.style.width = '0%';
            if (progressThumb) progressThumb.style.left = '0%';
        });
    }

    function updateProgressFromEvent(e) {
        const rect = progressContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        wandervistaVideo.currentTime = pos * wandervistaVideo.duration;
    }

    progressContainer.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDragging = true;
        updateProgressFromEvent(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateProgressFromEvent(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resetFadeTimeout();
        }
    });

    wandervistaVideo.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const percent = (wandervistaVideo.currentTime / wandervistaVideo.duration) * 100;
            progressFill.style.width = percent + '%';
            if (progressThumb) progressThumb.style.left = percent + '%';
        }
        timeCurrent.innerText = formatTime(wandervistaVideo.currentTime);
    });

    wandervistaVideo.addEventListener('loadedmetadata', () => {
        timeTotal.innerText = formatTime(wandervistaVideo.duration);
    });

    function toggleFullscreen() {
        if (videoContainer.classList.contains('fullscreen-mode')) {
            videoContainer.classList.remove('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.remove('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
        } else {
            videoContainer.classList.add('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.add('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
        }
    }

    if (fullscreenToggleBtn) {
        fullscreenToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullscreen();
        });
    }

    if (fullscreenBackdrop) {
        fullscreenBackdrop.addEventListener('click', (e) => {
            e.stopPropagation();
            if (videoContainer.classList.contains('fullscreen-mode')) {
                toggleFullscreen();
            }
        });
    }
}

// ==========================================
// MediMind AI Custom Logic
// ==========================================
const medimindImages = [
    'assets/MediMind/container/chat1.png',
    'assets/MediMind/container/dashboard1.png',
    'assets/MediMind/container/dashboard2.png',
    'assets/MediMind/container/home_page.png',
    'assets/MediMind/container/home2.png',
    'assets/MediMind/container/image_chat.png',
    'assets/MediMind/container/login_page.png',
    'assets/MediMind/container/register_page.png'
];

document.querySelectorAll('.medimind-flip-container').forEach(container => {
    let flipTimeout;
    let isHovered = false;
    let currentImageSrc = container.querySelector('.medimind-flip-img').src;
    const containerId = container.getAttribute('data-container');
    let cycleInterval = 4000;
    if (containerId === '1') cycleInterval = 3000;
    else if (containerId === '2') cycleInterval = 4000;
    else if (containerId === '3') cycleInterval = 5000;

    function scheduleNextFlip() {
        clearTimeout(flipTimeout);
        flipTimeout = setTimeout(performFlip, cycleInterval);
    }

    container.addEventListener('mouseenter', () => {
        isHovered = true;
        clearTimeout(flipTimeout);
    });

    container.addEventListener('mouseleave', () => {
        isHovered = false;
        scheduleNextFlip();
    });

    function performFlip() {
        if (isHovered) return;

        const inner = container.querySelector('.medimind-flip-inner');
        const img = container.querySelector('.medimind-flip-img');

        let nextImageSrc;
        do {
            nextImageSrc = medimindImages[Math.floor(Math.random() * medimindImages.length)];
        } while (currentImageSrc.endsWith(nextImageSrc));

        container.classList.add('flipping');
        inner.classList.remove('flip-full');
        inner.classList.add('flip-half');

        setTimeout(() => {
            img.src = nextImageSrc;
            currentImageSrc = nextImageSrc;

            inner.classList.remove('flip-half');
            inner.classList.add('flip-full');

            setTimeout(() => {
                container.classList.remove('flipping');
                scheduleNextFlip();
            }, 300);
        }, 300);
    }

    scheduleNextFlip();
});

// MediMind Lightbox Logic
const mmLightbox = document.getElementById('medimind-lightbox');
if (mmLightbox) {
    const mmLightboxImg = document.getElementById('medimind-lightbox-img');
    const mmCloseBtn = document.getElementById('medimind-lightbox-close');
    const mmZoomInBtn = document.getElementById('medimind-lightbox-zoom-in');
    const mmZoomOutBtn = document.getElementById('medimind-lightbox-zoom-out');
    const mmPrevBtn = document.getElementById('medimind-lightbox-prev');
    const mmNextBtn = document.getElementById('medimind-lightbox-next');
    const mmCounter = document.getElementById('medimind-lightbox-counter');

    let mmCurrentWidth = 920;
    let mmCurrentHeight = 540;
    let mmCurrentIndex = 0;
    let mmIsAnimating = false;

    const updateMmCounter = () => {
        if (mmCounter) {
            mmCounter.textContent = `${mmCurrentIndex + 1} / ${medimindImages.length}`;
        }
    };

    const changeMmImage = (direction) => {
        if (mmIsAnimating || !mmLightbox.classList.contains('active')) return;
        mmIsAnimating = true;

        if (direction === 'next') {
            mmCurrentIndex = (mmCurrentIndex + 1) % medimindImages.length;
            mmLightboxImg.classList.add('medimind-slide-out-left');
            
            setTimeout(() => {
                mmLightboxImg.src = medimindImages[mmCurrentIndex];
                mmLightboxImg.classList.remove('medimind-slide-out-left');
                mmLightboxImg.classList.add('medimind-slide-in-right');
                updateMmCounter();
                setTimeout(() => {
                    mmLightboxImg.classList.remove('medimind-slide-in-right');
                    mmIsAnimating = false;
                }, 300);
            }, 300);
        } else {
            mmCurrentIndex = (mmCurrentIndex - 1 + medimindImages.length) % medimindImages.length;
            mmLightboxImg.classList.add('medimind-slide-out-right');
            
            setTimeout(() => {
                mmLightboxImg.src = medimindImages[mmCurrentIndex];
                mmLightboxImg.classList.remove('medimind-slide-out-right');
                mmLightboxImg.classList.add('medimind-slide-in-left');
                updateMmCounter();
                setTimeout(() => {
                    mmLightboxImg.classList.remove('medimind-slide-in-left');
                    mmIsAnimating = false;
                }, 300);
            }, 300);
        }
    };

    const closeMmLightbox = () => {
        if (mmIsAnimating) return;
        mmLightbox.classList.remove('active');
        document.removeEventListener('keydown', mmKeydownHandler);
    };

    const mmKeydownHandler = (e) => {
        if (e.key === 'ArrowLeft') changeMmImage('prev');
        if (e.key === 'ArrowRight') changeMmImage('next');
        if (e.key === 'Escape') closeMmLightbox();
    };

    document.querySelectorAll('.medimind-hover-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const img = overlay.previousElementSibling.querySelector('.medimind-flip-img');
            if (img) {
                const currentSrc = img.getAttribute('src') || img.src || '';
                const idx = medimindImages.findIndex(src => currentSrc.includes(src) || src.includes(currentSrc));
                mmCurrentIndex = idx !== -1 ? idx : 0;
                
                mmLightboxImg.src = medimindImages[mmCurrentIndex] || currentSrc;
                updateMmCounter();

                mmCurrentWidth = 920;
                mmCurrentHeight = 540;
                mmLightboxImg.style.width = `${mmCurrentWidth}px`;
                mmLightboxImg.style.height = `${mmCurrentHeight}px`;

                mmLightbox.classList.add('active');
                document.addEventListener('keydown', mmKeydownHandler);
            }
        });
    });

    mmLightbox.addEventListener('click', (e) => {
        if (e.target === mmLightbox) {
            closeMmLightbox();
        }
    });

    if (mmCloseBtn) mmCloseBtn.addEventListener('click', closeMmLightbox);
    if (mmPrevBtn) mmPrevBtn.addEventListener('click', () => changeMmImage('prev'));
    if (mmNextBtn) mmNextBtn.addEventListener('click', () => changeMmImage('next'));

    if (mmZoomInBtn) mmZoomInBtn.addEventListener('click', () => {
        mmCurrentWidth += 20;
        mmCurrentHeight += 20;
        mmLightboxImg.style.width = `${mmCurrentWidth}px`;
        mmLightboxImg.style.height = `${mmCurrentHeight}px`;
    });

    if (mmZoomOutBtn) mmZoomOutBtn.addEventListener('click', () => {
        mmCurrentWidth -= 20;
        mmCurrentHeight -= 20;
        mmLightboxImg.style.width = `${mmCurrentWidth}px`;
        mmLightboxImg.style.height = `${mmCurrentHeight}px`;
    });
}

// Custom Video Controls Logic for MediMind
const medimindVideo = document.getElementById('medimind-video');
if (medimindVideo) {
    const videoContainer = document.getElementById('medimind-video-container');
    const fullscreenToggleBtn = document.getElementById('medimind-fullscreen-toggle-btn');
    const fullscreenBackdrop = document.getElementById('medimind-fullscreen-backdrop');
    const centerControlsWrapper = document.getElementById('medimind-center-controls-wrapper');
    const centerPlayOverlay = document.getElementById('medimind-center-play-overlay');
    const bottomControls = document.getElementById('medimind-bottom-controls-overlay');
    const stopBtn = document.getElementById('medimind-stop-btn');
    const progressContainer = document.getElementById('medimind-progress-container');
    const progressFill = document.getElementById('medimind-progress-fill');
    const progressThumb = document.getElementById('medimind-progress-thumb');
    const timeCurrent = document.getElementById('medimind-time-current');
    const timeTotal = document.getElementById('medimind-time-total');
    let fadeTimeout;
    let isDragging = false;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function togglePlay() {
        if (medimindVideo.paused) {
            medimindVideo.play();
            centerPlayOverlay.innerHTML = '<i class="fas fa-pause"></i>';
            videoContainer.classList.add('playing');
            resetFadeTimeout();
        } else {
            medimindVideo.pause();
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
        }
    }

    function resetFadeTimeout() {
        if (!medimindVideo.paused) {
            centerControlsWrapper.classList.remove('fade-out');
            bottomControls.classList.remove('fade-out');
            clearTimeout(fadeTimeout);
            fadeTimeout = setTimeout(() => {
                if (!videoContainer.matches(':hover') && !isDragging) {
                    centerControlsWrapper.classList.add('fade-out');
                    bottomControls.classList.add('fade-out');
                }
            }, 2000);
        }
    }

    const tapLeft = document.getElementById('medimind-tap-zone-left');
    const tapRight = document.getElementById('medimind-tap-zone-right');

    function triggerRipple(element) {
        element.classList.remove('animate-ripple');
        void element.offsetWidth; // trigger reflow
        element.classList.add('animate-ripple');
    }

    let tapTimer;
    let tapCount = 0;

    function handleTap(e, direction) {
        e.stopPropagation();
        tapCount++;
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
                togglePlay();
            }, 250);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            if (direction === 'left') {
                medimindVideo.currentTime = Math.max(0, medimindVideo.currentTime - 5);
                if (tapLeft) triggerRipple(tapLeft);
            } else {
                medimindVideo.currentTime = Math.min(medimindVideo.duration, medimindVideo.currentTime + 5);
                if (tapRight) triggerRipple(tapRight);
            }
            resetFadeTimeout();
        }
    }

    if (tapLeft) tapLeft.addEventListener('click', (e) => handleTap(e, 'left'));
    if (tapRight) tapRight.addEventListener('click', (e) => handleTap(e, 'right'));

    if (bottomControls) {
        bottomControls.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    videoContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    videoContainer.addEventListener('mousemove', () => {
        resetFadeTimeout();
    });

    videoContainer.addEventListener('mouseleave', () => {
        if (!medimindVideo.paused && !isDragging) {
            clearTimeout(fadeTimeout);
            centerControlsWrapper.classList.add('fade-out');
            bottomControls.classList.add('fade-out');
        }
    });

    if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            medimindVideo.pause();
            medimindVideo.currentTime = 0;
            centerPlayOverlay.innerHTML = '<i class="fas fa-play"></i>';
            videoContainer.classList.remove('playing');
            progressFill.style.width = '0%';
            if (progressThumb) progressThumb.style.left = '0%';
        });
    }

    function updateProgressFromEvent(e) {
        const rect = progressContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        medimindVideo.currentTime = pos * medimindVideo.duration;
    }

    if (progressContainer) {
        progressContainer.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isDragging = true;
            updateProgressFromEvent(e);
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // Need to make sure it's updating this specific video's progress when dragging
            updateProgressFromEvent(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resetFadeTimeout();
        }
    });

    medimindVideo.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const percent = (medimindVideo.currentTime / medimindVideo.duration) * 100;
            progressFill.style.width = percent + '%';
            if (progressThumb) progressThumb.style.left = percent + '%';
        }
        timeCurrent.innerText = formatTime(medimindVideo.currentTime);
    });

    medimindVideo.addEventListener('loadedmetadata', () => {
        timeTotal.innerText = formatTime(medimindVideo.duration);
    });

    function toggleFullscreen() {
        if (videoContainer.classList.contains('fullscreen-mode')) {
            videoContainer.classList.remove('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.remove('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
        } else {
            videoContainer.classList.add('fullscreen-mode');
            if (fullscreenBackdrop) fullscreenBackdrop.classList.add('active');
            if (fullscreenToggleBtn) fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
        }
    }

    if (fullscreenToggleBtn) {
        fullscreenToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullscreen();
        });
    }

    if (fullscreenBackdrop) {
        fullscreenBackdrop.addEventListener('click', (e) => {
            e.stopPropagation();
            if (videoContainer.classList.contains('fullscreen-mode')) {
                toggleFullscreen();
            }
        });
    }
}

