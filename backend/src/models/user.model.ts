import db from '@config/database';
import logger from '@config/logger';
import authConfig from '@config/auth';

/**
 * User interface
 */
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password: string;
  bio?: string;
  profile_picture_url?: string;
  role: string;
  created_at: Date;
  updated_at?: Date;
}

/**
 * User creation data
 */
interface CreateUserDto {
  username: string;
  name: string;
  email: string;
  password: string;
  bio?: string;
  profile_picture_url?: string;
  role?: string;
}

/**
 * User model with direct PostgreSQL queries
 */
export const UserModel = {
  /**
   * Set up users table
   */
  async setupTable(): Promise<void> {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        )
      `;
      
      await db.query(query);
      logger.info('Users table checked/created successfully');
    } catch (error) {
      logger.error('Error setting up users table:', error);
      throw error;
    }
  },

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await db.query<User>(query, [email]);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error(`Error fetching user with email ${email}:`, error);
      throw error;
    }
  },

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query<User>(query, [id]);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new user
   */
  async create(userData: CreateUserDto): Promise<User> {
    try {
      // Hash password before storing
      const hashedPassword = await authConfig.hashPassword(userData.password);
      
      const query = `
        INSERT INTO users (username, name, email, password, bio, profile_picture_url, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const role = userData.role || 'user';
      const result = await db.query<User>(query, [
        userData.username,
        userData.name, 
        userData.email.toLowerCase(), 
        hashedPassword,
        userData.bio || null,
        userData.profile_picture_url || null,
        role
      ]);
      
      return result[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE email = $1';
      const result = await db.query<{ count: string }>(query, [email.toLowerCase()]);
      
      return parseInt(result[0].count, 10) > 0;
    } catch (error) {
      logger.error(`Error checking if email ${email} exists:`, error);
      throw error;
    }
  },
  
  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE username = $1';
      const result = await db.query<User>(query, [username]);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error(`Error fetching user with username ${username}:`, error);
      throw error;
    }
  },
  
  /**
   * Check if username already exists
   */
  async usernameExists(username: string): Promise<boolean> {
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE username = $1';
      const result = await db.query<{ count: string }>(query, [username]);
      
      return parseInt(result[0].count, 10) > 0;
    } catch (error) {
      logger.error(`Error checking if username ${username} exists:`, error);
      throw error;
    }
  },
  
  /**
   * Find user by identifier (email or username)
   */
  async findByIdentifier(identifier: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 OR username = $1';
      const result = await db.query<User>(query, [identifier]);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error(`Error fetching user with identifier ${identifier}:`, error);
      throw error;
    }
  },
  
  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<{
    username: string;
    name: string;
    email: string;
    password: string;
    bio: string;
    profile_picture_url: string;
  }>): Promise<User> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Build dynamic query based on provided fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });
      
      // Add updated_at timestamp
      updates.push(`updated_at = $${paramIndex}`);
      values.push(new Date());
      paramIndex++;
      
      // Add user ID as the last parameter
      values.push(userId);
      
      const query = `
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;
      
      const result = await db.query<User>(query, values);
      
      if (result.length === 0) {
        throw new Error('User not found');
      }
      
      return result[0];
    } catch (error) {
      logger.error(`Error updating user profile for user ${userId}:`, error);
      throw error;
    }
  }
};

export default UserModel;
