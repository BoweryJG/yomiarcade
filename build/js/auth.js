/**
 * Authentication module for Neocis Yomi® Accuracy Challenge
 * Modified to bypass login completely
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    // Skip login and show app immediately
    if (loginScreen && appContainer) {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }
    
    // For compatibility with other code that might check authentication
    localStorage.setItem('yomi_authenticated', 'true');
    localStorage.setItem('yomi_login_time', new Date().toISOString());
});
