import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { ConsumeMessage } from 'amqplib';
import { IMulticastConsumeOutput, IMulticastConsumer, IMulticastConsumerConf, IStartMulticastConsumingInput, IStartMulticastConsumingOutput } from '../types';

const channelOptions = {
  publishTimeout: 10000,
};

// multicast to all bound queues
const exchangeType = 'fanout';

// our exchanges are durable
const exchangeOptions = { durable: true };

// nil string => create new queue with a random name
const queueName = '';

const pattern = '';

// this random queue is not durable and exclusive for this consumer
const queueOptions = { durable: false, exclusive: true };

const consumeOptions = { noAck: true };

function makeConsumerWrapper(queueName: string, input: IStartMulticastConsumingInput) {

  async function consumeWrapper(message: ConsumeMessage | null) {
    const funcLambda = 'consumeWrapper';
    try {
      if (!message) {
        console.info(funcLambda, 'no message');
        return;
      }

      const payload = message.content.toString('utf-8');
      let output: IMulticastConsumeOutput | null = null;
      try {
        output = await input.multicastConsume({ payload });
        if (!output.success || output.error) {
          throw new Error(output.error ?? 'multicast message consumer failed');
        }
      } catch (err) {
        output = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
      console.info(funcLambda, { queue: queueName, message, output });
    } catch (err) {
      console.error(funcLambda, err);
    }
  }

  return consumeWrapper
}

class RabbitMqMulticastConsumer implements IMulticastConsumer {

  protected _channels: Record<string, ChannelWrapper> = {};

  constructor(protected _connection: IAmqpConnectionManager) {
    // do nothing
  }

  _channelCache(name: string): ChannelWrapper {
    // NOTE: If we're not currently connected, these will be queued up in memory until we connect.
    //if (!this._connection.isConnected) { // NOT connected
    //  this._connection.reconnect();
    //}
    if (!(name in this._channels) || !this._channels[name]) {
      this._channels[name] = this._connection.createChannel({ ...channelOptions, name });
    }
    return this._channels[name];
  }

  async startMulticastConsuming(input: IStartMulticastConsumingInput): Promise<IStartMulticastConsumingOutput> {
    const func = 'RabbitMqMulticastConsumer.startMulticastConsuming';
    let success = false, error = '';

    try {
      const channelWrapper = this._channelCache(input.exchange);
      await channelWrapper.assertExchange(input.exchange, exchangeType, exchangeOptions);
      const q = await channelWrapper.assertQueue(queueName, queueOptions);
      await channelWrapper.bindQueue(q.queue, input.exchange, pattern);
      const consumeWrapper = makeConsumerWrapper(q.queue, input);
      await channelWrapper.consume(q.queue, consumeWrapper, consumeOptions);
      success = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(func, err);
    }

    return { success, error };
  }

  async close(): Promise<void> {
    if (this._connection) {
      try {
        await this._connection.close();
      } catch (err) {
        console.error('RabbitMqMulticastConsumer.close error', err);
      }
    }
  }
}

export function newRabbitMqMulticastConsumer(settings: IMulticastConsumerConf): Promise<IMulticastConsumer> {




  const connection = amqp.connect(
    {
      ...settings,
      connectionOptions: {
        timeout: 5000,
      },
    },
  );

  return Promise.resolve(new RabbitMqMulticastConsumer(connection));
}
