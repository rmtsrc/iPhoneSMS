// Javascript File
// Warning: This script depends on db.js

// Text limiting function modded from: http://www.ajaxray.com/blog/2007/11/09/interactive-character-limit-for-textarea-using-jquery/
function limitChars(textid, limit, infodiv) {
	var text = $('#'+textid).val();	
	var textlength = text.length;
	var noSms = 1;
	
	if (textlength == 0) {
		$("#save").text('List');
	} else {
		$("#save").text('Save');		
	}
	
	if(textlength > limit)
	{
		noSms = (Math.floor(textlength/limit)+1);
		$('#' + infodiv).html(noSms+' SMS '+ (limit - Math.floor(textlength - (limit * (noSms - 1)))) +' characters left.');
		//$('#'+textid).val(text.substr(0,limit));
		return false;
	}
	else
	{
		$('#' + infodiv).html(noSms+' SMS '+ (limit - textlength) +' characters left.');
		return true;
	}
}

var currentMessageId = 0;

function showHideToolbarButton() {
	$('#save').toggle();
	$('#new').toggle();			
}

function resetData() {
	// Reset data
	currentMessageId = 0;		
	$("textarea#message").val('');		
	$('#geolocation').attr('src', 'images/geolocation.png');
	$('#geolocationLink').html('');
	toDbCurrentPos[0] = '';
}

$(function(){
	winHash = window.location.hash;
	// Check to see if we have support for local db's and we are on the right page
	if (supportsDbs && (winHash == '#_compose' || winHash == '')) {
		$('#save').show();
		$('#delete').show();
	}
	
	if (winHash == '#_list') {
		$('#new').show();
		$('#delete').show();		
		loadMessages();
	}
	
	// Handle Save button click
 	$('#save').click(function(){
		// Hide Save button							  
		showHideToolbarButton();
		
		// Save the current message
		//log(currentMessageId);
		message = $("textarea#message").val();
		var thisCurrentMessageId  = currentMessageId;
		if (message.length > 0) {
			//log(message);
			
			// Handle lat long
			if (toDbCurrentPos != '' && toDbCurrentPos != "undefined" && toDbCurrentPos[0] != "undefined" && toDbCurrentPos[0] != '') {
				latitude = toDbCurrentPos[0];
				longitude = toDbCurrentPos[1];
			} else {
				latitude = null;
				longitude = null;
			}
			log([message, latitude, longitude, thisCurrentMessageId]);
			
			db = getDb();
			if (thisCurrentMessageId == 0) {
				//log('insert');
				db.transaction(function (transaction) {
					// [] = array of values for the ? placeholders
					transaction.executeSql('INSERT INTO message (message, latitude, longitude) VALUES (?, ?, ?);', [message, latitude, longitude], nullDataHandler, errorHandler);
				});				
			} else {
				//log('update');
				db.transaction(function (transaction) {
					// [] = array of values for the ? placeholders
					transaction.executeSql('UPDATE message SET message = ?, latitude = ?, longitude = ? WHERE id = ?;', [message, latitude, longitude, thisCurrentMessageId], nullDataHandler, errorHandler);
				});				
			}
		} else {
			// Delete it
			var toDelete = currentMessageId;
			if (toDelete > 0) {
				log('Deleting message id: '+toDelete);
				db = getDb();
				db.transaction(function (transaction) {
					// [] = array of values for the ? placeholders
					transaction.executeSql('DELETE FROM message WHERE id = ?;', [toDelete], nullDataHandler, errorHandler);
				});	
			}		
		}
		
		// Reset data
		resetData();
	
		// Load existing messages
		loadMessages();		
		
		//$('#list').html('<li class="messageLink"><a href="#compose">Hello</a></li>'); 
 	})
	
 	$('#new').click(function(){			
		$("#save").text('List');
		showHideToolbarButton();
	})
	
 	$('#delete').click(function(){	
		var answer = confirm('Are you sure you want to delete this message?');
		if (!answer){
			return false;
		}							
								
		showHideToolbarButton();
		
		// Delete last viewed message
		var toDelete = currentMessageId;
		if (toDelete > 0) {
			log('Deleting message id: '+toDelete);
			db = getDb();
			db.transaction(function (transaction) {
				// [] = array of values for the ? placeholders
				transaction.executeSql('DELETE FROM message WHERE id = ?;', [toDelete], nullDataHandler, errorHandler);
			});	
		}
		
		// Reset current message		
		resetData();
		
		// Load existing messages
		loadMessages();
		
		window.location = '#_list';
	})	

	// Limit a string to a certain length
	function stringLimit(string, limit, ending) {
		if (!ending) {
			ending = '...';
		}
        
        // If character number if more than character limit
        if (string.length > limit) {
            // substr to character limit
            string = string.substr(0, limit);
            
            // Should we add an ending like ...?
            string = string+ending;           
        }
		
		return string;
	}
	
	// Load in messages
	function loadMessages() {
		db = getDb();
		db.transaction(function (transaction) {
			// [] = array of values for the ? placeholders
			transaction.executeSql("SELECT * FROM message ORDER BY updated DESC;", [], listMessageDataHandler, errorHandler);
		});		
	}
	
	function listMessageDataHandler(transaction, results) {
		// Handle the results
		var string = '';
		for (var i=0; i<results.rows.length; i++) {
			// Each row is a standard JavaScript array indexed by
			// column names.
			var row = results.rows.item(i);
			var newMessage = stringLimit(row['message'], 23);
			
			// If we have GPS data show a little GPS
			var gps = '';
			log('row');
			log(row);
			if (row['latitude'] != null) {
				gps = ' - <span class="gps">GPS</span>';
			}
			
			string = string + '<li class="messageLink" onclick="javascript:messageLink('+row['id']+');"><a href="#compose">'+newMessage+"<br/><small>"+row['updated']+gps+"</small></a></li>\n";
		}
		//log(string);
		$('#list').html(string);
	}
		   
	// SMS textarea limits
 	$('#message').keyup(function(){
 		limitChars('message', 160, 'charlimitinfo');
 	})

	// Unused
 	$('#selectAll').click(function(){
 		document.getElementById("message").select(); 
 	})
});

function displayMessageDataHandler(transaction, results) {
	// Handle the results
	var string = '';
	var cLatitude;
	var cLongitude;
	for (var i=0; i<results.rows.length; i++) {
		// Each row is a standard JavaScript array indexed by
		// column names.
		var row = results.rows.item(i);
		string = string + row['message'];
		
		cLatitude = row['latitude'];
		cLongitude = row['longitude'];
	}
	//log(string);
	$("textarea#message").val(string);

	// Get lat long
	log(cLatitude);
	if (cLatitude != null) {
		toDbCurrentPos = [cLatitude,cLongitude];
		$('#geolocation').attr('src', 'images/geolocation-selected.png');
		$('#geolocationLink').html('<a href="'+ mapService+cLatitude+','+cLongitude+'" target="_blank">Location recorded, view on map</a>');
	} else {
		toDbCurrentPos = '';
		$('#geolocationLink').html('');
	}
}

// Handle clicking on a message
function messageLink(messageId) {
	currentMessageId = messageId;
	
	// Load in the message
	db = getDb();
		db.transaction(function (transaction) {
			// [] = array of values for the ? placeholders
			transaction.executeSql("SELECT * FROM message WHERE id = ?;", [messageId], displayMessageDataHandler, errorHandler);
		});		
	
	// Show the Save button
	showHideToolbarButton();
}
