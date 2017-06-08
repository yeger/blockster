
var blockster = {};

$(document).ready(function() {

	blockster = {
		workField : $('#blockster_work_field'),
		blocksList : $('#blockster_blocks_list'),
		modal : $('.remodal'),
		genId : function () {

			var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
			var ALPHABET_LENGTH = ALPHABET.length;
			var ID_LENGTH = 8;

			var rtn = '';
			for (var i = 0; i < ID_LENGTH; i++) {
				rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
			}
			return rtn;

		},
		createElem : function () {

			function addElem(type, tag, className, blockInnerHtml) {

				if ( type == 'emmet' ) {

					$(tag).each(function(index, el) {

						var id = blockster.genId();

						$(this).attr('data-blockster-id', id);

						blockster.workField.append($(el));

						blockster.blocksList.append(`
							<div class="_blockster_block" data-blockster-id="${id}">
								<span class="open_close_tag"></span>
								${$(el).prop('tagName').toLowerCase()}
							</div>
						`);

					});


				} else if (type == 'html') {

					var tag = tag || 'div';
					var id = blockster.genId();

					blockster.workField.append(`
						<${tag} class="${className}" data-blockster-id="${id}">
							${blockInnerHtml}
						</${tag}>
					`);

					blockster.blocksList.append(`
						<div class="_blockster_block" data-blockster-id="${id}">
						<span class="open_close_tag"></span>
							${tag} : ${className}
						</div>
					`);
				}

			};


			$('[data-remodal-id="blockster_create_block"] :submit').on('click', function(e) {

				e.preventDefault();

				var modal = $(this).closest('.remodal');
				var blockTypeStatus = modal.find('[data-tabs-title].active').data('tabs-title');

				if ( blockTypeStatus == 'html' ) {

					var tag = modal.find('input[name="tag"]').val();
					var className = modal.find('input[name="class"]').val();
					var blockInnerHtml = modal.find('textarea[name="html"]').val();

					addElem('html', tag, className, blockInnerHtml);

				} else if ( blockTypeStatus == 'emmet' ) {

					var emmetValue = modal.find('[name="emmet"]').val();
					var parseHtml = DOM.emmet(emmetValue);

					addElem('emmet', parseHtml);

				} else if ( blockTypeStatus == 'bemjson' ) {

					var value = modal.find('[name="bemjson"]').val();

				}

				return false;
			});

		},
		highlightElem : function () {

			var id = '';

			$(document).on('mouseover', '[data-blockster-id]:not(._blockster_select)', function() {

				id = $(this).data('blockster-id');
				$('[data-blockster-id="'+id+'"]').addClass('_blockster_highlight');

			}).on('mouseleave', '[data-blockster-id]', function() {

				$('[data-blockster-id="'+id+'"]').removeClass('_blockster_highlight');

			});

		},
		selectElem : function () {

			$(document).on('click', '[data-blockster-id]', function(e) {

				if ( ! $(e.target).is('.open_close_tag') ) {
					var id = $(this).data('blockster-id');
					$('[data-blockster-id]').not($('[data-blockster-id="'+id+'"]')).removeClass('_blockster_select');
					$('[data-blockster-id="'+id+'"]').toggleClass('_blockster_select');

				}

			});

		},
		openCloseBlock : function () {

			$(document).on('click', '._blockster_block', function(e) {

				if ( $(e.target).is('.open_close_tag') ) {
					$(this).toggleClass('_blockster_block--opened');
					$(this).trigger('click');
				}

			});

		},
		deleteElem : function () {

			$(document).on('keydown', function(e) {
				if ( e.key == 'Delete' ) {
					if ( confirm('Удалить блок') ) {
						$('[data-blockster-id]._blockster_select').remove();
					}
				}
			});

		},
		tabs : function () {

			$(document).on('click', '[data-tabs-title]:not(.active)', function(event) {

				var ind = $(this).index();

				$(this)
					.addClass('active')
					.siblings()
					.removeClass('active')
					.closest('[data-tabs]')
					.find('[data-tabs-body]')
					.eq(ind)
					.show()
					.siblings()
					.hide();

			});

			$('[data-tabs]').each(function(index, el) {

				if ( ! $(this).find('[data-tabs-title].active').length ) {
					$(this).find('[data-tabs-title]:first').click();
				} else {
					$(this).find('[data-tabs-title].active').click();
				}

			});

		},
		init : function () {
			this.highlightElem();
			this.createElem();
			this.selectElem();
			this.deleteElem();
			this.tabs();
			this.openCloseBlock();
		}
	};

	blockster.init();

});