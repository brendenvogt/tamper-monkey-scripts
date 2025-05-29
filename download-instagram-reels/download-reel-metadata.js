// ==UserScript==
// @name         Instagram Reel Metadata Downloader
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Adds a download button to each reel for thumbnail and description
// @match        *://*.instagram.com/*/
// @exclude      *://*.instagram.com/reel/*
// @exclude      *://*.instagram.com/p/*
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const BUTTON_CLASS = 'tm-download-btn';

    function sanitizeFilename(name) {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 80);
    }

    function createDownloadButton(post) {
        if (post.querySelector(`.${BUTTON_CLASS}`)) return;

        const button = document.createElement('button');
        button.innerText = '⬇ Download';
        button.className = BUTTON_CLASS;
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 9999;
            background: #007aff;
            color: white;
            border: none;
            padding: 6px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;

        button.onclick = (e) => {
            e.stopPropagation();
            const img = post.querySelector('img');
            if (!img) return;

            const imgUrl = img.src;
            const description = img.alt || 'No description';
            const today = new Date().toISOString().split('T')[0];
            const baseName = sanitizeFilename(description.split(" ").slice(0, 6).join("_") || 'reel');

            // Download image
            GM_download({
                url: imgUrl,
                name: `${today}_${baseName}.jpg`
            });

            // Download description
            const blob = new Blob([description], { type: "text/plain" });
            const blobUrl = URL.createObjectURL(blob);
            GM_download({
                url: blobUrl,
                name: `${today}_${baseName}.txt`
            });
        };

        post.style.position = 'relative'; // ensure position for button
        post.appendChild(button);
    }

    function addButtonsToReels() {
        const reelLinks = document.querySelectorAll('a[href*="/reel/"]');
        reelLinks.forEach(link => {
            const post = link.closest('div');
            if (post) createDownloadButton(post);
        });
    }

    // Initial run
    addButtonsToReels();

    // Observe DOM for dynamically loaded reels
    const observer = new MutationObserver(() => {
        addButtonsToReels();
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
