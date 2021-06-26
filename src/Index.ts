
/*****************************Imports*********************/
import express from "express";
import { AuthApiRouter } from "./Routes/AuthApi";
import { ListApiRouter } from "./Routes/ListApi";
import {addCorsHeaderFields} from "./Services/Middleware";

/***************************Variables*********************/
const SERVER_PORT : number = (parseInt(process.env.PORT!) || 5000); //Setting the port number to run the server

/**************************Script**************************/
const expressApp : express.Application = express(); //The express server

//Setting the middleware 
expressApp.use(express.json());
expressApp.use(express.urlencoded({extended: false}));
expressApp.use(addCorsHeaderFields);

//Setting routes
expressApp.use("/auth", AuthApiRouter);
expressApp.use("/lists", ListApiRouter);

//Starting express server
expressApp.listen(SERVER_PORT, "0.0.0.0", () => console.log(`Express Server started at port ${SERVER_PORT}`));

//Connecting to mongo db
require("./Config/Mongo");

//Configuring the app
require("./Config/App");

/**************************Exports************************/
