import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      firstname: string;
      lastname: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
  }
}