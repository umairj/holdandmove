(function($){
	
	window.Sidebar = function(){
		
		var sidebarSelector = '#sidebar';
		var clipboardSelector = '#clipboard';
		var clipboardElements;
		
		// jQuery Dom Elements
		var $sidebar;
		var $clipboard;
		
		/*
		 * Initialize the Sidebar
		 */
		
		var Init = function(selector) {
			
			if( !!selector ) {
				sidebarSelector = selector;
			}
			
			if( !$(sidebarSelector).length ) {
				return false;
			}
			
			if( !$(clipboard).length ) {
				return false;
			}
			
			clipboardElements = Array();
			
			$sidebar = $(sidebarSelector);
			
		};
		
		var PushToClipboard = function(item) {
			
			var $clipboardElementContainer = $('<div>');
			$clipboardElementContainer.addClass('elementContainer');
			$clipboardElementContainer.append($(item));
			$clipboard.append($clipboardElementContainer);
			clipboardElements.push( item );
		};
		
		
		var PopFromClipboard = function(item) {
			
		};
		
		return {
			Init : Init,
			PushToClipbaord : PushToClipboard,
			PopFromClipboard : PopFromClipboard
		};
		
	}();
	
	
	
	
	
	
})(jQuery);