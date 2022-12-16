export interface IMulticastConsumerSettings {
  kind    : 'rabbitmq' | 'redis' | 'kafka' | string;
  conf    : IMulticastConsumerConf;
  exchange: string;
}

export interface IMulticastConsumerConf {
  // TODO: either find common config for different kinds or define separate types for each
  //url     : string;
  protocol?: string;         // amqp, amqps, 
  username : string;
  password : string;
  hostname : string;
  port     : number;
  vhost?   : string;
  locale?  : string;
  ca?      : Array<Buffer>;
  heartbeat: number;
}

export interface IMulticastConsumer {
  startMulticastConsuming(input: IStartMulticastConsumingInput): Promise<IStartMulticastConsumingOutput>;
}

export interface IStartMulticastConsumingInput {
  exchange: string;
  multicastConsume(input: IMulticastConsumeInput): Promise<IMulticastConsumeOutput>;
}

export interface IStartMulticastConsumingOutput {
  success: boolean;
  error  : string | null;
}

export interface IMulticastConsumeInput {
  payload: string;
}

export interface IMulticastConsumeOutput {
  success: boolean;
  error  : string | null;
}
