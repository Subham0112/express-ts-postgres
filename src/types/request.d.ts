declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      role:string;
      email:string;
      token_version:number;
      profile_url:string;
    };
  }
}