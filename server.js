const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require('multer');
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST",
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    key: "mamberId",
    secret:"subscribe",
    resave: true,
    saveUninitialized: true,
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req,file,cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({
    storage: storage
})

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pet_shelter_app"
})

// charity worker sign up
app.post('/charityworkerSignUp',(req,res) => {
    const sql = "INSERT INTO charityworker (`worker_ID`,`first_name`,`last_name`,`email`,`password`) VALUES (?,?,?,?,?)";
    const workerID = req.body.encrypted_workerID;
    const firstName = req.body.encrypted_firstname;
    const lastName = req.body.encrypted_lastname;
    const email = req.body.encrypted_email;
    const password = req.body.password;
   
    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    db.query(sql,[workerID,firstName,lastName,email,password_hash],(err, data) => {
                        if(err){
                            return res.json("Error");
                        }
                        return res.json({registered:true});
                    })
                }
            })
        }
    })
})

//charity worker sign in
app.post('/charityworkerSignIn',(req,res) => {
    const sql = "SELECT * FROM charityworker WHERE `email` = ?";
    db.query(sql,[ req.body.encrypted_email],(err, data) => {
        if(err){
            return res.json("Error");
        }
       if(data.length > 0){
        bcrypt.compare(req.body.password.toString(), data[0].password, (err, response)=>{
            if(err){
                console.log(err);
            }
            if(response){
                req.session.firstName = data[0].first_name;
                req.session.lastName = data[0].last_name;
                console.log(req.session.firstname);
                console.log(req.session.lastName);
                return res.json("Success");
            }else{
                return res.json("Fail");
            }
        })
       }else{
            return res.json("the worker doesn't exist");
       }
    })
})

app.get('/CharityWorkerSession',(req,res)=>{
    var firstName = req.session.firstName;
    var lastName = req.session.lastName;
    console.log(firstName);
    console.log(lastName);
    if(firstName == "" && lastName == ""){
        return res.json("Empty");
    }else{
        return res.json({firstName:firstName,lastName:lastName});
    }
});

app.get('/cats',(req,res)=>{
    const sql = "SELECT * FROM cat";
    db.query(sql,(err,data)=>{
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})

app.post('/cat', (req,res)=>{
    const sql = "INSERT INTO cat (`cat_ID`,`cat_name`,`cat_type`,`country_of_origin`,`origin`,`size`,`hair_type`,`color_pattern`,`shelter_center`,`cat_image`, `address`, `business_hours`, `contact_number`, `map_link`, `official_website_url`) VALUES (?)";
    const values =[
        req.body.catID,
        req.body.catName,
        req.body.catType,
        req.body.countryOfOrigin,
        req.body.origin,
        req.body.size,
        req.body.hairType,
        req.body.color_pattern,
        req.body.shelter_center,
        req.body.cat_image,
        req.body.address,
        req.body.businessHours,
        req.body.contactNum,
        req.body.mapURL,
        req.body.offcialWebsiteURL
    ];
    db.query(sql,[values],(err,data)=>{
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})

app.get('/cat/:catID',(req,res)=>{
    const sql = "SELECT * FROM cat WHERE cat_ID = ?";
    const catID = req.params.catID;
    db.query(sql,[catID],(err,data)=>{
        if(err){
            return res.json({Error: err});
        }
        return res.json(data);
    })
})

app.post('/editCat/:catID',(req,res)=>{
    const sql = "UPDATE cat SET `cat_ID` = ?, `cat_name` = ?, `cat_type` = ?, `country_of_origin` = ?, `origin` = ?, `size` = ?, `hair_type` = ?, `color_pattern` = ?, `shelter_center` = ?, `address` = ?, `business_hours` = ?, `contact_number` = ?, `map_link` = ?, `official_website_url` = ? WHERE `cat_ID` = ?";
    const catID = req.params.catID;
    db.query(sql,[req.body.cat_ID,req.body.catName,req.body.catType,req.body.countryOfOrigin,req.body.origin,req.body.size,req.body.hairType,req.body.color_pattern,req.body.shelter_center,req.body.address,req.body.businessHours,req.body.contactNum, req.body.mapLink, req.body.offcialWebsiteURL,catID],(err,data) => {
        if(err){
            return res.json("Error");
        }
        return res.json({updated: true});
    })
})

app.post('/deleteCat/:catID',(req,res)=>{
    const sql = "DELETE FROM cat WHERE cat_ID = ?";
    const catID = req.params.catID;
    db.query(sql,[catID],(err,result) => {
        if(err){
            return res.json("Error");
        }
        return res.json({deleted: true});
    })
})

// check charity worker exist or not for changing password
app.post('/charityworker',(req,res) => {
    const sql = "SELECT * FROM charityworker WHERE `email` = ?";

    db.query(sql,[req.body.encrypted_email,req.body.password],(err,data) => {
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            bcrypt.compare(req.body.password.toString(),data[0].password,(err,response)=>{
                if(err){
                    console.log(err);
                }
                if(response){
                    return res.json({found:true});
                }else{
                    return res.json({found:false});
                }
            })
        }else{
            return res.json({found:false});
        }
    })

})

//charity worker changes password
app.post('/charityworkerChangePassword',(req,res) => {
    const sql = "UPDATE charityworker SET `password` = ? WHERE `email` = ?";
    const email = req.body.encrypted_email;
    const password = req.body.confirm_new_password;

    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    //console.log(password.toString());
                    //console.log(password_hash);
                    db.query(sql,[password_hash,email],(err,result)=>{
                        if(err){
                            return res.json("Error");
                        }
                        return res.json({updated:true});
                    })
                }
            })
        }
    })

})

//upload image to server
app.post('/upload',upload.single('image'),(req,res) => {
    //console.log(req.file);
    res.json({filename:req.file.originalname});
})

//upload image to database
app.post('/uploadCatImage',(req,res) => {
    const sql = "UPDATE cat SET `cat_image` = ? WHERE `cat_ID` = ?";
    db.query(sql,[req.body.file_name,req.body.values.catID],(err,result)=>{
        if(err){
            return res.json("Error");
        }
        return res.json({uploaded:true});
    })
})

//check member exist or not
app.post('/checkMemberExist',(req,res) => {
    const sql = "SELECT * FROM member WHERE `username` = ?";
    const username = req.body.encrypted_username;
    db.query(sql,[username],(err,data)=>{
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            return res.json("found");
        }else{
            return res.json("not found");
        }
    })
})

//register member
app.post('/memberSignUp',(req,res) => {
    const sql = "INSERT INTO member (`Id`,`username`,`email`,`password`) VALUES (?,?,?,?)";
    const Id = req.body.Id;
    const username = req.body.encrypted_username;
    const email = req.body.encrypted_email;
    const password = req.body.password;

    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    //console.log(password.toString());
                    //console.log(password_hash);
                    db.query(sql,[Id,username,email,password_hash],(err, data) => {
                        if(err){
                            return res.json("Error");
                            //console.log(err);
                        }
                        return res.json({registered:true});
                    })
                }
            })
        }
    })
})

//login member
app.post('/memberSignIn',(req,res) => {
    const sql = "SELECT * FROM member WHERE `username` = ?";   
    db.query(sql,[req.body.encrypted_username],(err,data)=>{
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response)=>{
                if(err){
                    console.log(err);
                }
                if(response){
                    req.session.username = data[0].username;
                    console.log(req.session.username);
                    return res.json("success");
                }else{
                    return res.json("fail");
                }
            })
        }else{
            return res.json("member doesn't exist");
        }
    })
})

app.get('/MemberSession',(req,res)=>{
    var username = req.session.username;
    console.log(username);
    if(username == ""){
        return res.json("Empty");
    }else{
        return res.json({username:username});
    }
});

//check member exist or not for changing password
app.post('/member',(req,res)=>{
    const sql = "SELECT * FROM member WHERE `username` = ?";

    db.query(sql,[req.body.encrypted_username,req.body.password],(err,data) => {
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            bcrypt.compare(req.body.password.toString(),data[0].password,(err,response)=>{
                if(err){
                    console.log(err);
                }
                if(response){
                    return res.json({found:true});
                }else{
                    return res.json({found:false});
                }
            })
        }else{
            return res.json({found:false});
        }
    })
})

//member changes password
app.post('/memberChangePassword',(req,res)=>{
    const sql = "UPDATE member SET `password` = ? WHERE `username` = ?";
    const username = req.body.encrypted_username;
    const password = req.body.confirm_new_password;

    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    console.log(password.toString());
                    console.log(password_hash);
                    db.query(sql,[password_hash,username],(err,result)=>{
                        if(err){
                            return res.json("Error");
                        }
                        return res.json({updated:true});
                    })
                }
            })
        }
    })
})

//get favourite of cat
app.get('/favourite/:catID',(req,res) => {
    const sql = "SELECT * FROM cat WHERE cat_ID = ?";
    db.query(sql,[req.params.catID],(err,data) => {
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})

//member add favourites
app.post('/addFavourite',(req,res) => {
    const sql = "INSERT INTO favourites (`cat_ID`,`member_username`,`cat_name`,`cat_type`,`country_of_origin`,`origin`,`size`,`hair_type`,`color_pattern`,`shelter_center`,`cat_image`,`address`,`business_hours`,`contact_number`,`map_link`,`official_website_url`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const cat_ID = req.body.cat_ID;
    const member_username = req.body.member_username;
    const catName = req.body.catName;
    const catType = req.body.catType;
    const countryOfOrigin = req.body.countryOfOrigin;
    const origin = req.body.origin;
    const size = req.body.size;
    const hairType = req.body.hairType;
    const color_pattern = req.body.color_pattern;
    const shelter_center = req.body.shelter_center;
    const catImage = req.body.catImage;
    const address = req.body.address;
    const businessHours = req.body.businessHours;
    const contactNum = req.body.contactNum;
    const mapLink = req.body.mapLink;
    const offcialWebsiteURL = req.body.offcialWebsiteURL;

    db.query(sql,[cat_ID,member_username,catName,catType,countryOfOrigin,origin,size,hairType,color_pattern,shelter_center,catImage,address,businessHours,contactNum,mapLink,offcialWebsiteURL],(err,result)=>{
        if(err){
            return res.json("Error");
        }
        return res.json({added:true});
    })
})

//member gets favourites of cats
app.get("/favourites/:member",(req,res)=>{
    const sql = "SELECT * FROM favourites WHERE `member_username` = ?";
    db.query(sql,[req.params.member],(err,data)=>{
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})

//delete favourites of cats
app.post("/deleteFavourite/:catID",(req,res)=>{
    const sql = "DELETE FROM favourites WHERE `cat_ID` = ?";
    const catID = req.params.catID;
    db.query(sql,[catID],(err,result)=>{
        if(err){
            return console.log(err);
        }
        return res.json({deleted:true});
    })
})

app.listen(4000,()=>{
    console.log("The server port 4000 is starting up and listening");
})