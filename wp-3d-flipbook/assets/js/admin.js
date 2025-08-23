/**
 * WP 3D Flipbook Admin JavaScript
 * Handles admin interface functionality
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Initialize admin functionality
        initFlipbookAdmin();
    });

    function initFlipbookAdmin() {
        // PDF upload functionality
        initPDFUpload();
        
        // Color picker initialization
        initColorPickers();
        
        // Settings validation
        initSettingsValidation();
        
        // Preview functionality
        initPreview();
        
        // Bulk actions
        initBulkActions();
        
        // Tooltips
        initTooltips();
    }

    function initPDFUpload() {
        // Handle PDF upload button clicks
        $(document).on('click', '#wp3d_flipbook_upload_pdf', function(e) {
            e.preventDefault();
            
            const button = $(this);
            const urlField = $('#wp3d_flipbook_pdf_url');
            
            // Create media frame
            const frame = wp.media({
                title: wp3d_flipbook_admin.strings.select_pdf,
                button: {
                    text: wp3d_flipbook_admin.strings.use_pdf
                },
                multiple: false,
                library: {
                    type: 'application/pdf'
                }
            });
            
            // Handle selection
            frame.on('select', function() {
                const attachment = frame.state().get('selection').first().toJSON();
                
                if (attachment.type === 'application/pdf') {
                    urlField.val(attachment.url);
                    
                    // Show success message
                    showAdminNotice(wp3d_flipbook_admin.strings.pdf_selected, 'success');
                    
                    // Update preview if available
                    updatePreview();
                } else {
                    showAdminNotice(wp3d_flipbook_admin.strings.invalid_file_type, 'error');
                }
            });
            
            frame.open();
        });
        
        // Handle drag and drop for PDF files
        initDragAndDrop();
    }

    function initDragAndDrop() {
        const dropZone = $('.wp3d-flipbook-drop-zone');
        
        if (dropZone.length) {
            dropZone.on('dragover', function(e) {
                e.preventDefault();
                $(this).addClass('dragover');
            });
            
            dropZone.on('dragleave', function(e) {
                e.preventDefault();
                $(this).removeClass('dragover');
            });
            
            dropZone.on('drop', function(e) {
                e.preventDefault();
                $(this).removeClass('dragover');
                
                const files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    handleFileUpload(files[0]);
                }
            });
        }
    }

    function handleFileUpload(file) {
        if (file.type !== 'application/pdf') {
            showAdminNotice(wp3d_flipbook_admin.strings.invalid_file_type, 'error');
            return;
        }
        
        // Check file size
        const maxSize = wp3d_flipbook_admin.max_file_size * 1024 * 1024; // Convert to bytes
        if (file.size > maxSize) {
            showAdminNotice(wp3d_flipbook_admin.strings.file_too_large, 'error');
            return;
        }
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('action', 'wp3d_flipbook_upload_pdf');
        formData.append('pdf_file', file);
        formData.append('nonce', wp3d_flipbook_admin.nonce);
        
        // Show loading state
        showLoadingState();
        
        // Upload file
        $.ajax({
            url: wp3d_flipbook_admin.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                hideLoadingState();
                
                if (response.success) {
                    $('#wp3d_flipbook_pdf_url').val(response.data.url);
                    showAdminNotice(wp3d_flipbook_admin.strings.upload_success, 'success');
                    updatePreview();
                } else {
                    showAdminNotice(response.data || wp3d_flipbook_admin.strings.upload_error, 'error');
                }
            },
            error: function() {
                hideLoadingState();
                showAdminNotice(wp3d_flipbook_admin.strings.upload_error, 'error');
            }
        });
    }

    function initColorPickers() {
        // Initialize WordPress color picker
        if ($.fn.wpColorPicker) {
            $('.color-picker').wpColorPicker({
                change: function(event, ui) {
                    // Update preview when color changes
                    updatePreview();
                }
            });
        }
    }

    function initSettingsValidation() {
        // Validate form before submission
        $('#post').on('submit', function(e) {
            const pdfUrl = $('#wp3d_flipbook_pdf_url').val();
            
            if (!pdfUrl) {
                e.preventDefault();
                showAdminNotice(wp3d_flipbook_admin.strings.pdf_required, 'error');
                $('#wp3d_flipbook_pdf_url').focus();
                return false;
            }
            
            // Validate dimensions
            const width = $('#wp3d_flipbook_width').val();
            const height = $('#wp3d_flipbook_height').val();
            
            if (width && !isValidDimension(width)) {
                e.preventDefault();
                showAdminNotice(wp3d_flipbook_admin.strings.invalid_width, 'error');
                $('#wp3d_flipbook_width').focus();
                return false;
            }
            
            if (height && !isValidDimension(height)) {
                e.preventDefault();
                showAdminNotice(wp3d_flipbook_admin.strings.invalid_height, 'error');
                $('#wp3d_flipbook_height').focus();
                return false;
            }
        });
        
        // Real-time validation
        $('#wp3d_flipbook_width, #wp3d_flipbook_height').on('blur', function() {
            const value = $(this).val();
            const field = $(this);
            
            if (value && !isValidDimension(value)) {
                field.addClass('error');
                showFieldError(field, wp3d_flipbook_admin.strings.invalid_dimension);
            } else {
                field.removeClass('error');
                hideFieldError(field);
            }
        });
    }

    function isValidDimension(value) {
        // Check if value is valid CSS dimension (px, %, em, rem, vw, vh)
        const dimensionRegex = /^(\d+(?:\.\d+)?)(px|%|em|rem|vw|vh)$/;
        return dimensionRegex.test(value) || value === 'auto';
    }

    function initPreview() {
        // Update preview when settings change
        $('input, select').on('change', function() {
            updatePreview();
        });
        
        // Toggle preview visibility
        $('.wp3d-flipbook-preview-toggle').on('click', function(e) {
            e.preventDefault();
            const preview = $('#wp3d-flipbook-preview');
            preview.toggle();
            $(this).text(preview.is(':visible') ? 
                wp3d_flipbook_admin.strings.hide_preview : 
                wp3d_flipbook_admin.strings.show_preview
            );
        });
    }

    function updatePreview() {
        const preview = $('#wp3d-flipbook-preview');
        if (preview.length && preview.is(':visible')) {
            const postId = $('#post_ID').val();
            const pdfUrl = $('#wp3d_flipbook_pdf_url').val();
            
            if (postId && pdfUrl) {
                // Reload preview via AJAX
                $.ajax({
                    url: wp3d_flipbook_admin.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'wp3d_flipbook_get_preview',
                        post_id: postId,
                        nonce: wp3d_flipbook_admin.nonce
                    },
                    success: function(response) {
                        if (response.success) {
                            preview.html(response.data.html);
                        }
                    }
                });
            }
        }
    }

    function initBulkActions() {
        // Handle bulk actions for flipbooks
        $('#doaction, #doaction2').on('click', function(e) {
            const action = $(this).prev('select').val();
            
            if (action === 'delete' && !confirm(wp3d_flipbook_admin.strings.confirm_delete)) {
                e.preventDefault();
                return false;
            }
        });
        
        // Select all functionality
        $('.wp3d-flipbook-select-all').on('click', function(e) {
            e.preventDefault();
            const checkboxes = $('.wp3d-flipbook-select');
            const allChecked = checkboxes.length === checkboxes.filter(':checked').length;
            
            checkboxes.prop('checked', !allChecked);
        });
    }

    function initTooltips() {
        // Initialize tooltips for help text
        $('.wp3d-flipbook-tooltip').each(function() {
            const element = $(this);
            const tooltipText = element.data('tooltip');
            
            if (tooltipText) {
                element.attr('title', tooltipText);
            }
        });
    }

    function showAdminNotice(message, type) {
        const noticeClass = type === 'error' ? 'error' : 'updated';
        const notice = $(`
            <div class="notice notice-${noticeClass} is-dismissible">
                <p>${message}</p>
                <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">Dismiss this notice.</span>
                </button>
            </div>
        `);
        
        $('.wp-header-end').after(notice);
        
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            notice.fadeOut();
        }, 5000);
        
        // Make dismissible
        notice.find('.notice-dismiss').on('click', function() {
            notice.fadeOut();
        });
    }

    function showFieldError(field, message) {
        let errorElement = field.siblings('.field-error');
        
        if (errorElement.length === 0) {
            errorElement = $(`<div class="field-error">${message}</div>`);
            field.after(errorElement);
        } else {
            errorElement.text(message);
        }
        
        errorElement.show();
    }

    function hideFieldError(field) {
        field.siblings('.field-error').hide();
    }

    function showLoadingState() {
        const loading = $(`
            <div class="wp3d-flipbook-loading-overlay">
                <div class="wp3d-flipbook-loading-spinner"></div>
                <p>${wp3d_flipbook_admin.strings.uploading}</p>
            </div>
        `);
        
        $('body').append(loading);
    }

    function hideLoadingState() {
        $('.wp3d-flipbook-loading-overlay').remove();
    }

    // Export functions for global use
    window.WP3DFlipbookAdmin = {
        showNotice: showAdminNotice,
        updatePreview: updatePreview,
        validateForm: initSettingsValidation
    };

})(jQuery);