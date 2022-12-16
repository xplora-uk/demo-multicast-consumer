import express, { Request, Response } from 'express';
import { newMulticastConsumer } from './multicast-consumers';
import { IMulticastConsumeInput } from './types';

export async function factory(penv = process.env) {
  const app = express();

  const exchange = String(penv.MCC_EXCHANGE || 'amq.fanout');

  const config = {
    http: {
      port: Number.parseInt(penv.MCC_HTTP_PORT || '3000'),
    },
    messageConsumer: {
      kind: penv.MCC_KIND || 'rabbitmq',
      exchange,
      conf: {
        hostname : penv.MCC_HOSTNAME || 'localhost',
        port     : Number.parseInt(penv.MCC_PORT || '0'),
        username : penv.MCC_USERNAME || '',
        password : penv.MCC_PASSWORD || '',
        heartbeat: 30,
      },
    },
  };

  const mcConsumer = await newMulticastConsumer(config.messageConsumer);

  const output = await mcConsumer.startMulticastConsuming({
    exchange,
    multicastConsume: async (input: IMulticastConsumeInput) => {
      // TODO: do something useful
      console.debug('payload', input.payload);
      return { success: true, error: '' };
    },
  });

  console.info('multicast-consumer ready', output);

  async function healthCheck(_req: Request, res: Response) {
    res.json({ status: 'OK', ts: new Date() });
  }

  app.get('/health', healthCheck);

  return { app, config, mcConsumer, healthCheck };
}
