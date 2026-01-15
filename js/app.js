/**
 * Capital Quiz Landing Page - Platform Detection & Routing
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        appScheme: 'capitalquiz://',
        iosAppId: '', // TODO: Update when published
        androidPackage: 'com.volodymyrs.capitalquiz.capitalquiz',
        iosStoreUrl: '', // TODO: Update when published
        androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.volodymyrs.capitalquiz.capitalquiz',
        websiteUrl: 'https://capitalquiz.vshyrochuk.com'
    };

    // Platform Detection
    const Platform = {
        isIOS: function() {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent);
        },
        isAndroid: function() {
            return /Android/i.test(navigator.userAgent);
        },
        isMobile: function() {
            return this.isIOS() || this.isAndroid();
        },
        isDesktop: function() {
            return !this.isMobile();
        },
        isMacOS: function() {
            return /Macintosh|MacIntel|MacPPC|Mac68K/i.test(navigator.userAgent);
        }
    };

    // Get the deep link path from current URL
    function getDeepLinkPath() {
        const path = window.location.pathname;
        const search = window.location.search;
        // Remove leading slash
        const cleanPath = path.replace(/^\//, '');
        return cleanPath + search;
    }

    // Build app deep link URL
    function buildAppUrl() {
        const path = getDeepLinkPath();
        return CONFIG.appScheme + path;
    }

    // Build Android intent URL
    function buildAndroidIntentUrl() {
        const path = getDeepLinkPath();
        return `intent://${path}#Intent;scheme=capitalquiz;package=${CONFIG.androidPackage};S.browser_fallback_url=${encodeURIComponent(CONFIG.androidStoreUrl)};end`;
    }

    // Try to open the app
    function openApp() {
        const startTime = Date.now();

        if (Platform.isIOS()) {
            // On iOS, try custom URL scheme
            // Universal Links should handle automatically if app is installed
            window.location.href = buildAppUrl();

            // Fallback to App Store after timeout
            setTimeout(function() {
                if (Date.now() - startTime < 2000) {
                    if (CONFIG.iosStoreUrl) {
                        window.location.href = CONFIG.iosStoreUrl;
                    }
                }
            }, 1500);
        } else if (Platform.isAndroid()) {
            // On Android, use intent URL with fallback
            window.location.href = buildAndroidIntentUrl();
        }
    }

    // Generate QR Code
    function generateQRCode() {
        const qrContainer = document.getElementById('qr-code');
        if (!qrContainer) return;

        // Use QRCode.js library or a simple API
        const currentUrl = window.location.href;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;

        const img = document.createElement('img');
        img.src = qrApiUrl;
        img.alt = 'QR Code to download Capital Quiz';
        img.style.width = '150px';
        img.style.height = '150px';
        qrContainer.appendChild(img);
    }

    // Initialize page based on platform
    function init() {
        const iosBadge = document.getElementById('ios-badge');
        const androidBadge = document.getElementById('android-badge');
        const openAppContainer = document.getElementById('open-app-container');
        const openAppBtn = document.getElementById('open-app-btn');
        const qrContainer = document.getElementById('qr-container');

        if (Platform.isMobile()) {
            // Mobile: Show open app button, appropriate store badge
            if (openAppContainer) {
                openAppContainer.style.display = 'block';
            }

            if (openAppBtn) {
                openAppBtn.addEventListener('click', openApp);
            }

            // Show only relevant store badge on mobile
            if (Platform.isIOS()) {
                if (androidBadge) androidBadge.style.display = 'none';
            } else if (Platform.isAndroid()) {
                if (iosBadge) iosBadge.style.display = 'none';
            }
        } else {
            // Desktop: Show QR code, both store badges
            if (qrContainer) {
                qrContainer.style.display = 'block';
                generateQRCode();
            }

            // On macOS, show iOS badge first (Mac App Store)
            if (Platform.isMacOS() && iosBadge && androidBadge) {
                // Reorder: iOS first for macOS users
                const parent = iosBadge.parentElement;
                if (parent) {
                    parent.insertBefore(iosBadge, androidBadge);
                }
            }
        }

        // Check if we should auto-attempt to open app
        // (useful for deep links shared on social media)
        const shouldAutoOpen = getDeepLinkPath() && Platform.isMobile();
        if (shouldAutoOpen && window.location.search.includes('open=1')) {
            // Only auto-open if explicitly requested via ?open=1
            setTimeout(openApp, 500);
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
