(function($){
	"use strict";
	$.fn.extend({
		void_autocomplete: function(options) {

			var defaults = {
				min: 1,
				selections: 0,
				list: [],
				caseSensitive: false,
				maxResults: 10,
				sortKey: false,
				ajax: false,
				openUp: false,
				onItemSelect: function(){}
			};

			var options = $.extend(defaults, options),
				base = this,
				container,
				items;

			// SETUP UI

			function triggered(str){
				if(!options.ajax)
					getAutocomplete(str);
				else if(str.length >= options.min){
					changeList([]);
					getAutocomplete('');
					setAjaxListCall(str);
				}
			}

			var ajaxCall;

			function setAjaxListCall(str){

				if(typeof ajaxCall != 'undefined')
					clearTimeout(ajaxCall);

				ajaxCall = setTimeout(function(){
					getAjaxList(str);
				}, 400);
				
			}

			function getAjaxList(str){
				try{

					var base = this,
						URL = options.ajax + '?q=' + encodeURIComponent(str);

					if(typeof ajax != 'undefined'){ 
						ajax.abort();
					}

			        $.ajax({
			            type: "GET",
	            		url: URL,
	            		searchString: str,
						success: function(response) {
							console.log(response);
							changeList(response);
							getAutocomplete(this.searchString);
						},
						error: function(request, textStatus, errorThrown) {
							console.log(errorThrown);
						}
					});

				}
				catch(e){
					console.log(e);
				}
			}

			function changeList(newList){
				options.list = newList;
			}

			function getAutocomplete(str){

				var arData = options.list;

				if(typeof str !== 'string'){

					container.find('.options_list').remove();

				} else {

					var ar = [];

					for(var i=0; i<arData.length; i++){

						if(has(arData[i], 'title') && typeof arData[i].title == 'string'){

							var idx = arData[i].title.toLowerCase().indexOf(str.toLowerCase());

							if(idx>-1){
								arData[i].idx = idx;
								ar.push(arData[i]);
							}
						}
					}
						
					ar = ar.sort(dynamicSort("idx"));

					if(options.sortKey)
						ar = ar.sort(dynamicSort(options.sortKey));

					ar = ar.splice(0, options.maxResults);

					var html = '<div id="options_list" class="options_list">';

					for(var i=0; i<ar.length; i++){
						if(ar[i].id){
							html += '<a "href=:;" class="item_list" data-option-id="' + ar[i].id + '">' + findAndTag(ar[i].title, str, 'strong') + '</a>';
						} else {
							html += '<a "href=:;" class="item_list" data-option-id="0">' + ar[i].title + '</a>';
						}
					}

					html += '</div>';

					container.find('.options_list').remove();

					container.append(html);

					container.find('a.item_list').each(function(){
						$(this).click(function(){
							var arrIdx = $(this).attr('data-option-id');
							selectItem(arrIdx);
						});
						$(this).mouseenter(function(){
							hoverItem($(this).index());
						});
					});

					changeItem(1);

				}

			}

			var selected = false;

			function selectItem(arrIdx){
				var obj = getObjByProp(options.list, 'id', arrIdx);

				if(obj){
					selected = obj.id;
					options.onItemSelect.call(this, obj, true);
					
					if(options.selections){
						if(obj.title != obj.id){
							var showTitle = obj.title;

						}else{
							var showTitle = 'ítem ' + obj.title;
						}

						var tag = insertTag("<strong>" + showTitle + "</strong>");
						container.addClass('tagged');
						tag.click(function(){
							selectItem(false);
						});
					}
				} else {
					selected = false;
					unselectItem(false);
				}

				getAutocomplete(false);
				base.val('');
			}
			
			function insertTag(txt){
				var html = '<div class="tag">' + txt + '</div>';
				container.append(html);
				base.blur();

				return container.find('.tag');
			}

			function findAndTag(text, find, tag){

				var idx = text.toLowerCase().indexOf(find.toLowerCase());

				if(idx > -1){
					return text.slice(0, idx) + '<' + tag + '>' + text.slice(idx, idx+find.length) + '</' + tag + '>' + text.slice(idx+find.length, text.length);
				} else {
					return text;
				}

			}

			function hoverItem(id){
				container.find('a.item_list').each(function(index){
					if(id == index){
						$(this).addClass('selected');
					} else {
						$(this).removeClass('selected');
					}
				});
			}

			function changeItem(delta){
				var item = container.find('.selected');

				if(item.length < 1){
					container.find('a.item_list').first().addClass('selected');
				} else {
					if(delta == 1 && item.next().length > 0){
						item.removeClass('selected');
						item.next().addClass('selected');
					} else if(delta ==-1 && item.prev().length > 0){
						item.removeClass('selected');
						item.prev().addClass('selected');
					}
				}
			}

			function clickCurrent(id){
				if(id == 'current'){
					var item = container.find('.selected').trigger('click');
				}
			}

			function init(){

				base.keyup(function(event){
					if (event.which != 38 && event.which != 40 && event.which != 13)
						triggered($(this).val());

				}).keydown(function(event){
					if (event.which == 38){
						changeItem(-1);
						event.stopPropagation();

					} else if (event.which == 40){
						changeItem(1);
						event.stopPropagation();

					} else if (event.which == 13){
						clickCurrent('current');
						event.stopPropagation();
					}

				}).focus(function() {
					triggered($(this).val());

				}).focusout(function() {
					var opts = container.find('.options_list');
					
					if(opts.length && idIsHovered(opts.attr('id'))){
						//console.log(idIsHovered(opts.attr('id')));
					}else{
						getAutocomplete(false);
					}
				});

				base.wrap("<div class='field_autocomplete'></div>");
				container = base.parent();

				if(options.openUp)
					container.addClass('openup');
			}

			function idIsHovered(id){
			    return jQuery("#" + id + ":hover").length > 0;
			}

			function unselectItem(id){
				options.onItemSelect.call(this, getObjByProp(options.list, 'id', id), false);
				if(options.selections){
					container.find('.tag').remove();
					container.removeClass('tagged');
				}
			}

			function dynamicSort(property) { // sort array of objects by obj.attr: array.sort(dynamicSort("attributte"))
			    var sortOrder = 1;
			    if(property[0] === "-") {
			        sortOrder = -1;
			        property = property.substr(1);
			    }
			    return function (a,b) {
			        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			        return result * sortOrder;
			    }
			}
			function has(it,prop){ // object has specific own non empty property
				if(it.hasOwnProperty(prop) && it[prop] != '' && it[prop] != null)
					return true;
				else
					return false;
			}
			function getObjByProp(ar, prop, val){
				for(var i=0; i<ar.length; i++){
					if(ar[i][prop] == val)
						return ar[i];
				}
				return false;
			}

			// PUBLIC

			this.recoverItem = function(id){
				unselectItem(id);
			}

			this.forceItem = function(item){
				if(options.list && options.list.length>0)
					options.list.push(item);
				else
					options.list = [item];

				selectItem(item.id);
			}

			return this.each(function(){
				init();
			});

		}
		
	});
	
})(jQuery);