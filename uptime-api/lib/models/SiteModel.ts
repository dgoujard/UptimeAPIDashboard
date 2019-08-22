import * as mongoose from 'mongoose';
import { LogSchema } from './LogModel';

const Schema = mongoose.Schema;

export const SiteSchema = new Schema({
    name: {
        type: String,
        required: 'Enter a name'
    },
    uptimeId : {
        type : Number,
        required: 'Enter an uptimeId'
    },
    url : {
        type: String,
        required: 'Enter an url'
    },
    createDatetime: {
        type: Number,
        required: 'Enter a timestamp date'
    },
    Account: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Accounts' 
    },
    status: { 
        type: Number,
        required: 'Enter a status'
    },
    lastlog: { 
        type: Number,
        required: 'Enter a lastlog'
    },
    ssl_monitored: {
        type: Boolean,
        required: 'Enter a ssl_monitored'
    },
    ssl_issuer: {
        type: String,
        required: 'Enter a ssl_issuer'
    },
    ssl_subject: {
        type: String,
        required: 'Enter a ssl_subject'
    },
    ssl_algo: {
        type: String,
        required: 'Enter a ssl_algo'
    },
    ssl_expireDatetime: {
        type: Number,
        required: 'Enter a ssl_expireDatetime'
    },
    ssl_error: {
        type: String,
        required: 'Enter a ssl_error'
    },
    screenshot_url: {
        type: String,
        required: 'Enter a screenshot_url'
    },
    screenshot_dateTime: {
        type: Number,
        required: 'Enter a screenshot_dateTime'
    },
    screenshot_error: {
        type: String,
        required: 'Enter a screenshot_error'
    },
    lighthouse_url: {
        type: String,
        required: 'Enter a lighthouse_url'
    },
    lighthouse_performance: {
        type: Number,
        required: 'Enter a lighthouse_performance'
    },
    lighthouse_accessibility: {
        type: Number,
        required: 'Enter a lighthouse_accessibility'
    },
    lighthouse_bestPractices: {
        type: Number,
        required: 'Enter a lighthouse_bestPractices'
    },
    lighthouse_seo: {
        type: Number,
        required: 'Enter a lighthouse_seo'
    },
    lighthouse_pwa: {
        type: Number,
        required: 'Enter a lighthouse_pwa'
    },
    lighthouse_dateTime: {
        type: Number,
        required: 'Enter a lighthouse_dateTime'
    }
});