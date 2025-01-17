const express = require("express");
const { UserModel, TodoModel } = require("./db");
const {auth, JWT_SECRET} = require("./auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");


mongoose.connect("mongodb+srv://birat059:Rarjun%40055@cluster44.fdvo7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster44");

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const hashedPassword = await bcrypt.hash(password,10);
    

    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    });
    res.json({
        message: "You are signed up"
    });

});

app.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email,
      });
      if(!user){
        res.status(404).json({
          message: "User does not exist in our database"
        })
        return
      }
        
    const passwordMatch = await bcrypt.compare(password,user.password);
    if(user && passwordMatch){
        const token = jwt.sign({
            id: user._id.toString()
        },JWT_SECRET);

        res.json({
        token
        })
    } else {
        res.status(404).json({
            message: "Invalid creds"
        })
    }
       
});

app.post("/todo", auth, async function (req, res) {
    const userId = req.user.id;
    const title = req.body.title;
    const done = req.body.done;
    await TodoModel.create({
        userId: userId,
        title: title,
        done: done
    });
    res.json({
        message: "Todo created"
    });
});

app.get("/todos", auth, async function (req, res) {
    const userId = req.user.id;
    const todos = await TodoModel.find({ userId });
    res.json(todos);
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});


