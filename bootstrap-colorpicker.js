/*!
 * ColorPicker v1.0.0 (https://github.com/docao/colorpicker)
 * Copyright (c) 2015 docv.hcm@gmail.com
 * Licensed under MIT (https://github.com/docao/colorpicker/blob/master/LICENSE)
 */

/**
 * @description A lightweight color picker
 * @version 1.0.0
 * @author docv.hcm@gmail.com
 */

+function($) {
	'use strict';

	// COLORPICKER CLASS DEFINITION
	// =========================

	var template = 
		'<div class="btn-group dropdown">' + 
			'<button type="button" class="btn color-btn" disabled style="opacity:1;filter:alpha(opacity=100)">' +
				'<i>&nbsp;</i>' +
			'</button>' +
			'<button type="button" data-toggle="dropdown" class="btn dropdown-toggle">' +
				'<span class="caret"></span><span class="sr-only">Toggle Dropdown</span>' +
			'</button>' + 
			'<div class="dropdown-menu">' +
				'<table>'+
					'<tr>'+
						'<td class="color-preview" style="padding:0 3px;vertical-align:top"><div></div></td>'+
						'<td class="color-gradient" rowspan="3">&times;</td>'+
					'</tr>'+
					'<tr>'+
						'<td class="color-box"><div></div></td>'+
					'</tr>'+
					'<tr>'+
						'<td class="action-col"></td>'+
					'</tr>'+
				'</table>'+				
			'</div>'+
		'</div>';
	var colorPattern = [0, 51, 102, 153, 204, 255];
	function hex(c) {
		var hex = c.toString(16);
		return (hex.length == 1 ? '0' + hex : hex).toUpperCase();
	}
	var hexColor = function(r, g, b) {
		return '#' + hex(r) + hex(g) + hex(b);
	}
	
	var hex2RGB = function(color) {
		var r, g, b;
		if(color.length == 4) {
			r = parseInt(color.charAt(1) + color.charAt(1), 16);
			g = parseInt(color.charAt(2) + color.charAt(2), 16);
			b = parseInt(color.charAt(3) + color.charAt(3), 16);
		} else {
			r = parseInt(color.substr(1,2), 16);
			g = parseInt(color.substr(3,2), 16);
			b = parseInt(color.substr(5,2), 16);
		}
		return [r,g,b];
	};
	
	var ColorPicker = function(element, options) {
		this.$target = $(element);
		this.options = options;
		this.init();
	}
	
	var setStyle = function($elem, style) {
		(typeof style == 'string') ? $elem.addClass(style) : $elem.css(style);
	}

	ColorPicker.DEFAULTS = {
		btnStyle: 'btn-default',
		dropdownAlign: null,
		defaultColor: '#000000',
		dropdownStyle: {},
		cellSize: 22,
		cellStyle: {
			padding: 0,
			border: '1px solid #ccc',
			boxSizing: 'content-box',
			cursor: 'pointer',
			textAlign: 'center'
		}
	}
	
	ColorPicker.prototype = {
		constructor: ColorPicker,
		init: function() {
			var cp = this;
			
			cp.options.cellSize = Math.max(cp.options.cellSize, 22);
			cp.options.baseSize = 6*(cp.options.cellSize +2) + 21;
			
			cp.$dropdown = $(template);
			cp.$target.after(cp.$dropdown);
			cp.$colorBtn = cp.$dropdown.find('.color-btn');
			cp.$arrowBtn = cp.$dropdown.find('.dropdown-toggle');
			cp.$miniPreview = cp.$colorBtn.children('i');
			cp.$menu = cp.$dropdown.find('.dropdown-menu');
			cp.$colorBox = cp.$menu.find('td.color-box>div');
			cp.$colorPreview = cp.$menu.find('td.color-preview>div');
			cp.$colorGradient = cp.$menu.find('td.color-gradient');
			cp.$actionCol = cp.$menu.find('td.action-col');
			
			cp.$colorContainer = $('<div class="clearfix">').appendTo(cp.$colorBox);
			
			cp.$target.hide();
			
			setStyle(cp.$colorBtn, cp.options.btnStyle);
			setStyle(cp.$arrowBtn, cp.options.btnStyle);
			
			cp.$miniPreview.css({
				display: 'inline-block',
				width: 20,
				outline: '1px solid #ccc'
			});
			
			cp.$menu.css({
				padding: 3,
				background: '#057',
				width: cp.options.baseSize + cp.options.cellSize + 9
			});
			setStyle(cp.$menu, cp.options.dropdownStyle);
			if(cp.options.dropdownAlign=='right') cp.$menu.addClass('pull-right');
			
			cp.$colorPreview.css('height', 256-cp.options.baseSize-32);
			
			cp.$colorBox.css({
				overflow: 'hidden',
				position: 'relative',
				width: cp.options.baseSize,
				height: cp.options.baseSize
			});
			
			cp.$colorContainer.css({
				width: cp.options.baseSize * colorPattern.length,
				height: cp.options.baseSize,
				position: 'absolute'
			});
			
			this.$actionCol.css('height', 30);
			
			cp.$colorGradient.css('width', cp.options.cellSize);
			
			cp.setValue(cp.options.defaultColor);
			cp.$dropdown.on('show.bs.dropdown', function () {
				cp.$colorContainer.is(':empty') && cp.createDropdown();
			})
			
			cp.$menu.on('click', function(e){
				e.stopPropagation();
			});
		},
		setValue: function(color) {
			this.$miniPreview.css('backgroundColor', color);
			this.$colorPreview.css('backgroundColor', color);
			this.$target.val(color);
			this.$dropdown.attr('title', color);
		},
		setColorEvent: function($td, callback) {
			var cp = this;
			$td.mouseenter(function(){
				cp.$colorPreview.css('backgroundColor', $(this).data('bgColor'));
			}).mouseleave(function(){
				cp.$colorPreview.css('backgroundColor', cp.$target.val());
			});
			$td.on('click', function(e){
				e.stopPropagation();
				var $this = $(this);
				if(cp.$lastItem) cp.$lastItem.css('color', cp.$lastItem.data('bgColor'));
				cp.setValue($this.data('bgColor'));
				$this.css('color', $this.data('textColor'));
				cp.$lastItem = $this;
				if(typeof callback == 'function') callback();
			});
		},
		createDropdown: function() {
			var cp = this;
			for(var i in colorPattern) {
				var $colorTable = $('<table class="table pull-left">');
				$colorTable.css({
					width: 'auto',
					borderSpacing: 3,
					borderCollapse: 'separate',
					marginBottom: 0,
					borderColor: '#ccc'
				}).appendTo(cp.$colorContainer);
				for(var j in colorPattern) {
					var $tr = $('<tr>').appendTo($colorTable);
					for(var k in colorPattern) {
						var $td = $('<td><i style="font-size:16px;font-weight:bold">&times;</i></td>').appendTo($tr), 
							a = colorPattern[i], 
							b = colorPattern[j], 
							c = colorPattern[k], 
							bgColor = hexColor(a, b, c),
							textColor = hexColor(255-a, 255-b, 255-c);
						setStyle($td, cp.options.cellStyle);
						$td.width(cp.options.cellSize);
						$td.height(cp.options.cellSize);
						$td.data('rgb', [a,b,c]);
						$td.data('bgColor', bgColor);
						$td.data('textColor', textColor);
						$td.css({
							backgroundColor: bgColor,
							color: bgColor
						});
						$td.attr('title', bgColor);
						cp.setColorEvent($td, function(){
							cp.renderGradientBar();
						});
					}
				}
			}
			this.renderGradientBar();
			this.renderActionCol();
		},
		renderGradientBar: function() {
			var cp = this, rgb = hex2RGB(cp.$target.val()), r0 = rgb[0], g0 = rgb[1], b0 = rgb[2];
			cp.$colorGradient.html('');
			var _r0 = 255-r0, _g0 = 255-g0, _b0 = 255-b0, g0_r0 = g0/r0, _g0_r0 = _g0/_r0, b0_r0 = b0/r0, _b0_r0 = _b0/_r0;
			var $table = $('<table>').appendTo(cp.$colorGradient);
			for(var i = 0; i <= 127; i++) {
				var r = i * 2, g, b;
				if(r <= r0) {
					g = Math.round(r * (g0/r0));
					b = Math.round(r * (b0/r0));
				} else {
					g = Math.round(g0 + (r-r0)*_g0_r0);
					b = Math.round(b0 + (r-r0)*_b0_r0);
				}
				if(isNaN(g) || isNaN(b)) continue;
				var color = hexColor(r,g,b);
				var $tr = $('<tr>').appendTo($table);
				var $td = $('<td>').appendTo($tr);
				$td.attr('title', color);
				$td.data('rgb', [r,g,b]);
				$td.data('bgColor', color);
				$td.css({
					width: cp.options.cellSize,
					minWidth: cp.options.cellSize,
					height: 2,
					cursor: 'crosshair',
					backgroundColor: color
				});
				cp.setColorEvent($td);
			}
		},
		renderActionCol: function() {
			var cp = this;
			var $ul = $('<ul class="carousel-indicators">').appendTo(cp.$actionCol);
			$ul.css({
				position: 'static',
				margin: 0,
				width: 'auto'
			});
			for(var i = 0; i < colorPattern.length; i++) {
				var $li = $('<li>').appendTo($ul);
				$li.css({
					outline: 'none',
					marginLeft: 5,
					marginRight: 5,
					width: 16,
					height: 16
				});
				$li.attr('tabindex', i);
				if(i == 0) $li.addClass('active');
				$li.on('click', function(e){
					e.stopPropagation();
					var $this = $(this);
					$ul.children('.active').removeClass('active');
					$this.addClass('active');
					cp.$colorContainer.animate({left: -cp.options.baseSize * Number($this.attr('tabindex'))});
				});
			}
		}
	};

	// COLORPICKER PLUGIN DEFINITION
	// ==========================

	function Plugin(option) {
		// get the args of the outer function..
		var args = arguments;
		// The arguments of the function are explicitly re-defined from the
		// argument list, because the shift causes them
		// to get lost
		// noinspection JSDuplicatedDeclaration
		var _option = option, option = args[0], event = args[1];
		[].shift.apply(args);

		// This fixes a bug in the js implementation on android 2.3 #715
		if (typeof option == 'undefined') {
			option = _option;
		}

		return this.each(function() {
			var $input = $(this);
			var colorpicker = $input.data('bs.colorpicker');
			var options = $.extend({}, ColorPicker.DEFAULTS, $input.data(),
					typeof option == 'object' && option);
			if (!colorpicker)
				$input.data('bs.colorpicker', (colorpicker = new ColorPicker(
						this, options)))
			if (typeof option == 'string')
				colorpicker[option]();
		});
	}

	var old = $.fn.colorpicker;

	$.fn.colorpicker = Plugin;
	$.fn.colorpicker.Constructor = ColorPicker;

	// COLORPICKER NO CONFLICT
	// ====================

	$.fn.colorpicker.noConflict = function() {
		$.fn.colorpicker = old;
		return this;
	}

	// COLORPICKER DATA-API
	// ===================================

	$(window).on('load.bs.colorpicker.data-api', function() {
		Plugin.call($('input[data-toggle="colorpicker"],input[type="color"]'));
	});

}(jQuery);
