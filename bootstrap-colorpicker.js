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
						'<td class="color-preview" style="padding:0 3px;vertical-align:top"><div style="text-align:center;font-weight:bold;font-size:20px;letter-spacing:1px;color:#fff;border:1px solid #ccc"></div></td>'+
						'<td class="color-gradient" rowspan="3" style="vertical-align:top">&nbsp;</td>'+
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
	var rgb2hex = function(r, g, b) {
		return '#' + hex(r) + hex(g) + hex(b);
	}
	
	var hex2rgb = function(color) {
		return color.length == 4 ? [
			parseInt(color.charAt(1) + color.charAt(1), 16),
			parseInt(color.charAt(2) + color.charAt(2), 16),
			parseInt(color.charAt(3) + color.charAt(3), 16)] : 
		[
		 	parseInt(color.substr(1,2), 16), 
		 	parseInt(color.substr(3,2), 16), 
		 	parseInt(color.substr(5,2), 16)];
	};
	
	var rgb2hsl = function rgb2hsl(r, g, b) {
		r = r / 255;
		g = g / 255;
		b = b / 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;
	
		if (max == min)
			h = s = 0; // achromatic
		else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
			}
			h /= 6;
		}
		return [Math.round(360 * h), Math.round(100 * s), Math.round(100 * l)];
	}
	
	var hue2rgb = function(p, q, t) {
		(t < 0) && (t += 1);
		(t > 1) && (t -= 1);
		if (6 * t < 1) return p + (q - p) * 6 * t;
		if (2 * t < 1) return q;
		if (3 * t < 2) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
	
	// Params: h in [0, 360], s, l in [0, 100]
	// Returns: r, g, b  in [0, 255]
	var hsl2rgb = function(h, s, l) {
		var r, g, b;
	
		h = h / 360;
		s = s / 100;
		l = l / 100;
	
		if (s === 0) r = g = b = l; // achromatic
		else {
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

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
		cellSize: 18,
		gradientCellSize: 2,
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
			
			var h = 100*cp.options.gradientCellSize-cp.options.baseSize-32;
			cp.$colorPreview.css({height:h,lineHeight:h+'px'});
			
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
			this.$colorPreview.html(color);
			this.$dropdown.attr('title', color);
		},
		setColorEvent: function($td, callback) {
			var cp = this;
			$td.mouseenter(function(){
				var color = $(this).data('color');
				cp.$colorPreview.css({backgroundColor:color, color: $(this).data('_color')});
				cp.$colorPreview.html(color);
			}).mouseleave(function(){
				var color = cp.$target.val().toUpperCase();
				cp.$colorPreview.css({backgroundColor:color, color: $(this).data('_color')});
				cp.$colorPreview.html(color);
			});
			$td.on('click', function(e){
				e.stopPropagation();
				var $this = $(this);
				if(cp.$lastItem) cp.$lastItem.css('outline', 0);
				cp.setValue($this.data('color'));
				var rgb = $this.data('rgb');
				$this.css('outline', '1px solid ' + $this.data('_color'));
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
						var $td = $('<td>&nbsp;</td>').appendTo($tr), 
							a = colorPattern[i], 
							b = colorPattern[j], 
							c = colorPattern[k], 
							color = rgb2hex(a, b, c);
						setStyle($td, cp.options.cellStyle);
						$td.width(cp.options.cellSize);
						$td.height(cp.options.cellSize);
						$td.data('color', color);
						$td.data('_color', rgb2hex(255-a, 255-b, 255-c));
						$td.data('rgb', [a, b, c]);
						$td.css({
							backgroundColor: color
						});
						$td.attr('title', color);
						cp.setColorEvent($td, function(){
							cp.updateGradientBar();
						});
					}
				}
			}
			this.updateGradientBar();
			this.renderActionCol();
		},
		updateGradientBar: function() {
			var cp = this, rgb = hex2rgb(cp.$target.val()), r0 = rgb[0], g0 = rgb[1], b0 = rgb[2];
			cp.$colorGradient.html('');
			var $table = $('<table>').appendTo(cp.$colorGradient);
			var hsl = rgb2hsl(r0, g0, b0), s = ((r0 == 0 && g0 == 0 && b0 == 0)||(r0 == 255 && g0 == 255 && b0 == 255)) ? 0 : 100;
			for(var i = 0; i <= 100; i++) {
				rgb = hsl2rgb(hsl[0], s, i);
				var color = rgb2hex(rgb[0], rgb[1], rgb[2]);
				var $tr = $('<tr>').appendTo($table);
				var $td = $('<td>').appendTo($tr);
				$td.attr('title', color);
				$td.data('color', color);
				$td.data('_color', rgb2hex(255-rgb[0], 255-rgb[1], 255-rgb[2]));
				$td.data('rgb', rgb);
				$td.css({
					width: cp.options.cellSize,
					minWidth: cp.options.cellSize,
					height: cp.options.gradientCellSize,
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
					marginLeft: 3,
					marginRight: 3,
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
