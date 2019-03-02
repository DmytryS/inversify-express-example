import 'reflect-metadata';
// import { Controller } from 'tsoa';
import {
    Container,
    inject,
    interfaces,
    decorate,
    injectable
} from 'inversify';
import {
    provide,
    buildProviderModule,
    fluentProvide
} from 'inversify-binding-decorators';

// decorate(injectable(), Controller);

type Identifier = string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>;

const container = new Container();


// const fluentProvider = makeFluentProvideDecorator(iocContainer);

const ProvideNamed = (identifier: Identifier, name: string) => fluentProvide(identifier).whenTargetNamed(name).done();

const ProvideSingleton = (identifier: Identifier) => fluentProvide(identifier).inSingletonScope().done();

const loadServices = () => container.load(buildProviderModule());

export {
    loadServices,
    container,
    provide,
    ProvideSingleton,
    ProvideNamed,
    inject,
    decorate,
    injectable
};
