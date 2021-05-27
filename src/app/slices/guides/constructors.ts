export class Guide {
  id: string;
  name: string;
  title: string;
  tags: string[];
  body: string;
  pinned: boolean;
  constructor(user = "", title = "", tags: string[] = [], body = "", pinned = false, id = "") {
    this.name = user;
    this.title = title;
    this.tags = tags;
    this.body = body;
    this.pinned = pinned;
    this.id = id;
  }
}
