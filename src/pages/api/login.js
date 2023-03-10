import { connectToDatabase } from '@/db/mongodb/connectToDatabase'

import UserModel from '@/db/mongoose/model/usermodel'
import jwt from 'jsonwebtoken';
import cookie from "cookie";
import bcrypt from 'bcrypt'


export default async function handler(req, res) {
    if(req.query.id !== process.env.NEXT_PUBLIC_KEY) return res.status(200).json({message : "You are not authorized to access API"})
  
    const { email, password } = req.body
   
    var isRegisteredUser;
    var passMatched = false;

    if (req.method === 'POST') {
        if(req.query.id !== process.env.NEXT_PUBLIC_KEY) return res.status(200).json({message : "You are not authorized to access API"})
        //connect to detabse
        await connectToDatabase().then(() => console.log('connected')).catch((err) => console.log(err))
        //find the user in the database
        const user = await UserModel.findOne({ email })
        isRegisteredUser = user;
       


        if (!isRegisteredUser) {
            return res.status(200).json({ message: 'Wrong cradantials or user not registered' })
        }

        if (isRegisteredUser) {

            // Compare password
            await bcrypt.compare(password, isRegisteredUser.password).then((isMatch) => {
               
                passMatched = isMatch;
            }).catch((err) => console.log(err));


            if (passMatched) {
                try {
                  
                    //create a jwt token for user
                    const token = jwt.sign({ id: isRegisteredUser._id }, "lreytiuhfurf465675$#45%%3^5hjefgjhrb", { expiresIn: '1d' });
                    //save the token to headers cookie
                    res.setHeader('Set-Cookie', cookie.serialize('token', token, 
                    { httpOnly: true, 
                        maxAge: 60 * 60 * 24 * 7 ,
                        path: '/'
                    }));

                }
                catch (err) {
                    console.log(err)
                }
                return res.status(200).json({ user: isRegisteredUser, message: 'Login successfull' })
            }
            else {
                return res.status(200).json({ message: 'Wrong cradantials or user not registered' })
            }

        }


        return res.status(404).json({ message: ' method not allowed' })


    }


}
