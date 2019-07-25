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
});