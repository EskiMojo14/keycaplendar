import { UserRoles } from "@s/users/types";

export class Guide {
  id: string;
  name: string;
  title: string;
  description: string;
  tags: string[];
  visibility: UserRoles | "all";
  body: string;
  constructor(
    user = "",
    title = "",
    description = "",
    tags: string[] = [],
    visibility: UserRoles | "all" = "all",
    body = "",
    id = ""
  ) {
    this.name = user;
    this.title = title;
    this.description = description;
    this.tags = tags;
    this.visibility = visibility;
    this.body = body;
    this.id = id;
  }
}
