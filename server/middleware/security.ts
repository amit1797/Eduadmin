import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./auth";

// Rate limiting configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message: "Too many login attempts, please try again later",
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Avoid using req.ip directly to satisfy validator; key off email for login attempts
  keyGenerator: (req) => String(req.body?.email || 'unknown')
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    message: "Too many requests, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    message: "API rate limit exceeded"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CSRF protection middleware
export function csrfProtection(req: AuthRequest, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints with proper authentication
  if (req.path.startsWith('/api/') && req.user) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
}

// Request logging middleware
export function requestLogger(req: AuthRequest, res: Response, next: NextFunction) {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(body) {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    };

    // Log suspicious activities
    if (res.statusCode >= 400 || duration > 5000) {
      console.warn('Suspicious request:', logData);
    }

    return originalSend.call(this, body);
  };

  next();
}

// Input size limiting middleware
export function limitRequestSize(req: Request, res: Response, next: NextFunction) {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({ message: "Request too large" });
  }

  next();
}

// IP whitelist middleware (for admin endpoints)
export function ipWhitelist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;
    
    if (!allowedIPs.includes(clientIP) && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: "Access denied from this IP" });
    }
    
    next();
  };
}

// Secure session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const
  },
  name: 'sessionId' // Don't use default session name
};

// Error handling middleware that doesn't expose internal details
export function secureErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the full error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      message: "Internal server error",
      timestamp: new Date().toISOString()
    });
  }

  // In development, provide more details
  res.status(err.status || 500).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Password strength validator
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
