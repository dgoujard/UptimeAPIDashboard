import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const AccountSchema = new Schema({
    email: {
        type: String,
        required: 'Enter an e-mail'
    },
    apiKey: {
        type: String,
        required: 'Enter an apiKey'
    }
});