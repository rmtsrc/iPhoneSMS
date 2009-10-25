// JavaScript Document
// Example modded from: http://merged.ca/iphone/html5-geolocation

var mapService = 'http://maps.google.co.uk/maps?q=';

var _geo;
var supportsGeolocation = false;
var toDbCurrentPos = '';

// Detect if we have Geolocation
if (typeof navigator != "undefined" && typeof navigator.geolocation != "undefined")  {
	supportsGeolocation = true;
	// HTML5 standard for geolocation
	_geo = navigator.geolocation;
} else if (typeof google != "undefined" && typeof google.gears != "undefined") {
	supportsGeolocation = true;
	// Non-standard Google Gears geolocation implementation
	_geo = google.gears.factory.create('beta.geolocation');
} else {
	// Finish the error checking if the client is not compliant with the spec
	log('Your browser does not support geolocation');
}

function getGeo() {
	if (_geo != "undefined" && supportsGeolocation) {
		return _geo;
	} else {
		return false;
		//return _db;
	}
}

$(function(){
	// If we support Geolocation show the button
	if (supportsGeolocation) {
		$('#geolocation').show();
	}
	
	$('#geolocation').click(function(){						
		if (toDbCurrentPos != '' && toDbCurrentPos != "undefined" && toDbCurrentPos[0] != "undefined" && toDbCurrentPos[0] != '') {
			$('#geolocation').attr('src', 'images/geolocation.png');
			$('#geolocationLink').html('');
			toDbCurrentPos[0] = '';
		} else {		
			var geolocation = getGeo();
			geolocation.getCurrentPosition( 
				function (position) {  
					// Did we get the position correctly?
					// alert (position.coords.latitude);
			 
					// To see everything available in the position.coords array:
					// for (key in position.coords) {alert(key)}
					mapServiceProvider(position.coords.latitude,position.coords.longitude);			
			 
				}, 
				// next function is the error callback
				function (error) {
					log(error);
					switch(error.code)  {
						case error.TIMEOUT:
							alert ('Timeout');
							break;
						case error.POSITION_UNAVAILABLE:
							alert ('Position unavailable');
							break;
						case error.PERMISSION_DENIED:
							alert ('Permission denied');
							break;
						case error.UNKNOWN_ERROR:
							alert ('Unknown error');
							break;
					}
				}
			);			
		}
		$("#save").text('Save');
	});		

	// Function called by the geolocation click
	function mapServiceProvider(latitude,longitude) {
		// Store in our database
		toDbCurrentPos = [latitude,longitude];	
		if (!supportsDbs) {
			log('Cannot save Geolocation data, as this browser does not support local databases');
		}
		
		var mapLink = mapService+latitude+','+longitude;
		log('latitude: '+latitude+' longitude: '+longitude);
		//log(mapLink);
		
		$('#geolocation').attr('src', 'images/geolocation-selected.png');
		$('#geolocationLink').html('<a href="'+mapLink+'" target="_blank">Location found, view on map</a>');
	}
});
