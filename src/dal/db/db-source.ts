import { config } from "dotenv";
import { connect } from "mongoose";
import { AddDefaultData } from "../../utility/default-data";
config();

connect("mongodb+srv://peakTest:JsIy3ngy1nJGaE17@peakdb.fuvfqca.mongodb.net/", {dbName: process.env.DB_DataBase})
.then(async (x) => {
    await AddDefaultData()
    console.log("Database Connected successfully")
})
.catch((err) =>  console.log("Error conneting to database", err));