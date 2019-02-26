import { Controller, Get, Post, Put, Delete } from 'inversify-restify-utils';
import { injectable } from 'inversify';
import * as errs from 'restify-errors';
import { actionService } from '../constant/decorators';
import IActionService from '../service/action/interface';
import TYPES from '../constant/types'

@Controller('/actions')
@injectable()
export default class ActionController {
    constructor(
        @actionService private actionService: IActionService
    ) { }

    @Get('/:id', TYPES.AuthService)
    private async getById(req) {
        const { id } = req.params;
        return this.actionService.getById(id);
    }

    @Put('/:id')
    private async putById(req) {
        const { body, params: { id } } = req;
        console.log('Data is', body);
        return this.actionService.updateById(id, body);
    }
}
