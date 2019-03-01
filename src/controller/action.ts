import { Controller, Get, Post, Put, Delete } from 'inversify-restify-utils';
// import { injectable } from 'inversify';
import { ProvideSingleton, inject } from '../libs/ioc/ioc';
// import * as errs from 'restify-errors';
// import { actionService } from '../constant/decorators';
import IActionService from '../services/action/interface';
import TYPES from '../constant/types'

@Controller('/actions')
@ProvideSingleton(ActionController)
export default class ActionController {
    public TARGET_NAME: string = 'ActionController';

    @inject(TYPES.ActionService) private actionService: IActionService
    // constructor(
    //     @actionService private actionService: IActionService
    // ) { }

    @Get('/:id')
    private async getById(req) {
        const { id } = req.params;
        return this.actionService.getById(id);
    }

    @Put('/:id')
    private async putById(req) {
        const { body, params: { id: actionId } } = req;
        console.log('Data is', body);
        return this.actionService.updateById(actionId, body);
    }
}
