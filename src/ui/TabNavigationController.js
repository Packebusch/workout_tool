// Tab Navigation Controller - iOS-style bottom tab bar
// ======================================================

export class TabNavigationController {
    static currentTab = 'workout';

    /**
     * Initialize tab navigation system
     */
    static init() {
        this.attachTabListeners();
        this.restoreLastTab();
    }

    /**
     * Attach click listeners to all tab buttons
     */
    static attachTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');

        console.log('TabNavigationController: Found', tabButtons.length, 'tab buttons');

        if (tabButtons.length === 0) {
            console.error('TabNavigationController: No tab buttons found! Check HTML structure.');
            return;
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = button.dataset.tab;
                console.log('TabNavigationController: Switching to tab:', tab);
                this.switchTab(tab);
            });
        });
    }

    /**
     * Switch to a different tab
     */
    static switchTab(tabName) {
        // Deactivate all tabs and views
        document.querySelectorAll('.tab-button').forEach(btn =>
            btn.classList.remove('active')
        );
        document.querySelectorAll('.tab-view').forEach(view =>
            view.classList.remove('active')
        );

        // Activate selected tab and view
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const tabView = document.getElementById(`${tabName}-view`);

        if (tabButton && tabView) {
            tabButton.classList.add('active');
            tabView.classList.add('active');

            this.currentTab = tabName;
            localStorage.setItem('last_active_tab', tabName);

            // Trigger tab-specific initialization
            this.onTabActivated(tabName);
        }
    }

    /**
     * Handle tab activation events
     */
    static onTabActivated(tabName) {
        switch(tabName) {
            case 'history':
                // Refresh history view when tab becomes active
                if (window.workoutApp && window.workoutApp.renderHistoryView) {
                    window.workoutApp.renderHistoryView();
                }
                break;

            case 'coach':
                // Refresh coach recommendations
                if (window.workoutApp && window.workoutApp.coachUI) {
                    window.workoutApp.coachUI.refresh();
                }
                break;

            case 'settings':
                // Update theme selector to match current theme
                this.updateThemeSelector();
                break;
        }
    }

    /**
     * Restore last active tab on app load
     */
    static restoreLastTab() {
        const lastTab = localStorage.getItem('last_active_tab');

        // Only restore if it's not the workout tab (workout is default)
        if (lastTab && lastTab !== 'workout') {
            this.switchTab(lastTab);
        }
    }

    /**
     * Update theme selector in settings to match current theme
     */
    static updateThemeSelector() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            // Import ThemeService dynamically to avoid circular dependency
            import('../services/ThemeService.js').then(({ ThemeService }) => {
                const savedPreference = ThemeService.getSavedPreference();
                themeSelect.value = savedPreference;
            });
        }
    }

    /**
     * Get current active tab
     */
    static getCurrentTab() {
        return this.currentTab;
    }

    /**
     * Programmatically navigate to a tab
     */
    static navigateTo(tabName) {
        this.switchTab(tabName);
    }
}
