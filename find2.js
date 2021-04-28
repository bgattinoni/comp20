//variables for connecting to mongo 
const MongoClient = require('mongodb').MongoClient;
const mongourl = "mongodb+srv://bgattinoni:alphabet6bvg@cluster0.m6rkd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//variables for reading file 
var http = require('http');
var fs = require('fs');
var qs = require('querystring');

//connecting to mongo
MongoClient.connect(mongourl, { useUnifiedTopology: true }, function(err, db) {
if(err) { return console.log(err); return;}

//create server 
http.createServer(function (req, res) 
  {
	  if (req.url == "/")
	  {
		  file = 'form.html';
		  fs.readFile(file, function(err, txt) {
    	  res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(txt);
          res.end();
		  });
	  }
	  else if (req.url == "/process")
	  {
		 res.writeHead(200, {'Content-Type':'text/html'});
		 pdata = "";
		 req.on('data', data => {
           pdata += data.toString();
         });

		// when complete POST data is received
		req.on('end', () => {
			pdata = qs.parse(pdata);
            
            //define database
            var dbo = db.db("hw14");
            
            //if statements for if ticker number or company name was inputted by user
            if(pdata['rad']=="ticker"){
                res.write("Inputted stock ticker: "+pdata['the_name']+"<br><br>");
                res.write("Company Name(s): <br>");
                
                //define query and filter 
                var query = ({"ticker":pdata['the_name']});
                var filter = {projection:{"name":1, "_id":0, "ticker":1}};
                
                dbo.collection('companies').find(query, filter).toArray(function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    
                    if(result.length==0){
                        res.write("Sorry, there are no companies listed with ticker number "+pdata['the_name']+".");
                    }
                    else{
                        for(var i=0; i<result.length; i++){
                            res.write(result[i]["name"]);
                            res.write("<br>");
                        }
                    }
                
                    res.end();
                });
            }
            else if(pdata['rad']=="name"){
                res.write("Inputted company name: "+pdata['the_name']+"<br><br>");
                
                //define query and filter 
                var query = ({"name":pdata['the_name']});
                var filter = {projection:{"name":1, "_id":0, "ticker":1}};
                
                dbo.collection('companies').find(query, filter).toArray(function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    
                    if(result.length==0){
                        res.write("Sorry, there are no companies listed with name "+pdata['the_name']+".");
                    }
                    else{
                        res.write("Ticker Number:<br>");
                        res.write(result[0]["ticker"]);
                        res.write("<br>");
                    }
                
                    res.end();
                });
            }

		});
		
	  }
	  else 
	  {
		  res.writeHead(200, {'Content-Type':'text/html'});
		  res.write ("Unknown page request");
		  res.end();
	  }
  

}).listen(8080);

});