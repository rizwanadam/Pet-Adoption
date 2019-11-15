var express = require('express');
const session = require('express-session');
var app = express();
var ejs = require('ejs');
app.set('view engine', 'ejs');
var mysql = require('mysql');
// var popup = require('popups');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(bodyParser.json());
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'petadoption'
});
var sessinfo;
var path = require('path');
connection.connect();
//connection.query('INSERT INTO ')

function ignoreFavicon(req, res, next) {
  if (req.originalUrl === '/favicon.ico') {
    res.status(204).json({nope: true});
  } else {
    next();
  }
}
var sess;

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(ignoreFavicon);
app.use(express.static('public'))
// app.use(function (req, res) {
//   res.setHeader('Content-Type', 'text/plain')
//   res.write('you posted:\n')
//   res.end(JSON.stringify(req.body, null, 2))
// })
app.get('/',function(req,res){
	sess = req.session;
	res.render('fp.ejs',{'email':sess.email});
});
app.get('/eg',function(req,res){
	res.render('eg.ejs');
});
app.post('/logged',function(req,res)
{
		sess = req.session;
		connection.query("select emailid,password from user where emailid=? and password=?",[req.body.email,req.body.pass],function(err,result,field){
			if(result.length==0){
				console.log(result.length);
				res.sendStatus(403);
			}
			else{
				sess.email = req.body.email;
				sess.password = req.body.pass;
				console.log("logged in");
				res.sendStatus(200);
			}
		});
});
app.get('/login',function(req,res){
	res.render("login.ejs");
})
app.get('/signup',function(req,res){
	console.log(req.params);
	res.render('reg.ejs');
});
app.post('/signedup',function(req,res){
	var name = req.body.name;
	var email = req.body.email;
	var phno = req.body.phno;
	var address = req.body.address;
	var password = req.body.password;
	console.log(req.body);
	connection.query('insert into user(name,address,emailid,password,phno) values (?,?,?,?,?)',[name,address,email,password,phno]);
	res.render('fp.ejs',{'email':sess.email});

});
function getUID(req,res,next){
	if(sess.email===undefined)
		return next();
	connection.query("select uid from user where emailid=?",[sess.email],function(err,result,field){
	if(err) throw err;
	req.uid = result[0].uid;
	console.log(result[0].uid);
	return next();
	});
}
function apply(req,res,next){
	if(sess.email===undefined)
		return next();
	connection.query("update pets set uid=? where pid=?",[req.uid,sessinfo.pid],function(err,result,field){
		if(err) throw err;
		return next();
	})
}
app.get('/apply',getUID,apply,function(req,res){
		if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{
	if(sess.email===undefined){
		var al = "<script>alert('Not logged in');</script>";
		res.render('cominfo.ejs',{'info':sessinfo.in,'message':al,'email':sess.email});
	}
	else{
		console.log(req.uid);
		connection.query("SELECT a.animal,p.name from animals a,pets p,user u where u.uid=p.uid and p.aid=a.aid and u.uid=?",[req.uid],function(err,result,field){
			if(err) throw err;
			console.log(result[0].animal);
			res.render('useradopt.ejs',{'info':sessinfo.in,'email':sess.email,'upet':result});
		});
	}
}
});
app.get('/adopted',getUID,function(req,res){
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{
  			connection.query("SELECT a.animal,p.name from animals a,pets p,user u where u.uid=p.uid and p.aid=a.aid and u.uid=?",[req.uid],function(err,result,field){
			if(err) throw err;
			console.log(result[0].animal);
			res.render('useradopt.ejs',{'info':sessinfo.in,'email':sess.email,'upet':result});
  	});
  }
});
app.get('/logout',function(req,res){
	delete sess.email;
	console.log(sess.email);
	res.render('fp.ejs',{'email':sess.email});
})
function findAID(req,res,next){
		if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{ 
	sess = req.session;
	sess.breed;
	connection.query('SELECT AID from animals WHERE animal=?',[req.params.animal], function (err, result, fields) {
	if(err) throw err;
	req.aid = result[0].AID;
	sess.aid=req.aid;
	return next();
 /* Render the error page. */            
    });
}
}
function breed(req,res,next){
	connection.query('SELECT distinct(breed) from pets WHERE aid =?',[req.aid], function (err, result, fields) {
	if(err) throw err;
	req.breed = result;
	sess.breed = result;
	return next();
 /* Render the error page. */            
    });
}
function breed1(req,res,next){
	connection.query('SELECT distinct(breed) from pets WHERE aid =?',[sess.aid], function (err, result, fields) {
	if(err) throw err;
	req.breed = result;
	return next();
 /* Render the error page. */            
    });
}

function info(req,res,next){
	connection.query('select name,animal,age,breed,pid from animals a,pets p where a.aid=p.aid and p.aid=?',[req.aid], function (err, result, fields) {
	if (err) throw err; 
	req.info = result;

	return next();
	});
}
function getBreed(req,res,next){
	console.log(req.body.Breed);
	connection.query('select name,animal,age,breed,pid from animals a,pets p where a.aid=p.aid and p.aid=? and breed=?',[sess.aid,req.body.Breed], function (err, result, fields) {
	if (err) throw err; 
	req.info = result;
	return next();
	});
}
app.post('/breed',getBreed,breed1,function(req,res){
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{
  		res.render('petinfo.ejs',{'pet':req.info,'breed':req.breed,'email':sess.email});
  	}
});
app.get('/:animal',findAID,breed,info,function(req,res){
	console.log(sess.email);
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{ 
  		res.render('petinfo.ejs',{'pet':req.info,'breed':req.breed,'email':sess.email});
  	}
});

app.get('/:animal/:id',function(req,res) {
	sessinfo = req.session;
	sessinfo.in;
	sessinfo.pid = req.params.id;
	// if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
 //    res.status(204).json({nope: true});
 //  	} else {
		var pid = req.params.id;
		connection.query('SELECT breed,age,name,gender,vaccinated,temperament,pid,animal from pets p,animals a where p.aid=a.aid and p.PID=?',[pid], function (err, result, fields) {
	 	if (err) throw err;
	 	// sess.animal = result[0].animal;
	 	sessinfo.in = result;
	 	res.render('cominfo.ejs',{'info':result,'email':sess.email});
	 	
  	});
	// }
});
app.get('/:animal1/:animal/:id/inquire$',function(req,res){
	console.log(req.params);
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	} else {	
	var id = req.params.id;
	connection.query('Select name from pets where PID=?',[id],function(err,result,fields){
		if(err) throw err;
		res.render('inquire.ejs',{'name':result,'email':sess.email});
	});
}
});
app.listen(3000,()=>{
	console.log("WASSSUP");
});