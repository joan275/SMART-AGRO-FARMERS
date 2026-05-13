// Cart Management System for Smart Agro Platform
class ShoppingCart {
    constructor() {
        this.storageKey = 'smartAgroCart';
        this.cart = this.loadCart();
    }

    // Load cart from localStorage
    loadCart() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    }

    // Add item to cart
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product.title} added to cart!`);
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartUI();
        }
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get cart item count
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }

    // Update cart UI elements
    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
            cartCount.style.display = this.getItemCount() > 0 ? 'inline-block' : 'none';
        }
        
        if (cartTotal) {
            cartTotal.textContent = `UGX ${this.getTotal().toLocaleString()}`;
        }
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Render cart modal
    renderCartModal() {
        if (this.cart.length === 0) {
            return `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p style="font-size: 0.9rem; color: #666;">Add some quality products to get started!</p>
                </div>
            `;
        }

        const items = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h5>${item.title}</h5>
                    <p>UGX ${item.price.toLocaleString()}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="cart.updateQuantity('${item.id}', parseInt(this.value))">
                    <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    UGX ${(item.price * item.quantity).toLocaleString()}
                </div>
                <button class="cart-remove-btn" onclick="cart.removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        return `
            <div class="cart-items">
                ${items}
            </div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>UGX ${this.getTotal().toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery:</span>
                    <span>Free (over UGX 50k)</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>UGX ${this.getTotal().toLocaleString()}</span>
                </div>
            </div>
            <div class="cart-actions">
                <button class="btn-primary" onclick="cart.checkout()">Proceed to Checkout</button>
                <button class="btn-outline" onclick="cart.closeModal()">Continue Shopping</button>
                <button class="btn-clear" onclick="cart.clearCart()">Clear Cart</button>
            </div>
        `;
    }

    // Open cart modal
    openModal() {
        let modal = document.getElementById('cart-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cart-modal';
            modal.className = 'cart-modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h2>Shopping Cart</h2>
                    <button class="modal-close" onclick="cart.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cart-modal-body">
                    ${this.renderCartModal()}
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Close cart modal
    closeModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Checkout function
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }

        const cartData = {
            items: this.cart,
            total: this.getTotal(),
            date: new Date().toISOString()
        };

        // Store order data
        localStorage.setItem('lastOrder', JSON.stringify(cartData));

        alert(`Order Summary:\n\nItems: ${this.getItemCount()}\nTotal: UGX ${this.getTotal().toLocaleString()}\n\nProceeding to payment...`);
        
        // Here you would integrate with a payment gateway
        // For now, we'll just clear the cart after "payment"
        this.clearCart();
        this.showNotification('Order placed successfully! Thank you for shopping with Smart Agro.');
        this.closeModal();
    }
}

// Initialize cart globally
const cart = new ShoppingCart();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    cart.updateCartUI();
    
    // Add click handlers to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const productTitle = card.querySelector('.product-title').textContent.trim();
                const priceText = card.querySelector('.product-price').textContent;
                const price = parseInt(priceText.replace(/[^\d]/g, ''));
                
                cart.addToCart({
                    id: `product-${Date.now()}`,
                    title: productTitle,
                    price: price,
                    quantity: 1
                });
            });
        }
    });
});
