import express, { json } from "express"
import mongoose from "mongoose"
import morgan from "morgan"
import "dotenv/config"
import bcrypt from 'bcrypt'
import { nanoid } from "nanoid"
import multer from "multer"
import jwt from "jsonwebtoken"
import cors from "cors"
import admin from "firebase-admin"
import {getAuth} from "firebase-admin/auth"
import serviceAccountKey from "./nofko-2f05e-firebase-adminsdk-tsc14-d3f2f065d6.json" assert {type: "json"}

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// Schema
import User from "./Schema/User.js"

const server = express()
const PORT = 3300

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})


server.use(cors())
server.use(express.static(path.join(__dirname, 'public')))
server.use(express.json())
server.use(morgan('dev'))


const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password


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



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${__dirname}/public/data/uploads`)
    },
    filename: function (req, file, cb) {
      const uploadDateTime = new Date().getTime()
      cb(null, nanoid() + '-' + uploadDateTime + '.jpeg')
    }
})

// image upload
const upload = multer({storage})

server.post('/upload-image', upload.single('upload_image'), function (req, res) {

    const image_url = `${req.protocol}://${req.headers.host}/data/uploads/${req.file.filename}`

    res.status(201).json({"image_url": image_url})
});



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
        if (!user){
            return res.status(200).json({'status' : 'Email Not found'})
        }
        
        if (user.google_auth) return res.status(403).json({"error": "Account was created using google. Try logging in with Google"})
        
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
            if (err) return res.status(403).json({"error": "Error occured while login please try again"})

            if (!result) {
                return res.status(403).json({"error": "Incorrect Password"})
            } else {
                return res.status(200).json(formatDataSend(user))
            }
        })

        
    }) .catch(err => {
        console.log(err.message);
        return res.status(403).json({"error": err.message})
    })
})


server.post('/google-auth', async (req, res) => {
    const {access_token} = req.body

    getAuth().verifyIdToken(access_token).then(async decode_user => {
        const {email, name, picture} = decode_user;

        console.log({email, name, picture});

        let user = await User.findOne({'personal_info.email' : email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then(user => user || null).catch(err => {
            res.status(500).json({"error": err.message})
        })

        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({"error": "This email was signed up without google. Please login with password to access the account"})
            }

            return res.status(200).json(formatDataSend(user))
        } else {
            const username = await generateUserName(email)
            

            user = new User({
                personal_info: {
                    fullname: name,
                    email,
                    profile_img: picture,
                    username,
                },

                google_auth: true
            })

            await user.save().then(save_user => user = save_user)
            .catch(err => {
                return res.status(500).json({"error": err.message})
            })


            console.log(user);
            return res.status(200).json(formatDataSend(user))
        }



        
    }) .catch(() => {
        return res.status(500).json({"error": "Failed to authenticate you with google. Try with some other google account"})
    })

})




server.listen(PORT, () => {
    console.log(`Server is running on this port ${PORT}`);
})



