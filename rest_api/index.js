const express = require('express');
const bcrypt = require("bcrypt");

const saltRounds = 10;

require('dotenv').config();

const Users = require('./models/Users');

const dbConnect = require("./dbconnect");

dbConnect();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.post('/create', async (req, res) => {


     const { username, password } = req.body;

     if (!username || !password) {
          return res.status(400).json({ msg: 'Please enter all fields' });
     }

     try {
          const salt =  await bcrypt.genSalt(saltRounds);
          bcrypt.hash(password, salt, async (error,hash) => {
               if(error){
                    res.status(500).json({ msg: error.message });
               }
                const user =  await Users.create({
                    username,
                    password: hash,
                });
          res.status(201).json({ user });
          });
        
     } catch (error) {
          res.status(400).json({ msg: error.message });
     }


});

app.get('/users', async (req, res) => {
     try {
          const users = await Users.find();
          res.status(200).json({ users });

     } catch (error) {
          res.status(500).json({ msg: error.message });
     }
});

app.get('/user', async (req, res) => {
     const { username, password } = req.body;

     try {
          if (!username || !password) return res.status(400).json({ msg: 'Please enter all fields' });
          
          const findUser = await Users.findOne({ username });
          if (!findUser) return res.status(404).json({ msg: 'User not found' });

          console.log(findUser.password);
          // compare passwords

          bcrypt.compare(password, findUser.password, async (error, result) => {
               if (error) {
                    res.status(500).json({ msg: error.message });
               }
               console.log(result);
               if (!result) return res.status(401).json({ msg: 'Invalid password' });
               res.status(200).json({ msg: 'Login successful' });
             
          });
             
         
         
     } catch (error) {
          res.status(500).json({ msg: error.message });
     }
});

app.put('/user/:id', async (req, res) => {
     const { id } = req.params;

     try {
          const user = await Users.findByIdAndUpdate(id, req.body);
          res.status(200).json({ user });
     } catch (error) {
          res.status(500).json({ msg: error.message });
     }
});

app.delete('/user/:id', async (req, res) => {
     const { id } = req.params;

     try {
          const user = await Users.findByIdAndDelete(id);
          res.status(200).json({ user });
     } catch (error) {
          res.status(500).json({ msg: error.message });
     }
});

app.listen(3000, () => {
     console.log('Example app listening on port 3000!');
});