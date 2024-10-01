import { Schema } from "mongoose";

export class GetUserRequest {
  constructor(public readonly userId: Schema.Types.ObjectId) {}
}
