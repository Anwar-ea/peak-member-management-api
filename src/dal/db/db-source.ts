import { config } from "dotenv";
import { connect } from "mongoose";
import { AddDefaultData } from "../../utility/default-data";
config();

connect(`mongodb+srv://${process.env.DB_userId}:${process.env.DB_Password}@${process.env.DB_Server}/`, {dbName: process.env.DB_DataBase, socketTimeoutMS: 30000})
.then(async (x) => {
    await AddDefaultData()
    console.log("Database Connected successfully")
})
.catch((err) =>  console.log("Error conneting to database", err));