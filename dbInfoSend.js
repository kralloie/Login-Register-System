const express = require('express');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const bodyParser = require('body-parser');

const hash = (hash_victim) =>
{
  let hashedNumber = 0;

  for(let i = 0; i < hash_victim.length; i++)
  {
    hashedNumber += parseInt(hash_victim.charCodeAt(i));
  }
  return hashedNumber = (hashedNumber * 0.323454567) + Math.sqrt(hash_victim.charCodeAt(3));
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
mongoose.connect("token",{useNewUrlParser: true},{useUnifiedTopology: true});

const userInfoSchema =
{
  email: String,
  password:String
}

var database;
var collectionInfo;
const info = mongoose.model("Info",userInfoSchema);

app.get("/",(req,res) => {
  res.sendFile(__dirname + "/" + 'home.html');
})
app.get("/register.html",(req,res) => {
  res.sendFile(__dirname + "/" + 'register.html');
})
app.get("/login.html",(req,res) => {
  res.sendFile(__dirname + "/" + 'login.html');
})
app.get("/loginsuccess.html",(req,res) =>{
  res.sendFile(__dirname + "/" + 'loginsuccess.html');
})
app.get("/home.html",(req,res) =>{
  res.sendFile(__dirname + "/" + 'home.html');
})

const updateDB = () => {
  return new Promise((resolve,reject)=>{
   MongoClient.connect('token',{useNewUrlParser: true}, (error,result) =>{
      if (error) throw error;
      console.log("Data updated");
      database = result.db('myUserStorage');
      database.collection('infos').find({},{  projection:{  _id:0 ,email:1 ,password:1  } }).toArray((error,result) =>{
        collectionInfo = {result};
        console.log(collectionInfo);
        resolve(collectionInfo);
      })
    })
  });
};

app.post('/register' , async (req,res) =>
{
  const mongoWaiter = await updateDB();
  if(req.body.regmail !== "" && req.body.regpass !== "")
  {   
    let errorCount = 0;
    let mail = req.body.regmail;
    let searchField = "email";
    for(let i = 0; i < collectionInfo.result.length; i++)
    {
      
      if(collectionInfo.result[i][searchField] == String(mail))
      {
       console.log("Register denied");
       errorCount = 1;
      }
    }
      if(errorCount === 0){
    
        let newInfo = new info({
          email:req.body.regmail,
          password:String(hash(req.body.regpass))
        })
        console.log("Registered" + newInfo);
        newInfo.save();
        res.redirect('/');
      }
      else
      {
        res.write("That Email is invalid or it is already registered.");
        res.end();
      }
  }
  else
  {
    return;
  }
})
app.post('/login', async (req,res)=>
{
  const mongoWaiter = await updateDB();
  let foundOneVariable = 0;
  if(req.body.logmail !== "" && req.body.logpass !=="")
  {
    let mail = req.body.logmail;
    let password = req.body.logpass;
    let mailField = "email";
    let passField = "password";

    for(let i = 0; i < collectionInfo.result.length; i++)
    {
      if(collectionInfo.result[i][mailField] == String(mail) && collectionInfo.result[i][passField] == String(hash(password)))
      {
        foundOneVariable = 1;
      }
    }
  }
  if(foundOneVariable === 1)
  {
    console.log("Login success");
    res.redirect('/loginsuccess.html')
    return;
  }
  else
  {
    res.write("Email or Password is incorrect")
    res.end();
    return;
  }
})



 
app.listen(8080,() =>{
  MongoClient.connect('token',{useNewUrlParser: true}, function(error,result){
    if (error) throw error;
    database = result.db('myUserStorage');
    console.log("soy un server de mierda")
  })
})




