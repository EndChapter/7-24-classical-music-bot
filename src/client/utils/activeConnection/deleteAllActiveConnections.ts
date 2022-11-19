import axios from 'axios';
import { databaseURL } from '../../../../config';
import logCatch from '../misc/logCatch';

export default async () => {
	await axios.delete(`${databaseURL}/activeConnections.json`).catch(logCatch);
};
