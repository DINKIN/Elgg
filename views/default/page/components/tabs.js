/**
 * Tabbed module
 *
 * @module page/components/tabs
 */
define(function (require) {

	var elgg = require('elgg');
	require('elgg/ready');
	var $ = require('jquery');
	var Ajax = require('elgg/Ajax');
	var ajax = new Ajax(false);

	function changeTab($tab) {

		$tab.siblings().andSelf().removeClass('elgg-state-selected');
		$tab.addClass('elgg-state-selected');

		var $target = $tab.data('target');
		if (!$target || !$target.length) {
			return false;
		}

		$target.siblings().addClass('hidden').removeClass('elgg-state-active');
		$target.removeClass('hidden').addClass('elgg-state-active');

		return true;
	};
	
	var clickLink = function (event) {
		console.log('clicked');
		var $link = $(this);
		if ($link.hasClass('elgg-non-link')) {
			return;
		}
		console.log('1');
		event.preventDefault();
		
		var $tab = $(this).parent();
		var $content = $('.elgg-tabs-content');

		var href = $link.data('ajaxHref') || $link.attr('href');
		var $target = $tab.data('target');
		if (!$target || !$target.length) {
			// store $tagret for future use
			$target = $($link.data('target'));
			$tab.data('target', $target);
		}
		
		if (href.indexOf('#') === 0) {
			// Open inline tab
			if (changeTab($tab)) {
				$tab.trigger('open');
				return;
			}
		} else {
			// Load an ajax tab
			if ($tab.data('loaded') && !$link.data('ajaxReload')) {
				if (changeTab($tab)) {
					$tab.trigger('open');
					return;
				}
			}
			
			ajax.path(href, {
				data: $link.data('ajaxQuery') || {},
				beforeSend: function () {
					changeTab($tab);
					$target.html('');
					$target.addClass('elgg-ajax-loader');
				}
			}).done(function (output, statusText, jqXHR) {
				$tab.data('loaded', true);
				$target.removeClass('elgg-ajax-loader');
				if (jqXHR.AjaxData.status === -1) {
					$target.html(elgg.echo('ajax:error'));
					return;
				} else {
					$target.html(output);
				}

				if (changeTab($tab)) {
					$tab.trigger('open');
				}
			});
		}
	};

	// register click event
	$(document).on('click', '.elgg-components-tab > a', clickLink);

	// Open selected tabs
	// This will load any selected tabs that link to ajax views
	$('.elgg-tabs-component .elgg-components-tab.elgg-state-selected > a').trigger('click');
});
