/**
 * Simulation module for Neocis Yomi® Accuracy Challenge
 * Handles 3D visualization and simulation mechanics for dental implant placement
 */

class ImplantSimulation {
    constructor() {
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.jawModel = null;
        this.implantModel = null;
        this.idealPathLine = null;
        
        // Simulation state
        this.currentMethod = null;
        this.isSimulating = false;
        this.isDrilling = false;
        this.isComplete = false;
        
        // Simulation metrics
        this.currentAngle = 0;
        this.currentDepth = 0;
        this.finalAngle = 0;
        this.finalDepth = 0;
        
        // Method parameters
        this.methodParams = {
            freehand: {
                tremor: 0.3,
                angleDeviation: 7.03,
                depthDeviation: 1.1,
                difficulty: 'high'
            },
            static: {
                tremor: 0.1,
                angleDeviation: 3.9,
                depthDeviation: 1.1,
                difficulty: 'medium'
            },
            yomi: {
                tremor: 0.01,
                angleDeviation: 1.42,
                depthDeviation: 0.14,
                difficulty: 'low'
            }
        };
        
        // Canvas and DOM elements
        this.canvas = null;
        this.resultsCanvas = null;
        
        // Initialize simulation
        this.init();
    }
    
    /**
     * Initialize the simulation environment
     */
    init() {
        // Get canvas elements
        this.canvas = document.getElementById('simulation-canvas');
        this.resultsCanvas = document.getElementById('results-canvas');
        
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45, 
            this.canvas.clientWidth / this.canvas.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create results renderer
        this.resultsRenderer = new THREE.WebGLRenderer({
            canvas: this.resultsCanvas,
            antialias: true
        });
        this.resultsRenderer.setSize(this.resultsCanvas.clientWidth, this.resultsCanvas.clientHeight);
        this.resultsRenderer.setPixelRatio(window.devicePixelRatio);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
        
        // Create placeholder jaw model (will be replaced with actual model)
        this.createPlaceholderJawModel();
        
        // Create ideal path line
        this.createIdealPathLine();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation loop
        this.animate();
    }
    
    /**
     * Create a placeholder jaw model until real assets are loaded
     */
    createPlaceholderJawModel() {
        // Create a simple jaw-like shape
        const jawGeometry = new THREE.BoxGeometry(5, 1, 2);
        const jawMaterial = new THREE.MeshPhongMaterial({ color: 0xd3d3d3 });
        this.jawModel = new THREE.Mesh(jawGeometry, jawMaterial);
        
        // Create a hole for missing tooth #19
        const holeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 32);
        const holeMesh = new THREE.Mesh(holeGeometry, new THREE.MeshBasicMaterial());
        holeMesh.position.set(0, 0, 0);
        holeMesh.rotation.x = Math.PI / 2;
        
        // Use CSG to create hole (simulated here)
        this.missingToothPosition = new THREE.Vector3(0, 0.5, 0);
        
        this.scene.add(this.jawModel);
    }
    
    /**
     * Create the ideal implant path line
     */
    createIdealPathLine() {
        const material = new THREE.LineDashedMaterial({
            color: 0xF28C38,
            linewidth: 2,
            dashSize: 0.2,
            gapSize: 0.1
        });
        
        const points = [
            new THREE.Vector3(0, 2, 0),
            new THREE.Vector3(0, -1, 0)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.idealPathLine = new THREE.Line(geometry, material);
        this.idealPathLine.computeLineDistances();
        this.scene.add(this.idealPathLine);
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        // Update camera
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Update results renderer if visible
        if (this.resultsCanvas.clientWidth > 0) {
            this.resultsRenderer.setSize(this.resultsCanvas.clientWidth, this.resultsCanvas.clientHeight);
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Update simulation if active
        if (this.isSimulating && !this.isComplete) {
            this.updateSimulation();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Render results scene if visible
        if (this.resultsCanvas.clientWidth > 0) {
            this.resultsRenderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * Update simulation state
     */
    updateSimulation() {
        if (this.isDrilling) {
            // Update depth based on method
            if (this.currentMethod === 'freehand' || this.currentMethod === 'static') {
                // Manual depth control for freehand and static
                this.currentDepth += 0.02;
            } else if (this.currentMethod === 'yomi') {
                // Automated precise depth control for Yomi
                this.currentDepth += 0.03;
            }
            
            // Add random tremor based on method
            const tremor = this.methodParams[this.currentMethod].tremor;
            
            // Update angle with random tremor based on method
            if (this.currentMethod === 'freehand') {
                // Freehand: Jumpy mouse with significant random tremors
                const randomFactor = Math.random() * 2 - 1; // -1 to 1
                this.currentAngle = Math.max(0, Math.min(
                    this.currentAngle + randomFactor * tremor * 5,
                    10
                ));
            } else if (this.currentMethod === 'static') {
                // Static Guided: Moderate constraints with some tremor
                const randomFactor = Math.random() * 2 - 1; // -1 to 1
                this.currentAngle = Math.max(0, Math.min(
                    this.currentAngle + randomFactor * tremor * 2,
                    5
                ));
            } else if (this.currentMethod === 'yomi') {
                // Yomi: Highly constrained with minimal tremor
                // Gradually improve to near-perfect alignment
                this.currentAngle = Math.max(0.1, this.currentAngle * 0.95);
            }
            
            // Add some realistic oscillation
            if (this.currentMethod === 'freehand') {
                this.currentAngle += Math.sin(Date.now() / 100) * tremor * 2;
            } else if (this.currentMethod === 'static') {
                this.currentAngle += Math.sin(Date.now() / 200) * tremor;
            }
            
            // Update UI
            this.updateFeedbackUI();
            
            // Update 3D visualization (placeholder for actual 3D updates)
            this.updateDrillVisualization();
            
            // Check if drilling is complete
            if (this.currentDepth >= 1.0) {
                this.completeDrilling();
            }
        }
    }
    
    /**
     * Update drill visualization in 3D scene
     */
    updateDrillVisualization() {
        // This would update the 3D model position and rotation
        // For now, we'll just log the values for debugging
        console.log(`Angle: ${this.currentAngle.toFixed(2)}°, Depth: ${this.currentDepth.toFixed(2)}mm`);
        
        // In a full implementation, this would:
        // 1. Update the position of the drill/implant model
        // 2. Apply rotation based on current angle
        // 3. Update depth based on current depth value
    }
    
    /**
     * Update feedback UI with current metrics
     */
    updateFeedbackUI() {
        // Update angle display
        const angleValue = document.getElementById('angle-value');
        angleValue.textContent = this.currentAngle.toFixed(2) + '°';
        
        // Update angle meter
        const angleMeter = document.getElementById('angle-meter');
        const anglePercentage = Math.min((this.currentAngle / 10) * 100, 100);
        angleMeter.style.width = anglePercentage + '%';
        
        // Update depth display
        const depthValue = document.getElementById('depth-value');
        depthValue.textContent = this.currentDepth.toFixed(2) + 'mm';
        
        // Update depth meter
        const depthMeter = document.getElementById('depth-meter');
        const depthPercentage = Math.min((this.currentDepth / 1.0) * 100, 100);
        depthMeter.style.width = depthPercentage + '%';
        
        // Update crosshair
        const crosshair = document.getElementById('crosshair');
        crosshair.classList.remove('poor', 'medium');
        
        if (this.currentAngle > 4) {
            crosshair.classList.add('poor');
        } else if (this.currentAngle > 1.5) {
            crosshair.classList.add('medium');
        }
    }
    
    /**
     * Start simulation with selected method
     * @param {string} method - The selected implant placement method
     */
    startSimulation(method) {
        this.currentMethod = method;
        this.isSimulating = true;
        this.isDrilling = false;
        this.isComplete = false;
        
        // Reset metrics
        this.currentAngle = 0;
        this.currentDepth = 0;
        this.finalAngle = 0;
        this.finalDepth = 0;
        
        // Update UI for selected method
        document.getElementById('simulation-method-title').textContent = 'Method: ' + this.formatMethodName(method);
        
        // Reset UI
        this.updateFeedbackUI();
        
        // Update drill button
        const drillBtn = document.getElementById('drill-btn');
        drillBtn.textContent = 'Drill It';
        
        // Set camera to default position based on selected view
        this.setView('buccal');
    }
    
    /**
     * Format method name for display
     * @param {string} method - The method identifier
     * @returns {string} Formatted method name
     */
    formatMethodName(method) {
        switch(method) {
            case 'freehand':
                return 'Freehand';
            case 'static':
                return 'Static Guided';
            case 'yomi':
                return 'Yomi Robotic-Assisted';
            default:
                return method;
        }
    }
    
    /**
     * Start drilling process
     */
    startDrilling() {
        this.isDrilling = true;
        
        // Update drill button
        const drillBtn = document.getElementById('drill-btn');
        drillBtn.textContent = 'Lock It In';
        
        // Method-specific drilling behavior
        if (this.currentMethod === 'freehand') {
            // Freehand: Start with current angle, will have significant tremors during drilling
            // No changes needed, will use current angle with tremors
            
            // Add sound effect (would be implemented with actual audio)
            console.log("Playing freehand drilling sound - loud and variable pitch");
            
        } else if (this.currentMethod === 'static') {
            // Static Guided: Slightly improve angle due to guide, but still manual
            this.currentAngle = Math.min(this.currentAngle, 4.5); // Guide helps a bit
            
            // Add sound effect (would be implemented with actual audio)
            console.log("Playing static guided drilling sound - steady medium pitch");
            
        } else if (this.currentMethod === 'yomi') {
            // Yomi: Automatically set to near-ideal values with minimal deviation
            // Robotic precision takes over
            this.currentAngle = 0.2 + Math.random() * 1.0;
            
            // Add Yomi robotic sound effect (would be implemented with actual audio)
            console.log("Playing Yomi drilling sound - precise with robotic beeps");
            
            // Visual feedback for robotic assistance
            const crosshair = document.getElementById('crosshair');
            crosshair.style.boxShadow = "0 0 10px #F28C38";
        }
    }
    
    /**
     * Complete drilling process
     */
    completeDrilling() {
        this.isDrilling = false;
        this.isComplete = true;
        
        // Store final metrics
        this.finalAngle = this.currentAngle;
        this.finalDepth = this.currentDepth;
        
        // Calculate score
        const score = this.calculateScore();
        
        // Prepare results data
        const resultsData = {
            method: this.currentMethod,
            angle: this.finalAngle,
            depth: this.finalDepth,
            score: score
        };
        
        // Trigger results display
        this.showResults(resultsData);
    }
    
    /**
     * Calculate score based on angle and depth
     * @returns {number} Final score
     */
    calculateScore() {
        // Score calculation: 100 - (angle × 10) - (depth × 50)
        const angleScore = this.finalAngle * 10;
        const depthScore = Math.abs(this.finalDepth - 1.0) * 50;
        const totalScore = Math.max(0, 100 - angleScore - depthScore);
        
        console.log(`Score calculation: 100 - (${this.finalAngle.toFixed(2)} × 10) - (${Math.abs(this.finalDepth - 1.0).toFixed(2)} × 50) = ${totalScore.toFixed(1)}`);
        
        return totalScore;
    }
    
    /**
     * Show results screen with simulation data
     * @param {Object} data - Simulation results data
     */
    showResults(data) {
        // Update results UI with method and measurements
        document.getElementById('your-score').textContent = 
            this.formatMethodName(data.method) + ': ' + 
            data.angle.toFixed(2) + '° | ' + 
            data.depth.toFixed(2) + 'mm';
        
        // Update angle bar
        const angleBar = document.getElementById('your-angle-bar');
        const anglePercentage = Math.min((data.angle / 7.03) * 100, 100);
        angleBar.style.width = anglePercentage + '%';
        document.getElementById('your-angle-value').textContent = data.angle.toFixed(2) + '°';
        
        // Update depth bar
        const depthBar = document.getElementById('your-depth-bar');
        const depthPercentage = Math.min((data.depth / 1.1) * 100, 100);
        depthBar.style.width = depthPercentage + '%';
        document.getElementById('your-depth-value').textContent = data.depth.toFixed(2) + 'mm';
        
        // Add numeric score display
        const scoreElement = document.createElement('div');
        scoreElement.className = 'numeric-score';
        scoreElement.innerHTML = `Your Score: <span>${data.score.toFixed(1)}</span>/100`;
        
        // Insert score after your-score element
        const yourScoreElement = document.getElementById('your-score');
        yourScoreElement.parentNode.insertBefore(scoreElement, yourScoreElement.nextSibling);
        
        // Style the score based on performance
        const scoreSpan = scoreElement.querySelector('span');
        if (data.score >= 80) {
            scoreSpan.style.color = '#4CAF50'; // Green for good score
        } else if (data.score >= 50) {
            scoreSpan.style.color = '#FF9800'; // Orange for medium score
        } else {
            scoreSpan.style.color = '#F44336'; // Red for poor score
        }
        
        // Update next move message based on method and performance
        const nextMoveMessage = document.getElementById('next-move-message');
        if (data.method === 'yomi') {
            nextMoveMessage.textContent = "That's Yomi's magic. Told ya.";
            
            // Add Neugarten's study reference for Yomi
            const studyRef = document.createElement('div');
            studyRef.className = 'study-reference';
            studyRef.textContent = "Neugarten's study: Yomi slashes freehand error by 80%. Facts don't lie.";
            nextMoveMessage.parentNode.insertBefore(studyRef, nextMoveMessage.nextSibling);
            
        } else if (data.method === 'static') {
            if (data.score < 50) {
                nextMoveMessage.textContent = "Guides can only help so much. See if Yomi saves you.";
            } else {
                nextMoveMessage.textContent = "Not bad with the guide, but Yomi could take you further.";
            }
        } else { // freehand
            if (data.score < 30) {
                nextMoveMessage.textContent = "Rough day? See if Yomi saves you.";
            } else if (data.score < 70) {
                nextMoveMessage.textContent = "Decent hand skills, but precision matters. Try Yomi.";
            } else {
                nextMoveMessage.textContent = "Impressive hand skills! Still, compare with Yomi's consistency.";
            }
        }
        
        // Check for Yomi Slayer badge
        if (data.method === 'freehand' && data.angle <= 1.42 && data.depth <= 0.14) {
            // Create badge element
            const badgeElement = document.createElement('div');
            badgeElement.className = 'yomi-slayer-badge';
            badgeElement.innerHTML = '🏆 YOMI SLAYER 🏆';
            badgeElement.style.color = '#F28C38';
            badgeElement.style.fontWeight = 'bold';
            badgeElement.style.fontSize = '24px';
            badgeElement.style.textAlign = 'center';
            badgeElement.style.margin = '20px 0';
            badgeElement.style.padding = '10px';
            badgeElement.style.border = '2px solid #F28C38';
            badgeElement.style.borderRadius = '5px';
            
            // Insert badge before next move message
            nextMoveMessage.parentNode.insertBefore(badgeElement, nextMoveMessage);
            
            // Update message
            nextMoveMessage.textContent = "INCREDIBLE! Somehow you beat the robot. Dr. Neugarten would like a word.";
        }
        
        // Show results screen
        document.getElementById('simulation-interface').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');
    }
    
    /**
     * Set camera view
     * @param {string} view - The view identifier
     */
    setView(view) {
        // Reset controls
        this.controls.reset();
        
        switch(view) {
            case 'buccal':
                this.camera.position.set(0, 0, 10);
                break;
            case 'lingual':
                this.camera.position.set(0, 0, -10);
                break;
            case 'occlusal':
                this.camera.position.set(0, 10, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'free':
                // Allow free movement
                break;
        }
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(view + '-view').classList.add('active');
    }
}

// Create global simulation instance
let simulation;
