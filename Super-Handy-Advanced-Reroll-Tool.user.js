	// ==UserScript==
	// @name         SHART
	// @namespace    http://tampermonkey.net/
	// @version      0.1
	// @description  It increases your stats every few attacks, and then shows you.
	// @author       https://github.com/RevulvaOcelot/
	// @match        *http://www.playinitium.com/*
	// @match        *https://www.playinitium.com/*
	// @grant        GM_setValue
	// @grant        GM_getValue
	// ==/UserScript==

	// JSON.stringify();
	// JSON.parse();

	(function() {
	  'use strict';
	  var statsHref = $('a.clue').attr('rel');
	  $('body').prepend(
	  	'<div id="STD-main" style="float:left; position: absolute; font-size: 10px;">' +
	  	'<div id="STD-attacks"></div>' +
	  	'<i> Current Stats: </i>' +
	  	'<ul id="STD-statList" style="list-style-type: none;"> </ul>' +
	  	'<span id="STD-status" style="width: 200px; ">Please wait...</span>' +
	  	'</div>'
	  );
	  $.ajax(statsHref)
	  .complete(function(d){
	  	// Attack Part

		var playerObject = JSON.stringify({
			'name': '',
			'total_attacks': 0,
			'current_attacks': 0,
			'strength': 5,
			'dexterity': 5,
			'intelligence': 5,
			'strength_progression': {
				0: 5
			},
			'dexterity_progression': {
				0: 5
			},
			'intelligence_progression': {
				0: 5
			},
			'progression_index': 0
		});
	  var charName = $('.hint').text();
    var plobject = JSON.parse(GM_getValue(charName+'_object', playerObject));
    if(plobject === null) {
    	plobject = JSON.parse(playerObject);
    }
    console.log(plobject);
    var loc = document.title == "Combat - Initium";
    
    $('#STD-attacks').prepend('<div id="displayDiv">'+
    	'<i id="attackDisplay"  style=""> Current Attacks: ' + plobject.current_attacks + ' </i> <br> ' + 
    	'<i id="totalAttackDisplay"  style=""> Total Attacks: ' + plobject.current_attacks + ' </i> <br>' + 
    	'<button id="resetAttacks"  style=""> Reset Current Attacks </button> <br>' + 
    	'<button id="resetTotalAttacks"  style=""> Reset Total Attacks </button> <br>' +
    	'<button id="setProgression"  style=""> Set Progression attack number </button> <br>' +
    	'<button id="resetCharacter"  style=""> Reset character tracking info </button> <br>' +
    	'<button id="getString"  style=""> Export JSON string </button> <br>' +
    	'<button id="loadString"  style=""> Import JSON string </button> <br>' +
    	'<table id="progTable"> <tr> <td> atkIndex </td> <td> str </td> <td> dex </td> <td> int </td> </table>' +
    	'</div>'
    	);

    $('#resetAttacks').on('click', function(e) {
    	e.preventDefault(); 
    	plobject.current_attacks = 0; 
    	saveObject(charName, plobject); 
    	$('#attackDisplay').text('Current Attacks: '+ plobject.current_attacks);
    });

    $('#resetTotalAttacks').on('click', function(e) {
    	e.preventDefault(); 
    	plobject.total_attacks = 0; 
    	saveObject(charName, plobject); 
    	$('#totalAttackDisplay').text('Total Attacks: '+ plobject.total_attacks);
    });

    $('#setProgression').on('click', function(e) {
    	e.preventDefault(); 
    	var newProgIndex = prompt("Enter new stats progression index. This will overwrite any similar indices when you attack.", 0);
    	plobject.progression_index = parseInt(newProgIndex); 
    	saveObject(charName, plobject); 
    	alert('Data will update on page refresh.');

    });


    $('#resetCharacter').on('click', function(e) {
    	e.preventDefault(); 
    	var newProgIndex = prompt("Type YES if you want to reset your info.", "No");
    	if(newProgIndex == "YES") {
    		plobject = JSON.parse(playerObject);
    		saveObject(charName, plobject); 
    		alert('Data will update on page refresh.');
    	}
    	
    	$('#attackDisplay').text('Attacks: '+ plobject.current_attacks);
    });


    $('#getString').on('click', function(e) {
    	e.preventDefault(); 
    	$('#STD-status').text('Your code: '+GM_getValue(charName+'_object', playerObject));
    });


    $('#loadString').on('click', function(e) {
    	e.preventDefault(); 
    	var answer = prompt("Enter your JSON string to OVERWRITE your local data. This is IRREVERSIBLE. Press cancel to abort.", "");
    	if((answer !== null)) {
    		$('#STD-status').text(' Your JSON code before overwrite: '+  GM_getValue(charName+'_object', playerObject));
    		plobject = JSON.parse(answer);
    		saveObject(charName, plobject); 
    		alert('Data will update on page refresh.');
    	}
    	
    });





    // Stats Part
    var stats = $('.main-item-subnote',d.responseText).splice(0,3);
    var tempName, tempStat;
    var statsObject = {};
    for(var i = 0; i < stats.length; i++) {
    	tempName = stats[i].attributes.name.nodeValue;
    	tempStat = stats[i].outerText;
    	plobject[tempName+'_progression'][plobject.progression_index] = tempStat.split(" ")[0];
    	plobject[tempName] = tempStat.split(" ")[0];
    	saveObject(charName, plobject);
    	$("#STD-statList").append('<li>' + tempName + ' : ' + tempStat + '</li>');
    }

    $("#STD-status").text('');
    var target_number;
    var keylist = Object.keys(plobject.strength_progression);
    var target_number = keylist[keylist.length-1];
    // var target_number = plobject.progression_index; // For showing just up to the progression index

    for(var ii = 0; ii <= target_number; ii++) {
    	$('#progTable').append('<tr> <td> '+ ii +' </td>' +
    		'<td>' + (plobject.strength_progression[ii] ? plobject.strength_progression[ii] : 0 )  + '</td>' +
    		'<td>' + (plobject.dexterity_progression[ii] ? plobject.dexterity_progression[ii] : 0) + '</td>' +
    		'<td>' + (plobject.intelligence_progression[ii] ? plobject.intelligence_progression[ii] : 0) + '</td>' +
    		'</tr>');
    }

  	  // If location is a combat site;
  	  if(loc) {
  	      $('.main-button').on('click', function(e) {
  	         e.preventDefault();
  	         if(($(this).attr('shortcut') == 49) || ($(this).attr('shortcut') == 50)) {
                plobject.current_attacks += 1;
                plobject.total_attacks += 1;
                plobject.progression_index = parseInt(plobject.progression_index) + 1;
                saveObject(charName, plobject);
  	         }
  	      });
  	  }
  	  
	  });


	    // Your code here...
	})();


function saveObject(charName, p) {
    GM_setValue(charName+'_object', JSON.stringify(p));
}