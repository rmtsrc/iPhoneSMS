// Javascript File

var debug = false;

function log(message) {
	if (debug && typeof console != "undefined") {
		console.log(message);
	}
}

log('Starting up');

var _db;
var supportsDbs = false;

function loadDatabase() {
	// Detect if we have Databases
	try {	
		if (typeof window.openDatabase != "undefined") {
			// HTML5 database standard
			supportsDbs = true;
			var shortName = 'SMSDraft';
			var version = '1.0';
			var displayName = 'SMS Draft Database';
			var maxSize = 65536; // in bytes
			_db = openDatabase(shortName, version, displayName, maxSize);
			createTables();
			// You should have a database instance in db.
			
/*		// Google Gears is not compatible with the HTML5 database standard
		} else if (typeof google.gears != "undefined") {
			// Non-standard Google Gears implementation
			supportsDbs = true;
			gearsDb = google.gears.factory.create('beta.database');			
			_db =  gearsDb.open('SMSDraft');
*/
		} else {			
			log('Your browser does not support offline databases');
			return;
		}
	} catch(e) {
		// Error handling code goes here.
		if (e == 2) {
			// Version number mismatch.
			alert("Invalid database version.");
		} else {
			alert("Unknown error "+e+".");
		}
	
		return;
	}
	
	//log("Database is:");
	//log(db);
}

function getDb() {
	if (_db != "undefined" && supportsDbs) {
		return _db;
	} else {
		return false;
		//return _db;
	}
}

function nullDataHandler(transaction, results) { }

function errorHandler(transaction, error) {
    // Error is a human-readable string.
    alert('Oops.  Error was '+error.message+' (Code '+error.code+')');

    // Handle errors here
    var we_think_this_error_is_fatal = true;
    if (we_think_this_error_is_fatal) return true;
    return false;
}

function dataHandler(transaction, results) {
    // Handle the results
	var string = '';
    for (var i=0; i<results.rows.length; i++) {
        // Each row is a standard JavaScript array indexed by
        // column names.
        var row = results.rows.item(i);
        string = string + row['message'] + " (ID "+row['id']+")\n";
    }
    log(string);
}

function createTables() {
	db = getDb();
	
    db.transaction(
        function (transaction) {
            /* The first query causes the transaction to (intentionally) fail if the table exists. */
            transaction.executeSql("CREATE TABLE IF NOT EXISTS message(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, latitude REAL, longitude REAL, created DATE, updated DATE);", [], nullDataHandler, errorHandler);
	 	 	transaction.executeSql("CREATE TRIGGER IF NOT EXISTS message_table_insert_tr AFTER INSERT ON message FOR EACH ROW BEGIN UPDATE message SET created = datetime('now') WHERE id = new.id; END;", [], nullDataHandler, errorHandler);
	 	 	transaction.executeSql("CREATE TRIGGER IF NOT EXISTS message_table_update_tr AFTER UPDATE ON message FOR EACH ROW BEGIN UPDATE message SET updated = datetime('now') WHERE id = new.id; END;", [], nullDataHandler, errorHandler);			

            /* These insertions will be skipped if the table already exists. */
			// Test data
            //transaction.executeSql('INSERT INTO message (message, latitude, longitude) VALUES ("Blank Message", 0.2101, -1.01);', [], nullDataHandler, errorHandler);
			//transaction.executeSql('UPDATE message SET message = "Some Message" WHERE id = 1;', [], nullDataHandler, errorHandler);
        }
    );
}


 
loadDatabase();
//log(supportsDbs);
if (supportsDbs) {
	log(getDb());
}