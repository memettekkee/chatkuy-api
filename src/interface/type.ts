 export interface DecodedToken {
    id: string;
    email: string;
    iat: number;
    exp: number;
  }
  
export interface ConnectedUser {
    userId: string;
    socketId: string;
  }