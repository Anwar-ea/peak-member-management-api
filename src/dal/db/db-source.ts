import { DataSource, Equal } from "typeorm";
import msnodesqlv8 from 'mssql'
import { Account, Privilege, Role, User, Module, Goal, Milestone, ToDo, BusinessPlan, MarketingStrategy, Measurable, Vision } from "../../entities";
import { config } from "dotenv";
config();
import { AddDefaultData } from "../../utility/default-data";

export const dataSource = new DataSource({
    driver: msnodesqlv8,
    type: 'mssql',
    host: process.env.DB_Server ?? "",
    database: process.env.DB_DataBase ?? "",
    username: process.env.DB_userId ?? "",
    password: process.env.DB_Password ?? "",
    port: process.env.DB_Port ? parseInt(process.env.DB_Port) : 1433,
    migrations: ["src/dal/migrations/**/*.ts"],
    entities: [Account, User,  Role, Privilege, Module, Goal, Milestone, ToDo, Vision, BusinessPlan, MarketingStrategy, Measurable],
    synchronize: true,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
});

dataSource.initialize()
.then(async (x) => {
    await AddDefaultData(dataSource)
    console.log("Database Connected successfully")
})
.catch((err) =>  console.log("Error conneting to database", err));