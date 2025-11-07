// API Configuration
// This file handles API URLs for both development (localhost) and production environments

(function() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    const config = {
        // Base URL for all API calls
        BASE_URL: isLocalhost 
            ? 'http://localhost:3000' 
            : window.location.origin,
        
        // API endpoint
        API_URL: isLocalhost 
            ? 'http://localhost:3000/api' 
            : window.location.origin + '/api',
        
        // Admin API endpoint
        ADMIN_URL: isLocalhost 
            ? 'http://localhost:3000/api/admin' 
            : window.location.origin + '/api/admin'
    };
    
    // Make configuration globally available
    window.APP_CONFIG = config;
    
    // Log current environment
    console.log('🌍 Environment:', isLocalhost ? 'Development (localhost)' : 'Production');
    console.log('🔗 API URL:', config.API_URL);
})();
