import * as dotenv from 'dotenv';
import Client from './client/client';

dotenv.config();

function main() {
	const client = new Client();
	client.connect();
}
main();
