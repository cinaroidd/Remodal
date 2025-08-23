/**
 * FlipBook Pro - Gutenberg Block
 */

(function() {
    'use strict';
    
    const { registerBlockType } = wp.blocks;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, SelectControl, RangeControl, ToggleControl } = wp.components;
    const { Component } = wp.element;
    const { __ } = wp.i18n;
    
    class FlipBookBlock extends Component {
        constructor(props) {
            super(props);
            this.state = {
                flipbooks: [],
                loading: true
            };
        }
        
        componentDidMount() {
            this.loadFlipbooks();
        }
        
        loadFlipbooks() {
            wp.apiFetch({
                url: flipbookProBlock.ajax_url,
                method: 'POST',
                data: {
                    action: 'get_flipbooks_list',
                    nonce: flipbookProBlock.nonce
                }
            }).then(response => {
                if (response.success) {
                    this.setState({
                        flipbooks: response.data,
                        loading: false
                    });
                } else {
                    this.setState({ loading: false });
                }
            }).catch(() => {
                this.setState({ loading: false });
            });
        }
        
        render() {
            const { attributes, setAttributes } = this.props;
            const { flipbookId, width, height, autoplay, controls, lightbox } = attributes;
            const { flipbooks, loading } = this.state;
            
            const flipbookOptions = [
                { label: __('Select a FlipBook', '3d-flipbook-pro'), value: 0 }
            ];
            
            if (flipbooks.length > 0) {
                flipbooks.forEach(flipbook => {
                    flipbookOptions.push({
                        label: flipbook.title,
                        value: flipbook.id
                    });
                });
            }
            
            return (
                <div className="flipbook-block-editor">
                    <InspectorControls>
                        <PanelBody title={__('FlipBook Settings', '3d-flipbook-pro')}>
                            <SelectControl
                                label={__('FlipBook', '3d-flipbook-pro')}
                                value={flipbookId}
                                options={flipbookOptions}
                                onChange={(value) => setAttributes({ flipbookId: parseInt(value) })}
                                help={loading ? __('Loading flipbooks...', '3d-flipbook-pro') : __('Select a flipbook to display', '3d-flipbook-pro')}
                            />
                            
                            {flipbookId > 0 && (
                                <>
                                    <RangeControl
                                        label={__('Width', '3d-flipbook-pro')}
                                        value={width}
                                        onChange={(value) => setAttributes({ width: value })}
                                        min={300}
                                        max={1200}
                                        step={10}
                                    />
                                    
                                    <RangeControl
                                        label={__('Height', '3d-flipbook-pro')}
                                        value={height}
                                        onChange={(value) => setAttributes({ height: value })}
                                        min={300}
                                        max={800}
                                        step={10}
                                    />
                                    
                                    <ToggleControl
                                        label={__('Auto Play', '3d-flipbook-pro')}
                                        checked={autoplay}
                                        onChange={(value) => setAttributes({ autoplay: value })}
                                        help={__('Automatically turn pages', '3d-flipbook-pro')}
                                    />
                                    
                                    <ToggleControl
                                        label={__('Show Controls', '3d-flipbook-pro')}
                                        checked={controls}
                                        onChange={(value) => setAttributes({ controls: value })}
                                        help={__('Show navigation controls', '3d-flipbook-pro')}
                                    />
                                    
                                    <ToggleControl
                                        label={__('Lightbox Mode', '3d-flipbook-pro')}
                                        checked={lightbox}
                                        onChange={(value) => setAttributes({ lightbox: value })}
                                        help={__('Open in lightbox when clicked', '3d-flipbook-pro')}
                                    />
                                </>
                            )}
                        </PanelBody>
                    </InspectorControls>
                    
                    <div className="flipbook-block-preview">
                        {flipbookId > 0 ? (
                            <div 
                                className="flipbook-preview-container"
                                style={{
                                    width: width + 'px',
                                    height: height + 'px',
                                    maxWidth: '100%',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f9f9f9'
                                }}
                            >
                                <div style={{ textAlign: 'center', color: '#666' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📖</div>
                                    <div>{__('FlipBook Preview', '3d-flipbook-pro')}</div>
                                    <small>{__('ID:', '3d-flipbook-pro')} {flipbookId}</small>
                                </div>
                            </div>
                        ) : (
                            <div className="flipbook-placeholder">
                                <div style={{ 
                                    padding: '40px',
                                    textAlign: 'center',
                                    border: '2px dashed #ddd',
                                    borderRadius: '4px',
                                    color: '#666'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
                                    <h3>{__('3D FlipBook Pro', '3d-flipbook-pro')}</h3>
                                    <p>{__('Select a flipbook from the sidebar to get started.', '3d-flipbook-pro')}</p>
                                    {loading && <p><em>{__('Loading flipbooks...', '3d-flipbook-pro')}</em></p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    }
    
    registerBlockType('flipbook-pro/flipbook', {
        title: __('3D FlipBook Pro', '3d-flipbook-pro'),
        description: __('Display an interactive 3D flipbook', '3d-flipbook-pro'),
        icon: 'book-alt',
        category: 'media',
        keywords: [
            __('flipbook', '3d-flipbook-pro'),
            __('pdf', '3d-flipbook-pro'),
            __('3d', '3d-flipbook-pro'),
            __('book', '3d-flipbook-pro')
        ],
        attributes: {
            flipbookId: {
                type: 'number',
                default: 0
            },
            width: {
                type: 'number',
                default: 800
            },
            height: {
                type: 'number',
                default: 600
            },
            autoplay: {
                type: 'boolean',
                default: false
            },
            controls: {
                type: 'boolean',
                default: true
            },
            lightbox: {
                type: 'boolean',
                default: false
            }
        },
        edit: FlipBookBlock,
        save: function() {
            // Return null since this is a dynamic block
            return null;
        }
    });
    
})();