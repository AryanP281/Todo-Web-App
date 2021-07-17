
/************************************Imports************************ */
import fs from "fs";

/************************************Variables************************ */
let JWT_SECRET : string | undefined;
const CORS_ORIGIN : string = "http://192.168.1.5:3000";

/************************************Script************************ */

//Getting the config file data
const configFileData : string[] = fs.readFileSync("Config.txt", "utf-8").split('\n');

//Setting the jwt secret
JWT_SECRET = configFileData[0];

/************************************Exports************************ */
export {JWT_SECRET, CORS_ORIGIN};
