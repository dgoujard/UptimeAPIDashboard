import * as mongoose from 'mongoose';
import { LogSchema } from './LogModel';

const Schema = mongoose.Schema;

export const FavoriteSchema = new Schema({
    name: {
        type: String,
        required: 'Enter a name'
    },
});