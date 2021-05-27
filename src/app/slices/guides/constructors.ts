import { UserRoles } from "../users/types";
export class Guide {
  id: string;
  name: string;
  title: string;
  tags: string[];
  visibility: UserRoles | "all";
  body: string;
  constructor(user = "", title = "", tags: string[] = [], visibility: UserRoles | "all" = "all", body = "", id = "") {
    this.name = user;
    this.title = title;
    this.tags = tags;
    this.visibility = visibility;
    this.body = body;
    this.id = id;
  }
}
