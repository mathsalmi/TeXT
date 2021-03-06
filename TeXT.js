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
		
		var self = this;
		
		var OPEN_CLASS = 'open';
		
		var $obj = null;
		var selection = null;
		
		/**
		 * Initializes the toolbox
		 */
		function init() {
			var html = '<div class="tools">' +
					'<a href="javascript:void(0)" class="bold"><img src="images/bold.png" alt="Bold"></a>' +
					'<a href="javascript:void(0)" class="italic"><img src="images/italic.png" alt="Italic"></a>' +
					'<a href="javascript:void(0)" class="underline"><img src="images/underline.png" alt="Underline"></a>' +
				'</div>';
			
			$obj = $(html).appendTo('body');
			
			// Actions
			$obj.find('.bold').click(Actions.bold)
			$obj.find('.italic').click(Actions.italic)
			$obj.find('.underline').click(Actions.underline)
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
			fixSelectionCollapse();
		}
		
		/**
		 * Tells whether or not mouse is hovering the toolbox
		 * @type {Boolean}
		 */
		self.isHovered = false;
		
		/**
		 * Checks whether the mouse is hovering the toolbox
		 */
		function checkHover() {
			$obj.mouseenter(function() {
				self.isHovered = true;
			}).mouseleave(function() {
				self.isHovered = false;
			});
		}
		
		/**
		 * Shows or hides the toolbox
		 */
		function toggle() {
			$(document).on('mouseup.ToolBox', function(e) {
				selection = document.getSelection();
				if( ! selection.isCollapsed && (editor.isFocused() || self.isHovered)) {
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
			$obj.css({'left' : (event.pageX + 5), 'top' : (event.pageY + 5)}).fadeIn(180).addClass(OPEN_CLASS);
		}
		
		/**
		 * Hides the toolbox
		 * @param  {event} mouse event
		 */
		this.hide = function(event) {
			$obj.fadeOut(180).removeClass(OPEN_CLASS);
		}
		
		/**
		 * Forces collapsing selection after clicking on something selected.
		 * Bug: select a word; click on the selection; it should deselect it and selection's isCollapsed property should be "false"
		 * 		but it is not what happens, so the toolbox never hides.
		 */
		function fixSelectionCollapse() {
			$(document).on("mousedown.ToolBox", function() {
				if(self.isHovered == false && selection != null) {
					selection.collapseToStart();
				}
			});
		}
		
		/**
		 * Checks whether or not the toolbox is visible
		 * @return {boolean} true if visible
		 */
		this.isVisible = function() {
			return $obj.hasClass(OPEN_CLASS);
		}
		
		/**
		 * Detaches toolbox
		 */
		this.detach = function() {
			// delete toolbox HTML
			$obj.remove();
			
			// remove events on Document
			$(document).off('.ToolBox');
		}
		
		// Execution
		init();
		run();
	}
	
	function Keyboard(editor) {
		// TODO: make it extensible
		
		/**
		 * Initializes the keyboard
		 */
		function init() {
			$(document).on("keydown.Keyboard", function(e) {
				var selection = document.getSelection();
				if(selection != null && editor.isFocused()) {
					
					// bold on META B
					if(actionKey(e) && e.keyCode == 66) {
						e.preventDefault();
						Actions.bold();
					}
					
					// italic on META I
					if(actionKey(e) && e.keyCode == 73) {
						e.preventDefault();
						Actions.italic();
					}
					
					// underline on META U
					if(actionKey(e) && e.keyCode == 85) {
						e.preventDefault();
						Actions.underline();
					}
					
					// close toolbox with ESC
					if(e.keyCode == 27) {
						e.preventDefault();
						editor.toolbox.hide();
					}
					
					// delete line using META D
					if(actionKey(e) && e.keyCode == 68) {
						e.preventDefault();
						Actions.deleteLine(selection);
					}
				}
			});
		}
		
		/**
		 * Returns which action key should be used depending on the OS
		 * @param  {event} e keyboard event
		 * @return {boolean}   whether or not the action key is pressed
		 */
		function actionKey(e) {
			var isMac = navigator.platform.toUpperCase().indexOf('MAC') != -1;
			if(isMac) {
				return e.metaKey;
			}
			
			return e.ctrlKey;
		}
		
		/**
		 * Detaches keyboard object
		 */
		this.detach = function() {
			$(document).off('.Keyboard');
		}
		
		// Execution
		init();
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
			document.execCommand('bold', false, null);
		},
		
		/**
		 * Makes selected text italic
		 */
		italic: function() {
			document.execCommand('italic', false, null);
		},
		
		/**
		 * Underlines selected text
		 */
		underline: function() {
			document.execCommand('underline', false, null);
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
		
		var self = this;
		
		/**
		 * Initializes the editor
		 */
		function init() {
			// set the content editable
			$obj.prop('contenteditable', true);
			
			// add instance of this to $obj
			$obj.data('TeXT', self);
			
			// initializes toolbox
			self.toolbox = new ToolBox(self);
			
			// initializes keyboard
			self.keyboard = new Keyboard(self);
		}
		
		/**
		 * Detaches editor, keyboard and the toolbox
		 */
		this.detach = function() {
			// set element's content not editable
			$obj.prop('contenteditable', false);
			
			// remove the instance of this from the object
			$obj.removeData('TeXT');
			
			// detach keyboard
			this.keyboard.detach();
			
			// detach toolbox
			this.toolbox.detach();
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
		// TODO: make it extensible
		
		var r = [];
		this.each(function() {
			var t = $(this).data('TeXT');
			if(t == null) {
				t = new TeXT($(this));
			}
			
			r.push(t);
		});
		
		return r.length == 1 ? r[0] : r;
	}
})(jQuery);