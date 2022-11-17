/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
// Package have some bugs so I will have to use with this way.
import * as dotenv from 'dotenv';
dotenv.config();
import Client from './client/client';

Client.init();
