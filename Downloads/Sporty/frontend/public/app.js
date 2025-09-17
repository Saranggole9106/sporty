// Global variables
let currentUser = null;
let grounds = [];
const API_BASE_URL = 'http://localhost:3001/api';

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const userPhoto = document.getElementById('userPhoto');

const welcomeSection = document.getElementById('welcomeSection');
const registrationSection = document.getElementById('registrationSection');
const dashboardSection = document.getElementById('dashboardSection');

const registrationForm = document.getElementById('registrationForm');
const bookingForm = document.getElementById('bookingForm');
const groundSelect = document.getElementById('groundSelect');
const bookingDate = document.getElementById('bookingDate');
const timeSlot = document.getElementById('timeSlot');
const slotLoader = document.getElementById('slotLoader');
const bookingsList = document.getElementById('bookingsList');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupDateRestrictions();
    loadGrounds();
    
    // Check authentication state
    if (window.onAuthStateChanged) {
        window.onAuthStateChanged(window.firebaseAuth, handleAuthStateChange);
    }
});

// Event Listeners
function setupEventListeners() {
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    registrationForm.addEventListener('submit', handleRegistration);
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
    document.getElementById('groundSelect').addEventListener('change', () => {
        loadAvailableSlots();
        updateBookingSteps();
    });
    document.getElementById('bookingDate').addEventListener('change', () => {
        loadAvailableSlots();
        updateBookingSteps();
    });
    document.getElementById('timeSlot').addEventListener('change', updateBookingSteps);
    
    // Initialize interactive features
    updateBookingSteps();
}

// Date restrictions
function setupDateRestrictions() {
    const today = new Date().toISOString().split('T')[0];
    bookingDate.min = today;
    
    // Set max date to 30 days from now
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    bookingDate.max = maxDate.toISOString().split('T')[0];
}

// Authentication handlers
async function handleLogin() {
    try {
        showLoading(true);
        const result = await window.signInWithPopup(window.firebaseAuth, window.googleProvider);
        console.log('Login successful:', result.user);
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await window.signOut(window.firebaseAuth);
        currentUser = null;
        showWelcomeSection();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function handleAuthStateChange(user) {
    if (user) {
        currentUser = user;
        updateUserProfile(user);
        
        // Check if user is registered
        const isRegistered = await checkUserRegistration(user.uid);
        if (isRegistered) {
            showDashboard();
            loadUserBookings();
        } else {
            showRegistrationForm(user);
        }
    } else {
        currentUser = null;
        showWelcomeSection();
    }
}

function updateUserProfile(user) {
    userName.textContent = user.displayName;
    userPhoto.src = user.photoURL;
    userProfile.style.display = 'flex';
    loginBtn.style.display = 'none';
}

// Registration
async function checkUserRegistration(firebaseUID) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/profile/${firebaseUID}`);
        return response.ok;
    } catch (error) {
        console.error('Error checking registration:', error);
        return false;
    }
}

function showRegistrationForm(user) {
    welcomeSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    registrationSection.style.display = 'block';
    
    // Pre-fill name and email
    document.getElementById('studentName').value = user.displayName || '';
}


async function handleRegistration(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError('Please login first');
        return;
    }
    
    const studentData = {
        name: document.getElementById('studentName').value,
        email: currentUser.email,
        rollNo: document.getElementById('rollNo').value,
        department: document.getElementById('department').value,
        firebaseUID: currentUser.uid
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/students/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Registration completed successfully!');
            setTimeout(() => {
                showDashboard();
                loadUserBookings();
            }, 2000);
        } else {
            showError(result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Registration failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Dashboard
function showDashboard() {
    welcomeSection.style.display = 'none';
    registrationSection.style.display = 'none';
    dashboardSection.style.display = 'block';
}

function showWelcomeSection() {
    welcomeSection.style.display = 'block';
    registrationSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    userProfile.style.display = 'none';
    loginBtn.style.display = 'block';
}

// Load grounds
async function loadGrounds() {
    try {
        const response = await fetch(`${API_BASE_URL}/grounds`);
        const result = await response.json();
        
        if (response.ok) {
            grounds = result.grounds;
            populateGroundSelect();
        }
    } catch (error) {
        console.error('Error loading grounds:', error);
    }
}

function populateGroundSelect() {
    groundSelect.innerHTML = '<option value="">Select a ground</option>';
    grounds.forEach(ground => {
        const option = document.createElement('option');
        option.value = ground._id;
        option.textContent = `${ground.name} - ${ground.location}`;
        groundSelect.appendChild(option);
    });
}

// Load available slots
async function loadAvailableSlots() {
    const groundId = groundSelect.value;
    const date = bookingDate.value;
    
    if (!groundId || !date) {
        timeSlot.innerHTML = '<option value="">Select date and ground first</option>';
        timeSlot.disabled = true;
        return;
    }
    
    try {
        slotLoader.style.display = 'block';
        timeSlot.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/bookings/availability?groundId=${groundId}&date=${date}`);
        const result = await response.json();
        
        if (response.ok) {
            populateTimeSlots(result.availableSlots);
        } else {
            showError(result.message || 'Failed to load slots');
        }
    } catch (error) {
        console.error('Error loading slots:', error);
        showError('Failed to load available slots');
    } finally {
        slotLoader.style.display = 'none';
    }
}

function populateTimeSlots(availableSlots) {
    timeSlot.innerHTML = '';
    
    if (availableSlots.length === 0) {
        timeSlot.innerHTML = '<option value="">No slots available</option>';
        timeSlot.disabled = true;
    } else {
        timeSlot.innerHTML = '<option value="">Select a time slot</option>';
        availableSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            timeSlot.appendChild(option);
        });
        timeSlot.disabled = false;
    }
}

// Interactive booking step management
function updateBookingSteps() {
    const groundSelect = document.getElementById('groundSelect');
    const bookingDate = document.getElementById('bookingDate');
    const timeSlot = document.getElementById('timeSlot');
    const bookBtn = document.getElementById('bookBtn');
    const bookingSummary = document.getElementById('bookingSummary');
    
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.form-section');
    
    // Reset all steps and sections
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Step 1: Ground selection
    steps[0].classList.add('active');
    sections[0].classList.add('active');
    
    if (groundSelect.value) {
        steps[0].classList.remove('active');
        steps[0].classList.add('completed');
        steps[1].classList.add('active');
        sections[1].classList.add('active');
        
        // Step 2: Date selection
        if (bookingDate.value) {
            steps[1].classList.remove('active');
            steps[1].classList.add('completed');
            steps[2].classList.add('active');
            sections[2].classList.add('active');
            
            // Step 3: Time slot selection
            if (timeSlot.value) {
                steps[2].classList.remove('active');
                steps[2].classList.add('completed');
                
                // Show booking summary
                updateBookingSummary();
                bookingSummary.style.display = 'block';
                bookBtn.disabled = false;
            } else {
                bookingSummary.style.display = 'none';
                bookBtn.disabled = true;
            }
        } else {
            bookingSummary.style.display = 'none';
            bookBtn.disabled = true;
        }
    } else {
        bookingSummary.style.display = 'none';
        bookBtn.disabled = true;
    }
}

function updateBookingSummary() {
    const groundSelect = document.getElementById('groundSelect');
    const bookingDate = document.getElementById('bookingDate');
    const timeSlot = document.getElementById('timeSlot');
    
    document.getElementById('summaryGround').textContent = groundSelect.options[groundSelect.selectedIndex].text;
    document.getElementById('summaryDate').textContent = new Date(bookingDate.value).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('summaryTime').textContent = timeSlot.value;
}

// Handle booking
async function handleBooking(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError('Please sign in first');
        return;
    }
    
    const groundSelect = document.getElementById('groundSelect');
    const bookingDate = document.getElementById('bookingDate');
    const timeSlot = document.getElementById('timeSlot');
    
    const bookingData = {
        studentId: currentUser.uid,
        groundId: groundSelect.value,
        date: bookingDate.value,
        slot: timeSlot.value
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/bookings/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showBookingSuccess(result.booking);
            bookingForm.reset();
            timeSlot.innerHTML = '<option value="">Select date and ground first</option>';
            timeSlot.disabled = true;
            loadUserBookings(); // Refresh bookings list
        } else {
            // Handle specific error cases
            if (response.status === 409) {
                if (result.error === 'Double booking not allowed') {
                    showError(`You already have a booking on ${new Date(bookingData.date).toLocaleDateString()}. Only one booking per day is allowed.`);
                } else if (result.error === 'Slot unavailable') {
                    showError(`The ${bookingData.slot} slot is already booked. Please select a different time.`);
                    // Refresh available slots
                    loadAvailableSlots();
                } else {
                    showError(result.message || 'Booking conflict occurred');
                }
            } else if (response.status === 404 && result.error === 'Student not found') {
                showError('Please complete your student registration first');
                // Show registration form
                document.getElementById('registrationModal').style.display = 'block';
            } else {
                showError(result.message || 'Booking failed');
            }
        }
    } catch (error) {
        console.error('Booking error:', error);
        showError('Booking failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Load user bookings
async function loadUserBookings() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/student/${currentUser.uid}`);
        const result = await response.json();
        
        if (response.ok) {
            displayBookings(result.bookings);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = '<div class="loading">Failed to load bookings</div>';
    }
}

function displayBookings(bookings) {
    if (bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="text-center" style="padding: 40px; color: #666;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>No bookings yet. Make your first booking above!</p>
            </div>
        `;
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <div class="booking-header">
                <div class="booking-title">${booking.ground}</div>
                <div class="booking-status status-${booking.status}">${booking.status}</div>
            </div>
            <div class="booking-details">
                <div><i class="fas fa-map-marker-alt"></i> ${booking.location}</div>
                <div><i class="fas fa-calendar"></i> ${formatDate(booking.date)}</div>
                <div><i class="fas fa-clock"></i> ${booking.slot}</div>
                <div><i class="fas fa-ticket-alt"></i> ${booking.reference}</div>
            </div>
            ${booking.status === 'confirmed' ? `
                <div class="booking-actions">
                    <button class="btn btn-cancel" onclick="cancelBooking('${booking.id}')">
                        <i class="fas fa-times"></i> Cancel Booking
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId: currentUser.uid })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Booking cancelled successfully', 'Booking Cancelled!');
            loadUserBookings(); // Refresh bookings list
        } else {
            showError(result.message || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        showError('Failed to cancel booking');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showSuccess(message, title = 'Success!') {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').style.display = 'block';
}

function showBookingSuccess(booking) {
    document.getElementById('successTitle').textContent = 'Booking Confirmed!';
    document.getElementById('successMessage').textContent = 'Your booking has been confirmed!';
    document.getElementById('bookingDetails').innerHTML = `
        <div class="booking-details" style="margin-top: 20px; text-align: left;">
            <div><strong>Ground:</strong> ${booking.ground}</div>
            <div><strong>Location:</strong> ${booking.location}</div>
            <div><strong>Date:</strong> ${formatDate(booking.date)}</div>
            <div><strong>Time:</strong> ${booking.slot}</div>
            <div><strong>Reference:</strong> ${booking.reference}</div>
        </div>
    `;
    document.getElementById('successModal').style.display = 'block';
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Add interactive event listeners for booking steps
document.addEventListener('DOMContentLoaded', function() {
    const groundSelect = document.getElementById('groundSelect');
    const bookingDate = document.getElementById('bookingDate');
    const timeSlot = document.getElementById('timeSlot');
    
    if (groundSelect) {
        groundSelect.addEventListener('change', function() {
            updateBookingSteps();
            loadAvailableSlots();
        });
    }
    
    if (bookingDate) {
        bookingDate.addEventListener('change', function() {
            updateBookingSteps();
            loadAvailableSlots();
        });
    }
    
    if (timeSlot) {
        timeSlot.addEventListener('change', function() {
            updateBookingSteps();
        });
    }
});

// Make functions globally available
window.cancelBooking = cancelBooking;
window.closeModal = closeModal;
