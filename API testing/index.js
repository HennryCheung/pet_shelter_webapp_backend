const express = require('express');
const mysql = require("mysql");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pet_shelter_app"
})

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
    const sql = "INSERT INTO cat (`cat_ID`,`cat_name`,`cat_type`,`country_of_origin`,`origin`,`size`,`hair_type`,`color_pattern`,`shelter_center`,`cat_image`, `address`, `business_hours`, `contact_number`, `map_link`, `official_website_url`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const cat = req.body;
    db.query(sql,[cat.cat_ID,cat.cat_name,cat.cat_type,cat.country_of_origin,cat.origin,cat.size,cat.hair_type,cat.color_pattern,cat.shelter_center,cat.cat_image,cat.address,cat.business_hours,cat.contact_number,cat.map_link,cat.official_website_url],(err,data)=>{
        if(err){
            return res.json("Error");
        }
        return res.json("Cat is added in the API and database at the same time.");
        //res.send("Cat is added in the API and database at the same time.")
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

app.put('/editCat/:catID',(req,res)=>{
    const sql = "UPDATE cat SET `cat_ID` = ?, `cat_name` = ?, `cat_type` = ?, `country_of_origin` = ?, `origin` = ?, `size` = ?, `hair_type` = ?, `color_pattern` = ?, `shelter_center` = ?, `address` = ?, `business_hours` = ?, `contact_number` = ?, `map_link` = ?, `official_website_url` = ? WHERE `cat_ID` = ?";
    const catID = req.params.catID;
    const cat = req.body;
    db.query(sql,[cat.cat_ID,cat.cat_name,cat.cat_type,cat.country_of_origin,cat.origin,cat.size,cat.hair_type,cat.color_pattern,cat.shelter_center,cat.address,cat.business_hours,cat.contact_number, cat.map_link, cat.official_website_url,catID],(err,data) => {
        if(err){
            return res.json("Error");
        }
        return res.json("Cat is updated in the API and database at the same time.");
    })
})

app.delete('/deleteCat/:catID',(req,res)=>{
    const sql = "DELETE FROM cat WHERE cat_ID = ?";
    const catID = req.params.catID;
    db.query(sql,[catID],(err,result) => {
        if(err){
            return res.json("Error");
        }
        return res.json("Cat is deleted in the API and database at the same time.");
    })
})

app.get('/charityworkers',(req,res) => {
    const sql = "SELECT * FROM charityworker";
    db.query(sql,(err,data) => {
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })

})

// charity worker sign up
app.post('/charityworkerSignUp',(req,res) => {
    const sql = "INSERT INTO charityworker (`worker_ID`,`first_name`,`last_name`,`email`,`password`) VALUES (?,?,?,?,?)";
    const charityworker = req.body;
   
    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(req.body.password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    db.query(sql,[req.body.worker_ID,req.body.first_name,req.body.last_name,req.body.email,password_hash],(err, data) => {
                        if(err){
                            return res.json("Error");
                        }
                        return res.json("Charity worker is registered and added in the API and database at the same time.");
                    })
                }
            })
        }
    })
})

//charity worker sign in
app.post('/charityworkerSignIn',(req,res) => {
    const sql = "SELECT * FROM charityworker WHERE `email` = ?";
    const charityworker = req.body;
    db.query(sql,[charityworker.email],(err, data) => {
        if(err){
            return res.json("Error");
        }
       if(data.length > 0){
        bcrypt.compare(charityworker.password.toString(), data[0].password, (err, response)=>{
            if(err){
                console.log(err);
            }
            if(response){
                return res.json("Sign In Success");
            }else{
                return res.json("Sign In Fail");
            }
        })
       }else{
            return res.json("the charity worker doesn't exist");
       }
    })
})

// check charity worker exist or not for changing password
app.post('/charityworkerCheckExist',(req,res) => {
    const sql = "SELECT * FROM charityworker WHERE `email` = ?";
    const charityworker = req.body;
    db.query(sql,[charityworker.email,charityworker.password],(err,data) => {
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            bcrypt.compare(charityworker.password.toString(),data[0].password,(err,response)=>{
                if(err){
                    console.log(err);
                }
                if(response){
                    return res.json("The charity worker is found");
                }else{
                    return res.json("The password is incorrect");
                }
            })
        }else{
            return res.json("The charity worker doesn't exist");
        }
    })

})

//charity worker changes password
app.put('/charityworkerChangePassword',(req,res) => {
    const sql = "UPDATE charityworker SET `password` = ? WHERE `email` = ?";
    const charityworker = req.body;

    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(charityworker.new_password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    //console.log(password.toString());
                    //console.log(password_hash);
                    db.query(sql,[password_hash,charityworker.email],(err,result)=>{
                        if(err){
                            return res.json("Error");
                        }
                        return res.json("The password of charity worker is changed");
                    })
                }
            })
        }
    })
})

app.get('/members',(req,res) => {
    const sql = "SELECT * FROM member";
    db.query(sql,(err,data) => {
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})

//register member
app.post('/memberSignUp',(req,res) => {
    const sql = "INSERT INTO member (`Id`,`username`,`email`,`password`) VALUES (?,?,?,?)";
    const member = req.body;

    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(member.password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    //console.log(password.toString());
                    //console.log(password_hash);
                    db.query(sql,[member.Id,member.username,member.email,password_hash],(err, data) => {
                        if(err){
                            return res.json("Error");
                        }
                        return res.json("Member is registered and added in the API and database at the same time.");
                    })
                }
            })
        }
    })
})

//login member
app.post('/memberSignIn',(req,res) => {
    const sql = "SELECT * FROM member WHERE `username` = ?"; 
    const member = req.body;  
    db.query(sql,[member.username],(err,data)=>{
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            bcrypt.compare(member.password.toString(), data[0].password, (err, response)=>{
                if(err){
                    console.log(err);
                }
                if(response){
                    return res.json("Sign In Success");
                }else{
                    return res.json("Sign In fail");
                }
            })
        }else{
            return res.json("member doesn't exist");
        }
    })
})

//check member exist or not for changing password
app.post('/memberCheckExist',(req,res)=>{
    const sql = "SELECT * FROM member WHERE `username` = ?";
    const member = req.body;

    db.query(sql,[member.username,member.password],(err,data) => {
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            bcrypt.compare(member.password.toString(),data[0].password,(err,response)=>{
                if(err){
                    console.log(err);
                }
                if(response){
                    return res.json("The member is found");
                }else{
                    return res.json("The password is incorrect");
                }
            })
        }else{
            return res.json("The member is not found");
        }
    })
})

//member changes password
app.put('/memberChangePassword',(req,res)=>{
    const sql = "UPDATE member SET `password` = ? WHERE `username` = ?";
    const member = req.body;

    bcrypt.genSalt(10, (err,salt) => {
        if(err){
            console.log("genSalt fail");
        } else{
            bcrypt.hash(member.new_password.toString(),salt,(err,password_hash) => {
                if(err){
                    console.log("hash fail");
                }else{
                    db.query(sql,[password_hash,member.username],(err,result)=>{
                        if(err){
                            return res.json("Error");
                        }
                        return res.json("The password of username is changed");
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
    const cat_favourite = req.body;
    const cat_ID = cat_favourite.cat_ID;
    const member_username = cat_favourite.member_username;
    const catName = cat_favourite.cat_name;
    const catType = cat_favourite.cat_type;
    const countryOfOrigin = cat_favourite.country_of_origin;
    const origin = cat_favourite.origin;
    const size = cat_favourite.size;
    const hairType = cat_favourite.hair_type;
    const color_pattern = cat_favourite.color_pattern;
    const shelter_center = cat_favourite.shelter_center;
    const catImage = cat_favourite.cat_image;
    const address = cat_favourite.address;
    const businessHours = cat_favourite.business_hours;
    const contactNum = cat_favourite.contact_number;
    const mapLink = cat_favourite.map_link;
    const offcialWebsiteURL = cat_favourite.official_website_url;

    db.query(sql,[cat_ID,member_username,catName,catType,countryOfOrigin,origin,size,hairType,color_pattern,shelter_center,catImage,address,businessHours,contactNum,mapLink,offcialWebsiteURL],(err,result)=>{
        if(err){
            return res.json("Error");
        }
        return res.json("The favourite of cat is added in the API and database at the same time");
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
app.delete("/deleteFavourite/:catID",(req,res)=>{
    const sql = "DELETE FROM favourites WHERE `cat_ID` = ?";
    const catID = req.params.catID;
    db.query(sql,[catID],(err,result)=>{
        if(err){
            return console.log(err);
        }
        return res.json({deleted:true});
    })
})

app.listen(4001,()=>{
    console.log("The server port 4001 is starting up and listening");
})