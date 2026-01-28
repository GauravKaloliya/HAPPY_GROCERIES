# Testing Guide - Happy Groceries 🛒

## How to Test

### Setup
1. Open `index.html` in a web browser (Chrome, Firefox, Safari, or Edge)
2. Clear browser localStorage if testing from scratch: Open DevTools > Application > Local Storage > Clear

## Test Cases

### ✅ Authentication Flow

#### Test 1: Sign Up
1. Click "Sign Up" button in navbar
2. Fill in the form:
   - Full Name: "Test User" (min 3 chars)
   - Phone: "9876543210" (exactly 10 digits)
   - Email: "test@example.com" (optional)
   - Password: "password123" (min 6 chars)
   - Confirm Password: "password123" (must match)
3. Watch password strength indicator change colors
4. Click "Sign Up"
5. **Expected**: Toast notification, redirect to home page, navbar shows "Welcome, Test!"

#### Test 2: Duplicate Phone Prevention
1. Try to sign up again with same phone number
2. **Expected**: Error message "Phone number already registered"

#### Test 3: Login
1. Logout (if logged in)
2. Click "Login" in navbar
3. Enter phone: "9876543210" and password: "password123"
4. Click "Login"
5. **Expected**: Success message, redirect to home, navbar updates

#### Test 4: Wrong Credentials
1. Try logging in with wrong password
2. **Expected**: Error message "Invalid password"

### ✅ Navigation & UI

#### Test 5: Hamburger Menu (Mobile)
1. Resize browser to < 768px width
2. **Expected**: Menu items hidden, hamburger icon appears
3. Click hamburger icon
4. **Expected**: Menu slides in, hamburger becomes X
5. Click outside menu
6. **Expected**: Menu closes

#### Test 6: Dark Mode
1. Click moon icon (🌙) in navbar
2. **Expected**: Page switches to dark theme, icon becomes sun (☀️)
3. Refresh page
4. **Expected**: Dark mode persists
5. Click sun icon to toggle back

#### Test 7: Active Page Indicator
1. Navigate to different pages
2. **Expected**: Current page link has underline in navbar

### ✅ Product Browsing

#### Test 8: Home Page Featured Products
1. Open home page
2. **Expected**: 8 featured products displayed with emojis, prices, ratings
3. Hover over product cards
4. **Expected**: Cards bounce and glow

#### Test 9: Shop Page - Search
1. Go to Shop page
2. Type "apple" in search bar
3. **Expected**: Only products with "apple" in name show up, results count updates
4. Clear search
5. **Expected**: All products return

#### Test 10: Category Filter
1. On Shop page, click "🍎 Fruits" filter button
2. **Expected**: Only fruit products shown, button highlighted
3. Click "All" filter
4. **Expected**: All products return

#### Test 11: Sort Functionality
1. On Shop page, select "Price (Low to High)" from dropdown
2. **Expected**: Products reorder by price ascending
3. Try other sort options
4. **Expected**: Products reorder accordingly

#### Test 12: Categories Page
1. Go to Categories page
2. Click on "Fruits" category card
3. **Expected**: Scroll to products section, show only fruits
4. Page URL includes `?category=Fruits`

### ✅ Shopping Cart

#### Test 13: Add to Cart
1. On any product card, change quantity to 3
2. Click "Add to Cart"
3. **Expected**: Toast notification "Added [Product] to cart 🛒"
4. Cart counter in navbar updates to 3

#### Test 14: View Cart
1. Click cart icon in navbar (or go to Cart page)
2. **Expected**: All cart items displayed with quantities, prices
3. See subtotal, tax (8%), and total calculations

#### Test 15: Update Quantity in Cart
1. On cart page, click + button on an item
2. **Expected**: Quantity increases, subtotal updates
3. Click − button
4. **Expected**: Quantity decreases, subtotal updates

#### Test 16: Remove from Cart
1. Click "Remove" button on a cart item
2. Confirm dialog appears
3. **Expected**: Item removed, cart updates, counter updates

#### Test 17: Empty Cart
1. Remove all items from cart
2. **Expected**: Empty cart illustration (🧺) with message "Your cart is empty"

#### Test 18: Cart Persistence
1. Add items to cart
2. Close browser tab
3. Reopen index.html
4. **Expected**: Cart items still there, counter correct

### ✅ Wishlist

#### Test 19: Add to Wishlist (Not Logged In)
1. Logout
2. Click heart icon on product card
3. **Expected**: Toast "Please login to use wishlist", redirect to login after 1s

#### Test 20: Add to Wishlist (Logged In)
1. Login
2. Click heart icon (🤍) on product card
3. **Expected**: Heart turns red (💖), toast "Added to wishlist"
4. Click again
5. **Expected**: Heart turns white (🤍), toast "Removed from wishlist"

#### Test 21: View Wishlist
1. Add items to wishlist
2. Go to Wishlist page (Profile dropdown > Wishlist)
3. **Expected**: All wishlist items displayed
4. Can add to cart or remove from wishlist

#### Test 22: Wishlist Persistence
1. Add items to wishlist
2. Logout and login again
3. **Expected**: Wishlist items still there

### ✅ Checkout

#### Test 23: Checkout Without Login
1. Logout
2. Add items to cart
3. Go to Checkout page
4. **Expected**: "Please login to checkout" message with Login button

#### Test 24: Checkout with Empty Cart
1. Login
2. Empty cart
3. Go to Checkout page
4. **Expected**: "Your cart is empty" message

#### Test 25: Complete Checkout
1. Login and add items to cart
2. Go to Checkout page
3. **Expected**: Form pre-filled with user data (phone readonly)
4. Fill in address (min 10 chars)
5. Click "Place Order"
6. **Expected**: Success modal appears with:
   - Order number (ORD-xxxxx)
   - Estimated delivery date
7. Click "Awesome!" button
8. **Expected**: Cart cleared, redirect to home

#### Test 26: Order History
1. Complete an order
2. Check localStorage: `happyGroceries_users`
3. **Expected**: User object has `orders` array with order details

### ✅ About Page

#### Test 27: Contact Form
1. Go to About page
2. Fill in contact form (name, email, message)
3. Click "Send Message"
4. **Expected**: Success message "Thank you! We'll get back to you 💌"

### ✅ Responsive Design

#### Test 28: Mobile View (< 768px)
1. Resize to mobile width
2. **Expected**:
   - Single column product grid
   - Hamburger menu
   - Stack layout for cart items
   - Full-width buttons

#### Test 29: Tablet View (768px - 1024px)
1. Resize to tablet width
2. **Expected**:
   - 2 column product grid
   - Adjusted spacing

#### Test 30: Desktop View (> 1024px)
1. Resize to desktop width
2. **Expected**:
   - 4 column product grid
   - Full navbar visible
   - Checkout in 2-column layout

### ✅ Data Persistence

#### Test 31: localStorage Check
1. Open DevTools > Application > Local Storage
2. **Expected**: See keys:
   - `happyGroceries_users` - Array of user objects
   - `happyGroceries_session` - Current session data
   - `happyGroceries_cart` - Cart items
   - `theme` - 'light' or 'dark'

### ✅ Edge Cases

#### Test 32: Invalid Phone Number
1. Try to sign up with 9-digit phone
2. **Expected**: Button disabled until valid

#### Test 33: Password Mismatch
1. Sign up with different passwords
2. **Expected**: Button disabled, error on submit

#### Test 34: Quantity Limits
1. Try to set quantity > 99
2. **Expected**: Capped at 99
3. Try to set quantity < 1
4. **Expected**: Reset to 1

## Expected Console Output

- **No errors**: Console should be clean
- **localStorage operations**: May see localStorage reads/writes in Network tab (allowed)

## Browser Compatibility

Test in multiple browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Performance

- **Animations**: Should run at 60fps (smooth)
- **Search**: Debounced, no lag while typing
- **Theme toggle**: Instant switch
- **Page loads**: Fast (no external dependencies except fonts)

## Accessibility

- All buttons are keyboard accessible (Tab to navigate)
- Focus states visible
- Labels on all form inputs
- Alt text on meaningful images (using emojis, inherently accessible)

---

All tests should pass for a fully functional Happy Groceries website! 🎉
