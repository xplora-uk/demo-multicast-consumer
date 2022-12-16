import { IMulticastConsumer, IMulticastConsumerSettings } from '../types';
import { newRabbitMqMulticastConsumer } from './rabbitmq';

export function newMulticastConsumer(settings: IMulticastConsumerSettings): Promise<IMulticastConsumer> {
  if (settings.kind === 'rabbitmq') {
    return newRabbitMqMulticastConsumer(settings.conf);
  }

  throw new Error('Unknown multicast message consumer kind');
}
