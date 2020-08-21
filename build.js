

// we'll need filesystem functionality
var fs = require('fs');
var path = require('path');



// template directory path, for DRY sake
var dir_books = "./";
var dir_tpl = "templates/";

// set up a list of the files we'll create.
var files = JSON.parse( fs.readFileSync( dir_books+"books.json", "utf8" ) );
var file_title = [];
files.forEach(function( file_info ){
	file_title[file_info.filename] = file_info.title;
});

// open the book template files
var tpl_stylus = fs.readFileSync( dir_tpl+"template.styl", "utf8" );
var tpl_scss = fs.readFileSync( dir_tpl+"template.scss", "utf8" );


// arrays for each index file
var files_stylus = [], 
	files_scss = [],
	files_less = [],
	files_index = [];



// directory location
var dir = 'json/';

var copyDirSync = function(src, dest) {
	var exists = fs.existsSync(src);
	var stats = exists && fs.statSync(src);
	var isDirectory = exists && stats.isDirectory();
	if (isDirectory) {
	  fs.mkdirSync(dest);
	  fs.readdirSync(src).forEach(function(childItemName) {
		copyDirSync(path.join(src, childItemName),
				    path.join(dest, childItemName));
	  });
	} else {
	  fs.copyFileSync(src, dest);
	}
  };

fs.rmdirSync( 'dist' , { recursive: true })
fs.mkdirSync( 'dist' )
fs.mkdirSync( 'dist/csv' )
fs.mkdirSync( 'dist/book' )
fs.mkdirSync( 'dist/less' )
fs.mkdirSync( 'dist/scss' )
fs.mkdirSync( 'dist/stylus' )
// loop through the directory
fs.readdir( dir, function( err, files ){

    // throw an error if applicable
    if ( err ) throw err;

    var total = 0;

    // loop through the files in the directory
    files.forEach(function( file ){

    	// 
    	var filename = file.replace( '.json', '' );

		// open the file
		var records = JSON.parse( fs.readFileSync( "json/"+file, "utf8" ) );


		// some empty arrays for our colors
		var records_csv = [];
		var records_less = [];
		var records_scss = [];
		var records_html = [];


		// start logging
		console.log( "" );
		console.log( "-------------------------------------------------------------------" );
		console.log( "  Book: " + file );
		console.log( "-------------------------------------------------------------------" );


		// variable name in Sass and Stylus
		var var_name = filename+'-colors';


		// loop through all the colors in this file.
		records.forEach(function( color ){

			// push another line of html
			records_html.push( '<div class="swatch" style="background-color: '+color.hex+';"><span>'+color.label+'</span></div>' );
			
			// push another scss array value
			records_scss.push( '("'+color.label+'" '+color.hex+')' );
			
			// push another less array value
			records_less.push( '@'+filename+'-'+color.label+': '+color.hex+';' );
			
			// push another xml record
			records_csv.push( '"'+color.name+'","'+color.label+'","'+color.hex+'"' );

		});


		// less files
		files_less.push( "\n// " + file_title[filename] + '\n@import "book-'+filename+'.less";' );

		// scss files
		files_scss.push( "\n// " + file_title[filename] + '\n@import "book-'+filename+'";' );

		// stylus files
		files_stylus.push( "\n// " + file_title[filename] + '\n@import "book-'+filename+'.styl"' );

		// db files
		files_index.push({
			id: filename,
			title: file_title[filename],
			records: records.length
		});

		// dump a color count for each book
		console.log( " > Colors in File: " + records_csv.length );
		total = total + records_csv.length;


		// write out the csv file
		fs.writeFileSync( "dist/csv/"+filename+".csv", records_csv.join( "\n" ) );
		console.log( " > dist/csv/"+filename+".csv created..." );


		// write out the index.html file
		fs.writeFileSync( 'dist/book/'+filename+'.html', records_html.join("\n") )
		console.log(' > dist/book/'+filename+'.html created...');


		// write out the Sass book file
		fs.writeFileSync( 'dist/scss/_book-'+filename+'.scss', tpl_scss
			.replace( "{{colors}}", records_scss.join(", ") )
			.replace( /\{\{var_name\}\}/g, var_name )
			.replace( "{{fn_name}}", filename ), 
		console.log(' > dist/scss/_book-' + filename + '.scss created...') );


		// write out the Stylus book file
		fs.writeFileSync( 'dist/stylus/book-'+filename+'.styl', tpl_stylus
			.replace( "{{colors}}", records_scss.join(" ") )
			.replace( /\{\{var_name\}\}/g, var_name )
			.replace( "{{fn_name}}", filename ) );
		console.log(' > dist/stylus/book-'+filename+'.styl created...');


		// write out the LESS book file
		fs.writeFileSync( 'dist/less/book-'+filename+'.less', "// "+filename+"\n"+records_less.join("\n")); 
		console.log(' > dist/less/book-'+filename+'.less created...');
		

    });


	// start outputting main file generation progress
	console.log( "" );
	console.log( "-------------------------------------------------------------------" );
	console.log( "  Main Files" );
	console.log( "-------------------------------------------------------------------" );


	// dump the total colors
	console.log( " > Total Colors: " + total );


	// write out the Sass book file
	fs.writeFileSync( 'dist/scss/_colorly.scss', files_scss.join("\n") );
	console.log(' > dist/scss/_colorly.scss created...');


	// write out the Stylus book file
	fs.writeFileSync( 'dist/stylus/colorly.styl', files_stylus.join("\n") );
	console.log(' > dist/stylus/colorly.styl created...');


	// write out the LESS book file
	fs.writeFileSync( 'dist/less/colorly.less', files_less.join("\n") );
	console.log(' > dist/less/colorly.less created...');

	// copy JSON book file
	copyDirSync( 'json/', 'dist/json/');
	console.log(' > dist/json/colorly.json created...');


	// write out the DB file
	fs.writeFileSync( 'dist/db.json', JSON.stringify(files_index));
	console.log(' > dist/db.json created...');

});

