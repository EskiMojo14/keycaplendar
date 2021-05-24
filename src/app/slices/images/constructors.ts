/**
 * Creates a standard image info object with specified values, or blank values if none specified.
 * Useful for creating blank image info objects.
 */
export class ImageObj {
  name: string;
  parent: string;
  fullPath: string;
  src: string;
  constructor(name = "", parent = "", fullPath = "", src = "") {
    this.name = name;
    this.parent = parent;
    this.fullPath = fullPath;
    this.src = src;
  }
}
