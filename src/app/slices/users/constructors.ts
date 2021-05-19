/**
 * Creates a standard user object with specified values, or blank values if none specified.
 * Useful for creating blank user objects.
 */

export class User {
  admin: boolean;
  designer: boolean;
  displayName: string;
  editor: boolean;
  email: string;
  nickname: string;
  photoURL: string;
  dateCreated: string;
  lastSignIn: string;
  lastActive: string;
  constructor(
    email = "",
    displayName = "",
    photoURL = "",
    nickname = "",
    designer = false,
    editor = false,
    admin = false,
    dateCreated = "",
    lastSignIn = "",
    lastActive = ""
  ) {
    this.admin = admin;
    this.designer = designer;
    this.displayName = displayName;
    this.editor = editor;
    this.email = email;
    this.nickname = nickname;
    this.photoURL = photoURL;
    this.dateCreated = dateCreated;
    this.lastSignIn = lastSignIn;
    this.lastActive = lastActive;
  }
}
