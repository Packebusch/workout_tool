# LocalStorage Migration Guide

## Exporting Your Workout History

If you're moving to a new browser or device, follow these steps to migrate your workout data:

### Step 1: Export Data from Old Browser

1. Open the Workout Tracker in your current browser
2. Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools
3. Click on the **Console** tab
4. Copy and paste this command and press Enter:

```javascript
console.log(JSON.stringify({
  history: localStorage.getItem('burpeeWorkoutHistory'),
  streak: localStorage.getItem('workoutStreak')
}));
```

5. Right-click on the output and select **Copy object**
6. Paste it into a text file and save it (e.g., `workout-data.txt`)

### Step 2: Import Data into New Browser

1. Open the Workout Tracker in your new browser/device
2. Press `F12` to open Developer Tools
3. Click on the **Console** tab
4. Copy and paste the following command, replacing `YOUR_DATA_HERE` with the data you copied:

```javascript
// First, paste your exported data here
const data = YOUR_DATA_HERE;

// Then import it
if (data.history) {
  localStorage.setItem('burpeeWorkoutHistory', data.history);
}
if (data.streak) {
  localStorage.setItem('workoutStreak', data.streak);
}

// Reload the page to see your data
location.reload();
```

### Example

**Export looks like this:**
```json
{
  "history": "{\"sessions\":[{\"date\":\"2024-12-28T10:00:00.000Z\",\"reps\":145,\"calories\":185}]}",
  "streak": "{\"streak\":5,\"lastWorkoutDate\":\"Sat Dec 28 2024\",\"longestStreak\":10}"
}
```

**Import code:**
```javascript
const data = {
  "history": "{\"sessions\":[{\"date\":\"2024-12-28T10:00:00.000Z\",\"reps\":145,\"calories\":185}]}",
  "streak": "{\"streak\":5,\"lastWorkoutDate\":\"Sat Dec 28 2024\",\"longestStreak\":10}"
};

if (data.history) {
  localStorage.setItem('burpeeWorkoutHistory', data.history);
}
if (data.streak) {
  localStorage.setItem('workoutStreak', data.streak);
}

location.reload();
```

## Alternative: Manual Export/Import

### Export to JSON File

```javascript
// In Console of old browser
const exportData = {
  history: JSON.parse(localStorage.getItem('burpeeWorkoutHistory') || '{"sessions":[]}'),
  streak: JSON.parse(localStorage.getItem('workoutStreak') || '{"streak":0}')
};

// Copy this output and save to a file
console.log(JSON.stringify(exportData, null, 2));
```

### Import from JSON File

```javascript
// In Console of new browser
// Paste your exported data as the value of importData
const importData = {
  "history": {"sessions": [...]},
  "streak": {"streak": 5, ...}
};

localStorage.setItem('burpeeWorkoutHistory', JSON.stringify(importData.history));
localStorage.setItem('workoutStreak', JSON.stringify(importData.streak));

location.reload();
```

## Backup Recommendation

**Pro Tip:** Regularly backup your data by:
1. Export your data monthly
2. Save to a cloud storage (Google Drive, Dropbox, etc.)
3. Keep at least 2 backup copies

This ensures you never lose your workout history and streak!
