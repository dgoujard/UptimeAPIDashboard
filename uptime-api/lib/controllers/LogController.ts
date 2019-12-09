import * as mongoose from 'mongoose';
import { Request, Response } from 'express';
import { SiteSchema } from '../models/SiteModel';
import { LogSchema } from '../models/LogModel';
import { AccountTypeSchema } from '../models/AccountTypeModel';

//import * as moment from 'moment/moment';
import * as moment from 'moment-timezone';

const Log = mongoose.model('Log', LogSchema);
const Site = mongoose.model('Sites', SiteSchema);
const AccountType = mongoose.model('typeaccount', AccountTypeSchema);

export class LogController{
    public deleteLogs(req: Request, res: Response){
        let DeleteAllLogs = Log.deleteMany({}).exec();
        DeleteAllLogs.then(function () {
            let data = {'State':'success', 'Message':'All logs deleted successfully'}
            res.json(data)
        });
    }
    // Get all logs
    public getLogs(req: Request, res: Response) {
        Log.find({}, (err, logs) => {
            if(err)
                res.send(err);
            res.json(logs);
        }).populate('Site').populate('Type');
    }
    // Get logs for each Sites
    public getLogsBySites = (req: Request, res: Response) => {
        const { site, ranges, custom_days_range = Array(), custom_interval = Array(), account=0} = req.body;
        let allRanges = ranges.split("-")
        let rangesArray = allRanges.map(function(e) { 
            e = e.split('_'); 
            return e;
        });
        let end = rangesArray[0][1];
        let start = rangesArray[rangesArray.length - 1][0];
        let requestLogs = {}
        let requestSite = {}
        requestLogs  = {datetime: {$gte: parseInt(start), $lte:parseInt(end)}};
        if(Array.isArray(site)){
            let siteArray = site.map(function(e) {
                return mongoose.Types.ObjectId(e)
            });
            requestLogs  = {Site : { $in: siteArray}, datetime: {$gte: parseInt(start), $lte:parseInt(end)}}
            requestSite = {_id : { $in: siteArray}}
        }
        let Logs = Log.find(requestLogs)
        .populate('Type')
        .populate({
            path:"Site",
            pcopulate : {
                path:"Account"
            }
        }).lean().exec();
        
        let TypeAccount = AccountType.find({}).lean().exec();
        let Sites =  Site.find(requestSite).populate('Account').lean().exec();
        let allSites = Array();
        let momentTime = parseInt(moment().tz('Europe/Paris').format('X'));
        Promise.all([Logs, Sites, TypeAccount]).then(([logs, sites, typeaccount])=>{
            var logArray = Array();
            logs.forEach(element => {
                if([1, 2, 99].indexOf(element.Type.logTypeId) > -1) {
                    let tmpLog = {
                        "site":element.Site.uptimeId,
                        "datetime":element.datetime,
                        "duration":element.duration,
                        "reason":{"code":element.code,"detail":element.detail},
                        "type":element.Type.logTypeId
                    }
                    logArray.push(tmpLog)
                }
            });
            if(account != 0)
                sites = sites.filter(e => e.Account.Type == account)
            sites.forEach(element => {
                let logsSite = logArray.filter( e => e.site === element.uptimeId)
                let uptime = [];
                let allLogs = Array()
                if(typeof ranges === "string"){
                    let rangeArray = ranges.split("-")
                    logsSite = this.getLogsWithDayAndInterval(logsSite, custom_days_range, custom_interval)
                    logsSite.sort((a, b) => a.datetime - b.datetime);
                    rangeArray.forEach(e => {
                        let range = e.split("_")
                        let durationLog = 0; 
                        if(parseInt(range[0]) < element.createDatetime){
                            range[0] = element.createDatetime;
                        }
                        let rangeDuration = this.getDuration(parseInt(range[0]), parseInt(range[1]), custom_days_range, custom_interval)
                        logsSite.forEach((el, idx, array) => {
                            if(el === logsSite[logsSite.length-1]){
                                el.duration = moment().format("X") - el.datetime
                            } else {
                                el.duration = logsSite[idx + 1].datetime - el.datetime
                            }
                            if(el.datetime < parseInt(range[0]) && el.datetime + el.duration > parseInt(range[1]) && el.type === 1){
                                durationLog = null
                            } else {
                                if(el.datetime < parseInt(range[0]) && el.datetime + el.duration > parseInt(range[0]) && el.type === 99){
                                    durationLog = null;
                                } else if(el.datetime < parseInt(range[0]) && el.datetime + el.duration > parseInt(range[0]) && el.type === 1){
                                    let duration = el.datetime + el.duration - parseInt(range[0]); 
                                    durationLog = durationLog + duration
                                }else if(el.datetime >= parseInt(range[0]) && el.datetime <= parseInt(range[1]) && el.type === 1){
                                    let duration = el.duration
                                    if(el.datetime + el.duration > parseInt(range[1]))
                                        duration = parseInt(range[1]) - el.datetime
                                    
                                    durationLog = durationLog + duration
                                    allLogs.push(el)
                                } 
                            }
                        });
                        if(parseInt(range[1]) < element.createDatetime) {
                            durationLog = null
                        }
                        if(durationLog == null){
                            uptime.push("0.000")
                        } else if( durationLog === 0) {
                            uptime.push("100.000")
                        }else {
                            let tmpUptime = ((rangeDuration - durationLog)/rangeDuration)*100
                            uptime.push(tmpUptime.toFixed(3))
                        }
                    });
                }

                allLogs.sort((a, b) => b.datetime - a.datetime);
                let accounttype = typeaccount.find(e => e._id.toString() === element.Account.Type)
                let ssl = {
                    "ssl_monitored":element.ssl_monitored,
                    "ssl_issuer":element.ssl_issuer,
                    "ssl_subject":element.ssl_subject,
                    "ssl_algo":element.ssl_algo,
                    "ssl_expireDatetime":element.ssl_expireDatetime,
                    "ssl_error":element.ssl_error
                };
                let screenShot = {
                    "screenshot_url":element.screenshot_url,
                    "screenshot_dateTime":element.screenshot_dateTime,
                    "screenshot_error":element.screenshot_error
                };
                let lighthouse = {
                    "lighthouse_url":element.lighthouse_url,
                    "lighthouse_performance":element.lighthouse_performance,
                    "lighthouse_accessibility":element.lighthouse_accessibility,
                    "lighthouse_bestPractices":element.lighthouse_bestPractices,
                    "lighthouse_seo":element.lighthouse_seo,
                    "lighthouse_pwa":element.lighthouse_pwa,
                    "lighthouse_dateTime":element.lighthouse_dateTime
                };
                let siteArray = {
                    "id":element.uptimeId,
                    "moment": parseInt(moment().tz('Europe/Paris').format('X')),
                    "accounttype":accounttype,
                    "id_object":element._id,
                    "status": element.status,
                    "account":element.Account._id,
                    "accountname":element.Account.email,
                    "custom_uptime_ranges":uptime.join("-"),
                    "custom_days_range": custom_days_range.join("-"),
                    "friendly_name":element.name,
                    "creation_datetime":element.createDatetime,
                    "url":element.url,
                    "logs":allLogs,
                    "ssl":ssl,
                    "screenshot":screenShot,
                    "lighthouse":lighthouse
                }
                allSites.push(siteArray);
            })
            allSites.sort((a,b) => ((a.friendly_name).toUpperCase() > (b.friendly_name).toUpperCase()) ? 1 : (((b.friendly_name).toUpperCase() > (a.friendly_name).toUpperCase()) ? -1 : 0));
            res.json(allSites)
        },reason => {
            res.json(reason)
        });
    }

    getLogsWithDayAndInterval(logs:Array<any>, forbidenDay: Array<string>, intervals: Array<string>){
        let allLogs = Array()
        let momentTime = parseInt(moment().tz('Europe/Paris').format('X'));
        if(intervals.length > 0 || forbidenDay.length) {
            logs.forEach(el => {
                if(el.type === 1) {
                    let startLog = el.datetime
                    let endLog = el.datetime + el.duration
                    while(endLog > startLog){
                        let duration:number
                        let startDay = parseInt(moment(endLog-1, 'X').tz('Europe/Paris').startOf("days").format('X'))
                        let startInterval = startDay
                        let endInterval = parseInt(moment(endLog-1, 'X').tz('Europe/Paris').endOf("days").format('X'))
                        if(intervals.length > 0){
                            startInterval = startDay + parseInt(intervals[0])

                            endInterval = startDay + parseInt(intervals[1])
                        }
                        if(endInterval > momentTime) {
                            endInterval = momentTime
                        }

                        if(startDay <= startLog)
                            startDay = startLog
                        let arrayInterval = Array(startInterval, endInterval, startDay, endLog)
                        if((startDay < startInterval && endLog < startInterval) ||  (startDay > endInterval && endLog > endInterval))
                            duration = 0
                        else
                            duration = (Math.max(...arrayInterval) - Math.min(...arrayInterval)) - (Math.max(startInterval, startDay) - Math.min(startInterval, startDay)) - (Math.max(endInterval, endLog) - Math.min(endInterval, endLog))
                        
                        if(forbidenDay.length > 0 && forbidenDay.indexOf(moment(startInterval, 'X').tz('Europe/Paris').endOf('day').locale('en').format('dddd').toLowerCase()) > -1){
                            duration = 0
                        }
                        if(duration != 0){
                            if(startDay <= startInterval)
                                startDay = startInterval
                            let log = {
                                "site":el.site,
                                "startInterval":startInterval,
                                "datetime":startDay,
                                "duration":duration,
                                "reason":el.reason,
                                "type":el.type
                            }
                            allLogs.push(log)
                        }
                        endLog = startDay - 1
                    }
                } else {
                    allLogs.push(el)
                }
            });
        } else {
            allLogs = logs
        }
        return allLogs;
    }

    getDuration(start:number, end: number, forbidenDay: Array<string>, intervals: Array<string>){
        let total = 0
        while(end > start){
            let startElement = parseInt(moment(end-1, 'X').tz('Europe/Paris').startOf("days").format('X'))
            let startInterval:number
            let endInterval:number
            if(intervals.length > 0){
                startInterval = parseInt(moment(startElement, 'X').tz('Europe/Paris').add(parseInt(intervals[0]), 'seconds').format('X'))
                endInterval = parseInt(moment(startElement, 'X').tz('Europe/Paris').add(parseInt(intervals[1]), 'seconds').format('X'))
                if(endInterval > end)
                    endInterval = end
            } else {
                startInterval = parseInt(moment(end-1, 'X').tz('Europe/Paris').startOf("days").format('X'))
                endInterval = end
            }
            let duration:number
            if(startInterval < start)
                startInterval  = start
            duration = endInterval - startInterval
            
            total = total + duration
            if(forbidenDay.length > 0 && forbidenDay.indexOf(moment(startElement, 'X').tz('Europe/Paris').endOf('day').locale('en').format('dddd').toLowerCase()) > -1){
                total = total - duration
            }
            end = parseInt(moment(end-1, 'X').tz('Europe/Paris').startOf("days").format('X'))
        }
        return total
    }
}

