/**
 * FlipBook Pro - TinyMCE Plugin
 */

(function() {
    'use strict';
    
    tinymce.PluginManager.add('flipbook_shortcode', function(editor, url) {
        
        // Add button to toolbar
        editor.addButton('flipbook_shortcode', {
            title: 'Insert FlipBook',
            icon: 'wp-menu-image dashicons-book-alt',
            onclick: function() {
                openFlipbookDialog();
            }
        });
        
        // Add menu item
        editor.addMenuItem('flipbook_shortcode', {
            text: 'Insert FlipBook',
            icon: 'wp-menu-image dashicons-book-alt',
            onclick: function() {
                openFlipbookDialog();
            },
            context: 'insert'
        });
        
        function openFlipbookDialog() {
            // Load available flipbooks
            jQuery.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'get_flipbooks_list',
                    nonce: flipbook_admin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        showFlipbookDialog(response.data);
                    } else {
                        showFlipbookDialog([]);
                    }
                },
                error: function() {
                    showFlipbookDialog([]);
                }
            });
        }
        
        function showFlipbookDialog(flipbooks) {
            const flipbookOptions = flipbooks.map(function(flipbook) {
                return {
                    text: flipbook.title,
                    value: flipbook.id
                };
            });
            
            if (flipbookOptions.length === 0) {
                flipbookOptions.push({
                    text: 'No flipbooks available',
                    value: ''
                });
            }
            
            editor.windowManager.open({
                title: 'Insert FlipBook',
                width: 400,
                height: 350,
                body: [
                    {
                        type: 'listbox',
                        name: 'flipbook_id',
                        label: 'Select FlipBook:',
                        values: flipbookOptions
                    },
                    {
                        type: 'textbox',
                        name: 'width',
                        label: 'Width (px):',
                        value: '800'
                    },
                    {
                        type: 'textbox',
                        name: 'height',
                        label: 'Height (px):',
                        value: '600'
                    },
                    {
                        type: 'checkbox',
                        name: 'autoplay',
                        label: 'Auto Play'
                    },
                    {
                        type: 'checkbox',
                        name: 'controls',
                        label: 'Show Controls',
                        checked: true
                    },
                    {
                        type: 'checkbox',
                        name: 'lightbox',
                        label: 'Lightbox Mode'
                    }
                ],
                onsubmit: function(e) {
                    const data = e.data;
                    
                    if (!data.flipbook_id) {
                        alert('Please select a flipbook.');
                        return false;
                    }
                    
                    let shortcode = '[flipbook id="' + data.flipbook_id + '"';
                    
                    if (data.width && data.width !== '800') {
                        shortcode += ' width="' + data.width + '"';
                    }
                    
                    if (data.height && data.height !== '600') {
                        shortcode += ' height="' + data.height + '"';
                    }
                    
                    if (data.autoplay) {
                        shortcode += ' autoplay="true"';
                    }
                    
                    if (!data.controls) {
                        shortcode += ' controls="false"';
                    }
                    
                    if (data.lightbox) {
                        shortcode += ' lightbox="true"';
                    }
                    
                    shortcode += ']';
                    
                    editor.insertContent(shortcode);
                }
            });
        }
        
        // Register shortcode placeholder
        editor.on('BeforeSetContent', function(event) {
            event.content = event.content.replace(
                /\[flipbook([^\]]*)\]/g,
                function(match) {
                    return '<div class="flipbook-shortcode-placeholder" data-shortcode="' + 
                           encodeURIComponent(match) + '">' +
                           '<div class="flipbook-placeholder-icon">📖</div>' +
                           '<div class="flipbook-placeholder-text">FlipBook Shortcode</div>' +
                           '<div class="flipbook-placeholder-code">' + match + '</div>' +
                           '</div>';
                }
            );
        });
        
        // Convert placeholder back to shortcode
        editor.on('GetContent', function(event) {
            event.content = event.content.replace(
                /<div class="flipbook-shortcode-placeholder"[^>]*data-shortcode="([^"]*)"[^>]*>.*?<\/div>/g,
                function(match, shortcode) {
                    return decodeURIComponent(shortcode);
                }
            );
        });
        
        // Add CSS for placeholder
        editor.on('init', function() {
            editor.dom.addStyle(`
                .flipbook-shortcode-placeholder {
                    background: #f9f9f9;
                    border: 2px dashed #ddd;
                    border-radius: 4px;
                    padding: 20px;
                    text-align: center;
                    margin: 10px 0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .flipbook-shortcode-placeholder:hover {
                    border-color: #007cba;
                    background: #f0f6fc;
                }
                .flipbook-placeholder-icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                }
                .flipbook-placeholder-text {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #333;
                }
                .flipbook-placeholder-code {
                    font-family: monospace;
                    font-size: 12px;
                    color: #666;
                    background: white;
                    padding: 5px 10px;
                    border-radius: 3px;
                    display: inline-block;
                }
            `);
        });
        
        // Handle placeholder clicks
        editor.on('click', function(event) {
            const target = event.target;
            const placeholder = target.closest('.flipbook-shortcode-placeholder');
            
            if (placeholder) {
                event.preventDefault();
                const shortcode = decodeURIComponent(placeholder.getAttribute('data-shortcode'));
                
                // Parse shortcode attributes
                const attributes = parseShortcode(shortcode);
                
                // Pre-populate dialog with existing values
                showEditDialog(attributes, placeholder);
            }
        });
        
        function parseShortcode(shortcode) {
            const attributes = {};
            const regex = /(\w+)="([^"]*)"/g;
            let match;
            
            while ((match = regex.exec(shortcode)) !== null) {
                attributes[match[1]] = match[2];
            }
            
            return attributes;
        }
        
        function showEditDialog(attributes, placeholder) {
            // Similar to showFlipbookDialog but with pre-filled values
            jQuery.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'get_flipbooks_list',
                    nonce: flipbook_admin.nonce
                },
                success: function(response) {
                    const flipbooks = response.success ? response.data : [];
                    const flipbookOptions = flipbooks.map(function(flipbook) {
                        return {
                            text: flipbook.title,
                            value: flipbook.id
                        };
                    });
                    
                    editor.windowManager.open({
                        title: 'Edit FlipBook',
                        width: 400,
                        height: 350,
                        body: [
                            {
                                type: 'listbox',
                                name: 'flipbook_id',
                                label: 'Select FlipBook:',
                                values: flipbookOptions,
                                value: attributes.id || ''
                            },
                            {
                                type: 'textbox',
                                name: 'width',
                                label: 'Width (px):',
                                value: attributes.width || '800'
                            },
                            {
                                type: 'textbox',
                                name: 'height',
                                label: 'Height (px):',
                                value: attributes.height || '600'
                            },
                            {
                                type: 'checkbox',
                                name: 'autoplay',
                                label: 'Auto Play',
                                checked: attributes.autoplay === 'true'
                            },
                            {
                                type: 'checkbox',
                                name: 'controls',
                                label: 'Show Controls',
                                checked: attributes.controls !== 'false'
                            },
                            {
                                type: 'checkbox',
                                name: 'lightbox',
                                label: 'Lightbox Mode',
                                checked: attributes.lightbox === 'true'
                            }
                        ],
                        onsubmit: function(e) {
                            const data = e.data;
                            
                            if (!data.flipbook_id) {
                                alert('Please select a flipbook.');
                                return false;
                            }
                            
                            let shortcode = '[flipbook id="' + data.flipbook_id + '"';
                            
                            if (data.width && data.width !== '800') {
                                shortcode += ' width="' + data.width + '"';
                            }
                            
                            if (data.height && data.height !== '600') {
                                shortcode += ' height="' + data.height + '"';
                            }
                            
                            if (data.autoplay) {
                                shortcode += ' autoplay="true"';
                            }
                            
                            if (!data.controls) {
                                shortcode += ' controls="false"';
                            }
                            
                            if (data.lightbox) {
                                shortcode += ' lightbox="true"';
                            }
                            
                            shortcode += ']';
                            
                            // Replace the placeholder with updated shortcode
                            const newPlaceholder = '<div class="flipbook-shortcode-placeholder" data-shortcode="' + 
                                                 encodeURIComponent(shortcode) + '">' +
                                                 '<div class="flipbook-placeholder-icon">📖</div>' +
                                                 '<div class="flipbook-placeholder-text">FlipBook Shortcode</div>' +
                                                 '<div class="flipbook-placeholder-code">' + shortcode + '</div>' +
                                                 '</div>';
                            
                            editor.dom.setOuterHTML(placeholder, newPlaceholder);
                        }
                    });
                }
            });
        }
    });
    
})();