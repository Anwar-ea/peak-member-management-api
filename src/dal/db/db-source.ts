import { config } from "dotenv";
import { connect } from "mongoose";
import { AddDefaultData } from "../../utility/default-data";
config();

connect("mongodb://localhost:27017/", {dbName: process.env.DB_DataBase})
.then(async (x) => {
    // await AddDefaultData(dataSource)
    console.log("Database Connected successfully")
})
.catch((err) =>  console.log("Error conneting to database", err));