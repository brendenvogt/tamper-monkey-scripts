// ==UserScript==
// @name         Instagram Reel Video Downloader
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Adds a floating download button to download Instagram reel video, thumbnail, and description on reel detail page
// @match        *://www.instagram.com/reel/*
// @match        *://www.instagram.com/p/*
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const BUTTON_ID = 'tm-reel-download-btn';

    function sanitizeFilename(name) {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 80);
    }

    function findVideoUrl() {
        const html = document.documentElement.innerHTML;
        const match = html.match(/"url":"([^"]+?\.mp4[^"]*)"/);
        return match ? decodeURIComponent(match[1].replace(/\\\//g, '/')) : null;
    }

    function findDescription() {
        const meta = document.querySelector('meta[property="og:title"]');
        const content = meta?.content || 'No description';

        // Extract the content inside double quotes
        const match = content.match(/"((.|\s)*?)"/);
        return match ? match[1] : 'No quoted title';
    }

    function createFloatingDownloadButton() {
        if (document.getElementById(BUTTON_ID)) return;

        const button = document.createElement('button');
        button.id = BUTTON_ID;
        button.innerText = '⬇ Download Reel';
        button.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 99999;
            background: #0095f6;
            color: white;
            padding: 10px 12px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        `;

        button.onclick = () => {
            const videoUrl = findVideoUrl();
            const description = findDescription();
            const today = new Date().toISOString().split('T')[0];
            const baseName = sanitizeFilename(description.split(' ').slice(0, 6).join('_')) || 'reel';
            const prefix = `${today}_`;


            const blob = new Blob([description], { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);

            if (videoUrl) {
                GM_download({
                    url: videoUrl,
                    name: `${prefix}${baseName}.mp4`
                });
            } else {
                alert("⚠️ Couldn't find video URL. Make sure the reel is fully loaded.");
            }
        };

        document.body.appendChild(button);
    }

    // Wait for the page to be ready, then inject the button
    const interval = setInterval(() => {
        if (document.readyState === 'complete') {
            clearInterval(interval);
            createFloatingDownloadButton();
        }
    }, 300);
})();
