// Bottom Sheet Component - iOS-style slide-up modals
// ====================================================

export class BottomSheet {
    constructor(contentHTML, options = {}) {
        this.options = {
            dismissible: true,
            snapPoints: ['90%'], // Can be ['40%', '90%'] for multi-snap sheets
            onDismiss: null,
            ...options
        };
        this.contentHTML = contentHTML;
        this.element = null;
        this.overlay = null;
        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
    }

    /**
     * Show the bottom sheet
     */
    show() {
        this.createElements();
        this.attachListeners();

        // Animate in
        requestAnimationFrame(() => {
            this.overlay.classList.add('visible');
            this.element.classList.add('visible');
        });

        // Add class to body to prevent scrolling
        document.body.style.overflow = 'hidden';
    }

    /**
     * Dismiss the bottom sheet
     */
    dismiss() {
        this.element.classList.remove('visible');
        this.overlay.classList.remove('visible');

        // Restore body scrolling
        document.body.style.overflow = '';

        setTimeout(() => {
            this.element?.remove();
            this.overlay?.remove();

            // Call dismiss callback if provided
            if (this.options.onDismiss) {
                this.options.onDismiss();
            }
        }, 300);
    }

    /**
     * Create overlay and sheet elements
     */
    createElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'bottom-sheet-overlay';

        if (this.options.dismissible) {
            this.overlay.addEventListener('click', () => {
                this.dismiss();
            });
        }

        // Create sheet
        this.element = document.createElement('div');
        this.element.className = 'bottom-sheet';
        this.element.innerHTML = `
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-content">
                ${this.contentHTML}
            </div>
        `;

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.element);
    }

    /**
     * Attach drag/swipe listeners for dismissal
     */
    attachListeners() {
        const handle = this.element.querySelector('.bottom-sheet-handle');
        const content = this.element.querySelector('.bottom-sheet-content');

        // Mouse/touch start
        const startHandler = (e) => {
            if (!this.options.dismissible) return;

            this.isDragging = true;
            this.startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
            this.element.style.transition = 'none';
        };

        // Mouse/touch move
        const moveHandler = (e) => {
            if (!this.isDragging) return;

            this.currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            const diff = this.currentY - this.startY;

            // Only allow dragging down (positive diff)
            if (diff > 0) {
                this.element.style.transform = `translateY(${diff}px)`;

                // Fade out overlay proportionally
                const opacity = Math.max(0, 1 - (diff / 300));
                this.overlay.style.opacity = opacity;
            }
        };

        // Mouse/touch end
        const endHandler = () => {
            if (!this.isDragging) return;

            this.isDragging = false;
            this.element.style.transition = '';
            this.overlay.style.opacity = '';

            const diff = this.currentY - this.startY;

            // Dismiss if dragged down more than 100px
            if (diff > 100) {
                this.dismiss();
            } else {
                // Snap back
                this.element.style.transform = 'translateY(0)';
            }
        };

        // Attach to handle
        handle.addEventListener('mousedown', startHandler);
        handle.addEventListener('touchstart', startHandler, { passive: true });

        // Attach to document for move/end (so it works even if cursor leaves handle)
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('touchmove', moveHandler, { passive: true });
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchend', endHandler);

        // Clean up listeners when dismissed
        this.element.addEventListener('remove', () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('mouseup', endHandler);
            document.removeEventListener('touchend', endHandler);
        });

        // Prevent scroll on content while dragging
        content.addEventListener('touchstart', (e) => {
            // Only prevent default if content is scrolled to top
            if (content.scrollTop === 0 && !this.isDragging) {
                // Allow dragging from content top
            }
        }, { passive: true });
    }

    /**
     * Update sheet content dynamically
     */
    setContent(newContentHTML) {
        const contentDiv = this.element?.querySelector('.bottom-sheet-content');
        if (contentDiv) {
            contentDiv.innerHTML = newContentHTML;
        }
    }

    /**
     * Check if sheet is currently shown
     */
    isVisible() {
        return this.element && this.element.classList.contains('visible');
    }
}

// Export a helper function for quick bottom sheets
export function showBottomSheet(contentHTML, options = {}) {
    const sheet = new BottomSheet(contentHTML, options);
    sheet.show();
    return sheet;
}
