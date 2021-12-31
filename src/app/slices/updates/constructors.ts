export class Update {
  id: string;
  name: string;
  title: string;
  date: string;
  body: string;
  pinned: boolean;
  constructor(
    user = "",
    title = "",
    date = "",
    body = "",
    pinned = false,
    id = ""
  ) {
    this.name = user;
    this.title = title;
    this.date = date;
    this.body = body;
    this.pinned = pinned;
    this.id = id;
  }
}
