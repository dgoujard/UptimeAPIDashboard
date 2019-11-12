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
    monitor: { 
        type: Boolean,
        required: 'Enter a status'
    },
    lastlog: { 
        type: Number,
        required: 'Enter a lastlog'
    },
    ssl_monitored: {
        type: Boolean,
    },
    ssl_issuer: {
        type: String,
    },
    ssl_subject: {
        type: String,
    },
    ssl_algo: {
        type: String,
    },
    ssl_expireDatetime: {
        type: Number,
    },
    ssl_error: {
        type: String,
    },
    screenshot_url: {
        type: String,
    },
    screenshot_dateTime: {
        type: Number,
    },
    screenshot_error: {
        type: String,
    },
    lighthouse_url: {
        type: String,
    },
    lighthouse_performance: {
        type: Number,
    },
    lighthouse_accessibility: {
        type: Number,
    },
    lighthouse_bestPractices: {
        type: Number,
    },
    lighthouse_seo: {
        type: Number,
    },
    lighthouse_pwa: {
        type: Number,
    },
    lighthouse_dateTime: {
        type: Number,
    }
});