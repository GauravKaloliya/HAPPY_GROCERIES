import { activityLogsAPI } from '../api/activityLogs';

class ActivityLogger {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.queue = [];
    this.isBatchProcessing = false;

    // Process queue periodically
    setInterval(() => this.processQueue(), 5000);

    // Process queue when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.processQueue();
      }
    });

    // Process queue before unloading
    window.addEventListener('beforeunload', () => {
      this.processQueue();
    });
  }

  generateSessionId() {
    // Generate a unique session ID
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentPage() {
    // Get current page path
    return window.location.pathname;
  }

  log(action, details = {}) {
    const logEntry = {
      action,
      page: this.getCurrentPage(),
      details,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(logEntry);

    // Process immediately if queue is getting full
    if (this.queue.length >= 10) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isBatchProcessing || this.queue.length === 0) {
      return;
    }

    this.isBatchProcessing = true;

    try {
      // Process all queued logs
      const logs = [...this.queue];
      this.queue = [];

      // Send each log (could be batched in a single API call)
      await Promise.all(
        logs.map(log =>
          activityLogsAPI.logActivity(log).catch(err => {
            // If failed, add back to queue
            console.error('Failed to log activity:', err);
            this.queue.unshift(log);
          })
        )
      );
    } catch (error) {
      console.error('Error processing activity logs:', error);
    } finally {
      this.isBatchProcessing = false;
    }
  }

  // Convenience methods for common actions
  logPageView() {
    this.log('page_view', {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  }

  logProductView(productId, productName) {
    this.log('product_view', {
      product_id: productId,
      product_name: productName,
    });
  }

  logAddToCart(productId, productName, quantity) {
    this.log('add_to_cart', {
      product_id: productId,
      product_name: productName,
      quantity,
    });
  }

  logRemoveFromCart(productId, productName, quantity) {
    this.log('remove_from_cart', {
      product_id: productId,
      product_name: productName,
      quantity,
    });
  }

  logSearch(query) {
    this.log('search', { query });
  }

  logFilterApply(filters) {
    this.log('filter_apply', { filters });
  }

  logAddToWishlist(productId, productName) {
    this.log('add_to_wishlist', {
      product_id: productId,
      product_name: productName,
    });
  }

  logRemoveFromWishlist(productId, productName) {
    this.log('remove_from_wishlist', {
      product_id: productId,
      product_name: productName,
    });
  }

  logCouponApply(couponCode, discount) {
    this.log('coupon_apply', {
      coupon_code: couponCode,
      discount,
    });
  }

  logCheckout(orderId, total) {
    this.log('checkout', {
      order_id: orderId,
      total,
    });
  }

  logLogin() {
    this.log('login');
  }

  logLogout() {
    this.log('logout');
  }

  logSignup() {
    this.log('signup');
  }

  logContactForm(formData) {
    this.log('contact_form', {
      has_name: !!formData.name,
      has_email: !!formData.email,
      has_message: !!formData.message,
    });
  }

  logProfileUpdate(fieldsUpdated) {
    this.log('profile_update', { fields: fieldsUpdated });
  }

  logSettingsChange(settingName, oldValue, newValue) {
    this.log('settings_change', {
      setting: settingName,
      old_value: oldValue,
      new_value: newValue,
    });
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

export default activityLogger;
