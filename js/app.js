/**
 * Main application script for Neocis Yomi® Accuracy Challenge
 * Handles UI interactions and navigation between screens
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const methodSelection = document.getElementById('method-selection');
    const jumpInBtn = document.getElementById('jump-in-btn');
    const freehandCard = document.getElementById('freehand-card');
    const staticCard = document.getElementById('static-card');
    const yomiCard = document.getElementById('yomi-card');
    const switchMethodBtn = document.getElementById('switch-method-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    
    // Initialize simulation module
    const simulation = window.simulation || {};
    
    // Event listeners
    // Jump In button
    if (jumpInBtn) {
        console.log("Jump In button found, adding event listener");
        jumpInBtn.addEventListener('click', () => {
            console.log("Jump In button clicked");
            welcomeScreen.classList.add('hidden');
            methodSelection.classList.remove('hidden');
        });
    } else {
        console.error("Jump In button not found in DOM");
    }
    
    // Method selection
    if (freehandCard) {
        freehandCard.addEventListener('click', () => startSimulation('freehand'));
    }
    
    if (staticCard) {
        staticCard.addEventListener('click', () => startSimulation('static'));
    }
    
    if (yomiCard) {
        yomiCard.addEventListener('click', () => startSimulation('yomi'));
    }
    
    // Results screen navigation
    if (switchMethodBtn) {
        switchMethodBtn.addEventListener('click', () => {
            document.getElementById('results-screen').classList.add('hidden');
            methodSelection.classList.remove('hidden');
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            window.open('https://neocis.com/yomi', '_blank') ;
        });
    }
    
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
            document.getElementById('results-screen').classList.add('hidden');
            startSimulation(simulation.currentMethod);
        });
    }
    
    // Function to start simulation
    function startSimulation(method) {
        methodSelection.classList.add('hidden');
        document.getElementById('simulation-interface').classList.remove('hidden');
        
        // Update method title
        document.getElementById('simulation-method-title').textContent = 'Method: ' + simulation.formatMethodName(method);
        
        // Initialize simulation with selected method
        simulation.initialize(method);
    }
});
