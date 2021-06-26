
/*****************************Imports*********************/
import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../Config/App";

/*****************************Middleware*********************/
async function verifyUserToken(req : Request, resp : Response, next : any) : Promise<void>
{
    /*Verifies the user's JWT*/

    const cookies : any = getCookies(req.headers.cookie); //Getting the cookies
    if(cookies.userToken === undefined)
        resp.status(200).json({success:false,code:4}); //Request does not have token
    else
    {
        //Verifing the token
        try
        {
            //Decoding the user id from the token
            const userId : string = await new Promise<string>((resolve, reject) => {
                jwt.verify(cookies.userToken, JWT_SECRET!, (err : any, decoded : any) => {
                    if(err)
                        reject(err);
                    else
                        resolve(decoded as string);
                })
            })

            //Adding the id to the request body
            req.body["userId"] = userId;

            next();
        }
        catch(err)
        {
            resp.status(200).json({success:false,code:4});
        }
    }
}

function addCorsHeaderFields(req : Request, resp : Response, next : any) : void
{
    /*Middleware to add the required CORS headers to the responses*/

    //Adding the required header fields
    resp.append("Access-Control-Allow-Origin", "http://localhost:3000");
    resp.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    resp.append("Access-Control-Allow-Headers", "Content-Type");
    resp.append("Access-Control-Allow-Credentials", "true")

    next();
}

/*****************************Functions*********************/
function getCookies(cookieStr : string | undefined) : any
{
    /*Returns an object containing the cookies in the given cookie string*/

    const cookies : any = {}; //The object containing the cookie mapping  
    if(cookieStr === undefined)
        return cookies;

    //Extracting the cookies
    const cookieStrs : string[] = cookieStr.split(';');
    let cookieComps : string[] | undefined;
    cookieStrs.forEach((keyVal : string) => {
        cookieComps = keyVal.split('=');
        cookies[cookieComps[0].trim()] = cookieComps[1];
    })

    return cookies;
}

/*****************************Exports*********************/
export {verifyUserToken, addCorsHeaderFields};
