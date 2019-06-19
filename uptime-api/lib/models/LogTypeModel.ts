import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;


export const LogTypeSchema = new Schema({
    logTypeId: {
        type: Number,
        required: 'Enter an id'
    },
    logTypeLabel: {
        type: String,
        required: 'Enter a label'
    }
});