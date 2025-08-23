/**
 * FlipBook Pro - Main JavaScript
 */

(function($) {
    'use strict';
    
    class FlipBookPro {
        constructor(container) {
            this.container = container;
            this.$container = $(container);
            this.flipbookId = this.$container.data('flipbook-id');
            this.type = this.$container.data('flipbook-type');
            this.sourceUrl = this.$container.data('flipbook-source');
            this.autoplay = this.$container.data('flipbook-autoplay') === true;
            this.showControls = this.$container.data('flipbook-controls') === true;
            
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.book = null;
            this.pages = [];
            this.currentPage = 0;
            this.totalPages = 0;
            this.isAnimating = false;
            this.zoom = 1;
            this.isFullscreen = false;
            
            this.init();
        }
        
        init() {
            this.showLoading();
            this.loadFlipbookData()
                .then(() => this.setupThreeJS())
                .then(() => this.loadContent())
                .then(() => this.setupControls())
                .then(() => this.hideLoading())
                .catch(error => this.showError(error));
        }
        
        loadFlipbookData() {
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: flipbook_ajax.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'get_flipbook_data',
                        flipbook_id: this.flipbookId,
                        nonce: flipbook_ajax.nonce
                    },
                    success: (response) => {
                        if (response.success) {
                            this.flipbookData = response.data;
                            resolve();
                        } else {
                            reject(response.data || 'Failed to load flipbook data');
                        }
                    },
                    error: () => reject('AJAX request failed')
                });
            });
        }
        
        setupThreeJS() {
            const width = this.$container.width();
            const height = this.$container.height();
            
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xf0f0f0);
            
            // Camera
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            this.camera.position.set(0, 0, 5);
            
            // Renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(width, height);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Add renderer to container
            const canvasContainer = this.$container.find('.flipbook-canvas-container')[0];
            canvasContainer.appendChild(this.renderer.domElement);
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);
            
            // Controls
            this.setupMouseControls();
            
            // Start render loop
            this.animate();
        }
        
        setupMouseControls() {
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };
            
            const canvas = this.renderer.domElement;
            
            canvas.addEventListener('mousedown', (e) => {
                if (this.isAnimating) return;
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
                canvas.style.cursor = 'grabbing';
            });
            
            canvas.addEventListener('mousemove', (e) => {
                if (!isDragging || this.isAnimating) return;
                
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                
                // Rotate book based on mouse movement
                if (this.book) {
                    this.book.rotation.y += deltaX * 0.01;
                    this.book.rotation.x += deltaY * 0.01;
                    
                    // Limit rotation
                    this.book.rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, this.book.rotation.x));
                }
                
                previousMousePosition = { x: e.clientX, y: e.clientY };
            });
            
            canvas.addEventListener('mouseup', () => {
                isDragging = false;
                canvas.style.cursor = 'grab';
            });
            
            canvas.addEventListener('mouseleave', () => {
                isDragging = false;
                canvas.style.cursor = 'grab';
            });
            
            // Click to turn page
            canvas.addEventListener('click', (e) => {
                if (isDragging || this.isAnimating) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const centerX = rect.width / 2;
                
                if (x > centerX) {
                    this.nextPage();
                } else {
                    this.prevPage();
                }
            });
            
            // Zoom with mouse wheel
            canvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                const zoomSpeed = 0.1;
                const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
                this.setZoom(this.zoom + delta);
            });
        }
        
        loadContent() {
            return new Promise((resolve, reject) => {
                switch (this.type) {
                    case 'pdf':
                        this.loadPDF().then(resolve).catch(reject);
                        break;
                    case 'images':
                        this.loadImages().then(resolve).catch(reject);
                        break;
                    case 'html':
                        this.loadHTML().then(resolve).catch(reject);
                        break;
                    default:
                        reject('Unsupported flipbook type');
                }
            });
        }
        
        loadPDF() {
            return new Promise((resolve, reject) => {
                if (typeof pdfjsLib === 'undefined') {
                    reject('PDF.js library not loaded');
                    return;
                }
                
                pdfjsLib.getDocument(this.sourceUrl).promise.then((pdf) => {
                    this.totalPages = pdf.numPages;
                    const loadPromises = [];
                    
                    for (let i = 1; i <= this.totalPages; i++) {
                        loadPromises.push(this.loadPDFPage(pdf, i));
                    }
                    
                    Promise.all(loadPromises).then(() => {
                        this.createBook();
                        resolve();
                    }).catch(reject);
                }).catch(reject);
            });
        }
        
        loadPDFPage(pdf, pageNumber) {
            return new Promise((resolve) => {
                pdf.getPage(pageNumber).then((page) => {
                    const scale = 2; // Higher scale for better quality
                    const viewport = page.getViewport({ scale });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    page.render(renderContext).promise.then(() => {
                        const texture = new THREE.CanvasTexture(canvas);
                        texture.flipY = false;
                        this.pages[pageNumber - 1] = texture;
                        resolve();
                    });
                });
            });
        }
        
        loadImages() {
            return new Promise((resolve, reject) => {
                if (!this.flipbookData.pages || this.flipbookData.pages.length === 0) {
                    reject('No pages found');
                    return;
                }
                
                this.totalPages = this.flipbookData.pages.length;
                const loadPromises = [];
                
                this.flipbookData.pages.forEach((page, index) => {
                    loadPromises.push(this.loadImagePage(page.image_url, index));
                });
                
                Promise.all(loadPromises).then(() => {
                    this.createBook();
                    resolve();
                }).catch(reject);
            });
        }
        
        loadImagePage(imageUrl, index) {
            return new Promise((resolve, reject) => {
                const loader = new THREE.TextureLoader();
                loader.load(imageUrl, (texture) => {
                    texture.flipY = false;
                    this.pages[index] = texture;
                    resolve();
                }, undefined, reject);
            });
        }
        
        loadHTML() {
            // For HTML content, we'll create simple text pages for now
            // This could be enhanced to render actual HTML content
            return new Promise((resolve) => {
                this.totalPages = 1;
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1448; // A4 ratio
                const context = canvas.getContext('2d');
                
                // Simple HTML-to-canvas rendering
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = '#000000';
                context.font = '24px Arial';
                context.fillText('HTML Content', 50, 100);
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.flipY = false;
                this.pages[0] = texture;
                
                this.createBook();
                resolve();
            });
        }
        
        createBook() {
            this.book = new THREE.Group();
            
            // Create book geometry
            const pageWidth = 3;
            const pageHeight = 4;
            const pageThickness = 0.01;
            
            // Create pages
            for (let i = 0; i < this.totalPages; i++) {
                const pageGeometry = new THREE.BoxGeometry(pageWidth, pageHeight, pageThickness);
                const pageMaterial = new THREE.MeshLambertMaterial({ 
                    map: this.pages[i],
                    color: 0xffffff
                });
                
                const page = new THREE.Mesh(pageGeometry, pageMaterial);
                page.position.z = i * pageThickness;
                page.castShadow = true;
                page.receiveShadow = true;
                page.userData = { pageNumber: i };
                
                this.book.add(page);
            }
            
            // Add book to scene
            this.scene.add(this.book);
            
            // Position camera to show the book nicely
            this.camera.position.set(0, 0, 8);
            this.camera.lookAt(0, 0, 0);
            
            this.updatePageDisplay();
        }
        
        setupControls() {
            if (!this.showControls) return;
            
            const $controls = this.$container.find('.flipbook-controls');
            const $prevBtn = $controls.find('.flipbook-prev');
            const $nextBtn = $controls.find('.flipbook-next');
            const $fullscreenBtn = $controls.find('.flipbook-fullscreen');
            const $zoomInBtn = $controls.find('.flipbook-zoom-in');
            const $zoomOutBtn = $controls.find('.flipbook-zoom-out');
            
            $prevBtn.on('click', () => this.prevPage());
            $nextBtn.on('click', () => this.nextPage());
            $fullscreenBtn.on('click', () => this.toggleFullscreen());
            $zoomInBtn.on('click', () => this.zoomIn());
            $zoomOutBtn.on('click', () => this.zoomOut());
            
            // Keyboard controls
            $(document).on('keydown', (e) => {
                if (!this.$container.is(':visible')) return;
                
                switch (e.keyCode) {
                    case 37: // Left arrow
                        this.prevPage();
                        break;
                    case 39: // Right arrow
                        this.nextPage();
                        break;
                    case 27: // Escape
                        if (this.isFullscreen) this.toggleFullscreen();
                        break;
                }
            });
            
            this.updateControls();
        }
        
        animate() {
            requestAnimationFrame(() => this.animate());
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        }
        
        nextPage() {
            if (this.isAnimating || this.currentPage >= this.totalPages - 1) return;
            
            this.isAnimating = true;
            this.currentPage++;
            
            // Animate page turn
            this.animatePageTurn(true).then(() => {
                this.isAnimating = false;
                this.updatePageDisplay();
                this.updateControls();
            });
        }
        
        prevPage() {
            if (this.isAnimating || this.currentPage <= 0) return;
            
            this.isAnimating = true;
            this.currentPage--;
            
            // Animate page turn
            this.animatePageTurn(false).then(() => {
                this.isAnimating = false;
                this.updatePageDisplay();
                this.updateControls();
            });
        }
        
        animatePageTurn(forward) {
            return new Promise((resolve) => {
                if (!this.book) {
                    resolve();
                    return;
                }
                
                const duration = 800; // Animation duration in ms
                const startTime = Date.now();
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function
                    const easeInOutCubic = (t) => {
                        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                    };
                    
                    const easedProgress = easeInOutCubic(progress);
                    
                    // Rotate pages for turning effect
                    this.book.children.forEach((page, index) => {
                        if (forward && index <= this.currentPage) {
                            page.rotation.y = easedProgress * Math.PI;
                        } else if (!forward && index > this.currentPage) {
                            page.rotation.y = (1 - easedProgress) * Math.PI;
                        }
                    });
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Reset rotations
                        this.book.children.forEach((page, index) => {
                            if (index <= this.currentPage) {
                                page.rotation.y = Math.PI;
                                page.visible = false; // Hide turned pages
                            } else {
                                page.rotation.y = 0;
                                page.visible = true;
                            }
                        });
                        resolve();
                    }
                };
                
                animate();
            });
        }
        
        setZoom(newZoom) {
            this.zoom = Math.max(0.5, Math.min(3, newZoom));
            
            if (this.book) {
                this.book.scale.setScalar(this.zoom);
            }
        }
        
        zoomIn() {
            this.setZoom(this.zoom + 0.2);
        }
        
        zoomOut() {
            this.setZoom(this.zoom - 0.2);
        }
        
        toggleFullscreen() {
            if (this.isFullscreen) {
                this.exitFullscreen();
            } else {
                this.enterFullscreen();
            }
        }
        
        enterFullscreen() {
            const modal = $('#flipbook-modal');
            const modalBody = modal.find('.flipbook-modal-body');
            
            // Clone the flipbook container
            const $clone = this.$container.clone(true);
            $clone.css({
                width: '90vw',
                height: '90vh',
                maxWidth: 'none',
                maxHeight: 'none'
            });
            
            modalBody.html($clone);
            modal.show();
            
            this.isFullscreen = true;
            this.updateControls();
            
            // Handle modal close
            modal.find('.flipbook-modal-close, .flipbook-modal-backdrop').on('click', () => {
                this.exitFullscreen();
            });
        }
        
        exitFullscreen() {
            $('#flipbook-modal').hide();
            this.isFullscreen = false;
            this.updateControls();
        }
        
        updatePageDisplay() {
            const $currentPage = this.$container.find('.flipbook-current-page');
            const $totalPages = this.$container.find('.flipbook-total-pages');
            
            $currentPage.text(this.currentPage + 1);
            $totalPages.text(this.totalPages);
        }
        
        updateControls() {
            const $controls = this.$container.find('.flipbook-controls');
            const $prevBtn = $controls.find('.flipbook-prev');
            const $nextBtn = $controls.find('.flipbook-next');
            const $fullscreenBtn = $controls.find('.flipbook-fullscreen');
            
            $prevBtn.prop('disabled', this.currentPage <= 0);
            $nextBtn.prop('disabled', this.currentPage >= this.totalPages - 1);
            
            // Update fullscreen button icon
            $fullscreenBtn.find('.flipbook-icon').text(this.isFullscreen ? '⛶' : '⛶');
        }
        
        showLoading() {
            this.$container.find('.flipbook-loading').show();
            this.$container.find('.flipbook-error').hide();
        }
        
        hideLoading() {
            this.$container.find('.flipbook-loading').hide();
        }
        
        showError(error) {
            console.error('FlipBook Error:', error);
            this.$container.find('.flipbook-loading').hide();
            this.$container.find('.flipbook-error').show();
        }
        
        destroy() {
            if (this.renderer) {
                this.renderer.dispose();
            }
            if (this.scene) {
                // Clean up Three.js objects
                this.scene.traverse((object) => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }
        }
    }
    
    // Initialize flipbooks when DOM is ready
    $(document).ready(function() {
        $('.flipbook-container').each(function() {
            new FlipBookPro(this);
        });
    });
    
    // Handle window resize
    $(window).on('resize', function() {
        $('.flipbook-container').each(function() {
            const $container = $(this);
            const flipbook = $container.data('flipbook-instance');
            
            if (flipbook && flipbook.renderer) {
                const width = $container.width();
                const height = $container.height();
                
                flipbook.camera.aspect = width / height;
                flipbook.camera.updateProjectionMatrix();
                flipbook.renderer.setSize(width, height);
            }
        });
    });
    
})(jQuery);