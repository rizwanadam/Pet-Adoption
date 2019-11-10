var express = require('express');
const session = require('express-session');
var app = express();
var ejs = require('ejs');
app.set('view engine', 'ejs');
var mysql = require('mysql');
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
app.use(express.static('views'))
// app.use(function (req, res) {
//   res.setHeader('Content-Type', 'text/plain')
//   res.write('you posted:\n')
//   res.end(JSON.stringify(req.body, null, 2))
// })
app.get('/',function(req,res){
	res.sendFile('frontpage.html',{root : __dirname + '/views'});
});
app.get('/eg',function(req,res){
	res.render('eg.ejs');
});
app.post('/logged',function(req,res)
{
		sess = req.session;
		sess.email = req.body.email;
		sess.password = req.body.pass;
});
app.get('/login',function(req,res){
	res.render("login.ejs");
})
app.get('/signup',function(req,res){
	res.render('signup.ejs');
});
var sess;
function findAID(req,res,next){
	sess = req.session;
	sess.breed;
	connection.query('SELECT AID from animals WHERE animal=?',[req.params.animal], function (err, result, fields) {
	if(err) throw err;
	req.aid = result[0].AID;
	sess.aid=req.aid;
	return next()
 /* Render the error page. */            
    });
}
function breed(req,res,next){
	connection.query('SELECT distinct(breed) from pets WHERE aid =?',[req.aid], function (err, result, fields) {
	if(err) throw err;
	req.breed = result;
	sess.breed = result;
	return next()
 /* Render the error page. */            
    });
}
function breed1(req,res,next){
	console.log(sess.aid);
	connection.query('SELECT distinct(breed) from pets WHERE aid =?',[sess.aid], function (err, result, fields) {
	if(err) throw err;
	req.breed = result;
	return next()
 /* Render the error page. */            
    });
}

function info(req,res,next){
	connection.query('select name,animal,age,breed,pid from animals a,pets p where a.aid=p.aid and p.aid=?',[req.aid], function (err, result, fields) {
	if (err) throw err; 
	req.info = result;
	console.log(result);
	return next();
	});
}
function getBreed(req,res,next){
	console.log(req.body.Breed);
	connection.query('select name,animal,age,breed,pid from animals a,pets p where a.aid=p.aid and p.aid=? and breed=?',[sess.aid,req.body.Breed], function (err, result, fields) {
	if (err) throw err; 
	req.info = result;
	console.log(result);
	return next();
	});
}
app.post('/breed',getBreed,breed1,function(req,res){
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{
  		res.render('petinfo.ejs',{'pet':req.info,'breed':req.breed});
  	}
});
app.get('/:animal',findAID,breed,info,function(req,res){
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{ 
  		res.render('petinfo.ejs',{'pet':req.info,'breed':req.breed});
  	}
});

app.get('/:animal/:id',function(req,res) {

	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	} else {
		var pid = req.params.id;
		console.log(req.params);
		connection.query('SELECT breed,age,name,gender,vaccinated,temperament,pid,animal from pets p,animals a where p.aid=a.aid and p.PID=?',[pid], function (err, result, fields) {
	 	if (err) throw err;
	 	console.log(result);
	 	res.render('cominfo.ejs',{'info':result});
	 	
  	});
	}
});
app.get('/:animal1/:animal/:id/inquire$',function(req,res){
	console.log(req.params);
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	} else {	
	var id = req.params.id;
	connection.query('Select name from pets where PID=?',[id],function(err,result,fields){
		if(err) throw err;
		res.render('inquire.ejs',{'name':result});
	});
}
});
app.listen(3000,()=>{
	console.log("WASSSUP");
});