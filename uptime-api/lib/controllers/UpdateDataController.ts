
import * as mongoose from 'mongoose';
import { Request, Response } from 'express';
import { SiteSchema } from '../models/SiteModel';
import { AccountSchema } from '../models/AccountModel';
import { LogTypeSchema } from '../models/LogTypeModel';
import { LogSchema } from '../models/LogModel';

import axios from 'axios';
import * as moment from 'moment/moment';

const Site = mongoose.model('Sites', SiteSchema);
const Account = mongoose.model('Accounts', AccountSchema);
const LogType = mongoose.model('LogType', LogTypeSchema);
const Log = mongoose.model('Log', LogSchema);

export class UpdateDataController{

    uptimeRequest = async (url, data) => {
        let resp = await axios.post(url, data);
        return resp.data;
    }

    getUptimeData = async (accounts, lastlog) => {
        let results = [];
        let url = 'https://api.uptimerobot.com/v2/getMonitors';
        for(var i = 0; i<accounts.length; i++){
            let data = {"api_key":accounts[i].apiKey, "logs":1};
            if(lastlog != null)
                data["logs_start_date"] = lastlog.datetime + 1;
            let tmpResult = await this.uptimeRequest(url, data);
            tmpResult.monitors["acountId"] = accounts[i]._id;
            results.push(tmpResult.monitors);
            if(tmpResult.pagination.limit < tmpResult.pagination.total){
                let offset = tmpResult.pagination.limit;
                while(offset < tmpResult.pagination.total){
                    let data = {"api_key":accounts[i].apiKey, "offset":offset, "logs":1, "logs_end_date": moment().format('X')};
                    if(lastlog != null)
                        data["logs_start_date"] = lastlog.datetime + 1;
                    tmpResult = await this.uptimeRequest(url, data);
                    tmpResult.monitors["acountId"] = accounts[i]._id;
                    results.push(tmpResult.monitors);
                    offset = offset + tmpResult.pagination.limit;
                }
            }
        }
        return results;
    }

    public saveAllSites = async () => {
        let Accounts = Account.find({}).exec();
        let SitePromises = Site.find({}).exec();
        let LastLog = Log.findOne({}).sort('-datetime').exec();
        let Logtype = LogType.find({}).exec();
        let newSiteAdd = Array();
        let newLogsAdd = Array();
        let result = {};
        await Promise.all([Accounts, SitePromises, LastLog, Logtype]).then(async ([accounts, sites, lastlog, logtype]) => {
            let uptimeData = await this.getUptimeData(accounts, lastlog)
            uptimeData.forEach(element => {
                let AccountId = element.acountId;
                element.forEach(element => {
                    let isNewSite = false
                    let newSite 
                    let siteConcerned = sites.filter(e => e.uptimeId === element.id);
                    var logs = element.logs
                    if(siteConcerned.length === 0){
                        element.create_datetime = logs[logs.length-1].datetime
                        var site = {
                            "name":element.friendly_name,
                            "uptimeId":element.id,
                            "url":element.url,
                            "createDatetime":element.create_datetime,
                            "Account":AccountId,
                        }
                        newSiteAdd.push(site)
                        newSite = new Site(site);
                        isNewSite = true
                        newSite.save();
                    }
                    logs.forEach(logelement => {
                        var siteConcernedId = 0
                        if(isNewSite){
                            siteConcernedId = newSite._id;
                        }else{ 
                            siteConcerned = sites.find(x => x.uptimeId === element.id);
                            siteConcernedId = siteConcerned._id;
                            
                        }
                        var logtypeConcerned = logtype.find(x=> x.logTypeId === logelement.type)
                        var logtosave = {
                            "Site":siteConcernedId,
                            "Type":logtypeConcerned._id,
                            "datetime":logelement.datetime,
                            "duration":logelement.duration,
                            "code":logelement.reason.code,
                            "detail":logelement.reason.detail
                        }
                        newLogsAdd.push(logtosave)
                        let log = new Log(logtosave);
                        log.save();
                    });
                });
            });
        }).then(() =>{
            result = {'State':'sucess', 'message': 'Sites and Logs saved successfully', 'site_added':newSiteAdd.length,  'logs_added':newLogsAdd.length, 'sites':newSiteAdd}
        }).catch((error) => {
            result = {'State':'error', 'message': 'Sites cannot be saved'}
        });

        return result;
    }    
}