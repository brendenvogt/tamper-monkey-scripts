// ==UserScript==
// @name         Doom Scroller 9000
// @namespace    http://tampermonkey.net/
// @version      2025-05-21
// @description  Auto-scroll to next visible Instagram post with a polished UI and dynamic behavior handling for infinite scrolling feeds.
// @author       Brenden Vogt @brendenvogt
// @match        https://www.instagram.com/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let scrollInterval = null;
    let isScrolling = false;
    let scrollSpeed = 1500;
    let lastScrolledArticle = null;

    // Create and style the UI panel
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '20px';
    panel.style.right = '20px';
    panel.style.zIndex = '9999';
    panel.style.backdropFilter = 'blur(10px)';
    panel.style.background = 'rgba(20, 20, 20, 0.6)';
    panel.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    panel.style.borderRadius = '16px';
    panel.style.padding = '16px';
    panel.style.fontFamily = 'Segoe UI, sans-serif';
    panel.style.fontSize = '14px';
    panel.style.color = '#fff';
    panel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
    panel.innerHTML = `
        <button id="toggleScrollBtn" style="
            padding: 10px 20px;
            border: none;
            border-radius: 999px;
            background: linear-gradient(145deg, #3f51b5, #5c6bc0);
            color: white;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        ">▶️ Start Scrolling</button>
        <br><br>
        <label for="scrollSpeed">Speed:</label>
        <input type="range" min="500" max="5000" value="1500" id="scrollSpeed" step="100" style="
            width: 100%;
            appearance: none;
            height: 6px;
            background: #888;
            border-radius: 3px;
            outline: none;
            margin-top: 6px;
            transition: background 0.3s ease;
        ">
        <div style="margin-top: 4px;">⏱️ <span id="speedValue">1500</span> ms</div>
    `;
    document.body.appendChild(panel);

    const toggleBtn = document.getElementById('toggleScrollBtn');
    const speedSlider = document.getElementById('scrollSpeed');
    const speedDisplay = document.getElementById('speedValue');

    // Enhance slider appearance using CSS
    const style = document.createElement('style');
    style.textContent = `
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            border: 2px solid #3f51b5;
            cursor: pointer;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
            transition: background 0.3s ease;
        }
        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            border: 2px solid #3f51b5;
            cursor: pointer;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(0,0,0,0.5);
        }
    `;
    document.head.appendChild(style);

    // Slider behavior
    speedSlider.addEventListener('input', () => {
        scrollSpeed = parseInt(speedSlider.value);
        speedDisplay.textContent = scrollSpeed;
        if (isScrolling) {
            clearInterval(scrollInterval);
            scrollInterval = setInterval(scrollToNextArticle, scrollSpeed);
        }
    });

    // Toggle button logic
    toggleBtn.addEventListener('click', () => {
        isScrolling = !isScrolling;
        toggleBtn.textContent = isScrolling ? '⏹️ Stop Scrolling' : '▶️ Start Scrolling';

        if (isScrolling) {
            scrollInterval = setInterval(scrollToNextArticle, scrollSpeed);
        } else {
            clearInterval(scrollInterval);
        }
    });

    function getArticles() {
        return Array.from(document.querySelectorAll('article')).filter(a => a.offsetParent !== null);
    }

    function scrollToNextArticle() {
        const articles = getArticles();
        if (articles.length === 0) return;

        let nextArticle = null;

        if (!lastScrolledArticle) {
            // First run: find article near center
            const viewportMiddle = window.innerHeight / 2;
            for (const article of articles) {
                const rect = article.getBoundingClientRect();
                if (rect.top < viewportMiddle && rect.bottom > viewportMiddle) {
                    lastScrolledArticle = article;
                    break;
                }
            }
        }

        const currentIndex = articles.indexOf(lastScrolledArticle);
        if (currentIndex !== -1 && currentIndex + 1 < articles.length) {
            nextArticle = articles[currentIndex + 1];
        } else {
            nextArticle = articles.find(a => a.getBoundingClientRect().top > window.innerHeight * 0.25);
        }

        if (nextArticle) {
            nextArticle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            lastScrolledArticle = nextArticle;
        }
    }
})();
