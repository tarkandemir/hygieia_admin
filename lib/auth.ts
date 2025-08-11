import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    console.log('🔐 Verifying token...', {
      tokenPreview: token.substring(0, 50) + '...',
      secretPreview: JWT_SECRET.substring(0, 10) + '...',
      secretLength: JWT_SECRET.length
    });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully:', { userId: (decoded as any).userId, email: (decoded as any).email });
    return decoded;
  } catch (error) {
    console.log('❌ Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'products', actions: ['create', 'read', 'update', 'delete', 'import', 'export'] },
    { resource: 'orders', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'notifications', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'dashboard', actions: ['read'] },
  ],
  manager: [
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'products', actions: ['create', 'read', 'update', 'import', 'export'] },
    { resource: 'orders', actions: ['create', 'read', 'update'] },
    { resource: 'notifications', actions: ['create', 'read', 'update'] },
    { resource: 'dashboard', actions: ['read'] },
  ],
  employee: [
    { resource: 'products', actions: ['read'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'notifications', actions: ['read'] },
    { resource: 'dashboard', actions: ['read'] },
  ],
};

export function hasPermission(userRole: string, resource: string, action: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const resourcePermission = rolePermissions.find(p => p.resource === resource);
  return resourcePermission ? resourcePermission.actions.includes(action) : false;
} 