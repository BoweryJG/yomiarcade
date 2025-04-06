/**
 * Main application module for Neocis Yomi® Accuracy Challenge
 * Handles UI interactions and application flow
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const methodSelection = document.getElementById('method-selection');
    const simulationInterface = document.getElementById('simulation-interface');
    const resultsScreen = document.getElementById('results-screen');
    
    // Buttons
    const jumpInBtn = document.getElementById('jump-in-btn');
    const freehandCard = document.getElementById('freehand-card');
    const staticCard = document.getElementById('static-card');
    const yomiCard = document.getElementById('yomi-card');
    const drillBtn = document.getElementById('drill-btn');
    const switchMethodBtn = document.getElementById('switch-method-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    
    // View buttons
    const buccalViewBtn = document.getElementById('buccal-view');
    const lingualViewBtn = document.getElementById('lingual-view');
    const occlusalViewBtn = document.getElementById('occlusal-view');
    const freeViewBtn = document.getElementById('free-view');
    
    // Initialize simulation
    simulation = new ImplantSimulation();
    
    // Event Listeners
    
    // Welcome screen to method selection
    jumpInBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        methodSelection.classList.remove('hidden');
    });
    
    // Method selection
    freehandCard.addEventListener('click', () => {
        startMethod('freehand');
    });
    
    staticCard.addEventListener('click', () => {
        startMethod('static');
    });
    
    yomiCard.addEventListener('click', () => {
        startMethod('yomi');
    });
    
    // Drill button
    drillBtn.addEventListener('click', () => {
        if (!simulation.isDrilling) {
            simulation.startDrilling();
        } else {
            simulation.completeDrilling();
        }
    });
    
    // View controls
    buccalViewBtn.addEventListener('click', () => {
        simulation.setView('buccal');
    });
    
    lingualViewBtn.addEventListener('click', () => {
        simulation.setView('lingual');
    });
    
    occlusalViewBtn.addEventListener('click', () => {
        simulation.setView('occlusal');
    });
    
    freeViewBtn.addEventListener('click', () => {
        simulation.setView('free');
    });
    
    // Results screen buttons
    switchMethodBtn.addEventListener('click', () => {
        resultsScreen.classList.add('hidden');
        methodSelection.classList.remove('hidden');
    });
    
    learnMoreBtn.addEventListener('click', () => {
        window.open('https://neocis.com/yomi', '_blank');
    });
    
    tryAgainBtn.addEventListener('click', () => {
        resultsScreen.classList.add('hidden');
        simulationInterface.classList.remove('hidden');
        simulation.startSimulation(simulation.currentMethod);
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (simulationInterface.classList.contains('hidden')) return;
        
        switch(e.key.toLowerCase()) {
            case 'w':
                simulation.setView('occlusal');
                break;
            case 'a':
                simulation.setView('lingual');
                break;
            case 's':
                simulation.setView('free');
                break;
            case 'd':
                simulation.setView('buccal');
                break;
            case ' ':
                if (!simulation.isDrilling) {
                    simulation.startDrilling();
                } else {
                    simulation.completeDrilling();
                }
                break;
        }
    });
    
    /**
     * Start simulation with selected method
     * @param {string} method - The selected implant placement method
     */
    function startMethod(method) {
        methodSelection.classList.add('hidden');
        simulationInterface.classList.remove('hidden');
        simulation.startSimulation(method);
    }
    
    // Handle mouse movement for simulation
    const simulationCanvas = document.getElementById('simulation-canvas');
    
    simulationCanvas.addEventListener('mousemove', (e) => {
        if (!simulation.isSimulating || simulation.isComplete) return;
        
        // Get mouse position relative to canvas
        const rect = simulationCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to normalized coordinates (-1 to 1)
        const normalizedX = (x / rect.width) * 2 - 1;
        const normalizedY = -((y / rect.height) * 2 - 1);
        
        // Only update angle if not drilling
        if (!simulation.isDrilling) {
            // Calculate base angle based on mouse position
            let angle = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY) * 10;
            
            // Apply method-specific behavior
            if (simulation.currentMethod === 'freehand') {
                // Freehand: Jumpy mouse with significant random tremors
                const tremor = simulation.methodParams[simulation.currentMethod].tremor;
                
                // Add random tremor
                const randomFactor = Math.random() * 2 - 1; // -1 to 1
                angle += randomFactor * tremor * 8;
                
                // Add oscillation for hand shake simulation
                angle += Math.sin(Date.now() / 100) * tremor * 3;
                
                // Occasional larger jumps to simulate hand instability
                if (Math.random() < 0.05) {
                    angle += (Math.random() * 2 - 1) * 3;
                }
            } 
            else if (simulation.currentMethod === 'static') {
                // Static guided: More constrained movement with guide
                const tremor = simulation.methodParams[simulation.currentMethod].tremor;
                
                // Limit maximum angle deviation
                angle = Math.min(angle, 5);
                
                // Add smaller random tremor
                const randomFactor = Math.random() * 2 - 1; // -1 to 1
                angle += randomFactor * tremor * 3;
                
                // Add subtle oscillation
                angle += Math.sin(Date.now() / 200) * tremor;
                
                // Guide resistance effect - tends to pull toward center
                if (angle > 2) {
                    angle = 2 + (angle - 2) * 0.7; // Resistance increases with angle
                }
            } 
            else if (simulation.currentMethod === 'yomi') {
                // Yomi: Highly constrained with robotic precision
                const tremor = simulation.methodParams[simulation.currentMethod].tremor;
                
                // Tight angle constraints
                angle = Math.min(angle, 2);
                
                // Minimal tremor
                angle += (Math.random() * 2 - 1) * tremor;
                
                // Strong centering force - robotic guidance
                angle = angle * 0.3; // Strong pull toward perfect alignment
                
                // Ensure minimum precision level
                angle = Math.max(angle, 0.1);
                angle = Math.min(angle, 1.5);
            }
            
            // Ensure angle is positive and within reasonable bounds
            simulation.currentAngle = Math.max(0, Math.min(angle, 10));
            
            // Update UI
            simulation.updateFeedbackUI();
        }
    });
});
