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
		
		var self = this;
		
		/**
		 * Initializes the toolbox
		 */
		function init() {
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
		
		/**
		 * Methods to be executed after 'init' is ran
		 */
		function run() {
			// check whether or not the mouse is hovering the tools box
			checkHover();
			
			// toggle toolbox
			toggle();
			
			// fix problem with selection range
			fixSelectionRange();
		}
		
		/**
		 * Checks whether the mouse is hovering the toolbox
		 */
		function checkHover() {
			obj.mouseenter(function() {
				hover = true;
			}).mouseleave(function() {
				hover = false;
			});
		}
		
		/**
		 * Shows or hides the toolbox
		 */
		function toggle() {
			$(document).mouseup(function(e) {
				selection = document.getSelection();
				if( ! selection.isCollapsed && editor.isFocused()) {
					if( ! self.isVisible()) {
						self.show(e);
					}
				} else {
					self.hide(e);
				}
			});
		}
		
		/**
		 * Shows the toolbox
		 * @param  {event} mouse event
		 */
		this.show = function(event) {
			obj.css({'left' : (event.pageX + 5), 'top' : (event.pageY + 5)}).fadeIn(180).addClass(OPEN_CLASS);
		}
		
		/**
		 * Hides the toolbox
		 * @param  {event} mouse event
		 */
		this.hide = function(event) {
			obj.fadeOut(180).removeClass(OPEN_CLASS);
		}
		
		/**
		 * Collapses text selection
		 */
		function fixSelectionRange() {
			$(document).mousedown(function() {
				console.log(hover); // TODO: remove this
				console.log(selection); // TODO: remove this
				
				if(hover == false && selection != null) {
					selection.collapse(true); // TODO: this call is not standard and crashes on Firefox and IE
					selection = null;
				}
			});
		}
		
		/**
		 * Checks whether or not the toolbox is visible
		 * @return {boolean} true if visible
		 */
		this.isVisible = function() {
			return obj.hasClass(OPEN_CLASS);
		}
		
		// Execution
		init();
		run();
	}
	
	function Keyboard(editor) {
		// TODO: make it extensible
		// TODO: change metaKey or ctrlKey depending on the OS
		
		$(document).keydown(function(e) {
			var selection = document.getSelection();
			if(selection != null && editor.isFocused()) {
				// bold on META B
				if(e.metaKey && e.keyCode == 66) {
					e.preventDefault();
					Actions.bold();
				}
				
				// italic on META I
				if(e.metaKey && e.keyCode == 73) {
					Actions.italic();
				}
				
				// underline on META U
				if(e.metaKey && e.keyCode == 85) {
					Actions.underline();
				}
				
				// close toolbox with ESC
				if(e.keyCode == 27) {
					editor.toolbox.hide();
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
		/**
		 * Makes selected text bold
		 */
		bold: function() {
			document.execCommand('bold');
		},
		
		/**
		 * Makes selected text italic
		 */
		italic: function() {
			document.execCommand('italic');
		},
		
		/**
		 * Underlines selected text
		 */
		underline: function() {
			document.execCommand('underline');
		},
		
		/**
		 * Deletes selected line
		 * @param  {Selection} selection the selection object
		 */
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
		
		/**
		 * Initializes the editor
		 */
		function init() {
			// TODO: check whether this was already instantiated
			// TODO: create detach method
			
			// set the content editable
			$obj.prop('contenteditable', true);
		}
		
		/**
		 * Checks whether or not the editor is focused
		 * @return {Boolean} true if it is focused
		 */
		this.isFocused = function() {
			return $(document.activeElement).is($obj);
		}
		
		/**
		 * Returns editor's value in HTML
		 * @return {string} editor's value
		 */
		this.getHTML = function() {
			return $obj.html();
		}
		
		/**
		 * Returns editor's value in simple text
		 * @return {string} editor's value
		 */
		this.getText = function() {
			return $obj.text();
		}
		
		// TODO: delete this function
		this.changeBg = function() {
			$obj.css('background', 'red');
		}
		
		// add tooltip box to public methods	
		this.toolbox = new ToolBox(this);
		
		// add keyboard to public methods
		this.keyboard = new Keyboard(this);
		
		// Execution
		init();
	}
	
	/**
	 * jQuery integration
	 * 
	 * @return object an instance of TeXT
	 * @return array array of instances of TeXT
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