/**
 * WP 3D Flipbook Engine
 * Main JavaScript file for handling 3D flipbook functionality
 */

(function($) {
    'use strict';

    // Global configuration
    let pdfjsLib = window['pdfjs-dist/build/pdf'];
    let flipbooks = {};

    // Initialize PDF.js
    if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    class WP3DFlipbook {
        constructor(container, config) {
            this.container = container;
            this.config = config;
            this.currentPage = 1;
            this.totalPages = 0;
            this.zoomLevel = config.zoom_level || 1;
            this.isFullscreen = false;
            this.isLoading = true;
            this.pages = [];
            this.thumbnails = [];
            
            this.init();
        }

        init() {
            this.setupElements();
            this.bindEvents();
            this.loadPDF();
        }

        setupElements() {
            this.viewer = this.container.find('.wp3d-flipbook-viewer');
            this.pagesContainer = this.container.find('.wp3d-flipbook-pages');
            this.loadingElement = this.container.find('.wp3d-flipbook-loading');
            this.controls = this.container.find('.wp3d-flipbook-controls');
            this.thumbnailsContainer = this.container.find('.wp3d-flipbook-thumbnails');
            this.thumbnailsContent = this.container.find('.wp3d-flipbook-thumbnails-content');
            
            // Setup control buttons
            this.prevBtn = this.container.find('.wp3d-flipbook-prev');
            this.nextBtn = this.container.find('.wp3d-flipbook-next');
            this.zoomInBtn = this.container.find('.wp3d-flipbook-zoom-in');
            this.zoomOutBtn = this.container.find('.wp3d-flipbook-zoom-out');
            this.fullscreenBtn = this.container.find('.wp3d-flipbook-fullscreen');
            this.currentPageSpan = this.container.find('.wp3d-flipbook-current-page');
            this.totalPagesSpan = this.container.find('.wp3d-flipbook-total-pages');

            // Hide controls if not enabled
            if (!this.config.show_controls) {
                this.controls.hide();
            }

            // Hide thumbnails if not enabled
            if (!this.config.show_thumbnails) {
                this.thumbnailsContainer.hide();
            }
        }

        bindEvents() {
            // Navigation events
            this.prevBtn.on('click', () => this.previousPage());
            this.nextBtn.on('click', () => this.nextPage());
            
            // Zoom events
            this.zoomInBtn.on('click', () => this.zoomIn());
            this.zoomOutBtn.on('click', () => this.zoomOut());
            
            // Fullscreen events
            this.fullscreenBtn.on('click', () => this.toggleFullscreen());
            
            // Keyboard events
            $(document).on('keydown.flipbook', (e) => this.handleKeyboard(e));
            
            // Mouse events
            this.viewer.on('click', (e) => this.handleClick(e));
            
            // Touch events for mobile
            this.viewer.on('touchstart', (e) => this.handleTouchStart(e));
            this.viewer.on('touchend', (e) => this.handleTouchEnd(e));
            
            // Window resize
            $(window).on('resize.flipbook', () => this.handleResize());
            
            // Auto-hide controls
            if (this.config.show_controls) {
                this.viewer.on('mousemove', () => this.showControls());
                this.viewer.on('mouseleave', () => this.hideControls());
            }
        }

        async loadPDF() {
            try {
                this.showLoading();
                
                // Load PDF document
                const loadingTask = pdfjsLib.getDocument(this.config.pdf_url);
                const pdf = await loadingTask.promise;
                
                this.totalPages = pdf.numPages;
                this.totalPagesSpan.text(this.totalPages);
                
                // Load first few pages
                await this.loadInitialPages(pdf);
                
                // Generate thumbnails if enabled
                if (this.config.show_thumbnails) {
                    await this.generateThumbnails(pdf);
                }
                
                this.hideLoading();
                this.renderPage(1);
                
                // Track view
                this.trackView();
                
                // Auto-play if enabled
                if (this.config.auto_play) {
                    this.startAutoPlay();
                }
                
            } catch (error) {
                console.error('Error loading PDF:', error);
                this.showError('Failed to load PDF file');
            }
        }

        async loadInitialPages(pdf) {
            const pagesToLoad = Math.min(5, this.totalPages);
            
            for (let i = 1; i <= pagesToLoad; i++) {
                const page = await pdf.getPage(i);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: this.zoomLevel });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                this.pages[i] = {
                    canvas: canvas,
                    viewport: viewport,
                    page: page
                };
            }
        }

        async generateThumbnails(pdf) {
            const thumbnailScale = 0.2;
            
            for (let i = 1; i <= this.totalPages; i++) {
                const page = await pdf.getPage(i);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: thumbnailScale });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                this.thumbnails[i] = canvas;
                
                // Create thumbnail element
                const thumbnail = $(`
                    <div class="wp3d-flipbook-thumbnail" data-page="${i}">
                        <img src="${canvas.toDataURL()}" alt="Page ${i}">
                    </div>
                `);
                
                thumbnail.on('click', () => this.goToPage(i));
                this.thumbnailsContent.append(thumbnail);
            }
        }

        async loadPage(pageNumber) {
            if (this.pages[pageNumber]) {
                return this.pages[pageNumber];
            }
            
            try {
                const loadingTask = pdfjsLib.getDocument(this.config.pdf_url);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(pageNumber);
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: this.zoomLevel });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                this.pages[pageNumber] = {
                    canvas: canvas,
                    viewport: viewport,
                    page: page
                };
                
                return this.pages[pageNumber];
            } catch (error) {
                console.error('Error loading page:', error);
                return null;
            }
        }

        renderPage(pageNumber) {
            if (pageNumber < 1 || pageNumber > this.totalPages) {
                return;
            }
            
            this.currentPage = pageNumber;
            this.currentPageSpan.text(pageNumber);
            
            // Update button states
            this.prevBtn.prop('disabled', pageNumber <= 1);
            this.nextBtn.prop('disabled', pageNumber >= this.totalPages);
            
            // Update thumbnail selection
            this.thumbnailsContainer.find('.wp3d-flipbook-thumbnail').removeClass('active');
            this.thumbnailsContainer.find(`[data-page="${pageNumber}"]`).addClass('active');
            
            // Clear current pages
            this.pagesContainer.empty();
            
            // Render current page
            this.renderSinglePage(pageNumber);
            
            // Track interaction
            this.trackInteraction('page_change', { page: pageNumber });
        }

        renderSinglePage(pageNumber) {
            const pageData = this.pages[pageNumber];
            if (!pageData) {
                this.loadPage(pageNumber).then(() => this.renderSinglePage(pageNumber));
                return;
            }
            
            const pageElement = $(`
                <div class="wp3d-flipbook-page" data-page="${pageNumber}">
                    <div class="wp3d-flipbook-page-front">
                        <img src="${pageData.canvas.toDataURL()}" alt="Page ${pageNumber}">
                    </div>
                </div>
            `);
            
            this.pagesContainer.append(pageElement);
            
            // Add 3D effect
            this.add3DEffect(pageElement);
        }

        add3DEffect(pageElement) {
            // Simple 3D effect using CSS transforms
            pageElement.css({
                'transform': 'rotateY(0deg)',
                'transition': 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            // Add hover effect
            pageElement.on('mouseenter', function() {
                $(this).css('transform', 'rotateY(5deg) scale(1.02)');
            }).on('mouseleave', function() {
                $(this).css('transform', 'rotateY(0deg) scale(1)');
            });
        }

        previousPage() {
            if (this.currentPage > 1) {
                this.renderPage(this.currentPage - 1);
            }
        }

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.renderPage(this.currentPage + 1);
            }
        }

        goToPage(pageNumber) {
            this.renderPage(pageNumber);
        }

        zoomIn() {
            this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
            this.updateZoom();
        }

        zoomOut() {
            this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
            this.updateZoom();
        }

        updateZoom() {
            this.pagesContainer.css('transform', `scale(${this.zoomLevel})`);
            this.trackInteraction('zoom', { level: this.zoomLevel });
        }

        toggleFullscreen() {
            if (!this.isFullscreen) {
                this.enterFullscreen();
            } else {
                this.exitFullscreen();
            }
        }

        enterFullscreen() {
            this.container.addClass('fullscreen');
            this.isFullscreen = true;
            this.fullscreenBtn.text('⛶');
            this.trackInteraction('fullscreen_enter');
        }

        exitFullscreen() {
            this.container.removeClass('fullscreen');
            this.isFullscreen = false;
            this.fullscreenBtn.text('⛶');
            this.trackInteraction('fullscreen_exit');
        }

        handleKeyboard(e) {
            if (!this.isFullscreen && !this.container.is(':focus')) {
                return;
            }
            
            switch (e.keyCode) {
                case 37: // Left arrow
                    e.preventDefault();
                    this.previousPage();
                    break;
                case 39: // Right arrow
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 38: // Up arrow
                    e.preventDefault();
                    this.zoomIn();
                    break;
                case 40: // Down arrow
                    e.preventDefault();
                    this.zoomOut();
                    break;
                case 27: // Escape
                    if (this.isFullscreen) {
                        this.exitFullscreen();
                    }
                    break;
            }
        }

        handleClick(e) {
            const rect = this.viewer[0].getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            if (x < width / 3) {
                this.previousPage();
            } else if (x > (width * 2) / 3) {
                this.nextPage();
            }
        }

        handleTouchStart(e) {
            this.touchStartX = e.originalEvent.touches[0].clientX;
        }

        handleTouchEnd(e) {
            if (!this.touchStartX) return;
            
            const touchEndX = e.originalEvent.changedTouches[0].clientX;
            const diff = this.touchStartX - touchEndX;
            const threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextPage();
                } else {
                    this.previousPage();
                }
            }
            
            this.touchStartX = null;
        }

        handleResize() {
            // Recalculate dimensions if needed
            if (this.isFullscreen) {
                this.viewer.css({
                    width: '100vw',
                    height: '100vh'
                });
            }
        }

        showControls() {
            this.controls.removeClass('hidden');
            clearTimeout(this.controlsTimeout);
            this.controlsTimeout = setTimeout(() => this.hideControls(), 3000);
        }

        hideControls() {
            this.controls.addClass('hidden');
        }

        showLoading() {
            this.loadingElement.removeClass('hidden');
            this.isLoading = true;
        }

        hideLoading() {
            this.loadingElement.addClass('hidden');
            this.isLoading = false;
        }

        showError(message) {
            this.hideLoading();
            this.pagesContainer.html(`
                <div class="wp3d-flipbook-error">
                    <div class="wp3d-flipbook-error-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `);
        }

        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => {
                if (this.currentPage < this.totalPages) {
                    this.nextPage();
                } else {
                    this.stopAutoPlay();
                }
            }, 3000);
        }

        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }

        trackView() {
            $.ajax({
                url: wp3d_flipbook_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wp3d_flipbook_track_view',
                    flipbook_id: this.config.id.replace('wp3d-flipbook-', '').split('-')[0],
                    nonce: wp3d_flipbook_ajax.nonce
                }
            });
        }

        trackInteraction(type, data = {}) {
            $.ajax({
                url: wp3d_flipbook_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wp3d_flipbook_track_interaction',
                    flipbook_id: this.config.id.replace('wp3d-flipbook-', '').split('-')[0],
                    interaction_type: type,
                    interaction_data: data,
                    nonce: wp3d_flipbook_ajax.nonce
                }
            });
        }

        destroy() {
            // Clean up event listeners
            $(document).off('keydown.flipbook');
            $(window).off('resize.flipbook');
            
            // Stop auto-play
            this.stopAutoPlay();
            
            // Remove from global registry
            delete flipbooks[this.config.id];
        }
    }

    // Initialize flipbooks when DOM is ready
    $(document).ready(function() {
        $('.wp3d-flipbook-container').each(function() {
            const container = $(this);
            const configData = container.data('config');
            
            if (configData) {
                const flipbook = new WP3DFlipbook(container, configData);
                flipbooks[configData.id] = flipbook;
            }
        });
    });

    // Make flipbook class available globally
    window.WP3DFlipbook = WP3DFlipbook;
    window.flipbooks = flipbooks;

})(jQuery);