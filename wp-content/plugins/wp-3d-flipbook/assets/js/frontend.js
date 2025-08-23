(function(){
	function getPageFlipCtor() {
		if (window.PageFlip) return window.PageFlip;
		if (window.pageFlip) return window.pageFlip;
		if (window.St && window.St.PageFlip) return window.St.PageFlip;
		return null;
	}

	function initAll() {
		var PageFlipCtor = getPageFlipCtor();
		if (!PageFlipCtor) { return; }
		var viewers = document.querySelectorAll('.wp3dfb-viewer');
		viewers.forEach(function(container){
			try {
				var pages = [];
				try { pages = JSON.parse(container.getAttribute('data-pages') || '[]'); } catch(e) { pages = []; }
				var width = parseInt(container.getAttribute('data-width') || '800', 10);
				var height = parseInt(container.getAttribute('data-height') || '600', 10);
				if (!pages || !pages.length) return;

				var instance = new PageFlipCtor(container, {
					width: width,
					height: height,
					showCover: false,
					maxShadowOpacity: 0.5,
					mobileScrollSupport: true
				});
				instance.loadFromImages(pages);
			} catch (err) {
				// swallow errors silently
			}
		});
	}

	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		setTimeout(initAll, 0);
	} else {
		document.addEventListener('DOMContentLoaded', initAll);
	}
})();