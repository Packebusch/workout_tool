# GitHub Pages Deployment Guide

## Quick Setup (5 minutes)

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Name your repository (e.g., `workout-tracker`)
3. Set to **Public** (required for free GitHub Pages)
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### 2. Push Your Code

```bash
cd /Users/tompackebusch/workspace/workout_tool

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/workout-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Source", select:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

### 4. Access Your Site

After 1-2 minutes, your site will be live at:
```
https://YOUR_USERNAME.github.io/workout-tracker/
```

GitHub will show the URL in the Pages settings.

## Before You Deploy - Update Legal Pages

**IMPORTANT:** Edit these files with your information:

### imprint.html
Replace the placeholders:
- `[Your Name / Company Name]`
- `[Your Street Address]`
- `[Your Postal Code, City]`
- `[Your Country]`
- `[your-email@example.com]`
- `[Your Phone Number]` (optional)

### privacy.html
Replace:
- `[Your Name / Company Name]`
- `[Your Address]`
- `[your-email@example.com]`

## Custom Domain (Optional)

To use your own domain (e.g., workout.yourdomain.com):

1. Add a file named `CNAME` to your repository:
   ```
   workout.yourdomain.com
   ```

2. In your DNS settings, add a CNAME record:
   - Name: `workout`
   - Value: `YOUR_USERNAME.github.io`

3. In GitHub Pages settings, enter your custom domain

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

Your site updates automatically within 1-2 minutes!

## Troubleshooting

### Site Not Loading?
- Wait 2-3 minutes after first deployment
- Check GitHub Pages settings show the correct branch
- Verify repository is Public

### 404 Error?
- Make sure `index.html` is in the root directory
- Check the branch and folder are set correctly in Pages settings

### Changes Not Showing?
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Clear browser cache
- Wait 1-2 minutes for GitHub to rebuild

## Migration Data

Users can migrate their data using the instructions in `MIGRATION_GUIDE.md`.

Share this link with users who want to migrate:
```
https://YOUR_USERNAME.github.io/workout-tracker/MIGRATION_GUIDE.md
```

Or create a help page that includes the migration instructions.
