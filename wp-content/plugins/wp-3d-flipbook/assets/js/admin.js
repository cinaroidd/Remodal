(function($){
	var frame;

	function renderItem(attachment){
		var id = attachment.id || attachment.get('id');
		var url = (attachment.sizes && attachment.sizes.thumbnail && attachment.sizes.thumbnail.url) || attachment.url || (attachment.get && attachment.get('url')) || '';
		var $li = $('<li class="wp3dfb-page"/>').attr('data-id', id);
		$li.append('<input type="hidden" name="wp3dfb_pages[]" value="'+ id +'" />');
		$li.append('<img alt="" />').find('img').attr('src', url);
		$li.append('<button type="button" class="button link-button wp3dfb-remove">&times;</button>');
		return $li;
	}

	function openFrame(){
		if (frame) { frame.open(); return; }
		frame = wp.media({
			title: 'Select Flipbook Pages',
			button: { text: 'Add to Flipbook' },
			multiple: true,
			library: { type: 'image' }
		});
		frame.on('select', function(){
			var selection = frame.state().get('selection');
			if (!selection) return;
			var $list = $('#wp3dfb-pages-list');
			selection.each(function(attachment){
				attachment = attachment.toJSON ? attachment.toJSON() : attachment;
				$list.append(renderItem(attachment));
			});
		});
		frame.open();
	}

	function bindEvents(){
		$(document).on('click', '#wp3dfb-add-pages', function(){
			openFrame();
		});
		$(document).on('click', '.wp3dfb-remove', function(){
			$(this).closest('.wp3dfb-page').remove();
		});
		$('#wp3dfb-pages-list').sortable({
			items: '> li.wp3dfb-page',
			placeholder: 'wp3dfb-placeholder',
			forcePlaceholderSize: true
		});
	}

	$(function(){
		bindEvents();
	});
})(jQuery);