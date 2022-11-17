import axios from 'axios';
import { databaseURL } from '../../../../config';
import logCatch from '../misc/logCatch';

export default (privateKey: string) => {
	axios.delete(`${databaseURL}/activeConnections/${privateKey}.json`).catch(logCatch);
};
