import { inject } from "inversify";
import TYPES from "./types";

export const server = inject(TYPES.Server);
export const config = inject(TYPES.Config);
export const logger = inject(TYPES.Logger);
export const database = inject(TYPES.Database);
export const authService = inject(TYPES.AuthService);
export const mailSender = inject(TYPES.MailSender);
export const userRepository = inject(TYPES.UserRepository);
export const actionRepository = inject(TYPES.ActionRepository);
export const userService = inject(TYPES.UserService);
export const actionService = inject(TYPES.ActionService);
