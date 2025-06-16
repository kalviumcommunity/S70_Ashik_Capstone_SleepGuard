

# SleepGuard - Mobile Usage Monitoring for Student Sleep Cycles

## Idea Brief
SleepGuard is an app designed to help students maintain healthy sleep cycles by monitoring late-night mobile usage. The app tracks when students use their phones after midnight and alerts their parents if it's for non-educational purposes. This helps reduce distractions, encourage healthier sleep habits, and foster better time management. The app includes features such as custom bedtime schedules, usage tracking, parental notifications, and weekly sleep reports.

## Key Features

### 1. Authentication & Security
- Google & Email Sign-In
- JWT & Cookie-Based Session Management
- Two-Factor Authentication (2FA) - OTP-based
- Role-Based Access Control (Student, Parent)
- Data Encryption (Secure Data Transmission)

### 2. Mobile Usage Monitoring
- Tracks usage of apps after midnight
- Categorizes app usage (e.g., Social Media, Games, Educational Apps)
- Notifies parents if non-educational apps are being used late at night
- Tracks total screen time after midnight

### 3. Parental Notifications
- Alerts sent to parents when their child uses their phone past a set bedtime
- Option for parents to customize message content (e.g., “Your child is using Instagram at 12:30 AM”)
- Option to limit app usage time for students

### 4. Custom Bedtime Settings
- Students set their preferred bedtime (e.g., 10:00 PM) and wake-up time
- Option for parents to restrict screen time after a certain hour
- Gentle reminders to students to prepare for bed

### 5. Sleep Reports & Insights
- Weekly or monthly reports summarizing late-night phone usage
- Visual analytics of usage trends (graphs, charts)
- Comparison of predicted vs. actual sleep patterns
- Tips for better sleep management based on usage data

### 6. AI-Driven Sleep Suggestions
- Personalized suggestions to improve sleep habits
- AI-based analysis of student’s app usage and its correlation with sleep quality

### 7. Security & Compliance
- GDPR & Data Privacy Compliance
- Secure Login (Email, Google Sign-In)
- End-to-end encryption for data (both in-transit and at-rest)

## Tech Stack

### Frontend:
- React Native (for cross-platform mobile app development)
- Redux (State Management)
- Tailwind CSS (UI Styling)
- Framer Motion (Animations)

### Backend:
- Node.js & Express.js (API)
- MongoDB + Mongoose (Database)
- Firebase Cloud Messaging (for notifications)
- JWT & OAuth (Authentication)

### Deployment & DevOps:
- Vercel (Frontend Deployment)
- Render (Backend Deployment)

## Development Timeline (4 Weeks)

### Week 1: Core Setup & Authentication

#### Day 1-3: Project Setup & Authentication
- Initialize React Native app and set up the project structure.
- Set up GitHub repository for version control.
- Implement JWT Authentication for login and user registration.
- Configure Google OAuth sign-in.
- Set up Node.js & Express.js backend for API handling.

#### Day 4-5: Role-Based Access & Security
- Implement Two-Factor Authentication (2FA) using OTP for secure login.
- Set up role-based access for students and parents.
- Ensure session management with token expiry and auto-logout functionality.

#### Day 6-7: Bedtime Settings & Usage Restrictions
- Implement student profile creation with customizable sleep schedules.
- Allow parents to set screen-time limits for students.
- Implement functionality to set alerts for phone usage after the student’s bedtime.

### Week 2: Mobile Usage Monitoring & Parent Notifications

#### Day 8-10: Mobile Usage Tracking
- Implement app tracking functionality (detect when a student uses their phone after midnight).
- Track which apps are used (non-educational apps flagged).
- Categorize apps into educational and non-educational groups.

#### Day 11-12: Parent Notifications
- Set up Firebase Cloud Messaging for push notifications to parents.
- Design and implement notifications that alert parents when their child is using their phone after bedtime.
- Customize notification content (e.g., "Your child is using Instagram at 12:30 AM").

#### Day 13-14: Notification Settings & Customization
- Allow parents to choose which types of notifications they want to receive.
- Allow students to modify their bedtime alerts.

### Week 3: Sleep Reports, AI Integration & Insights

#### Day 15-16: Sleep Reports & Analytics
- Implement weekly or monthly reports that summarize phone usage trends after midnight.
- Create visual analytics (charts, graphs) comparing usage with sleep recommendations.
- Allow students to view reports on their phone usage patterns.

#### Day 17-18: AI-Driven Sleep Suggestions
- Integrate AI capabilities to provide personalized sleep improvement suggestions.
- Use machine learning to analyze data and recommend optimal bedtimes or app usage reduction.

#### Day 19-20: AI-based App Usage Insights
- Implement AI analysis to determine the correlation between phone usage and sleep quality.
- Provide tips and suggestions based on insights from app usage data.

### Week 4: Testing, Final Touches & Deployment

#### Day 21-23: Security, Testing & Optimization
- Test app security features, ensuring data encryption is in place.
- Optimize performance for tracking app usage without excessive battery consumption.
- Test push notifications and reminders for accuracy.

#### Day 24-26: User Testing & UI Enhancements
- Conduct beta testing with a select group of users (students and parents).
- Gather feedback to improve app UI/UX and overall functionality.
- Refine user interface and adjust features based on feedback.

#### Day 27-28: Deployment & Final Launch
- Deploy the frontend to Vercel and backend to Render.
- Publish the app to the Google Play Store and Apple App Store.
- Submit project to GitHub and make it open source for future contributions.
