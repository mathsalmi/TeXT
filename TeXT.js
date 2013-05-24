/**
 * A simple text editor plugin for jQuery
 * 
 * @author  Matheus Salmi
 */
(function($) {
	
	/**
	 * Formatting toolbox
	 */
	var Toolbox = {
		// TODO: make it extensible
		// TODO: return public methods
		// TODO: work for many elements
		
		obj: null,
		selection: null,
		hover: false,
		
		init: function() {
			var html = '<div class="tools">' +
					'<a href="javascript:void(0)" class="bold"><img src="images/bold.png" alt="Bold"></a>' +
					'<a href="javascript:void(0)" class="italic"><img src="images/italic.png" alt="Italic"></a>' +
					'<a href="javascript:void(0)" class="underline"><img src="images/underline.png" alt="Underline"></a>' +
				'</div>';
			
			this.obj = $(html).appendTo('body');
		},
		
		run: function() {
			// check whether or not the mouse is hovering the tools box
			this.checkHover();
			
			// toggle toolbox
			this.toggle();
			
			// fix problem with selection range
			this.checkSelectionRange();
		},
		
		checkHover: function() {
			var that = this;
			this.getObj().mouseenter(function() {
				that.hover = true;
			}).mouseleave(function() {
				that.hover = false;
			});
		},
		
		toggle: function() {
			var that = this;
			$(document).mouseup(function(e) {
				that.selection = document.getSelection();
				if(that.selection.toString() != '') {
					if( ! that.isOpen()) {
						that.show(e);
					}
				} else {
					that.hide(e);
				}
			});
		},
		
		show: function(event) {
			this.getObj().css({'left' : (event.pageX + 5), 'top' : (event.pageY + 5)}).fadeIn(180).addClass('open');
		},
		
		hide: function(event) {
			this.getObj().fadeOut(180).removeClass('open');
		},
		
		checkSelectionRange: function() {
			var that = this;
			$(document).mousedown(function() {
				if(that.hover == false && that.selection != null) {
					that.selection.collapse(true);
					that.selection = null;
				}
			})	
		},
		
		isOpen: function() {
			return this.getObj().hasClass('open');
		},
		
		getObj: function() {
			if(this.obj == null) {
				this.init();
			}

			return this.obj;
		},
	};
	
	var Keyboard = {
		// TODO: make it extensible
		// TODO: return public methods
		// TODO: work for many elements
		
		editor: null,
		toolbox: null,
		selection: null, // TODO: check whether or not is needed. Perhaps move document.getSelection() to an object
		
		init: function(editor, toolbox) {
			if(editor == null || toolbox == null) {
				throw new Error("There must be an instance of the Editor and the Toobox");
			}
			
			this.editor = editor;
			this.toolbox = toolbox;
			
			return this;
		},
		
		run: function() {
			var that = this;
			
			$(document).keydown(function(e) {
				var selection = document.getSelection();
				if(selection != null && that.editor.isFocused()) {
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
						that.toolbox.fadeOut(180).removeClass('open'); // TODO: refactor this
					}
					
					// delete line using META D
					if(e.metaKey && e.keyCode == 68) {
						e.preventDefault();
						selection.modify('move', 'backward', 'lineboundary');
						selection.modify('extend', 'forward', 'lineboundary');
						selection.deleteFromDocument();
					}
				}
			})
		},
	};
	
	/**
	 * TeXT Editor
	 * 
	 * @param jQuery $obj the object to add this editor to
	 */
	function TeXT($obj) {
		var _init = function() {
			// TODO: check whether this was already instantiated
			
			// set the content editable
			$obj.prop('contenteditable', true);
		}
		
		var _isEditorFocused = function() {
			return $(document.activeElement).is($obj);
		}
		
		var _getHTML = function() {
			return $obj.html();
		}
		
		var _getText = function() {
			return $obj.text();
		}
		
		var methods = {
			isFocused: _isEditorFocused,
			getHTML: _getHTML,
			getText: _getText
		}
		
		// Execution
		_init();
		Toolbox.run();
		Keyboard.init(methods, Toolbox.getObj()).run();
		
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