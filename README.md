# multicast-consumer-demo

demo for a multicast message consumer

## requirements

* Node v16.x

## installation

```sh
npm i
```

## configuration

```sh
cp .env-sample.env .env
# edit .env file
```

Sample:

```plain
TODO:
```

## changing code

Review source code in `./src`.

Layout:

```plain
src/
  multicast-consumers/
    rabbitmq.ts  multicast message consumer adapted for rabbitmq
    index.ts     loader for this folder
  factory.ts     prepares dependencies
  index.ts       main entry file of this codebase; prepared express app and starts it.
  types.ts       type definitions
```

## linting

TODO:

## testing

TODO:

## execution

```sh
npm run start:dev

# or
npm run build
npm run start
```

Also, you can refer to `./Dockerfile`.

## usage

TODO:
