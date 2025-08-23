/**
 * FlipBook Pro - Admin JavaScript
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        
        // Media uploader for PDF files
        $('#upload_pdf_button').on('click', function(e) {
            e.preventDefault();
            
            const mediaUploader = wp.media({
                title: 'Select PDF File',
                button: {
                    text: 'Use this PDF'
                },
                multiple: false,
                library: {
                    type: 'application/pdf'
                }
            });
            
            mediaUploader.on('select', function() {
                const attachment = mediaUploader.state().get('selection').first().toJSON();
                $('#flipbook_source_url').val(attachment.url);
            });
            
            mediaUploader.open();
        });
        
        // Toggle fields based on flipbook type
        $('#flipbook_type').on('change', function() {
            const type = $(this).val();
            
            // Hide all type-specific fields
            $('.type-specific').hide();
            
            // Show relevant fields
            switch (type) {
                case 'pdf':
                    $('#pdf_upload_row').show();
                    break;
                case 'images':
                    $('#images_upload_row').show();
                    break;
                case 'html':
                    $('#html_content_row').show();
                    break;
            }
        }).trigger('change');
        
        // Copy shortcode to clipboard
        $(document).on('click', '.copy-shortcode', function(e) {
            e.preventDefault();
            
            const shortcode = $(this).data('shortcode');
            
            // Create temporary input element
            const tempInput = $('<input>');
            $('body').append(tempInput);
            tempInput.val(shortcode).select();
            document.execCommand('copy');
            tempInput.remove();
            
            // Show feedback
            const originalText = $(this).text();
            $(this).text('Copied!');
            
            setTimeout(() => {
                $(this).text(originalText);
            }, 2000);
        });
        
        // Form validation
        $('form[action*="save_flipbook"]').on('submit', function(e) {
            const title = $('#flipbook_title').val().trim();
            const type = $('#flipbook_type').val();
            const sourceUrl = $('#flipbook_source_url').val().trim();
            
            if (!title) {
                alert('Please enter a title for the flipbook.');
                e.preventDefault();
                return false;
            }
            
            if (type === 'pdf' && !sourceUrl) {
                alert('Please upload a PDF file or enter a PDF URL.');
                e.preventDefault();
                return false;
            }
            
            // Show loading state
            $(this).find('input[type="submit"]').prop('disabled', true).val('Saving...');
        });
        
        // Preview functionality
        $('#preview_flipbook').on('click', function(e) {
            e.preventDefault();
            
            const flipbookId = $(this).data('flipbook-id');
            if (!flipbookId) {
                alert('Please save the flipbook first to preview it.');
                return;
            }
            
            // Open preview in new window
            const previewUrl = `${window.location.origin}?flipbook_preview=${flipbookId}`;
            window.open(previewUrl, 'flipbook_preview', 'width=1000,height=700,scrollbars=yes');
        });
        
        // Settings tabs
        $('.flipbook-settings-tabs .nav-tab').on('click', function(e) {
            e.preventDefault();
            
            const targetTab = $(this).attr('href');
            
            // Update active tab
            $('.flipbook-settings-tabs .nav-tab').removeClass('nav-tab-active');
            $(this).addClass('nav-tab-active');
            
            // Show target content
            $('.flipbook-tab-content').hide();
            $(targetTab).show();
        });
        
        // Color picker initialization
        if ($.fn.wpColorPicker) {
            $('.flipbook-color-picker').wpColorPicker();
        }
        
        // Toggle switches
        $('.flipbook-toggle input').on('change', function() {
            const $slider = $(this).siblings('.flipbook-toggle-slider');
            if ($(this).is(':checked')) {
                $slider.addClass('active');
            } else {
                $slider.removeClass('active');
            }
        });
        
        // Drag and drop for file uploads
        $('.flipbook-upload-area').on('dragover dragenter', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('dragover');
        });
        
        $('.flipbook-upload-area').on('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragover');
        });
        
        $('.flipbook-upload-area').on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragover');
            
            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0], $(this));
            }
        });
        
        // Handle file upload
        function handleFileUpload(file, $uploadArea) {
            if (file.type !== 'application/pdf') {
                alert('Please upload a PDF file.');
                return;
            }
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('action', 'upload_flipbook_pdf');
            formData.append('nonce', flipbook_admin.nonce);
            
            // Show progress
            $uploadArea.html('<div class="flipbook-progress"><div class="flipbook-progress-bar" style="width: 0%">0%</div></div>');
            
            $.ajax({
                url: flipbook_admin.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            const percentComplete = Math.round((evt.loaded / evt.total) * 100);
                            $('.flipbook-progress-bar').css('width', percentComplete + '%').text(percentComplete + '%');
                        }
                    }, false);
                    return xhr;
                },
                success: function(response) {
                    if (response.success) {
                        $('#flipbook_source_url').val(response.data.url);
                        $uploadArea.html('<div class="flipbook-message success">File uploaded successfully!</div>');
                    } else {
                        $uploadArea.html('<div class="flipbook-message error">Upload failed: ' + response.data + '</div>');
                    }
                },
                error: function() {
                    $uploadArea.html('<div class="flipbook-message error">Upload failed. Please try again.</div>');
                }
            });
        }
        
        // Auto-save functionality
        let autoSaveTimeout;
        $('input, textarea, select').on('input change', function() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(function() {
                // Auto-save logic here if needed
                console.log('Auto-save triggered');
            }, 5000);
        });
        
        // Tooltips
        $('.flipbook-tooltip').on('mouseenter', function() {
            $(this).find('.flipbook-tooltip-text').fadeIn(200);
        }).on('mouseleave', function() {
            $(this).find('.flipbook-tooltip-text').fadeOut(200);
        });
        
        // Bulk actions
        $('#bulk-action-selector-top, #bulk-action-selector-bottom').on('change', function() {
            const action = $(this).val();
            const $applyButton = $(this).siblings('.button');
            
            if (action === '-1') {
                $applyButton.prop('disabled', true);
            } else {
                $applyButton.prop('disabled', false);
            }
        });
        
        // Search functionality
        $('#flipbook-search').on('input', function() {
            const searchTerm = $(this).val().toLowerCase();
            
            $('.wp-list-table tbody tr').each(function() {
                const rowText = $(this).text().toLowerCase();
                if (rowText.indexOf(searchTerm) === -1) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        });
        
        // Confirmation dialogs
        $('.button-link-delete').on('click', function(e) {
            if (!confirm('Are you sure you want to delete this flipbook? This action cannot be undone.')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Help tabs
        $('.help-tab').on('click', function(e) {
            e.preventDefault();
            
            const targetHelp = $(this).attr('href');
            
            $('.help-tab').removeClass('active');
            $(this).addClass('active');
            
            $('.help-content').hide();
            $(targetHelp).show();
        });
        
        // Responsive table handling
        function handleResponsiveTables() {
            if ($(window).width() < 782) {
                $('.wp-list-table').addClass('mobile');
            } else {
                $('.wp-list-table').removeClass('mobile');
            }
        }
        
        $(window).on('resize', handleResponsiveTables);
        handleResponsiveTables();
        
        // Initialize sortable lists if needed
        if ($.fn.sortable) {
            $('.flipbook-sortable').sortable({
                handle: '.sort-handle',
                update: function(event, ui) {
                    // Handle reordering
                    const order = $(this).sortable('toArray');
                    console.log('New order:', order);
                }
            });
        }
        
    });
    
})(jQuery);