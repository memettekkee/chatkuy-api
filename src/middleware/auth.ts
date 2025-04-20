import express from 'express'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
      interface Request {
        user?: {
          id: string;
          email: string;
        };
      }
    }
  }

  const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    try {
      // token dari header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access denied. Token not found !'
        });
        return 
      }
  
      const token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default_jwt_secret'
      ) as {
        id: string;
        email: string;
        iat: number;
        exp: number;
      };
      
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
      
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid token !' 
        }); 
        return 
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ 
          success: false, 
          message: 'Expired token !' 
        }); 
        return 
      }
      
      console.error('Auth error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
      return 
    }
  };
  
  export default verifyToken;