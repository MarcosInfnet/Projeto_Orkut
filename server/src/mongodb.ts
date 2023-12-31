import { MongoClient, Db } from "mongodb";
export * from "mongodb";

export let mongodb : Db;

export async function setupMongoDb() {
    let mongoDbUrl : string;
    if(!process.env.MONGODB_URL) {
        throw new Error("ESTÁ FALTANDO A STRING DE CONEXAO!")
    }
    mongoDbUrl = process.env.MONGODB_URL;

    const mongoClient = new MongoClient(mongoDbUrl);
    await mongoClient.connect();
    mongodb = mongoClient.db("orkut");
}