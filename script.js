// Global variables
let currentUser = null;
let currentUserType = null;
let currentStep = 1;
let totalSteps = 3;
let userData = {
    users: [],
    trainers: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data from localStorage
    loadUserData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up BMI calculation
    setupBMICalculation();
});

// Set up BMI calculation
function setupBMICalculation() {
    const weightInput = document.getElementById('user-weight');
    const heightInput = document.getElementById('user-height');
    
    if (weightInput && heightInput) {
        weightInput.addEventListener('input', calculateBMI);
        heightInput.addEventListener('input', calculateBMI);
    }
}

// Calculate BMI
function calculateBMI() {
    const weight = parseFloat(document.getElementById('user-weight').value);
    const height = parseFloat(document.getElementById('user-height').value);
    
    if (weight && height && height > 0) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const roundedBMI = Math.round(bmi * 10) / 10;
        
        // Update BMI display
        document.getElementById('bmi-value').textContent = roundedBMI;
        
        // Determine BMI category
        let category = '';
        let categoryClass = '';
        
        if (bmi < 18.5) {
            category = 'Underweight';
            categoryClass = 'underweight';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal';
            categoryClass = 'normal';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            categoryClass = 'overweight';
        } else {
            category = 'Obese';
            categoryClass = 'obese';
        }
        
        const categoryElement = document.getElementById('bmi-category');
        categoryElement.textContent = category;
        categoryElement.className = `bmi-category ${categoryClass}`;
        
        // Update BMI chart
        const fillPercentage = Math.min(Math.max((bmi - 15) / (40 - 15) * 100, 0), 100);
        document.getElementById('bmi-fill').style.width = `${fillPercentage}%`;
    }
}

// Onboarding Functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Hide current step
            document.getElementById(`step-${currentStep}`).classList.remove('active');
            
            // Show next step
            currentStep++;
            document.getElementById(`step-${currentStep}`).classList.add('active');
            
            // Update navigation buttons
            updateNavigationButtons();
            updateProgressBar();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        
        // Show previous step
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        
        // Update navigation buttons
        updateNavigationButtons();
        updateProgressBar();
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const completeBtn = document.getElementById('complete-btn');
    
    // Show/hide previous button
    if (currentStep > 1) {
        prevBtn.style.display = 'inline-flex';
    } else {
        prevBtn.style.display = 'none';
    }
    
    // Show/hide next/complete buttons
    if (currentStep < totalSteps) {
        nextBtn.style.display = 'inline-flex';
        completeBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'none';
        completeBtn.style.display = 'inline-flex';
    }
}

function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            field.focus();
            alert(`Please fill in the ${field.previousElementSibling.textContent} field.`);
            return false;
        }
    }
    
    return true;
}

function completeOnboarding(event) {
    event.preventDefault();
    
    if (validateCurrentStep()) {
        // Collect all form data
        const onboardingData = {
            age: document.getElementById('user-age').value,
            gender: document.getElementById('user-gender').value,
            weight: document.getElementById('user-weight').value,
            height: document.getElementById('user-height').value,
            bmi: document.getElementById('bmi-value').textContent,
            bmiCategory: document.getElementById('bmi-category').textContent,
            fitnessGoals: document.getElementById('fitness-goals').value,
            yogaExperience: document.getElementById('yoga-experience').value,
            primaryYogaGoal: document.getElementById('primary-yoga-goal').value,
            currentFrequency: document.getElementById('current-frequency').value,
            primaryReason: document.getElementById('primary-reason').value,
            desiredFrequency: document.getElementById('desired-frequency').value,
            preferredSessionLength: document.getElementById('preferred-session-length').value,
            completedAt: new Date().toISOString()
        };
        
        // Update current user with onboarding data
        if (currentUser) {
            currentUser.onboardingData = onboardingData;
            
            // Update in userData
            const userIndex = userData.users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                userData.users[userIndex] = currentUser;
                saveUserData();
            }
        }
        
        // Close onboarding modal
        document.getElementById('onboarding-modal').classList.remove('active');
        
        // Show success message
        alert('Profile completed successfully! Your yoga journey is now personalized for you.');
        
        // Update dashboard with personalized content
        updatePersonalizedDashboard();
        
        // Show user dashboard
        document.getElementById('user-dashboard').classList.add('active');
        document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}!`;
        updateUserStats();
    }
}

function updatePersonalizedDashboard() {
    if (currentUser && currentUser.onboardingData) {
        const data = currentUser.onboardingData;
        
        // Update user stats based on onboarding data
        if (data.yogaExperience === 'complete-beginner') {
            currentUser.streak = 0;
            currentUser.averageAccuracy = 0;
        } else if (data.yogaExperience === 'beginner') {
            currentUser.streak = Math.floor(Math.random() * 7) + 1;
            currentUser.averageAccuracy = Math.floor(Math.random() * 20) + 60;
        } else if (data.yogaExperience === 'intermediate') {
            currentUser.streak = Math.floor(Math.random() * 14) + 7;
            currentUser.averageAccuracy = Math.floor(Math.random() * 20) + 70;
        } else {
            currentUser.streak = Math.floor(Math.random() * 30) + 15;
            currentUser.averageAccuracy = Math.floor(Math.random() * 15) + 80;
        }
        
        saveUserData();
        updateUserStats();
    }
}

function showOnboardingModal() {
    document.getElementById('onboarding-modal').classList.add('active');
    currentStep = 1;
    updateNavigationButtons();
    updateProgressBar();
}

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('sthiraAIUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('sthiraAIUserData', JSON.stringify(userData));
}

// Set up event listeners
function setupEventListeners() {
    // Prevent form submission from refreshing the page
    document.addEventListener('submit', function(e) {
        e.preventDefault();
    });
}

// Show authentication modal
function showAuthModal(userType) {
    currentUserType = userType;
    const modal = document.getElementById('auth-modal');
    const loginTitle = document.getElementById('login-title');
    const signupTitle = document.getElementById('signup-title');
    
    if (userType === 'user') {
        loginTitle.textContent = 'Login as User';
        signupTitle.textContent = 'Sign Up as User';
    } else {
        loginTitle.textContent = 'Login as Trainer';
        signupTitle.textContent = 'Sign Up as Trainer';
    }
    
    modal.classList.add('active');
    switchAuthTab('login');
}

// Close authentication modal
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('active');
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tabBtn => tabBtn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    }
}

// Handle login
function handleLogin(event) {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    const userType = currentUserType;
    const users = userType === 'user' ? userData.users : userData.trainers;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        loginUser(userType);
    } else {
        alert('Invalid email or password');
    }
}

// Handle signup
function handleSignup(event) {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    const userType = currentUserType;
    const users = userType === 'user' ? userData.users : userData.trainers;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        alert('User with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        joinDate: new Date().toISOString(),
        streak: 0,
        totalSessions: 0,
        averageAccuracy: 0
    };
    
    if (userType === 'trainer') {
        newUser.experience = 0;
        newUser.specialization = '';
        newUser.rating = 0;
        newUser.totalStudents = 0;
        newUser.activeCourses = 0;
    }
    
    users.push(newUser);
    saveUserData();
    
    currentUser = newUser;
    loginUser(userType);
}

// Login user and show appropriate dashboard
function loginUser(userType) {
    closeAuthModal();
    
    // Hide landing page
    document.getElementById('landing-page').classList.remove('active');
    
    if (userType === 'user') {
        // Check if user has completed onboarding
        if (!currentUser.onboardingData) {
            // Show onboarding modal for new users
            showOnboardingModal();
        } else {
            // Show user dashboard
            document.getElementById('user-dashboard').classList.add('active');
            document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}!`;
            updateUserStats();
        }
    } else {
        // Show trainer dashboard
        document.getElementById('trainer-dashboard').classList.add('active');
        document.getElementById('trainer-name').textContent = `Welcome, ${currentUser.name}!`;
        updateTrainerStats();
    }
}

// Logout user
function logout() {
    currentUser = null;
    currentUserType = null;
    
    // Hide all dashboards
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Show landing page
    document.getElementById('landing-page').classList.add('active');
    
    // Clear forms
    document.querySelectorAll('form').forEach(form => form.reset());
}

// Update user statistics
function updateUserStats() {
    if (!currentUser) return;
    
    document.getElementById('streak-count').textContent = currentUser.streak || 0;
    document.getElementById('rank-position').textContent = `#${getUserRank()}`;
    document.getElementById('session-time').textContent = Math.floor(Math.random() * 60) + 15;
    document.getElementById('accuracy-score').textContent = `${currentUser.averageAccuracy || 85}%`;
}

// Update trainer statistics
function updateTrainerStats() {
    if (!currentUser) return;
    
    // Update trainer stats in the dashboard
    const statCards = document.querySelectorAll('#trainer-overview-section .stat-card h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = currentUser.rating || '4.8';
        statCards[1].textContent = currentUser.totalStudents || 156;
        statCards[2].textContent = currentUser.activeCourses || 12;
        statCards[3].textContent = '89%'; // Monthly performance
    }
}

// Get user rank based on streak
function getUserRank() {
    const sortedUsers = userData.users.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    const userIndex = sortedUsers.findIndex(u => u.id === currentUser.id);
    return userIndex + 1;
}

// Show dashboard section
function showDashboardSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('#user-dashboard .dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all sidebar items
    document.querySelectorAll('#user-dashboard .sidebar-menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }
    
    // Add active class to corresponding sidebar item
    const sidebarItem = document.querySelector(`#user-dashboard .sidebar-menu li[onclick*="${sectionName}"]`);
    if (sidebarItem) {
        sidebarItem.classList.add('active');
    }
}

// Show trainer section
function showTrainerSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('#trainer-dashboard .dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all sidebar items
    document.querySelectorAll('#trainer-dashboard .sidebar-menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`trainer-${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }
    
    // Add active class to corresponding sidebar item
    const sidebarItem = document.querySelector(`#trainer-dashboard .sidebar-menu li[onclick*="${sectionName}"]`);
    if (sidebarItem) {
        sidebarItem.classList.add('active');
    }
}

// Get AI health recommendation
function getHealthRecommendation() {
    const concern = document.getElementById('health-concern').value;
    
    if (!concern.trim()) {
        alert('Please describe your health concern');
        return;
    }
    
    const responseDiv = document.getElementById('health-response');
    
    // Simulate AI processing
    responseDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Analyzing your concern...</p>';
    responseDiv.classList.add('active');
    
    setTimeout(() => {
        const recommendations = generateHealthRecommendations(concern);
        const yogaSuggestion = getYogaSuggestions(concern);
        responseDiv.innerHTML = `
            <h4><i class="fas fa-brain"></i> AI Health Recommendation</h4>
            <p><strong>Your concern:</strong> ${concern}</p>
            <div class="recommendations">
                <h5>Recommended Actions:</h5>
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            <div class="yoga-suggestions">
                <h5>Suggested Yoga Practices:</h5>
                <p>${yogaSuggestion.text}</p>
                <button class="btn btn-primary" onclick="openYogaVideo('${yogaSuggestion.youtubeVideo}')">
                    <i class="fab fa-youtube"></i> Watch Yoga Tutorial
                </button>
            </div>
        `;
    }, 2000);
}

// Enhanced Health Recommendations with Accurate Medical Information
function generateHealthRecommendations(concern) {
    const concernLower = concern.toLowerCase();
    const recommendations = [];
    
    if (concernLower.includes('stress') || concernLower.includes('anxiety')) {
        recommendations.push('Practice diaphragmatic breathing: 4 seconds inhale, 4 seconds hold, 6 seconds exhale');
        recommendations.push('Engage in regular physical activity - aim for 150 minutes of moderate exercise per week');
        recommendations.push('Maintain consistent sleep schedule: 7-9 hours nightly for adults');
        recommendations.push('Limit caffeine intake to 400mg daily (about 4 cups of coffee)');
        recommendations.push('Consider mindfulness meditation: 10-20 minutes daily');
        recommendations.push('Maintain social connections and seek professional help if symptoms persist');
    } else if (concernLower.includes('back') || concernLower.includes('spine')) {
        recommendations.push('Practice gentle spinal mobility exercises daily');
        recommendations.push('Strengthen core muscles with planks and bird-dog exercises');
        recommendations.push('Maintain neutral spine alignment during daily activities');
        recommendations.push('Use ergonomic furniture and adjust workstation height');
        recommendations.push('Apply heat therapy for 15-20 minutes to reduce muscle tension');
        recommendations.push('Consult healthcare provider if pain persists beyond 2 weeks');
    } else if (concernLower.includes('flexibility') || concernLower.includes('stiff')) {
        recommendations.push('Perform dynamic stretching before exercise and static stretching after');
        recommendations.push('Focus on hip-opening poses: pigeon pose, butterfly pose, lizard pose');
        recommendations.push('Warm up muscles for 5-10 minutes before stretching');
        recommendations.push('Stay hydrated: aim for 8-10 glasses of water daily');
        recommendations.push('Practice yoga regularly: 2-3 sessions per week minimum');
        recommendations.push('Consider foam rolling for myofascial release');
    } else if (concernLower.includes('sleep') || concernLower.includes('insomnia')) {
        recommendations.push('Maintain consistent sleep schedule, even on weekends');
        recommendations.push('Create cool, dark, quiet sleep environment (65-68°F)');
        recommendations.push('Avoid screens 1 hour before bedtime');
        recommendations.push('Practice relaxation techniques: progressive muscle relaxation');
        recommendations.push('Limit daytime naps to 20-30 minutes');
        recommendations.push('Avoid large meals, caffeine, and alcohol 3 hours before bed');
    } else if (concernLower.includes('energy') || concernLower.includes('fatigue')) {
        recommendations.push('Maintain balanced diet with complex carbohydrates and lean proteins');
        recommendations.push('Stay hydrated: drink water throughout the day');
        recommendations.push('Get regular exercise: 30 minutes daily improves energy levels');
        recommendations.push('Ensure adequate iron intake: leafy greens, lean meats, legumes');
        recommendations.push('Practice stress management techniques');
        recommendations.push('Consider B-vitamin supplementation if deficient');
    } else {
        recommendations.push('Maintain regular yoga practice: 3-4 sessions per week');
        recommendations.push('Focus on proper breathing techniques during practice');
        recommendations.push('Listen to your body and modify poses as needed');
        recommendations.push('Stay consistent with your wellness routine');
        recommendations.push('Combine yoga with cardiovascular exercise');
        recommendations.push('Maintain balanced nutrition and adequate hydration');
    }
    
    return recommendations;
}

// Enhanced yoga suggestions with YouTube integration
function getYogaSuggestions(concern) {
    const concernLower = concern.toLowerCase();
    
    if (concernLower.includes('stress') || concernLower.includes('anxiety')) {
        return {
            text: 'Try these calming poses: Child\'s Pose (Balasana), Legs-Up-the-Wall Pose (Viparita Karani), and Corpse Pose (Savasana) for relaxation.',
            youtubeVideo: 'https://www.youtube.com/watch?v=2MJGg-dUKh0'
        };
    } else if (concernLower.includes('back') || concernLower.includes('spine')) {
        return {
            text: 'Focus on back-strengthening poses: Cat-Cow Pose, Cobra Pose (Bhujangasana), and Spinal Twist (Ardha Matsyendrasana).',
            youtubeVideo: 'https://www.youtube.com/watch?v=JDcdhTuycOI'
        };
    } else if (concernLower.includes('flexibility') || concernLower.includes('stiff')) {
        return {
            text: 'Practice flexibility poses: Downward Dog, Forward Fold (Uttanasana), and Butterfly Pose (Baddha Konasana).',
            youtubeVideo: 'https://www.youtube.com/watch?v=DH7IjnXGfVY'
        };
    } else if (concernLower.includes('sleep') || concernLower.includes('insomnia')) {
        return {
            text: 'Try bedtime yoga: Legs-Up-the-Wall Pose, Reclining Butterfly Pose, and Corpse Pose for better sleep.',
            youtubeVideo: 'https://www.youtube.com/watch?v=2MJGg-dUKh0'
        };
    } else {
        return {
            text: 'Start with foundational poses: Mountain Pose (Tadasana), Warrior I (Virabhadrasana I), and Tree Pose (Vrikshasana).',
            youtubeVideo: 'https://www.youtube.com/watch?v=YlRZtr6DlBw'
        };
    }
}

// Comprehensive Yoga Pose Database
const yogaPosesDatabase = {
    'mountain': {
        name: 'Mountain Pose (Tadasana)',
        difficulty: 'Beginner',
        benefits: ['Improves posture', 'Strengthens legs', 'Enhances focus', 'Reduces stress'],
        alignment: ['Feet hip-width apart', 'Weight evenly distributed', 'Spine straight', 'Shoulders relaxed'],
        commonMistakes: ['Locking knees', 'Arching back', 'Tension in shoulders', 'Uneven weight distribution'],
        youtubeVideo: 'https://www.youtube.com/watch?v=YlRZtr6DlBw'
    },
    'downward-dog': {
        name: 'Downward-Facing Dog (Adho Mukha Svanasana)',
        difficulty: 'Beginner',
        benefits: ['Strengthens arms and legs', 'Stretches hamstrings', 'Improves circulation', 'Calms the mind'],
        alignment: ['Hands shoulder-width apart', 'Feet hip-width apart', 'Hips high', 'Straight arms'],
        commonMistakes: ['Bent knees', 'Arched back', 'Hands too close', 'Looking up'],
        youtubeVideo: 'https://www.youtube.com/watch?v=DH7IjnXGfVY'
    },
    'warrior1': {
        name: 'Warrior I (Virabhadrasana I)',
        difficulty: 'Intermediate',
        benefits: ['Strengthens legs', 'Opens chest', 'Improves balance', 'Builds confidence'],
        alignment: ['Front knee over ankle', 'Back leg straight', 'Hips square', 'Arms reaching up'],
        commonMistakes: ['Knee too far forward', 'Hips not square', 'Arching back', 'Back foot not grounded'],
        youtubeVideo: 'https://www.youtube.com/watch?v=3V-2qkMzdWY'
    },
    'warrior2': {
        name: 'Warrior II (Virabhadrasana II)',
        difficulty: 'Intermediate',
        benefits: ['Strengthens legs', 'Opens hips', 'Improves stamina', 'Builds focus'],
        alignment: ['Front knee over ankle', 'Back leg straight', 'Arms parallel to floor', 'Gaze over front hand'],
        commonMistakes: ['Knee collapsing inward', 'Arms not parallel', 'Hips not open', 'Leaning forward'],
        youtubeVideo: 'https://www.youtube.com/watch?v=3V-2qkMzdWY'
    },
    'tree': {
        name: 'Tree Pose (Vrikshasana)',
        difficulty: 'Beginner',
        benefits: ['Improves balance', 'Strengthens legs', 'Opens hips', 'Enhances focus'],
        alignment: ['Standing leg straight', 'Foot on inner thigh', 'Hips square', 'Arms overhead'],
        commonMistakes: ['Foot on knee', 'Hips not square', 'Standing leg bent', 'Arms not aligned'],
        youtubeVideo: 'https://www.youtube.com/watch?v=YlRZtr6DlBw'
    },
    'child': {
        name: 'Child\'s Pose (Balasana)',
        difficulty: 'Beginner',
        benefits: ['Relaxes spine', 'Reduces stress', 'Stretches hips', 'Calms nervous system'],
        alignment: ['Knees hip-width apart', 'Toes together', 'Arms extended', 'Forehead on mat'],
        commonMistakes: ['Knees too wide', 'Arms not extended', 'Tension in shoulders', 'Not relaxing'],
        youtubeVideo: 'https://www.youtube.com/watch?v=2MJGg-dUKh0'
    },
    'cobra': {
        name: 'Cobra Pose (Bhujangasana)',
        difficulty: 'Beginner',
        benefits: ['Strengthens back', 'Opens chest', 'Improves posture', 'Stretches abdomen'],
        alignment: ['Hands under shoulders', 'Elbows close to body', 'Chest lifted', 'Legs engaged'],
        commonMistakes: ['Arching too much', 'Hands too far forward', 'Elbows flared', 'Not engaging legs'],
        youtubeVideo: 'https://www.youtube.com/watch?v=JDcdhTuycOI'
    },
    'bridge': {
        name: 'Bridge Pose (Setu Bandhasana)',
        difficulty: 'Beginner',
        benefits: ['Strengthens back', 'Opens chest', 'Stretches spine', 'Calms mind'],
        alignment: ['Feet hip-width apart', 'Knees over ankles', 'Arms under body', 'Chest lifted'],
        commonMistakes: ['Knees too wide', 'Feet too far from body', 'Not lifting chest', 'Tension in neck'],
        youtubeVideo: 'https://www.youtube.com/watch?v=DH7IjnXGfVY'
    },
    'triangle': {
        name: 'Triangle Pose (Trikonasana)',
        difficulty: 'Intermediate',
        benefits: ['Stretches sides', 'Strengthens legs', 'Improves balance', 'Opens hips'],
        alignment: ['Wide stance', 'Front foot forward', 'Back foot parallel', 'Hand on shin or floor'],
        commonMistakes: ['Stance too narrow', 'Back foot not parallel', 'Collapsing into pose', 'Not reaching'],
        youtubeVideo: 'https://www.youtube.com/watch?v=3V-2qkMzdWY'
    },
    'plank': {
        name: 'Plank Pose (Phalakasana)',
        difficulty: 'Intermediate',
        benefits: ['Strengthens core', 'Builds arm strength', 'Improves posture', 'Enhances stability'],
        alignment: ['Body in straight line', 'Hands under shoulders', 'Core engaged', 'Legs straight'],
        commonMistakes: ['Hips too high', 'Hips sagging', 'Hands too wide', 'Not engaging core'],
        youtubeVideo: 'https://www.youtube.com/watch?v=DH7IjnXGfVY'
    }
};

// Analyze uploaded asana with comprehensive pose recognition
function analyzeAsana(input) {
    const file = input.files[0];
    if (!file) return;
    
    const analysisDiv = document.getElementById('asana-analysis');
    
    // Show loading
    analysisDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Analyzing your pose...</p>';
    analysisDiv.classList.add('active');
    
    // Simulate AI analysis with pose recognition
    setTimeout(() => {
        const detectedPose = detectYogaPose(); // Simulate pose detection
        const poseData = yogaPosesDatabase[detectedPose];
        
        analysisDiv.innerHTML = `
            <h4><i class="fas fa-camera"></i> Pose Analysis - ${poseData.name}</h4>
            <div class="analysis-results">
                <div class="pose-info">
                    <div class="pose-difficulty">
                        <span class="difficulty-badge ${poseData.difficulty.toLowerCase()}">${poseData.difficulty}</span>
                    </div>
                    <div class="pose-benefits">
                        <h5>Benefits:</h5>
                        <ul>
                            ${poseData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="accuracy-score">
                    <h5>Overall Accuracy: ${poseData.accuracy}%</h5>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${poseData.accuracy}%"></div>
                    </div>
                </div>
                <div class="alignment-check">
                    <h5>Alignment Check:</h5>
                    <ul>
                        ${poseData.alignment.map(item => `<li><i class="fas fa-check text-success"></i> ${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="common-mistakes">
                    <h5>Common Mistakes to Avoid:</h5>
                    <ul>
                        ${poseData.commonMistakes.map(mistake => `<li><i class="fas fa-exclamation-triangle text-warning"></i> ${mistake}</li>`).join('')}
                    </ul>
                </div>
                <div class="video-tutorial">
                    <h5>Learn More:</h5>
                    <button class="btn btn-primary" onclick="openYogaVideo('${poseData.youtubeVideo}')">
                        <i class="fab fa-youtube"></i> Watch Tutorial Video
                    </button>
                </div>
            </div>
        `;
        
        // Update user's accuracy score
        if (currentUser) {
            currentUser.averageAccuracy = Math.round((currentUser.averageAccuracy + poseData.accuracy) / 2);
            saveUserData();
            updateUserStats();
        }
    }, 3000);
}

// Simulate pose detection (in real app, this would use computer vision)
function detectYogaPose() {
    const poses = Object.keys(yogaPosesDatabase);
    const selectedPose = poses[Math.floor(Math.random() * poses.length)];
    
    // Add accuracy score to pose data
    yogaPosesDatabase[selectedPose].accuracy = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    return selectedPose;
}

// Select age group for kids yoga
function selectAgeGroup(ageGroup) {
    const ageBtns = document.querySelectorAll('.age-btn');
    const programCards = document.querySelectorAll('.program-card');
    
    // Update active age button
    ageBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide programs based on age group
    programCards.forEach(card => {
        const cardAge = card.dataset.age;
        if (ageGroup === 'all' || cardAge === ageGroup) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Open YouTube video in new tab
function openYogaVideo(videoUrl) {
    window.open(videoUrl, '_blank');
}

// Generate asana analysis
function generateAsanaAnalysis() {
    const accuracy = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    const feedback = [
        'Good alignment in your spine',
        'Proper breathing technique observed',
        'Stable foundation maintained'
    ];
    
    const improvements = [
        'Try to extend your arms more',
        'Focus on engaging your core muscles',
        'Keep your gaze steady and focused'
    ];
    
    return {
        accuracy: accuracy,
        feedback: feedback,
        improvements: improvements
    };
}

// Filter workshops by category
function filterWorkshops(category) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workshopCards = document.querySelectorAll('.workshop-card');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide workshop cards based on filter
    workshopCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Search trainers
function searchTrainers() {
    const searchTerm = document.getElementById('trainer-search').value.toLowerCase();
    const trainerCards = document.querySelectorAll('.trainer-card');
    
    trainerCards.forEach(card => {
        const trainerName = card.querySelector('h3').textContent.toLowerCase();
        const specialization = card.querySelector('.trainer-specialization').textContent.toLowerCase();
        const location = card.querySelector('.trainer-location').textContent.toLowerCase();
        
        if (trainerName.includes(searchTerm) || 
            specialization.includes(searchTerm) || 
            location.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Request call from trainer
function requestCall(trainerName) {
    alert(`Call request sent to ${trainerName}! They will contact you within 24 hours.`);
}

// Join course with trainer
function joinCourse(trainerName) {
    alert(`You have joined ${trainerName}'s course! Check your email for course details.`);
}

// Generate AI diet plan
function generateDietPlan(event) {
    event.preventDefault();
    
    const goal = document.getElementById('diet-goal').value;
    const type = document.getElementById('diet-type').value;
    const allergies = document.getElementById('allergies').value;
    const activityLevel = document.getElementById('activity-level').value;
    
    if (!goal || !type || !activityLevel) {
        alert('Please fill in all required fields');
        return;
    }
    
    const resultDiv = document.getElementById('diet-plan-result');
    
    // Show loading
    resultDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating your personalized diet plan...</p>';
    resultDiv.classList.add('active');
    
    setTimeout(() => {
        const dietPlan = generatePersonalizedDietPlan(goal, type, allergies, activityLevel);
        resultDiv.innerHTML = `
            <h4><i class="fas fa-brain"></i> Your AI-Generated Diet Plan</h4>
            <div class="plan-summary">
                <p><strong>Goal:</strong> ${goal.replace('-', ' ').toUpperCase()}</p>
                <p><strong>Diet Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p><strong>Activity Level:</strong> ${activityLevel.charAt(0).toUpperCase() + activityLevel.slice(1)}</p>
                ${allergies ? `<p><strong>Allergies:</strong> ${allergies}</p>` : ''}
            </div>
            <div class="meal-plan">
                <h5>Daily Meal Plan:</h5>
                <div class="meals">
                    ${dietPlan.meals.map(meal => `
                        <div class="meal">
                            <h6>${meal.name}</h6>
                            <ul>
                                ${meal.items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="nutrition-tips">
                <h5>Nutrition Tips:</h5>
                <ul>
                    ${dietPlan.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    }, 3000);
}

// Generate personalized diet plan
function generatePersonalizedDietPlan(goal, type, allergies, activityLevel) {
    const meals = [
        {
            name: 'Breakfast',
            items: getBreakfastItems(goal, type, allergies)
        },
        {
            name: 'Lunch',
            items: getLunchItems(goal, type, allergies)
        },
        {
            name: 'Dinner',
            items: getDinnerItems(goal, type, allergies)
        },
        {
            name: 'Snacks',
            items: getSnackItems(goal, type, allergies)
        }
    ];
    
    const tips = getNutritionTips(goal, type, activityLevel);
    
    return { meals, tips };
}

// Get breakfast items based on diet preferences
function getBreakfastItems(goal, type, allergies) {
    const items = [];
    
    if (type === 'vegan') {
        items.push('Oatmeal with berries and almond milk');
        items.push('Avocado toast on whole grain bread');
        items.push('Smoothie bowl with fruits and nuts');
    } else if (type === 'keto') {
        items.push('Eggs with avocado and spinach');
        items.push('Greek yogurt with nuts');
        items.push('Bulletproof coffee');
    } else {
        items.push('Greek yogurt with honey and granola');
        items.push('Scrambled eggs with vegetables');
        items.push('Whole grain toast with nut butter');
    }
    
    return items.slice(0, 2);
}

// Get lunch items based on diet preferences
function getLunchItems(goal, type, allergies) {
    const items = [];
    
    if (type === 'mediterranean') {
        items.push('Quinoa salad with vegetables');
        items.push('Grilled fish with roasted vegetables');
        items.push('Hummus with whole grain pita');
    } else if (type === 'vegetarian') {
        items.push('Lentil curry with brown rice');
        items.push('Vegetable stir-fry with tofu');
        items.push('Chickpea salad wrap');
    } else {
        items.push('Grilled chicken with sweet potato');
        items.push('Salmon with quinoa and vegetables');
        items.push('Turkey and vegetable wrap');
    }
    
    return items.slice(0, 2);
}

// Get dinner items based on diet preferences
function getDinnerItems(goal, type, allergies) {
    const items = [];
    
    if (type === 'paleo') {
        items.push('Grilled steak with roasted vegetables');
        items.push('Baked salmon with asparagus');
        items.push('Chicken stir-fry with vegetables');
    } else {
        items.push('Baked chicken with quinoa');
        items.push('Fish with steamed vegetables');
        items.push('Vegetable soup with whole grain bread');
    }
    
    return items.slice(0, 2);
}

// Get snack items based on diet preferences
function getSnackItems(goal, type, allergies) {
    const items = [];
    
    if (type === 'vegan') {
        items.push('Mixed nuts and dried fruits');
        items.push('Apple slices with almond butter');
        items.push('Hummus with vegetable sticks');
    } else {
        items.push('Greek yogurt with berries');
        items.push('Mixed nuts');
        items.push('Cheese and whole grain crackers');
    }
    
    return items.slice(0, 2);
}

// Get nutrition tips based on goals and activity level
function getNutritionTips(goal, type, activityLevel) {
    const tips = [];
    
    if (goal === 'weight-loss') {
        tips.push('Focus on portion control and eat smaller, frequent meals');
        tips.push('Include plenty of fiber-rich foods to stay full longer');
        tips.push('Stay hydrated with water throughout the day');
    } else if (goal === 'muscle-gain') {
        tips.push('Increase protein intake to support muscle growth');
        tips.push('Eat within 30 minutes after workouts');
        tips.push('Include complex carbohydrates for energy');
    } else {
        tips.push('Maintain a balanced diet with all food groups');
        tips.push('Eat regular meals to maintain stable energy');
        tips.push('Include a variety of colorful fruits and vegetables');
    }
    
    if (activityLevel === 'active') {
        tips.push('Increase calorie intake to fuel your active lifestyle');
        tips.push('Focus on post-workout nutrition for recovery');
    }
    
    return tips;
}

// Show recipe details
function showRecipe(recipeType) {
    const recipes = {
        'kitchari': {
            name: 'Ayurvedic Kitchari',
            ingredients: [
                '1 cup basmati rice',
                '1/2 cup yellow mung dal',
                '1 tbsp ghee',
                '1 tsp cumin seeds',
                '1 tsp turmeric',
                '1 tsp ginger (grated)',
                'Salt to taste',
                '4 cups water'
            ],
            instructions: [
                'Rinse rice and dal until water runs clear',
                'Heat ghee in a pot and add cumin seeds',
                'Add ginger and turmeric, stir for 30 seconds',
                'Add rice and dal, stir for 2 minutes',
                'Add water and salt, bring to boil',
                'Simmer for 20-25 minutes until soft',
                'Serve warm with fresh herbs'
            ]
        },
        'golden-milk': {
            name: 'Golden Milk (Turmeric Latte)',
            ingredients: [
                '1 cup milk (dairy or plant-based)',
                '1 tsp turmeric powder',
                '1/2 tsp cinnamon',
                '1/4 tsp ginger powder',
                'Pinch of black pepper',
                '1 tsp honey or maple syrup',
                '1 tsp coconut oil'
            ],
            instructions: [
                'Heat milk in a saucepan over medium heat',
                'Add turmeric, cinnamon, ginger, and black pepper',
                'Whisk continuously for 2-3 minutes',
                'Remove from heat and add honey',
                'Add coconut oil and whisk until frothy',
                'Strain if desired and serve warm'
            ]
        },
        'buddha-bowl': {
            name: 'Mediterranean Buddha Bowl',
            ingredients: [
                '1 cup cooked quinoa',
                '1/2 cup chickpeas',
                '1/2 avocado (sliced)',
                '1/2 cup cherry tomatoes',
                '1/4 cup cucumber (diced)',
                '2 tbsp olive oil',
                '1 tbsp lemon juice',
                'Salt and pepper to taste',
                'Fresh herbs (parsley, mint)'
            ],
            instructions: [
                'Cook quinoa according to package instructions',
                'Rinse and drain chickpeas',
                'Prepare vegetables and slice avocado',
                'Make dressing with olive oil, lemon juice, salt, and pepper',
                'Arrange quinoa in bowl as base',
                'Top with chickpeas, vegetables, and avocado',
                'Drizzle with dressing and garnish with herbs'
            ]
        }
    };
    
    const recipe = recipes[recipeType];
    if (recipe) {
        const modal = createRecipeModal(recipe);
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }
}

// Create recipe modal
function createRecipeModal(recipe) {
    const modal = document.createElement('div');
    modal.className = 'recipe-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    modal.innerHTML = `
        <div class="recipe-modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <span class="close-recipe" style="
                position: absolute;
                right: 20px;
                top: 20px;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            ">&times;</span>
            <h2>${recipe.name}</h2>
            <div class="recipe-ingredients">
                <h3>Ingredients:</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            <div class="recipe-instructions">
                <h3>Instructions:</h3>
                <ol>
                    ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                </ol>
            </div>
        </div>
    `;
    
    // Close modal functionality
    modal.querySelector('.close-recipe').onclick = () => {
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    return modal;
}

// Kids Yoga Programs with Cartoon Videos
const kidsYogaPrograms = {
    '3-5': [
        {
            name: 'Animal Yoga Adventure',
            description: 'Fun animal-themed poses that help kids develop strength, flexibility, and imagination.',
            duration: '15 minutes',
            features: ['Interactive', 'Story-based', 'Cartoon Characters'],
            youtubeVideo: 'https://www.youtube.com/watch?v=X655B4ISakg',
            cartoonVideo: 'https://www.youtube.com/watch?v=X655B4ISakg'
        },
        {
            name: 'Disney Yoga Fun',
            description: 'Yoga poses inspired by Disney characters for magical movement.',
            duration: '12 minutes',
            features: ['Disney Characters', 'Magical Stories', 'Fun Music'],
            youtubeVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs',
            cartoonVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs'
        }
    ],
    '6-8': [
        {
            name: 'Superhero Yoga',
            description: 'Empowering poses that make kids feel like superheroes while building confidence.',
            duration: '20 minutes',
            features: ['Confidence Building', 'Fun Games', 'Superhero Theme'],
            youtubeVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs',
            cartoonVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs'
        },
        {
            name: 'Paw Patrol Yoga',
            description: 'Adventure-themed yoga with Paw Patrol characters.',
            duration: '18 minutes',
            features: ['Adventure Theme', 'Team Building', 'Problem Solving'],
            youtubeVideo: 'https://www.youtube.com/watch?v=X655B4ISakg',
            cartoonVideo: 'https://www.youtube.com/watch?v=X655B4ISakg'
        }
    ],
    '9-12': [
        {
            name: 'Harry Potter Yoga',
            description: 'Magical yoga journey through Hogwarts with spells and poses.',
            duration: '25 minutes',
            features: ['Fantasy Theme', 'Magic Spells', 'Adventure'],
            youtubeVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs',
            cartoonVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs'
        },
        {
            name: 'Sports Yoga Challenge',
            description: 'Yoga poses inspired by different sports for active kids.',
            duration: '22 minutes',
            features: ['Sports Theme', 'Competition', 'Team Spirit'],
            youtubeVideo: 'https://www.youtube.com/watch?v=X655B4ISakg',
            cartoonVideo: 'https://www.youtube.com/watch?v=X655B4ISakg'
        }
    ],
    '13-17': [
        {
            name: 'Teen Mindfulness',
            description: 'Stress-relief focused practice with breathing techniques and meditation.',
            duration: '30 minutes',
            features: ['Stress Relief', 'Mindfulness', 'Meditation'],
            youtubeVideo: 'https://www.youtube.com/watch?v=2MJGg-dUKh0',
            cartoonVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs'
        },
        {
            name: 'Anime Yoga Flow',
            description: 'Dynamic yoga inspired by anime characters and movements.',
            duration: '28 minutes',
            features: ['Anime Theme', 'Dynamic Flow', 'Cool Poses'],
            youtubeVideo: 'https://www.youtube.com/watch?v=DH7IjnXGfVY',
            cartoonVideo: 'https://www.youtube.com/watch?v=U9Q6FKF12Qs'
        }
    ]
};

// Start kids yoga program
function startKidsYogaProgram(programName, ageGroup) {
    const programs = kidsYogaPrograms[ageGroup];
    const program = programs.find(p => p.name === programName);
    
    if (program) {
        // Show program options
        const modal = createKidsYogaModal(program);
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }
}

// Create kids yoga program modal
function createKidsYogaModal(program) {
    const modal = document.createElement('div');
    modal.className = 'kids-yoga-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    modal.innerHTML = `
        <div class="kids-modal-content" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 20px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            color: white;
            text-align: center;
        ">
            <span class="close-kids-modal" style="
                position: absolute;
                right: 20px;
                top: 20px;
                font-size: 24px;
                cursor: pointer;
                color: white;
            ">&times;</span>
            <h2 style="margin-bottom: 20px;">${program.name}</h2>
            <p style="margin-bottom: 20px; font-size: 16px;">${program.description}</p>
            <div style="margin: 20px 0;">
                <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; margin: 5px; display: inline-block;">${program.duration}</span>
                ${program.features.map(feature => `<span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; margin: 5px; display: inline-block;">${feature}</span>`).join('')}
            </div>
            <div style="margin: 30px 0;">
                <h3 style="margin-bottom: 15px;">Choose Your Experience:</h3>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="openKidsVideo('${program.youtubeVideo}')" style="background: white; color: #667eea; border: none; padding: 15px 25px; border-radius: 10px; font-weight: bold;">
                        <i class="fas fa-play"></i> Regular Tutorial
                    </button>
                    <button class="btn btn-primary" onclick="openKidsVideo('${program.cartoonVideo}')" style="background: #ff6b6b; color: white; border: none; padding: 15px 25px; border-radius: 10px; font-weight: bold;">
                        <i class="fas fa-child"></i> Cartoon Version
                    </button>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h4 style="margin-bottom: 10px;">Benefits for Kids:</h4>
                <ul style="text-align: left; list-style: none; padding: 0;">
                    <li style="margin: 5px 0;"><i class="fas fa-heart" style="color: #ff6b6b; margin-right: 10px;"></i> Improves physical health and flexibility</li>
                    <li style="margin: 5px 0;"><i class="fas fa-brain" style="color: #4ecdc4; margin-right: 10px;"></i> Enhances focus and concentration</li>
                    <li style="margin: 5px 0;"><i class="fas fa-smile" style="color: #ffe66d; margin-right: 10px;"></i> Reduces stress and promotes happiness</li>
                    <li style="margin: 5px 0;"><i class="fas fa-users" style="color: #a8e6cf; margin-right: 10px;"></i> Builds confidence and social skills</li>
                </ul>
            </div>
        </div>
    `;
    
    // Close modal functionality
    modal.querySelector('.close-kids-modal').onclick = () => {
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    return modal;
}

// Open kids yoga video
function openKidsVideo(videoUrl) {
    window.open(videoUrl, '_blank');
}

// Trainer Dashboard Functions

// Update trainer profile
function updateTrainerProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('trainer-name-input').value;
    const experience = document.getElementById('trainer-experience-input').value;
    const specialization = document.getElementById('trainer-specialization-input').value;
    const location = document.getElementById('trainer-location-input').value;
    const bio = document.getElementById('trainer-bio').value;
    
    if (!name || !experience || !specialization || !location) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update current user data
    if (currentUser) {
        currentUser.name = name;
        currentUser.experience = parseInt(experience);
        currentUser.specialization = specialization;
        currentUser.location = location;
        currentUser.bio = bio;
        
        // Update in userData
        const trainerIndex = userData.trainers.findIndex(t => t.id === currentUser.id);
        if (trainerIndex !== -1) {
            userData.trainers[trainerIndex] = currentUser;
            saveUserData();
        }
        
        // Update display
        document.getElementById('trainer-name').textContent = `Welcome, ${currentUser.name}!`;
        
        alert('Profile updated successfully!');
    }
}

// Filter requests by status
function filterRequests(status) {
    const filterBtns = document.querySelectorAll('#trainer-requests-section .filter-btn');
    const requestCards = document.querySelectorAll('.request-card');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide request cards based on filter
    requestCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Accept training request
function acceptRequest(studentName) {
    alert(`Training request from ${studentName} has been accepted! You can now schedule sessions.`);
    // In a real app, this would update the database and send notifications
}

// Decline training request
function declineRequest(studentName) {
    if (confirm(`Are you sure you want to decline the training request from ${studentName}?`)) {
        alert(`Training request from ${studentName} has been declined.`);
        // In a real app, this would update the database and send notifications
    }
}

// Start session with student
function startSession(studentName) {
    alert(`Starting session with ${studentName}. Session will begin shortly.`);
    // In a real app, this would initiate a video call or session
}

// Message student
function messageStudent(studentName) {
    alert(`Opening chat with ${studentName}.`);
    // In a real app, this would open a messaging interface
}

// Create new course
function createNewCourse() {
    alert('Opening course creation form...');
    // In a real app, this would open a course creation modal/form
}

// Edit course
function editCourse(courseId) {
    alert(`Opening course editor for ${courseId}...`);
    // In a real app, this would open the course editing interface
}

// View students in course
function viewStudents(courseId) {
    alert(`Showing students enrolled in ${courseId}...`);
    // In a real app, this would show a list of enrolled students
}

// Publish course
function publishCourse(courseId) {
    if (confirm(`Are you sure you want to publish ${courseId}? This will make it available for enrollment.`)) {
        alert(`Course ${courseId} has been published successfully!`);
        // In a real app, this would update the course status and notify users
    }
}

// Create new workshop
function createNewWorkshop() {
    alert('Opening workshop creation form...');
    // In a real app, this would open a workshop creation modal/form
}

// Manage workshop
function manageWorkshop(workshopId) {
    alert(`Opening workshop management for ${workshopId}...`);
    // In a real app, this would open workshop management interface
}

// View workshop participants
function viewParticipants(workshopId) {
    alert(`Showing participants for ${workshopId}...`);
    // In a real app, this would show a list of workshop participants
}

// Join WhatsApp group
function joinWhatsAppGroup(groupType) {
    const groupLinks = {
        'general': 'https://chat.whatsapp.com/general-group-link',
        'beginners': 'https://chat.whatsapp.com/beginners-group-link',
        'advanced': 'https://chat.whatsapp.com/advanced-group-link'
    };
    
    const link = groupLinks[groupType];
    if (link) {
        alert(`Opening WhatsApp group for ${groupType}...`);
        // In a real app, this would open the WhatsApp group link
        // window.open(link, '_blank');
    }
}

// Manage community event
function manageEvent(eventId) {
    alert(`Opening event management for ${eventId}...`);
    // In a real app, this would open event management interface
}

// Initialize demo data
function initializeDemoData() {
    if (userData.users.length === 0) {
        userData.users = [
            {
                id: 1,
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                password: 'password123',
                joinDate: '2024-01-15',
                streak: 28,
                totalSessions: 45,
                averageAccuracy: 92
            },
            {
                id: 2,
                name: 'Mike Chen',
                email: 'mike@example.com',
                password: 'password123',
                joinDate: '2024-01-20',
                streak: 25,
                totalSessions: 38,
                averageAccuracy: 88
            }
        ];
        
        userData.trainers = [
            {
                id: 1,
                name: 'Emma Wilson',
                email: 'emma@example.com',
                password: 'password123',
                joinDate: '2024-01-10',
                experience: 5,
                specialization: 'Hatha Yoga, Meditation',
                rating: 4.9,
                totalStudents: 200,
                activeCourses: 8
            }
        ];
        
        saveUserData();
    }
}

// Initialize demo data when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDemoData();
});
