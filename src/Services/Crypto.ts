
/*************************************Imports***************************/
import bcrypt from "bcrypt";

/************************************Variables************************ */
const saltRounds : number = 10; //The number of salt rounds for brcypt hashing

/************************************Functions************************ */
function saltedHash(val : string) : Promise<string>
{
    /*Hashes the given value using BCrypt*/

    return bcrypt.hash(val, saltRounds);
}

function compare(val : string, hashed : string) : Promise<boolean>
{
    return bcrypt.compare(val,hashed);
}

/**************************Exports************************ */
export {saltedHash, compare};
