// ==========================================
// EMAILJS SETUP INSTRUCTIONS:
// 1. Go to https://www.emailjs.com and create a free account
// 2. Add a new Email Service (Gmail) and note the Service ID
// 3. Create an Email Template with variables: from_name, from_email, message
// 4. Copy your Public Key from Account > API Keys
// 5. Replace YOUR_PUBLIC_KEY, YOUR_SERVICE_ID, YOUR_TEMPLATE_ID below
// ==========================================

// Replace YOUR_PUBLIC_KEY with key from emailjs.com dashboard
if (typeof emailjs !== 'undefined') {
    emailjs.init('vN2IONhtk5559cwUa');
}

// Service ID and Template ID that need to be configured on emailjs.com
const EMAILJS_SERVICE_ID = 'service_w9bjo4p';
const EMAILJS_TEMPLATE_ID = 'template_zmc7uqe';

// ==========================================
// 8. CONTACT FORM & FOOTER INTERACTIONS
// ==========================================

// Copy to Clipboard
window.copyToClipboard = function (text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const tooltip = btnElement.querySelector('.copy-tooltip');
        tooltip.classList.add('show');

        // Reset icon
        const icon = btnElement.querySelector('i');
        icon.className = 'fas fa-check';
        icon.style.color = 'var(--neon-green)';

        setTimeout(() => {
            tooltip.classList.remove('show');
            icon.className = 'fas fa-copy';
            icon.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

// Character Counter
window.updateCharCount = function (textarea) {
    const maxLength = 500;
    let currentLength = textarea.value.length;

    if (currentLength > maxLength) {
        textarea.value = textarea.value.substring(0, maxLength);
        currentLength = maxLength;
    }

    document.getElementById('char-count').innerText = currentLength;
};

// Form Submission Success State & Toast
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const sendBtn = document.getElementById('send-btn');
        const btnText = sendBtn.querySelector('.btn-text');
        const btnIcon = sendBtn.querySelector('.btn-icon');
        const toast = document.getElementById('toast-notification');
        
        const inputs = contactForm.querySelectorAll('input, textarea');
        let isValid = true;

        // Validation
        inputs.forEach(input => {
            input.classList.remove('shake-error');
            if (!input.value.trim()) {
                isValid = false;
                // Trigger reflow to restart animation
                void input.offsetWidth;
                input.classList.add('shake-error');
            }
        });

        if (!isValid) return;

        const nameInput = contactForm.querySelector('input[type="text"]').value;
        const emailInput = contactForm.querySelector('input[type="email"]').value;
        const messageInput = document.getElementById('contact-message').value;

        // While sending
        btnText.innerText = 'SENDING...';
        btnIcon.className = 'fas fa-circle-notch fa-spin btn-icon';
        sendBtn.style.opacity = '0.7';
        sendBtn.style.pointerEvents = 'none';

        const templateParams = {
            from_name: nameInput,
            from_email: emailInput,
            message: messageInput,
            to_email: 'amohammedali2005@gmail.com',
            time: new Date().toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short'
            })
        };

        if (typeof emailjs !== 'undefined') {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function() {
                    // On success
                    sendBtn.style.opacity = '1';
                    sendBtn.classList.remove('error-state');
                    sendBtn.classList.add('success-state');
                    btnText.innerText = '✓ MESSAGE SENT!';
                    btnIcon.style.display = 'none';
                    
                    toast.classList.remove('error-toast');
                    toast.innerHTML = '<i class="fas fa-check-circle"></i> Message delivered successfully!';
                    toast.classList.add('show');

                    setTimeout(() => {
                        sendBtn.classList.remove('success-state');
                        sendBtn.style.pointerEvents = 'auto';
                        btnText.innerText = 'Send Message';
                        btnIcon.style.display = 'inline-block';
                        btnIcon.className = 'fas fa-paper-plane btn-icon';
                        contactForm.reset();
                        document.getElementById('char-count').innerText = '0';
                    }, 3000);

                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 4000);

                }, function(error) {
                    // On failure
                    console.error('EmailJS Error:', error);
                    sendBtn.style.opacity = '1';
                    sendBtn.classList.remove('success-state');
                    sendBtn.classList.add('error-state');
                    btnText.innerText = '✗ FAILED — RETRY';
                    btnIcon.style.display = 'none';

                    toast.classList.add('error-toast');
                    toast.innerHTML = '<i class="fas fa-times-circle"></i> Failed to send. Please email directly: amohammedali2005@gmail.com';
                    toast.classList.add('show');

                    setTimeout(() => {
                        sendBtn.classList.remove('error-state');
                        sendBtn.style.pointerEvents = 'auto';
                        btnText.innerText = 'Send Message';
                        btnIcon.style.display = 'inline-block';
                        btnIcon.className = 'fas fa-paper-plane btn-icon';
                    }, 3000);

                    setTimeout(() => {
                        toast.classList.remove('show');
                        toast.classList.remove('error-toast');
                    }, 6000);
                });
        } else {
            // Fallback if EmailJS failed to load
            alert('Email service is currently unavailable. Please email directly at amohammedali2005@gmail.com');
            sendBtn.style.opacity = '1';
            sendBtn.style.pointerEvents = 'auto';
            btnText.innerText = 'Send Message';
            btnIcon.className = 'fas fa-paper-plane btn-icon';
        }
    });
}

// Dynamic Footer Year
const yearElement = document.getElementById('current-year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


