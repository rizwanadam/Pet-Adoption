var express = require('express');
var app = express();
var ejs = require('ejs');
app.set('view engine', 'ejs');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'petadoption'
});

connection.connect();
//connection.query('INSERT INTO ')

app.use(express.static('views'));
app.get('/',function(req,res){
	res.sendFile('frontpage.html',{root : __dirname + '/views'});
});

app.get('/:animal',function(req,res){
	var animal = req.params.animal;
	if(animal==='Dog'){
		connection.query("SELECT breed,age,name,gender,pid,animal from pets,animals where pets.AID=animals.AID and animals.AID=1;", function (err, result, fields) {
	    if (err) throw err; 
	   	console.log(result);
	   	res.render('petinfo.ejs',{'pet':result});
  	});
	}
	if(animal==='Cat'){
		res.sendFile('petinfo.html',{root : __dirname + '/views'})
	}
	if(animal==='Hamster'){
		res.sendFile('petinfo.html',{root : __dirname + '/views'})
	}
	if(animal==='Rabbit'){
		res.sendFile('petinfo.html',{root : __dirname + '/views'})
	}
	if(animal==='guinea-pig'){
		res.sendFile('petinfo.html',{root : __dirname + '/views'})
	}
	if(animal==='other'){
		res.sendFile('petinfo.html',{root : __dirname + '/views'})
	}
});
app.get('/:animal/:id$',function(req,res) {
		var pid = req.params.id;
		console.log(req.params);
		connection.query('SELECT breed,age,name,gender,vaccinated,temperament from pets where PID=?',[pid], function (err, result, fields) {
	 	if (err) throw err;
	 		console.log(result);
	 	if(result==undefined)
	 		return;
	 	else
	 	{
	    	res.render('cominfo.ejs',{'info':result});
	    	return;
	 	}
  	});
});
app.listen(3000,()=>{
	console.log("WASSSUP");
});