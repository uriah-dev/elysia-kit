declare module "react" {
  export function createElement(
    type: any,
    props?: any,
    ...children: any[]
  ): any;
  export const Fragment: any;
  export default {
    createElement: createElement,
    Fragment: Fragment,
  };
}

declare module "react/jsx-runtime" {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export const Fragment: any;
}
