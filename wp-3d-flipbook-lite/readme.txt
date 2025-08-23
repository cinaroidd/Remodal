=== WP 3D Flipbook Lite ===
Contributors: yourname
Tags: flipbook, 3D, threejs, viewer, images
Requires at least: 5.6
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight 3D flipbook plugin powered by Three.js. Create flipbooks from images and embed via shortcode.

== Description ==

WP 3D Flipbook Lite lets you create simple 3D page flip experiences from a set of images. It uses Three.js to render a basic flip animation and provides a minimal toolbar with previous/next controls.

Features:
- Custom post type `Flipbook`
- Drag-and-drop ordering of image pages
- Shortcode to embed anywhere: `[flipbook id="123"]`
- Responsive sizing (scales to container width)

This is a lightweight starting point intended for small catalogs, brochures, and simple presentations.

== Installation ==

1. Upload the `wp-3d-flipbook-lite` folder to the `/wp-content/plugins/` directory, or install via the WordPress Plugins screen.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Go to `Flipbooks` > `Add New`.
4. Use the "Select Images" button to choose pages from the media library and drag to reorder.
5. Adjust viewer settings (width, height, background color) and publish.
6. Copy the shortcode from the published flipbook and paste it into any post or page: `[flipbook id="123"]` (replace 123 with your flipbook post ID).

== Frequently Asked Questions ==

= How do I change the size? =
Use the settings metabox on the flipbook edit screen to set width and height in pixels. The viewer will scale to fit its container on the front-end.

= Does it support PDFs? =
This lite version supports images. Convert your PDF pages to images before creating a flipbook.

= Can I use Gutenberg/Block Editor? =
Yes. Insert a Shortcode block and paste `[flipbook id="123"]`.

== Screenshots ==
1. Admin metabox for selecting and ordering pages
2. Front-end viewer with basic toolbar

== Changelog ==
= 0.1.0 =
- Initial release with CPT, admin UI, shortcode, and basic Three.js viewer

== Upgrade Notice ==
= 0.1.0 =
Initial release.