
import * as mongoose from 'mongoose';
import { SiteSchema } from '../models/SiteModel';
import { LogSchema } from '../models/LogModel';
import { Request, Response } from 'express';

const Site = mongoose.model('Sites', SiteSchema);
const Log = mongoose.model('Log', LogSchema);

export class SiteController{
    public addSite (req: Request, res: Response) {                
        let newSite = new Site(req.body);
        newSite.save((err, site) => {
            if(err){
                res.send(err);
            }    
            res.json(site);
        });
    }

    public getSite (req: Request, res: Response) {           
        Site.find({}, (err, site) => {
            if(err){
                res.send(err);
            }
            res.json(site);
        }).populate('Account');
    }

    public deleteSites(req: Request, res: Response) {
        let DeleteSites = Site.deleteMany({}).exec();
        let DeleteAllLogs = Log.deleteMany({}).exec();
        Promise.all([DeleteSites, DeleteAllLogs]).then(function () {
            let data = {'State':'success', 'Message':'All site deleted successfully'}
            res.json(data)
        });
    }
}