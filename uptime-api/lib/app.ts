import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as cron from "node-cron";
import { Routes } from "./routes/UptimeRoutes";
import { UpdateDataController } from "./controllers/UpdateDataController";
import * as mongoose from "mongoose";

class App {

    public app: express.Application;
    public routePrv: Routes = new Routes();
    public mongoUrl: string = 'mongodb://root:aUNdT89bYNkw42A834Hv@217.182.52.55/UptimeDB';
    public updateDataController = new UpdateDataController()
    constructor() {
        this.app = express();
        this.app.use(cors())
        this.config();
        this.routePrv.routes(this.app);     
        this.mongoSetup();
        this.executeCron();
    }

    private config(): void{
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private mongoSetup(): void{
        mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoUrl);    
    }

    private executeCron = async () => {
        await cron.schedule('* * * * *', async () => {
            let dataToStore = await this.updateDataController.saveAllSites();
            console.log(dataToStore);
        });
    }    
}

export default new App().app;