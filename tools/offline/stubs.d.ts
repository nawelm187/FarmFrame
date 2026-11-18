declare module "react"; declare module "react/jsx-runtime"; declare module "react-router-dom"; declare module "react-dom/client"; declare module "@supabase/supabase-js";
declare module "*.css"; declare module "*.png"; declare module "*.webp"; declare module "*.svg";
declare namespace JSX { interface IntrinsicElements { [k: string]: any } interface Element {} interface ElementChildrenAttribute { children: {} } }
interface ImportMeta { env: any; glob: any }
