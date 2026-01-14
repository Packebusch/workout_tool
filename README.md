# Workout Tracker

A privacy-focused Progressive Web App (PWA) for tracking multiple workout types with iOS-style design. Built with vanilla JavaScript to provide a native app experience that respects your privacy—all data stays on your device.

## Features

### 🎯 Core Workout Tracking
- **Multiple Workout Types**: Burpees, push-ups, squats, pull-ups, and more
- **Quick Count Buttons**: Fast, single-tap counting for rapid workout logging
- **Countdown Timers**: Configurable rest timers with haptic feedback
- **Progress Tracking**: Visual progress bars and live statistics
- **Keyboard Support**: Spacebar for hands-free rep counting

### 📱 iOS-Style Interface
- **Bottom Tab Navigation**: Four tabs - Workout, History, Coach, Settings
- **Native-Like Design**: iOS design system with SF Symbols-inspired icons
- **Dark Mode**: Beautiful dark theme optimized for OLED displays
- **Haptic Feedback**: Tactile responses on supported devices
- **Notch Support**: Respects iPhone safe areas and Dynamic Island
- **Bottom Sheet Modals**: Native iOS-style modal interactions

### 📊 History & Analytics
- **Complete Workout History**: Every session automatically saved
- **Detailed Statistics**: View performance trends and averages
- **7-Day & 30-Day Views**: Quick overview of recent activity
- **Progressive Overload Tracking**: See your strength improvements over time
- **Export Data**: Download all your data as JSON

### 🎓 Personal Coach
- **Smart Recommendations**: Daily workout suggestions based on your history
- **Recovery Awareness**: Monitors workout frequency and suggests rest
- **Goal Suggestions**: AI-powered goals tailored to your fitness level
- **Soreness Tracking**: Log muscle soreness to optimize recovery
- **Performance Insights**: Analyze trends and patterns

### 🎯 Goal Setting
- **Custom Goals**: Set targets for any workout type
- **Progress Tracking**: Visual indicators showing goal completion
- **Smart Milestones**: Automatically suggested based on your performance
- **Achievement Tracking**: Celebrate when you hit your targets

### 🔒 Privacy First
- **100% Local Storage**: All data stored in your browser, never uploaded
- **No Tracking**: Zero analytics, cookies, or third-party scripts
- **No Account Required**: Start using immediately
- **Full Data Control**: Export or delete your data anytime
- **Offline-Ready**: Works without internet connection

### 💾 Progressive Web App
- **Install to Home Screen**: Feels like a native app
- **Offline Support**: Service worker caching
- **Fast Loading**: Optimized performance
- **Regular Updates**: Auto-updates when online

## Installation

### Web Browser
1. Visit the hosted URL or open `index.html` locally
2. Works on all modern browsers (Chrome, Firefox, Safari, Edge)

### Install as PWA (Recommended)

**iPhone/iPad:**
1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

**Android:**
1. Open in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen" or "Install App"
4. Tap "Install"

**Desktop (Chrome/Edge):**
1. Look for install icon in address bar
2. Click "Install"
3. App opens in standalone window

## Usage

### Workout Tab

**Starting a Workout:**
1. Select your workout type from the dropdown
2. Use Quick Count buttons (1, 3, 5 reps) for fast logging
3. Or use the +/- buttons for precise control
4. Timer automatically tracks your workout duration
5. Complete and save when finished

**Rest Timers:**
- Configure custom rest periods (30s, 60s, 90s, etc.)
- Countdown with visual and haptic feedback
- Audio notification when rest is complete

### History Tab

**View Your Progress:**
- See all completed workouts in chronological order
- Toggle between 7-day and 30-day views
- View detailed stats for each session
- Export all data as JSON
- Clear individual workouts or entire history

**Statistics Include:**
- Total workouts completed
- Total reps across all exercises
- Average performance
- Best single-session performance
- Calorie estimates

### Coach Tab

**Daily Recommendations:**
- Personalized workout suggestions
- Rest day recommendations when needed
- Goal progress tracking
- Soreness monitoring
- Performance insights

**Features:**
- Smart rest day detection
- Recovery-aware programming
- Goal suggestion system
- Muscle soreness logging
- Trend analysis

### Settings Tab

**Data Management:**
- Export all data (JSON format)
- Clear all data and reset app
- View app information

## Technical Details

### Built With
- **HTML5**: Semantic markup with accessibility
- **CSS3**: Modern layouts with CSS Grid/Flexbox
- **Vanilla JavaScript**: Zero dependencies, ES6+ features
- **localStorage API**: Client-side data persistence
- **Service Worker**: Offline support and caching
- **Web Audio API**: Sound effects and notifications
- **Vibration API**: Haptic feedback on supported devices

### Architecture
```
workout_tool/
├── index.html              # Main app shell
├── styles.css              # iOS-style design system
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── src/
    ├── app.js              # Main application controller
    ├── services/           # Core services
    │   ├── StorageManager.js
    │   └── ThemeService.js
    ├── ui/                 # UI controllers
    │   ├── HistoryUIController.js
    │   ├── SettingsController.js
    │   ├── TabNavigationController.js
    │   └── BottomSheet.js
    └── utils/
        └── haptics.js      # Haptic feedback
```

### Design System
- **Colors**: iOS semantic color system
- **Typography**: SF Pro-inspired font stack
- **Spacing**: 8px base grid system
- **Radius**: Consistent border radius scale
- **Shadows**: Layered shadow system
- **Transitions**: Native-feeling animations

### Browser Compatibility

**Minimum Requirements:**
- Modern browser (2020+)
- JavaScript enabled
- localStorage support
- CSS Grid/Flexbox support

**Tested On:**
- iOS Safari 14+
- Chrome 90+
- Firefox 88+
- Edge 90+

**PWA Features:**
- Service Worker support
- Web App Manifest support
- Add to Home Screen capability

## Data & Privacy

### What Gets Stored
All data is stored locally in your browser using localStorage:
- Workout sessions (date, type, reps, duration)
- Goals and progress
- Soreness logs
- Coach insights
- User preferences

### What Does NOT Get Stored
- ❌ No user accounts
- ❌ No personal information
- ❌ No analytics or tracking
- ❌ No cookies (except localStorage)
- ❌ No server uploads

### Data Management
- **Export**: Download all your data as JSON
- **Clear**: Delete all data from the app
- **Local Only**: Data never leaves your device
- **Browser-Specific**: Data tied to browser/device

## Keyboard Shortcuts

- **Spacebar**: Count a rep (when workout active)
- **Enter**: Start/complete workout
- **Escape**: Close modals

## Troubleshooting

### PWA Not Installing
- Ensure using HTTPS (or localhost)
- Try clearing browser cache
- Check browser supports PWA features
- On iOS, must use Safari

### Data Not Saving
- Check localStorage is enabled
- Verify not in private/incognito mode
- Try different browser
- Check storage quota not exceeded

### Haptics Not Working
- Only works on supported devices (iPhone, Android)
- Check device settings allow vibration
- Web vibration API must be supported

### Audio Not Playing
- Interact with page before sounds play (browser requirement)
- Check device not muted
- Verify browser allows audio

## Calorie Estimation

**Modified Burpee Formula:**
```
Calories = (duration_minutes × 10) + (total_reps × 1)
```

**Other Exercises:**
Estimates based on standard metabolic equivalents (METs) for each exercise type.

Note: Calorie estimates are approximate and vary by individual factors (weight, intensity, form).

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast text (WCAG AA compliant)
- Large touch targets (min 44×44px)
- Respects prefers-reduced-motion
- Focus visible indicators

## Performance

- **First Load**: < 1s (cached)
- **Interaction**: < 100ms response time
- **Bundle Size**: < 200KB total
- **Offline**: Fully functional offline after first visit
- **Optimized**: Minimal JavaScript, efficient rendering

## Development

### Local Development
```bash
# Serve locally
python3 -m http.server 8080

# Or use any static server
npx serve .
```

### Project Structure
- No build process required
- No npm dependencies
- Pure HTML/CSS/JS
- ES6 modules for organization

## Future Enhancements

Possible additions:
- Light mode support
- Custom workout types
- Workout templates
- Rest day scheduling
- Charts and graphs
- Social features
- Apple Health integration
- More detailed analytics

## Contributing

This is a personal project, but suggestions are welcome:
1. Open an issue for bugs
2. Suggest features via issues
3. Privacy-first approach mandatory
4. Keep dependencies at zero

## Support

For issues:
1. Check browser console for errors
2. Verify JavaScript is enabled
3. Try clearing browser cache
4. Use a supported browser
5. Check localStorage is available

## License

Free to use for personal fitness tracking.

---

**Track. Progress. Achieve. 💪**

Built for fitness enthusiasts who value privacy and want a simple, effective way to track their workouts without sharing data with third parties.
