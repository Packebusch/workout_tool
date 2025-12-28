# Burpee Workout Tracker

A motivational web application for tracking your 20-minute burpee workout sessions. Built with vanilla HTML, CSS, and JavaScript for a fast, simple, and effective workout companion.

## Features

### Core Functionality
- **20-Minute Countdown Timer**: Visual timer counting down from 20:00 to 0:00
- **Rep Counter**: Large, easy-to-tap button to count each burpee rep
- **Progress Bar**: Visual representation of workout completion
- **Keyboard Support**: Press spacebar to count reps (hands-free!)

### Motivational System
- **Dynamic Messages**: Encouraging text messages at time intervals and rep milestones
- **Audio Cues**: Sound notifications for:
  - Workout start/completion
  - Time milestones (15min, 10min, 5min, 1min)
  - Rep milestones (every 25 reps, 100, 150, 200+)
- **Visual Effects**:
  - Color-coded timer (green → yellow → orange → red)
  - Pulsing animations on milestones
  - Celebration effects for achievements

### Metrics & Analytics
- **Calorie Estimation**: Real-time calorie burn calculation based on modified burpee formula
- **Pace Tracking**: Live display of reps per minute
- **Fitness Level Assessment**:
  - Beginner: < 4 reps/min
  - Intermediate: 4-7 reps/min
  - Advanced: 7-10 reps/min
  - Elite: > 10 reps/min

### Workout History
- **Session Tracking**: Automatically saves completed workouts to browser storage
- **Statistics Dashboard**: View total workouts, average reps, best performance, and total calories
- **Performance Trends**: Track your progress over time
- **Persistent Storage**: All data saved locally in your browser

## Installation

1. Download or clone all files to a local directory:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`

2. Open `index.html` in a modern web browser:
   - **Chrome** (recommended)
   - **Firefox**
   - **Safari**
   - **Edge**

No server or installation required! Just open the HTML file directly.

## Usage

### Starting a Workout

1. Open `index.html` in your browser
2. Click the **Start** button to begin your 20-minute countdown
3. The rep counter button will activate

### Counting Reps

**Two ways to count:**
- Click/tap the large **+ COUNT REP** button
- Press the **Spacebar** key (great for hands-free counting!)

### During the Workout

- **Pause**: Click pause to take a break (timer and counter pause)
- **Resume**: Click resume to continue
- **Reset**: Click reset to start over (confirms before resetting)

### After the Workout

When the timer reaches 0:00, you'll see:
- Complete workout statistics
- Your fitness level assessment
- Options to **Save** or **Discard** the workout

### Viewing History

1. Click **📜 View History** at the bottom
2. See all your past workouts with:
   - Date and time
   - Total reps and duration
   - Calories burned
   - Fitness level achieved
3. View overall statistics (total workouts, averages, best performance)
4. Clear history if needed

## Tips for Best Experience

### Mobile Use
- Works great on phones and tablets
- Large touch targets for easy tapping during workouts
- Add to home screen for quick access

### Audio
- Grant audio permissions when prompted for sound effects
- Adjust device volume for optimal alert levels

### Keyboard Shortcuts
- **Spacebar**: Count a rep (when workout is active)
- Great for using a wireless keyboard during floor workouts

### Workout Style
This tracker is optimized for:
- Modified burpees (without jumping)
- Mixing in knee pull-ups during the pushup position
- 20-minute continuous session

## Calorie Calculation Formula

The app uses this formula for modified burpees (no jumping):
```
Calories = (elapsed_minutes × 10) + (total_reps × 1)
```

Based on:
- Modified burpee workout: ~10 cal/min
- Calorie burn per rep: ~1 calorie

## Browser Compatibility

**Requires:**
- Modern browser (2020+)
- JavaScript enabled
- localStorage support (for history feature)
- Web Audio API support (for sound effects)

**Tested on:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy

All data is stored **locally in your browser**:
- No server uploads
- No account required
- No tracking or analytics
- Your workout data never leaves your device

To clear all data:
- Use the "Clear All History" button in the History panel
- Or clear your browser's localStorage

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast colors for visibility
- Large touch targets (min 44×44px)
- Respects `prefers-reduced-motion` setting

## Technical Details

**Built with:**
- Vanilla JavaScript (ES6+)
- CSS3 (Flexbox, Grid, Animations)
- HTML5 (Semantic markup)
- localStorage API
- Web Audio API

**No dependencies or frameworks required!**

## Troubleshooting

### Audio not playing
- Interact with the page first (click start)
- Check browser audio permissions
- Ensure device is not muted

### History not saving
- Check if browser allows localStorage
- Try a different browser
- Check browser privacy settings

### Button not responding
- Ensure workout is started
- Check if workout is paused
- Try refreshing the page

## Future Enhancements

Possible additions (not yet implemented):
- Custom timer durations
- Multiple workout types
- Rest interval timers
- Social sharing features
- Export history as CSV
- Progressive Web App (PWA) support

## Support

For issues or suggestions:
- Check browser console for errors
- Try a different browser
- Ensure JavaScript is enabled
- Clear browser cache and reload

## License

Free to use for personal fitness tracking.

---

**Stay strong and keep pushing! 💪**

Built for burpee enthusiasts who want to track progress and stay motivated.
