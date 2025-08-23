(function($){
  'use strict';

  function refreshHiddenInput($list, $input) {
    var ids = [];
    $list.find('li.wp3d-page-item').each(function(){
      var id = $(this).data('id');
      if (id) ids.push(id);
    });
    $input.val(ids.join(','));
  }

  $(document).on('click', '#wp3d-select-pages', function(e){
    e.preventDefault();
    var frame = wp.media({
      title: 'Select Flipbook Images',
      button: { text: 'Use images' },
      library: { type: 'image' },
      multiple: true
    });

    frame.on('select', function(){
      var selection = frame.state().get('selection');
      var $list = $('#wp3d-pages-list');
      selection.each(function(att){
        var id = att.get('id');
        var url = att.get('sizes') && att.get('sizes').thumbnail ? att.get('sizes').thumbnail.url : att.get('url');
        var $li = $('<li class="wp3d-page-item"/>').attr('data-id', id);
        $li.append($('<img/>').attr('src', url).attr('alt', ''));
        $li.append($('<span class="dashicons dashicons-no-alt wp3d-remove" title="Remove"/>'));
        $list.append($li);
      });
      refreshHiddenInput($('#wp3d-pages-list'), $('#wp3d-pages-input'));
    });

    frame.open();
  });

  $(document).on('click', '#wp3d-clear-pages', function(e){
    e.preventDefault();
    $('#wp3d-pages-list').empty();
    $('#wp3d-pages-input').val('');
  });

  $(document).on('click', '.wp3d-remove', function(){
    $(this).closest('li').remove();
    refreshHiddenInput($('#wp3d-pages-list'), $('#wp3d-pages-input'));
  });

  $(function(){
    $('#wp3d-pages-list').sortable({
      update: function(){
        refreshHiddenInput($('#wp3d-pages-list'), $('#wp3d-pages-input'));
      }
    });
  });
})(jQuery);