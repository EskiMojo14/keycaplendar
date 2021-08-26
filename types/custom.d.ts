declare module "csstype" {
  interface Properties {
    "--animation-delay": number;
  }
}
declare module "*.module.scss" {
  const content: Record<string, string>;
  export default content;
}
