import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { jwtConfig, securityConfig } from '@/config/app';
import { LoginDto, CreateAdminUserDto, JwtPayload } from '@/types';
import { AdminRole } from '@prisma/client';
import { ApiResponseUtil } from '@/utils/response';
import logger from '@/config/logger';

export class AuthController {
  // Admin login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginDto = req.body;

      // Validate input
      if (!email || !password) {
        ApiResponseUtil.badRequest(res, 'Email and password are required');
        return;
      }

      // Find admin user
      const admin = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!admin) {
        ApiResponseUtil.unauthorized(res, 'Invalid credentials');
        return;
      }

      // Check if admin is active
      if (!admin.isActive) {
        ApiResponseUtil.unauthorized(res, 'Account is deactivated');
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        ApiResponseUtil.unauthorized(res, 'Invalid credentials');
        return;
      }

      // Generate JWT token
      const payload: JwtPayload = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions as any,
      };

      const token = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      });

      const refreshToken = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.refreshExpiresIn,
      });

      // Update last login
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() },
      });

      // Log activity
      await prisma.adminActivityLog.create({
        data: {
          adminId: admin.id,
          action: 'LOGIN',
          resource: 'auth',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      // Remove password from response
      const { password: _, ...adminWithoutPassword } = admin;

      ApiResponseUtil.success(res, {
        admin: adminWithoutPassword,
        token,
        refreshToken,
      }, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      ApiResponseUtil.internalServerError(res, 'Login failed');
    }
  }

  // Create new admin user (Super Admin only)
  static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, permissions }: CreateAdminUserDto = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        ApiResponseUtil.badRequest(res, 'All fields are required');
        return;
      }

      // Check if email already exists
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingAdmin) {
        ApiResponseUtil.conflict(res, 'Email already exists');
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, securityConfig.bcryptRounds);

      // Create admin user
      const newAdmin = await prisma.adminUser.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          role: role || AdminRole.ADMIN,
          permissions: permissions || [],
        },
      });

      // Log activity
      await prisma.adminActivityLog.create({
        data: {
          adminId: (req as any).admin.id,
          action: 'CREATE_ADMIN',
          resource: 'admin_users',
          resourceId: newAdmin.id,
          details: { createdAdminEmail: email },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      // Remove password from response
      const { password: _, ...adminWithoutPassword } = newAdmin;

      ApiResponseUtil.created(res, adminWithoutPassword, 'Admin user created successfully');
    } catch (error) {
      logger.error('Create admin error:', error);
      ApiResponseUtil.internalServerError(res, 'Failed to create admin user');
    }
  }

  // Get current admin profile
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const admin = (req as any).admin;

      if (!admin) {
        ApiResponseUtil.unauthorized(res, 'Authentication required');
        return;
      }

      // Remove password from response
      const { password: _, ...adminWithoutPassword } = admin;

      ApiResponseUtil.success(res, adminWithoutPassword, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile error:', error);
      ApiResponseUtil.internalServerError(res, 'Failed to get profile');
    }
  }

  // Update admin profile
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const admin = (req as any).admin;
      const { firstName, lastName, currentPassword, newPassword } = req.body;

      if (!admin) {
        ApiResponseUtil.unauthorized(res, 'Authentication required');
        return;
      }

      const updateData: any = {};

      // Update basic info
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      // Update password if provided
      if (currentPassword && newPassword) {
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isCurrentPasswordValid) {
          ApiResponseUtil.badRequest(res, 'Current password is incorrect');
          return;
        }

        // Hash new password
        updateData.password = await bcrypt.hash(newPassword, securityConfig.bcryptRounds);
      }

      // Update admin
      const updatedAdmin = await prisma.adminUser.update({
        where: { id: admin.id },
        data: updateData,
      });

      // Log activity
      await prisma.adminActivityLog.create({
        data: {
          adminId: admin.id,
          action: 'UPDATE_PROFILE',
          resource: 'admin_users',
          resourceId: admin.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      // Remove password from response
      const { password: _, ...adminWithoutPassword } = updatedAdmin;

      ApiResponseUtil.success(res, adminWithoutPassword, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile error:', error);
      ApiResponseUtil.internalServerError(res, 'Failed to update profile');
    }
  }

  // Refresh token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        ApiResponseUtil.badRequest(res, 'Refresh token is required');
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtConfig.secret) as JwtPayload;

      // Get admin user
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.adminId },
      });

      if (!admin || !admin.isActive) {
        ApiResponseUtil.unauthorized(res, 'Invalid refresh token');
        return;
      }

      // Generate new tokens
      const payload: JwtPayload = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions as any,
      };

      const newToken = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      });

      const newRefreshToken = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.refreshExpiresIn,
      });

      ApiResponseUtil.success(res, {
        token: newToken,
        refreshToken: newRefreshToken,
      }, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Refresh token error:', error);
      ApiResponseUtil.unauthorized(res, 'Invalid refresh token');
    }
  }

  // Logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const admin = (req as any).admin;

      if (admin) {
        // Log activity
        await prisma.adminActivityLog.create({
          data: {
            adminId: admin.id,
            action: 'LOGOUT',
            resource: 'auth',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
          },
        });
      }

      ApiResponseUtil.success(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      ApiResponseUtil.internalServerError(res, 'Logout failed');
    }
  }
} 