import express from "express"
import mongoose from "mongoose"
import morgan from "morgan"
import "dotenv/config"
import bcrypt from 'bcrypt'
import { nanoid } from "nanoid"
import jwt from "jsonwebtoken"

// Schema
import User from "./Schema/User.js"

const server = express()
const PORT = 5000

server.use(express.json())
server.use(morgan('dev'))


let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password


mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
})

const formatDataSend = (user) => {

    const access_token = jwt.sign({id: user._id}, process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img : user.personal_info.profile_img,
        username : user.personal_info.username,
        fullname : user.personal_info.fullname,
        
    }
}

const generateUserName = async (email) => {
    let username = email.split("@")[0]
    

    const isUserNameUnique = await User.exists({"personal_info.username": username}).then(result => result)

    isUserNameUnique ? username += nanoid().substring(0, 5) : username

    return username;
}

server.post('/signup', (req, res) => {
    const {fullname, email, password} = req.body


    // data validate
    if (fullname.length < 3) {
        return res.status(403).json({"error": "Fullname must be ar least 3 letters long"})
    }

    if (!email.length) {
        return res.status(403).json({"error": "Enter email"})
    }

    if (!emailRegex.test(email)) {
        return res.status(403).json({"error": "Email is invalid"})
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({"error": "Password should be 6 to 20 characters long with a numberic, 1 lowercase and 1 uppercase letters"})
    }


    bcrypt.hash(password, 10, async (err, hashed_password) => {
        const username = await generateUserName(email)
        console.log(username);
        
        const user = new User ({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username,
            }
        })

        user.save().then(user => res.status(200).json(formatDataSend(user)) )
        .catch(err => {
            if (err.code == 11000) {
                res.status(500).json({"error" : "Email already exists"})
            }
        } )
    })
    

})


server.post('/signin', async (req, res) => {
    const {email, password} = req.body

    await User.findOne({'personal_info.email': email}).then(user => {
        console.log(user);
        return res.status(200).json({'status' : 'got user document'})
    }) .catch(err => {
        console.log(err);
        return res.status(403).json({"error": "Email not found"})
    })
})




server.listen(PORT, () => {
    console.log(`Server is running on this port ${PORT}`);
})



