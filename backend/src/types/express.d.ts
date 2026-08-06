declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};

declare module "bcrypt" {
  const bcrypt: any;
  export default bcrypt;
}

declare module "morgan" {
  const morgan: any;
  export default morgan;
}
