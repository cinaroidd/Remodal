# 3D FlipBook Pro - WordPress Plugin

A powerful WordPress plugin for creating stunning interactive 3D flipbooks from PDFs, images, and HTML content with realistic page-turning animations.

## Features

### 🚀 Core Features
- **3D Page Turning Animation** - Realistic book flipping with Three.js
- **Multiple Content Types** - Support for PDF, images, and HTML content
- **PDF.js Integration** - High-quality PDF rendering
- **Responsive Design** - Works perfectly on all devices
- **Touch Support** - Mobile-friendly touch gestures

### 📱 Display Options
- **Shortcode Support** - Easy embedding with `[flipbook id="1"]`
- **Gutenberg Block** - Modern block editor integration
- **Lightbox Mode** - Full-screen viewing experience
- **Custom Dimensions** - Flexible width and height settings
- **Auto-play Mode** - Automatic page turning

### 🎨 Customization
- **Navigation Controls** - Previous/next buttons, page counter
- **Zoom Controls** - Zoom in/out functionality
- **Fullscreen Mode** - Immersive reading experience
- **Custom Styling** - CSS customization support
- **Multiple Themes** - Different visual styles

### ⚙️ Admin Features
- **Easy Management** - Intuitive admin interface
- **Bulk Operations** - Manage multiple flipbooks
- **Media Library Integration** - WordPress media uploader
- **Preview Mode** - Preview before publishing
- **Settings Panel** - Global configuration options

## Installation

1. **Upload the Plugin**
   ```
   wp-content/plugins/3d-flipbook-pro/
   ```

2. **Activate the Plugin**
   - Go to WordPress Admin → Plugins
   - Find "3D FlipBook Pro" and click "Activate"

3. **Create Your First FlipBook**
   - Navigate to FlipBook Pro → Add New
   - Upload your PDF or images
   - Configure settings
   - Save and embed using shortcode or block

## Usage

### Creating a FlipBook

1. **Go to FlipBook Pro → Add New**
2. **Enter Basic Information**
   - Title: Name for your flipbook
   - Description: Optional description
   - Type: Choose PDF, Images, or HTML

3. **Upload Content**
   - **PDF**: Upload PDF file or enter URL
   - **Images**: Upload multiple images in order
   - **HTML**: Enter HTML content

4. **Configure Settings**
   - Width/Height: Set dimensions
   - Auto Play: Enable automatic page turning
   - Controls: Show/hide navigation controls
   - Lightbox: Enable full-screen mode

5. **Save and Embed**
   - Click "Create FlipBook"
   - Copy the shortcode or use Gutenberg block

### Embedding FlipBooks

#### Using Shortcode
```
[flipbook id="1"]
[flipbook id="1" width="1000" height="700"]
[flipbook id="1" autoplay="true" controls="false"]
[flipbook id="1" lightbox="true"]
```

#### Using Gutenberg Block
1. Add new block → Media → 3D FlipBook Pro
2. Select flipbook from dropdown
3. Configure settings in sidebar
4. Publish/Update page

#### Shortcode Parameters
- `id` (required): FlipBook ID
- `width`: Width in pixels (default: 800)
- `height`: Height in pixels (default: 600)
- `autoplay`: Enable auto page turning (true/false)
- `controls`: Show navigation controls (true/false)
- `lightbox`: Enable lightbox mode (true/false)

## File Structure

```
3d-flipbook-pro/
├── 3d-flipbook-pro.php          # Main plugin file
├── README.md                    # Documentation
├── includes/                    # PHP classes
│   ├── class-flipbook-database.php
│   ├── class-flipbook-admin.php
│   ├── class-flipbook-frontend.php
│   ├── class-flipbook-shortcode.php
│   ├── class-flipbook-gutenberg.php
│   └── class-flipbook-ajax.php
├── assets/                      # Frontend assets
│   ├── css/
│   │   ├── flipbook.css        # Main styles
│   │   ├── admin.css           # Admin styles
│   │   └── block-editor.css    # Gutenberg styles
│   └── js/
│       ├── flipbook.js         # Main JavaScript
│       ├── admin.js            # Admin JavaScript
│       ├── block-editor.js     # Gutenberg block
│       ├── tinymce-plugin.js   # TinyMCE integration
│       ├── three.min.js        # Three.js library
│       └── pdf.min.js          # PDF.js library
└── languages/                  # Translation files
```

## Technical Requirements

- **WordPress**: 5.0 or higher
- **PHP**: 7.4 or higher
- **MySQL**: 5.6 or higher
- **Modern Browser**: Chrome, Firefox, Safari, Edge

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

### Optimization Features
- **Lazy Loading** - Content loaded on demand
- **Texture Caching** - Efficient memory usage
- **Responsive Images** - Automatic image scaling
- **CDN Support** - External library loading
- **Minified Assets** - Optimized file sizes

### Performance Tips
1. **Optimize PDFs** - Use compressed PDFs for better loading
2. **Image Formats** - Use WebP when possible
3. **Page Limits** - Consider splitting large documents
4. **Caching** - Use WordPress caching plugins
5. **CDN** - Implement content delivery network

## Customization

### CSS Customization
```css
/* Custom flipbook styling */
.flipbook-container {
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.flipbook-controls {
    background: linear-gradient(45deg, #007cba, #005a87);
}

.flipbook-btn {
    border-radius: 50%;
}
```

### JavaScript Hooks
```javascript
// Custom event listeners
jQuery(document).on('flipbook:pageChanged', function(e, data) {
    console.log('Page changed to:', data.currentPage);
});

jQuery(document).on('flipbook:loaded', function(e, data) {
    console.log('FlipBook loaded:', data.flipbookId);
});
```

## Troubleshooting

### Common Issues

**FlipBook not displaying**
- Check if Three.js and PDF.js are loaded
- Verify shortcode syntax
- Check browser console for errors

**PDF not loading**
- Ensure PDF URL is accessible
- Check file permissions
- Verify PDF is not corrupted

**Performance issues**
- Reduce PDF file size
- Enable browser caching
- Check server resources

**Mobile display problems**
- Test on actual devices
- Check responsive CSS
- Verify touch events

### Debug Mode
Add to wp-config.php:
```php
define('FLIPBOOK_DEBUG', true);
```

## Hooks & Filters

### Actions
```php
// Before flipbook render
do_action('flipbook_before_render', $flipbook_id);

// After flipbook render
do_action('flipbook_after_render', $flipbook_id);

// On flipbook save
do_action('flipbook_saved', $flipbook_id, $flipbook_data);
```

### Filters
```php
// Modify flipbook settings
$settings = apply_filters('flipbook_settings', $settings, $flipbook_id);

// Modify flipbook HTML
$html = apply_filters('flipbook_html', $html, $flipbook_id);

// Modify shortcode attributes
$atts = apply_filters('flipbook_shortcode_atts', $atts);
```

## Security

### Best Practices
- File upload validation
- Nonce verification
- Capability checks
- SQL injection prevention
- XSS protection

### File Permissions
```
directories: 755
files: 644
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

GPL v2 or later

## Support

For support and documentation, visit:
- Plugin documentation
- WordPress.org support forums
- GitHub issues

## Changelog

### Version 1.0.0
- Initial release
- PDF flipbook support
- Image flipbook support
- 3D animations with Three.js
- Responsive design
- Gutenberg block
- Shortcode system
- Admin interface
- Mobile support

---

**Created with ❤️ for the WordPress community**