/**
 * A simple text editor plugin for jQuery
 * 
 * @author  Matheus Salmi
 */
(function($) {
	
	// TODO: create singleton objects for keyboard and mouse events
	
	/**
	 * Formatting toolbox
	 */	
	function ToolBox(editor) {
		// TODO: make it extensible
		// TODO: change the way mouse and keyboard events are dealt
		
		var obj = null;
		var selection = null;
		var hover = false;
		
		// Methods
		function _init() {
			var html = '<div class="tools">' +
					'<a href="javascript:void(0)" class="bold"><img src="images/bold.png" alt="Bold"></a>' +
					'<a href="javascript:void(0)" class="italic"><img src="images/italic.png" alt="Italic"></a>' +
					'<a href="javascript:void(0)" class="underline"><img src="images/underline.png" alt="Underline"></a>' +
				'</div>';
			
			obj = $(html).appendTo('body');
		}
		
		function _run() {
			// check whether or not the mouse is hovering the tools box
			_checkHover();
			
			// toggle toolbox
			_toggle();
			
			// fix problem with selection range
			_checkSelectionRange();
		}
		
		function _checkHover() {
			obj.mouseenter(function() {
				hover = true;
			}).mouseleave(function() {
				hover = false;
			});
			
			console.log(hover); // TODO: remove this
		}
		
		function _toggle() {
			$(document).mouseup(function(e) {
				selection = document.getSelection();
				if( ! selection.isCollapsed && editor.isFocused()) {
					if( ! isVisible()) {
						show(e);
					}
				} else {
					hide(e);
				}
			});
		}
		
		function show(event) {
			obj.css({'left' : (event.pageX + 5), 'top' : (event.pageY + 5)}).fadeIn(180).addClass('open');
		}
		
		function hide(event) {
			// TODO: move the css class "open" to a constant
			obj.fadeOut(180).removeClass('open');
		}
		
		function _checkSelectionRange() {
			$(document).mousedown(function() {
				console.log(hover); // TODO: remove this
				console.log(selection); // TODO: remove this
				
				if(hover == false && selection != null) {
					selection.collapse(true);
					selection = null;
				}
			});
		}
		
		function isVisible() {
			return obj.hasClass('open');
		}
		
		// Execution
		_init();
		_run();
		
		return {
			show: show,
			hide: hide,
			isVisible: isVisible,
		}
	}
	
	function Keyboard(editor, toolbox) {
		// TODO: make it extensible
		
		$(document).keydown(function(e) {
			var selection = document.getSelection();
			if(selection != null && editor.isFocused()) {
				if(e.metaKey && e.keyCode == 66) {
					e.preventDefault();
					document.execCommand('bold');
				}

				if(e.metaKey && e.keyCode == 73) {
					document.execCommand('italic');
				}
				
				if(e.metaKey && e.keyCode == 85) {
					document.execCommand('underline');
				}
				
				// close toolbox with ESC
				if(e.keyCode == 27) {
					toolbox.hide();
				}
				
				// delete line using META D
				if(e.metaKey && e.keyCode == 68) {
					e.preventDefault();
					selection.modify('move', 'backward', 'lineboundary');
					selection.modify('extend', 'forward', 'lineboundary');
					selection.deleteFromDocument();
				}
			}
		});
	}
	
	/**
	 * TeXT Editor
	 * 
	 * @param jQuery $obj the object to add this editor to
	 */
	function TeXT($obj) {
		var _toolbox = null;
		
		var _init = function() {
			// TODO: check whether this was already instantiated
			// TODO: create detach method
			
			// set the content editable
			$obj.prop('contenteditable', true);
		}
		
		var isFocused = function() {
			return $(document.activeElement).is($obj);
		}
		
		var getHTML = function() {
			return $obj.html();
		}
		
		var getText = function() {
			return $obj.text();
		}
		
		function changeBg() {
			$obj.css('background', 'red');
		}
		
		// Execution
		_init();
		
		var methods = {
			isFocused: isFocused,
			getHTML: getHTML,
			getText: getText,
			changeBg: changeBg,
		};
		
		_toolbox = new ToolBox(methods);
		methods.box = _toolbox; // add to public methods
		
		_keyboard = new Keyboard(methods, _toolbox);
		methods.keyboard = _keyboard; // add to public methods
		
		// Returns public functions
		return methods;
	}
	
	/**
	 * jQuery integration
	 * 
	 * @return array an instance of the objects
	 */
	$.fn.TeXT = function() {
		// TODO: if there is only one object in THIS, then return the object otherwise return an array of objects
		// TODO: add options for customization purposes
		var r = [];
		
		this.each(function() {
			r.push( new TeXT($(this)) );
		});
		
		return r;
	}
})(jQuery);