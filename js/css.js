function updatePadding() {
    let aspectRatio = window.innerWidth / window.innerHeight;
    let minRatio = 7 / 10;  // 0.7
    let maxRatio = 15 / 10; // 1.5
    let minPadding = 15;    // 15%
    let maxPadding = 55;    // 55%

    // Ensure aspect ratio stays within defined limits
    if (aspectRatio < minRatio) {
        aspectRatio = minRatio;
    } else if (aspectRatio > maxRatio) {
        aspectRatio = maxRatio;
    }

    // Calculate padding based on aspect ratio
    let newPadding = minPadding + (maxPadding - minPadding) * ((aspectRatio - minRatio) / (maxRatio - minRatio));

    // Apply padding dynamically via CSS variable
    document.documentElement.style.setProperty('--dynamic-padding-right', `${newPadding}%`);
}

// Run function on page load and resize
window.addEventListener('resize', updatePadding);
window.addEventListener('load', updatePadding);