import {Request, Response} from "express";
import { AccountTypeController } from "../controllers/AccountTypeController";
import { AccountController } from "../controllers/AccountController";
import { SiteController } from "../controllers/SiteController";
import { UpdateDataController } from "../controllers/UpdateDataController";
import { LogTypeController } from "../controllers/LogTypeController";
import { LogController } from "../controllers/LogController";


export class Routes {       
    public accountTypeController: AccountTypeController = new AccountTypeController()
    public accountController: AccountController = new AccountController() 
    public siteController: SiteController = new SiteController() 
    public updateDataController: UpdateDataController = new UpdateDataController() 
    public logTypeController: LogTypeController = new LogTypeController()
    public logController: LogController = new LogController()

    public routes(app): void {          
        app.route('/')
        .get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        })
        
        app.route('/updateData')
        .post(this.updateDataController.saveAllSites);
        
        app.route('/account')
        .get(this.accountController.getAccounts)
        .post(this.accountController.addAccount);
        
        app.route('/accountype')
        .get(this.accountTypeController.getAccountType)
        .post(this.accountTypeController.addAccountType);

        app.route('/sites')
        .get(this.siteController.getSite)
        .post(this.siteController.addSite)
        .delete(this.siteController.deleteSites)

        app.route('/logs')
        .post(this.logController.getLogs)
        .delete(this.logController.deleteLogs)

        app.route('/siteslogs')
        .post(this.logController.getLogsBySites)

        app.route('/saveLogType')
        .post(this.logTypeController.addLogType);

    }
}