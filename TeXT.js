/**
 * A simple text editor plugin for jQuery
 * 
 * @author  Matheus Salmi
 */
(function($) {
	
	/**
	 * Formatting toolbox
	 */	
	function ToolBox(editor) {
		// TODO: make it extensible
		
		const OPEN_CLASS = 'open';
		
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
			
			// Actions
			obj.find('.bold').click(Actions.bold)
			obj.find('.italic').click(Actions.italic)
			obj.find('.underline').click(Actions.underline)
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
			obj.css({'left' : (event.pageX + 5), 'top' : (event.pageY + 5)}).fadeIn(180).addClass(OPEN_CLASS);
		}
		
		function hide(event) {
			obj.fadeOut(180).removeClass(OPEN_CLASS);
		}
		
		function _checkSelectionRange() {
			$(document).mousedown(function() {
				console.log(hover); // TODO: remove this
				console.log(selection); // TODO: remove this
				
				if(hover == false && selection != null) {
					selection.collapse(true); // TODO: this call is not standard and crashes on Firefox and IE
					selection = null;
				}
			});
		}
		
		function isVisible() {
			return obj.hasClass(OPEN_CLASS);
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
					Actions.bold();
				}

				if(e.metaKey && e.keyCode == 73) {
					Actions.italic();
				}
				
				if(e.metaKey && e.keyCode == 85) {
					Actions.underline();
				}
				
				// close toolbox with ESC
				if(e.keyCode == 27) {
					toolbox.hide();
				}
				
				// delete line using META D
				if(e.metaKey && e.keyCode == 68) {
					e.preventDefault();
					Actions.deleteLine(selection);
				}
			}
		});
	}
	
	/**
	 * Text editor actions
	 * 
	 * @type {Object}
	 */
	var Actions = {
		bold: function() {
			document.execCommand('bold');
		},
		
		italic: function() {
			document.execCommand('italic');
		},
		
		underline: function() {
			document.execCommand('underline');
		},
		
		deleteLine: function(selection) {
			selection.modify('move', 'backward', 'lineboundary');
			selection.modify('extend', 'forward', 'lineboundary');
			selection.deleteFromDocument();
		}
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
		// TODO: add options for customization purposes
		
		// selector matched one
		if(this.length == 1) {
			return new TeXT($(this));
		}
		
		// selector matched more than one
		var r = [];
		this.each(function() {
			r.push( new TeXT($(this)) );
		});
		
		return r;
	}
})(jQuery);