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
var sessi;
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(ignoreFavicon);
app.use(express.static('public'))

app.get('/',function(req,res){
	sess = req.session;
	sess.email;
	console.log(sess.email);
	res.render('fp.ejs',{'email':sess.email,'type':sess.log});
});
function getOName(req,res,next){
	connection.query("select name from owner where email=?",[sess.email],function(err,result,fields){
		if(err) throw err;
		req.name = result[0].name;
		return next();
	});
}
function getOID(req,res,next){
	connection.query("Select OID,name from owner where email=?",[sess.email],function(err,result,fields){
	if(err) throw err;
	req.oid = result[0].OID;
	sess.oid = result[0].OID;
	return next();
	});
}
app.get('/owner',getOName,getOID,function(req,res){
	connection.query("select * from pets where OID=?",[sess.oid],function(err,result,field){
		if(err) throw err;
		res.render("ownerpage.ejs",{'pdet':result,'type':sess.log,'email':sess.email,'name':req.name})
		});
});
app.get('/upload',function(req,res){
	res.render("upload.ejs",{'type':sess.log,'email':sess.email});
});
// app.get('/viewadopt',getOID,function(req,res){
// 	connection.query("select * from pets where OID=?",[sess.oid],function(err,result,field){
// 	if(err) throw err;
// 	res.render("avail.ejs",{'pdet':result,'type':sess.log,'email':sess.email})
// 	});
// });
function getPet(req,res,next){
	console.log(req.params.pname);
	connection.query("Select PID from pets where name=?",[req.params.uname],function(err,result,field){
		if(err) throw err;
		req.pid = result[0].PID;
		console.log(req.pid);
		return next();
	});
}
function getU(req,res,next){
	console.log(req.params.pname);
	connection.query("Select UID from user where name=?",[req.params.pname],function(err,result,field){
		if(err) throw err;
		req.uid = result[0].UID;
		console.log(req.uid);
		return next();
	});
}
app.get('/confirm/:uname/:pname',getPet,getU,function(req,res){
	console.log(req.params)
	connection.query("update userpets set status='confirmed' where uid=? and pid=?",[req.uid,req.pid],function(err,result,fields){
		if(err) throw err;
		sess.result.status='confirmed';
		console.log(result);
		res.render("owneradopt.ejs",{'pdet':sess.result,'type':sess.log,'email':sess.email});
	});
});
function getPdet(res,req,next){
	console.log(sess.oid);
	connection.query("select p.name,p.breed,u.name as uname,status from user u,userpets up,pets p where u.uid=up.uid and p.pid=up.pid and p.oid=?",[sess.oid],function(err,result,fields){
	if(err) throw err;
	console.log(result);
	sess.result = result;
	return next();
	});
}
app.get('/view',getOID,getPdet,function(req,res){
	res.render("owneradopt.ejs",{'pdet':sess.result,'type':sess.log,'email':sess.email});
});
function checkUser(req,res,next){
			if(req.body.email&&req.body.pass){
			connection.query("select * from user where emailid=? and password=?",[req.body.email,req.body.pass],function(err,result,field){
			if(err)throw err;
			req.ch = result.length;
			return next();
		});
		}
}
app.post('/loggedinuser',checkUser,function(req,res)
{
		sess = req.session;
		sess.log;
		if(req.ch>0){
			sess.email = req.body.email;
			sess.password = req.body.pass;
			sess.log="user"
			res.render("login.ejs",{'log':"1",'email':sess.email});
		}
		else{
			res.render("login.ejs",{'log':"2"});
		}
});
function checkOwner(req,res,next){
			if(req.body.email&&req.body.pass){
			connection.query("select * from owner where email=? and password=?",[req.body.email,req.body.pass],function(err,result,field){
			if(err)throw err;
			req.ch = result.length;
			return next();
		});
		}
}

app.post('/loggedinowner',checkOwner,function(req,res)
{
		sess = req.session;
		sess.log
		if(req.ch>0){
			sess.log = "owner";
			sess.email = req.body.email;
			sess.password = req.body.pass;
			res.render("login.ejs",{'log':"1",'email':sess.email});
		}
		else{
			res.render("login.ejs",{'log':"2"});
		}
});
// app.post('/logged',async function(req,res)
// {
// 		sess = req.session;
// 		console.log(req.body.email);
// 		let resp = await request.post('http://localhost:3000/logged');

// 		connection.query("select * from user where emailid=?",[req.body.email],function(err,result,field){
// 			console.log(result.length);
// 			if(result.length>0){
				// sess.email = req.body.email;
				// sess.password = req.body.pass;
// 				console.log("logged in");
// 				res.sendStatus(200);
// 			}
// 			else{
// 				res.sendStatus(403);
// 				console.log("Invalid");
// 			}
// 		});
// });
app.get('/login',function(req,res){
	var log;
	res.render("login.ejs",{'log':"nothing"});
})
app.get('/signup',function(req,res){
	console.log(req.params);
	res.render('reg.ejs');
});
app.post('/signedupuser',function(req,res){
	var name = req.body.name;
	var email = req.body.email;
	var phno = req.body.phno;
	var address = req.body.address;
	var password = req.body.password;
	console.log(req.body);
	connection.query('insert into user(name,address,emailid,password,phno) values (?,?,?,?,?)',[name,address,email,password,phno]);
	res.render('fp.ejs',{'email':sess.email,'type':sess.log});

});
app.post('/signedupowner',function(req,res){
	var name = req.body.name;
	var email = req.body.email;
	var phno = req.body.phno;
	var address = req.body.address;
	var password = req.body.password;
	console.log(req.body);
	connection.query('insert into owner(name,address,emailid,password,phno) values (?,?,?,?,?)',[name,address,email,password,phno]);
	res.render('fp.ejs',{'email':sess.email,'type':sess.log});

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
function checkexist(req,res,next){
	connection.query("select * from userpets where uid=? and pid=?",[req.uid,sessinfo.pid],function(err,res,fields){
		if(err) throw err;
		req.len = res.length;
		console.log(req.len);
		return next();
	});
}
function apply(req,res,next){
	if(sess.email===undefined||req.len===1)
	{
		req.mess="cant";
		return next();
	}
	else{
	connection.query("insert into userpets(UID,PID,status) values (?,?,'Available')",[req.uid,parseInt(sessinfo.pid)],function(err,result,field){
		if(err) throw err;
		return next();
	});
}
}
app.get('/apply',getUID,checkexist,apply,function(req,res){
		if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{
	if(sess.email===undefined){
		var al = "<script>alert('Not logged in');</script>";
		res.render('cominfo.ejs',{'info':sessinfo.in,'message':al,'email':sess.email,'type':sess.log});
	}
	else{
		console.log(req.uid);
		connection.query("SELECT u.name as uname,a.animal,p.name from animals a,pets p,user u,userpets up where u.uid=up.uid and p.aid=a.aid and p.pid=up.pid and up.uid=?",[req.uid],function(err,result,field){
			if(err) throw err;
			console.log(result[0].uname);
			res.render('useradopt.ejs',{'info':sessinfo.in,'email':sess.email,'upet':result,'type':sess.log,'mess':req.mess});
		});
	}
}
});
app.get('/applied',getUID,function(req,res){
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{
  			connection.query("SELECT u.name as uname,a.animal,p.name from animals a,pets p,user u,userpets up where u.uid=up.uid and p.aid=a.aid and p.pid=up.pid and up.uid=?",[req.uid],function(err,result,field){
			if(err) throw err;
			console.log(result[0].uname);
			res.render('useradopt.ejs',{'email':sess.email,'upet':result,'type':sess.log});
  	});
  }
});
app.get('/logout',function(req,res){
	req.session.destroy();
	delete sess.email;
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
  		res.render('petinfo.ejs',{'pet':req.info,'breed':req.breed,'email':sess.email,'type':sess.log});
  	}
});
function getuser(req,res,next){
	console.log(req.body);
	sessi = req.session;
	sessi.id;
	connection.query("select uid from user where emailid=?",[req.body.email],function(err,res,fields){
		if(err) throw err;
		req.userid= res[0].UID;
		// console.log(res[0].uid);
		console.log(req.userid)
		return next();
	});
}

app.post("/postquery",getuser,function(req,res){
	console.log(sess.id);
	connection.query("insert into userqueries values(5,?,?)",[sessinfo.pid,req.body.ask],function(err,result,fields){
	if(err) throw err;
	res.render('cominfo.ejs',{'info':sessinfo.in,'email':sess.email,'type':sess.log});
	});
});
app.get('/:animal',findAID,breed,info,function(req,res){
	console.log(sess.email);
	if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(req.originalUrl)) {
    res.status(204).json({nope: true});
  	}else{ 
  		res.render('petinfo.ejs',{'pet':req.info,'breed':req.breed,'email':sess.email,'type':sess.log});
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
	 	res.render('cominfo.ejs',{'info':result,'email':sess.email,'type':sess.log});
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
		res.render('inquire.ejs',{'name':result,'email':sess.email,'type':sess.log});
	});
}
});
app.listen(3000,()=>{
	console.log("Pet.find server started!");
});