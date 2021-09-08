declare module "csstype" {
  interface Properties {
    [varName: `--${string}`]: string | number;
  }
}
declare module "*.module.scss" {
  const content: Record<string, string>;
  export default content;
}
