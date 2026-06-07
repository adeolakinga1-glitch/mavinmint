// Main site JavaScript extracted from index.html

window._wq = window._wq || [];

(function () {
    document.querySelectorAll('#samples .video-thumb').forEach(function (thumb) {
        var playerEl = thumb.querySelector('wistia-player');
        if (!playerEl) return;
        var mediaId = playerEl.getAttribute('media-id');
        var playBtn = thumb.querySelector('.play-btn');
        var overlay = thumb.querySelector('.vt-overlay');
        if (playBtn) playBtn.style.pointerEvents = 'auto';
        window._wq.push({
            id: mediaId,
            onReady: function (video) {
                try {
                    video.bind('play', function () {
                        if (overlay) overlay.style.display = 'none';
                    });
                    video.bind('pause', function () {
                        if (overlay) overlay.style.display = 'flex';
                    });
                    video.bind('end', function () {
                        if (overlay) overlay.style.display = 'flex';
                    });
                    if (playBtn) {
                        playBtn.addEventListener('click', function (e) {
                            e.preventDefault();
                            video.play();
                        });
                    }
                } catch (e) {
                    console.warn('Wistia bind error', e);
                }
            }
        });
    });
})();

(function () {
    function createIframe(src) {
        var iframe = document.createElement('iframe');
        var sep = src.indexOf('?') === -1 ? '?' : '&';
        var srcWith = src + sep + 'enablejsapi=1&autoplay=1';
        iframe.setAttribute('src', srcWith);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.position = 'absolute';
        iframe.style.inset = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        return iframe;
    }

    document.querySelectorAll('#student-work .yt-placeholder').forEach(function (p) {
        p.addEventListener('click', function () {
            var src = p.getAttribute('data-src');
            if (!src) return;
            var parent = p.parentElement;
            var iframe = createIframe(src);
            parent.appendChild(iframe);
            p.remove();
            if (window.initYTIframe) window.initYTIframe(iframe);
            if (window.YT && !window.initYTIframe && typeof window.onYouTubeIframeAPIReady === 'function') {
                try {
                    window.onYouTubeIframeAPIReady();
                } catch (e) { }
            }
        });
    });
})();

(function () {
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var sections = Array.from(document.querySelectorAll('.section'));
        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        sections.forEach(function (s) { io.observe(s); });

        var statEls = Array.from(document.querySelectorAll('.stat-num'));
        statEls.forEach(function (el) {
            var text = el.textContent.trim();
            var m = text.match(/^([\d,\.]+)\s*(.*)$/);
            var suffix = '';
            var suffixRaw = '';
            var num = 0;
            if (m) {
                num = parseFloat(m[1].replace(/,/g, '')) || 0;
                suffixRaw = (m[2] || '').trim();
                var abbr = (suffixRaw || '').match(/^([kKmM])$/);
                if (abbr) {
                    suffix = abbr[1].toUpperCase();
                    if (suffix === 'K') num *= 1000;
                    if (suffix === 'M') num *= 1000000;
                }
            } else {
                num = parseFloat(text.replace(/[^0-9\.]/g, '')) || 0;
            }
            el.dataset.target = num;
            el.dataset.suffix = suffix;
            el.dataset.suffixRaw = suffixRaw;
            el.textContent = '0';
        });

        var statsContainer = document.querySelector('#stats');
        if (statsContainer && statEls.length) {
            var statObserver = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        statEls.forEach(function (el) {
                            var target = +el.dataset.target || 0;
                            var suffix = el.dataset.suffix || '';
                            var duration = 1400;
                            var start = performance.now();
                            function step(now) {
                                var progress = Math.min((now - start) / duration, 1);
                                var val = Math.floor(target * easeOutCubic(progress));
                                el.textContent = val.toLocaleString();
                                if (progress < 1) requestAnimationFrame(step);
                                else {
                                    var raw = el.dataset.suffixRaw || '';
                                    if (suffix === 'M') el.textContent = (target / 1000000) + 'M' + raw.replace(/^([kKmM])/, '');
                                    else if (suffix === 'K') el.textContent = Math.round(target / 1000) + 'K' + raw.replace(/^([kKmM])/, '');
                                    else el.textContent = target.toLocaleString() + raw;
                                }
                            }
                            requestAnimationFrame(step);
                        });
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            statObserver.observe(statsContainer);
        }
    });
})();

(function () {
    function getHtmlVideos() { return Array.from(document.querySelectorAll('video')); }
    var ytPlayers = [];
    var wistiaPlayers = [];

    function pauseAllExcept(source) {
        getHtmlVideos().forEach(function (v) {
            try {
                if (v !== source && !v.paused) v.pause();
            } catch (e) { }
        });

        ytPlayers.forEach(function (p) {
            try {
                if (p && typeof p.getPlayerState === 'function' && p !== source) {
                    if (p.getPlayerState() === YT.PlayerState.PLAYING) p.pauseVideo();
                }
            } catch (e) { }
        });

        wistiaPlayers.forEach(function (w) {
            try {
                if (w !== source) w.pause();
            } catch (e) { }
        });
    }

    document.addEventListener('play', function (e) {
        if (e.target && e.target.tagName === 'VIDEO') pauseAllExcept(e.target);
    }, true);

    var ytIframes = Array.from(document.querySelectorAll('#student-work iframe[src*="youtube.com/embed"]'));
    if (ytIframes.length) {
        if (!window.YT) {
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }

        function initYTIframe(iframe) {
            try {
                var player = new YT.Player(iframe, {
                    events: {
                        'onStateChange': function (event) {
                            if (event.data === YT.PlayerState.PLAYING) pauseAllExcept(player);
                        }
                    }
                });
                ytPlayers.push(player);
                return player;
            } catch (e) {
                return null;
            }
        }

        window.initYTIframe = initYTIframe;
        window.pauseAllExcept = pauseAllExcept;
        window.registerWistiaPlayer = function (player) {
            try { wistiaPlayers.push(player); } catch (e) { }
        };

        window.onYouTubeIframeAPIReady = function () {
            var currentIframes = Array.from(document.querySelectorAll('#student-work iframe[src*="youtube.com/embed"]'));
            ytPlayers = currentIframes.map(function (iframe) {
                return initYTIframe(iframe);
            }).filter(Boolean);
        };
    }

    window._wq = window._wq || [];
    var wistiaEls = Array.from(document.querySelectorAll('wistia-player[media-id]'));
    wistiaEls.forEach(function (el) {
        var id = el.getAttribute('media-id');
        if (!id) return;
        window._wq.push({
            id: id,
            onReady: function (video) {
                wistiaPlayers.push(video);
                try {
                    video.bind('play', function () { pauseAllExcept(video); });
                } catch (e) { }
            }
        });
    });
})();

window.addEventListener('scroll', function () {
    document.getElementById('nav').style.background = window.scrollY > 50 ? 'rgba(4,14,24,.97)' : 'rgba(4,14,24,.82)';
});

var hamburger = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
        });
    });
}

function toggleFaq(btn) {
    var ans = btn.nextElementSibling;
    var open = ans.classList.contains('open');
    document.querySelectorAll('.faq-a.open').forEach(function (el) { el.classList.remove('open'); });
    document.querySelectorAll('.faq-q.open').forEach(function (el) { el.classList.remove('open'); });
    if (!open) {
        ans.classList.add('open');
        btn.classList.add('open');
    }
}

function toggleModule(btn) {
    var ol = btn.nextElementSibling;
    var hidden = ol.classList.contains('hidden');
    ol.classList.toggle('hidden');
    btn.classList.toggle('open');
    btn.childNodes[0].textContent = hidden ? 'Hide Outline ' : 'View Outline ';
}

(function () {
    var FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';
    var contactForm = document.getElementById('contactForm');
    var formMsg = document.getElementById('formMsg');
    var submitBtn = contactForm && contactForm.querySelector('.form-submit');

    if (!contactForm || !formMsg || !submitBtn) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        formMsg.textContent = '';
        var name = contactForm.name.value.trim();
        var email = contactForm.email.value.trim();
        var message = contactForm.message.value.trim();
        if (!name || !email || !message) {
            formMsg.style.color = 'var(--danger, #d9534f)';
            formMsg.textContent = 'Please fill in name, email and message.';
            return;
        }
        submitBtn.disabled = true;
        var orig = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
        try {
            var res = await fetch(FORMSPREE_URL, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                formMsg.style.color = 'var(--success, #28a745)';
                formMsg.textContent = 'Message sent — thanks! We will reply within 24 hours.';
                contactForm.reset();
            } else {
                var data = await res.json().catch(function () { return {}; });
                formMsg.style.color = 'var(--danger, #d9534f)';
                formMsg.textContent = data.error || 'Submission failed. Please try again later.';
            }
        } catch (err) {
            formMsg.style.color = 'var(--danger, #d9534f)';
            formMsg.textContent = 'Network error — check your connection.';
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = orig;
    });
})();

var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            obs.unobserve(e.target);
        }
    });
}, { threshold: .08 });

document.querySelectorAll('.card,.about-item,.stat-item,.info-card,.resource-row').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .55s ease,transform .55s ease';
    obs.observe(el);
});

document.querySelectorAll('#testimonial-videos video').forEach(function (video) {
    video.addEventListener('play', function () {
        document.querySelectorAll('#testimonial-videos video').forEach(function (other) {
            if (other !== video) other.pause();
        });
        video.closest('.video-thumb') && video.closest('.video-thumb').classList.add('playing');
    });
    video.addEventListener('pause', function () {
        video.closest('.video-thumb') && video.closest('.video-thumb').classList.remove('playing');
    });
    video.addEventListener('ended', function () {
        video.closest('.video-thumb') && video.closest('.video-thumb').classList.remove('playing');
    });
});

// Testimonials Slider
(function () {
    var slider = document.querySelector('.testimonials-grid');
    var prevBtn = document.getElementById('testi-prev');
    var nextBtn = document.getElementById('testi-next');
    var indicatorsContainer = document.getElementById('testi-indicators');
    
    if (!slider) return;
    
    var cards = slider.querySelectorAll('.testi-card');
    var currentIndex = 0;
    var cardWidth = cards[0]?.offsetWidth || 0;
    var gap = 20;
    
    // Create indicators
    cards.forEach(function (_, index) {
        var dot = document.createElement('div');
        dot.className = 'indicator-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', function () {
            goToSlide(index);
        });
        indicatorsContainer.appendChild(dot);
    });
    
    function updateSliderPosition() {
        var offset = currentIndex * (cardWidth + gap);
        slider.style.transform = 'translateX(-' + offset + 'px)';
        
        // Update buttons state
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === cards.length - 3;
        
        // Update indicators
        document.querySelectorAll('.indicator-dot').forEach(function (dot, index) {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, cards.length - 3));
        updateSliderPosition();
    }
    
    prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
    });
    
    // Handle window resize
    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            cardWidth = cards[0]?.offsetWidth || 0;
            updateSliderPosition();
        }, 150);
    });
    
    // Initialize
    updateSliderPosition();
})();


