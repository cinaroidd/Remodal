# WP 3D Flipbook

A powerful WordPress plugin that converts PDF files into beautiful, interactive 3D flipbooks with realistic page turning effects.

## Features

- **3D Page Turning Effects**: Realistic page flipping animations using CSS3 transforms
- **PDF Integration**: Upload and convert PDF files directly in WordPress
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Customizable Controls**: Show/hide navigation controls, thumbnails, and zoom options
- **Fullscreen Mode**: Immersive reading experience with fullscreen support
- **Touch Support**: Swipe gestures for mobile devices
- **Keyboard Navigation**: Arrow keys for page navigation
- **Zoom Functionality**: Zoom in/out with smooth scaling
- **Auto-play Option**: Automatic page turning for presentations
- **Analytics Tracking**: Track views and user interactions
- **Shortcode Support**: Easy integration with `[wp3d_flipbook id="POST_ID"]`
- **Custom Post Type**: Dedicated management interface for flipbooks

## Installation

1. **Upload the Plugin**:
   - Download the plugin files
   - Upload the `wp-3d-flipbook` folder to your `/wp-content/plugins/` directory
   - Or upload via WordPress admin: Plugins → Add New → Upload Plugin

2. **Activate the Plugin**:
   - Go to Plugins → Installed Plugins
   - Find "WP 3D Flipbook" and click "Activate"

3. **Configure Settings**:
   - Go to 3D Flipbooks → Settings
   - Configure default settings for new flipbooks

## Usage

### Creating a Flipbook

1. **Add New Flipbook**:
   - Go to 3D Flipbooks → Add New
   - Enter a title for your flipbook

2. **Upload PDF**:
   - Click "Upload PDF" button
   - Select your PDF file (max 50MB by default)
   - The PDF will be processed automatically

3. **Configure Settings**:
   - **Width/Height**: Set dimensions (e.g., "100%", "600px")
   - **Page Mode**: Single or double page display
   - **Zoom Level**: Default zoom (50% to 200%)
   - **Background Color**: Custom background color
   - **Options**: Enable/disable controls, thumbnails, auto-play

4. **Publish**:
   - Click "Publish" to save your flipbook

### Displaying Flipbooks

#### Shortcode Method
Use the provided shortcode anywhere on your site:
```
[wp3d_flipbook id="POST_ID"]
```

**Shortcode Parameters**:
- `id` (required): The flipbook post ID
- `width`: Custom width (e.g., "800px", "100%")
- `height`: Custom height (e.g., "600px")
- `preview`: Set to "true" for preview mode

#### PHP Method
Use in your theme files:
```php
<?php echo do_shortcode('[wp3d_flipbook id="123"]'); ?>
```

#### Block Editor
The plugin integrates with the WordPress block editor for easy insertion.

## Configuration

### Plugin Settings

Navigate to **3D Flipbooks → Settings** to configure:

- **Default Width/Height**: Default dimensions for new flipbooks
- **Maximum File Size**: Limit PDF upload size (1-500MB)
- **Analytics**: Enable/disable usage tracking

### Flipbook Options

Each flipbook can be customized with:

- **Dimensions**: Width and height settings
- **Page Display**: Single or double page mode
- **Zoom Controls**: Default zoom level and zoom buttons
- **Navigation**: Show/hide controls and thumbnails
- **Auto-play**: Automatic page turning
- **Background**: Custom background color

## Browser Support

The plugin works best in modern browsers that support:
- HTML5 Canvas
- CSS3 Transforms
- WebGL (for enhanced 3D effects)
- ES6 JavaScript

**Supported Browsers**:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

**Flipbook not loading**:
- Check that the PDF file is accessible
- Ensure the PDF is not corrupted
- Try a different browser
- Check browser console for JavaScript errors

**PDF upload fails**:
- Verify file is a valid PDF
- Check file size limits
- Ensure proper file permissions
- Try uploading a smaller PDF first

**Performance issues**:
- Use smaller PDF files for better performance
- Enable page caching if available
- Consider using a CDN for large files

### Debug Mode

Enable WordPress debug mode to see detailed error messages:
```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Development

### Hooks and Filters

The plugin provides several hooks for customization:

```php
// Modify flipbook settings
add_filter('wp3d_flipbook_settings', function($settings) {
    $settings['default_width'] = '800px';
    return $settings;
});

// Customize shortcode output
add_filter('wp3d_flipbook_shortcode_html', function($html, $atts) {
    // Modify HTML output
    return $html;
}, 10, 2);

// Track custom analytics
add_action('wp3d_flipbook_track_interaction', function($flipbook_id, $type, $data) {
    // Custom tracking logic
}, 10, 3);
```

### Custom Styling

Override default styles by adding CSS to your theme:

```css
/* Custom flipbook styles */
.wp3d-flipbook-container {
    border: 2px solid #333;
    border-radius: 10px;
}

.wp3d-flipbook-controls {
    background: rgba(0, 0, 0, 0.9);
}

.wp3d-flipbook-btn {
    background: #0073aa;
}
```

## API Reference

### JavaScript API

Access flipbook instances globally:

```javascript
// Get flipbook instance
const flipbook = window.flipbooks['flipbook-id'];

// Control flipbook programmatically
flipbook.nextPage();
flipbook.previousPage();
flipbook.goToPage(5);
flipbook.zoomIn();
flipbook.zoomOut();
flipbook.toggleFullscreen();
```

### AJAX Endpoints

The plugin provides several AJAX endpoints:

- `wp3d_flipbook_track_view`: Track flipbook views
- `wp3d_flipbook_track_interaction`: Track user interactions
- `wp3d_flipbook_get_pages`: Get PDF page data

## Changelog

### Version 1.0.0
- Initial release
- 3D flipbook functionality
- PDF upload and processing
- Responsive design
- Touch and keyboard support
- Analytics tracking
- Shortcode integration

## Support

For support and feature requests:
- Create an issue on GitHub
- Check the documentation
- Review troubleshooting guide

## License

This plugin is licensed under the GPL v2 or later.

## Credits

- **PDF.js**: PDF rendering library by Mozilla
- **Three.js**: 3D graphics library
- **WordPress**: Content management system

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Roadmap

Future features planned:
- Advanced 3D effects with Three.js
- Page annotations and notes
- Social sharing integration
- Advanced analytics dashboard
- Multi-language support
- Custom themes and templates