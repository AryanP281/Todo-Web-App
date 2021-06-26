
/*****************************Imports*********************/
import {Request,Response} from "express";
import { Collection } from "mongodb";
import { mongodb } from "../Config/Mongo";
import {saltedHash, compare} from "../Services/Crypto";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../Config/App";

/*****************************Variables*********************/
let userAccountsCollection : Collection | null = null; //Reference to the collection containing the user account details

/*****************************Helper Functions*********************/
async function checkUserExists(email : string) : Promise<boolean>
{
    /*Checks if a user with the given email has been registered*/

    //Getting the collection
    if(userAccountsCollection === null)
        userAccountsCollection = await mongodb.db().collection("Users");
    
    //Getting the user document
    const doc = await userAccountsCollection.findOne({email:email});
    
    return (doc !== null);
}

async function createUserCollection(userId : string) : Promise<string>
{
    /*Creates a collection for the user with the given user id*/

    //Creating the user collection
    const userCollection : Collection = await mongodb.db().createCollection(userId);

    //Adding the user lists document
    const listDoc = await userCollection.insertOne({lists: ["Do", "Doing", "Done"]});

    return listDoc.ops[0]._id.toString();
}

/*****************************Functions*********************/
async function createUserAccount(req : Request, resp : Response) : Promise<void>
{
    /*Creates an account for the user*/

    //Checking if email already exists
    const emailExists : boolean = await checkUserExists(req.body.email);
    if(emailExists)
    {
        //Sending error
        resp.status(200).json({success: false, code: 1});
        return;
    }
    
    //Adding the user account to database
    const hashedPassword : string = await saltedHash(req.body.password); //Hashing the user password
    const userDoc : {email:string,password:string,fname:string,lname:string} = {
        email: req.body.email,
        password: hashedPassword,
        fname: req.body.fname,
        lname: req.body.lname
    }; //The user info to store
    try 
    {
        const res = await userAccountsCollection!.insertOne(userDoc);

        //Creating the user collection
        const userId : string = res.ops[0]._id.toString(); //Getting the id of the user document
        const listsDocId : string = await createUserCollection(userId);

        //Setting the cookies
        const userToken = await jwt.sign(userId, JWT_SECRET!); //Generating the JWT
        resp.cookie("userToken", userToken, {httpOnly: true});
        resp.cookie("auth", true, {httpOnly: false});

        resp.status(200).json({success:true, code:0}); //User account successfully created
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
    
}

async function loginUser(req : Request, resp : Response) : Promise<void>
{
    /*Validates the user credentials and responds with the jwt access token*/

    //Getting the collection
    if(userAccountsCollection === null)
        userAccountsCollection = await mongodb.db().collection("Users");

    //Getting the user doc
    const userDoc = await userAccountsCollection.findOne({email:req.body.email});
    if(userDoc === null)
    {
        //User account does not exist
        resp.status(200).json({success:false,code:1});
        return;
    }

    //Verifing the password
    const hashedPassword : string = userDoc.password;
    if(!(await compare(req.body.password, hashedPassword)))
    {
        //Incorrect password
        resp.status(200).json({success:false, code: 3});
        return;
    }
    
    //Setting cookies
    const userToken : string = await jwt.sign(userDoc._id.toString(), JWT_SECRET!);
    resp.cookie("userToken", userToken, {httpOnly: true});
    resp.cookie("auth", true, {httpOnly: false});

    resp.status(200).json({success:true, code:0});
}

function logoutUser(req : Request, resp : Response)
{
    /*Logs the user out by clearing all of its cookies*/

    resp.cookie("userToken", "", {maxAge:0});
    resp.cookie("auth",false,{maxAge:0});

    resp.status(200).json({success:true, code: 0});
}

/*****************************Exports*********************/
export {createUserAccount, loginUser, logoutUser};

