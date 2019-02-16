import { inject } from "inversify";
import TYPES from "./constant/types";

export const server = inject(TYPES.Server);
export const config = inject(TYPES.Config);
export const logger = inject(TYPES.Logger);
export const database = inject(TYPES.Database);
export const userRepository = inject(TYPES.UserRepository);
export const userService = inject(TYPES.UserService);
