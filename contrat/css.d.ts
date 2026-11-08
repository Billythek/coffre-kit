// Les feuilles de style que le thème importe (le constructeur les range en modules).
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
declare module "*.css";
