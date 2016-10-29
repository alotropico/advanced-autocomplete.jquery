$(document).ready(Init);

function Init(){

	var celestial_bodies = [
	    {title:'Earth', id:1},
	    {title:'Moon', id:2},
	    {title:'Sun', id:3}
	];

	var autocomplete1 = $('#input_1').void_autocomplete({
		list: celestial_bodies,
		onItemSelect: autocompleteCallbackFirst
	});

	var autocomplete2 = $('#input_2').void_autocomplete({
		ajax: 'json/list.json',
		onItemSelect: autocompleteCallbackSecond,
		maxResults: 5
	});

	var autocomplete3 = $('#input_3').void_autocomplete({
		selections: 1,
		list: celestial_bodies,
		onItemSelect: autocompleteCallback
	});

	autocomplete3.forceItem({title:"Pluto", id:"11"});

	$('#button_3').click(function(){
		if(aaa){

		}
	});
}

function autocompleteCallbackFirst(selected, val){
	$('#results_1').append('<li>' + selected.title + '</li>');
}
function autocompleteCallbackSecond(selected, val){
	$('#results_2').append('<li>' + selected.title + '</li>');
}
function autocompleteCallback(selected){
    console.log(selected);
}