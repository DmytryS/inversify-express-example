// import { Controller } from 'tsoa';
import {
    Container,
    decorate,
    inject,
    injectable,
    interfaces
} from 'inversify';
import {
    buildProviderModule,
    fluentProvide,
    provide
} from 'inversify-binding-decorators';
import 'reflect-metadata';

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
