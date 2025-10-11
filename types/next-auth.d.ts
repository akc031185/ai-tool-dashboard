import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    sessionVersion?: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'user';
      sessionVersion?: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'user';
    sessionVersion?: number;
  }
}
