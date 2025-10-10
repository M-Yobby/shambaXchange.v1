import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './db.js';
import { users, sales, costs, listings, posts, comments, sponsorContent } from '../shared/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shambaXchange-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root directory (frontend)
app.use(express.static('.'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Auth middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role check middleware
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.username, username));
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      lastLogin: new Date(),
    }).returning();

    // Generate token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        avatar: newUser.avatar,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    fullName: req.user.fullName,
    role: req.user.role,
    avatar: req.user.avatar,
  });
});

// ==================== DASHBOARD ROUTES (Farmers only) ====================

app.get('/api/sales', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const userSales = await db.select().from(sales)
      .where(eq(sales.userId, req.user.id))
      .orderBy(desc(sales.date));
    res.json(userSales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/api/sales', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const { product, quantity, price, wholesale, type, date } = req.body;
    const total = quantity * price;

    const [newSale] = await db.insert(sales).values({
      userId: req.user.id,
      product,
      quantity,
      price,
      wholesale,
      type,
      total,
      date: new Date(date),
    }).returning();

    res.json(newSale);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

app.get('/api/costs', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const userCosts = await db.select().from(costs)
      .where(eq(costs.userId, req.user.id))
      .orderBy(desc(costs.date));
    res.json(userCosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch costs' });
  }
});

app.post('/api/costs', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const { item, category, amount, date } = req.body;

    const [newCost] = await db.insert(costs).values({
      userId: req.user.id,
      item,
      category,
      amount,
      date: new Date(date),
    }).returning();

    res.json(newCost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cost' });
  }
});

// AI Assistant endpoint
app.post('/api/ai/chat', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `You are a helpful agricultural assistant for farmers in Kenya. Provide practical farming advice. User question: ${message}`,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        }
      })
    });

    const data = await response.json();
    const aiResponse = data[0]?.generated_text || 'I apologize, but I could not generate a response. Please try again.';

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// ==================== MARKETPLACE ROUTES ====================

app.get('/api/listings', authenticate, async (req, res) => {
  try {
    const allListings = await db.select({
      id: listings.id,
      category: listings.category,
      item: listings.item,
      quantity: listings.quantity,
      units: listings.units,
      location: listings.location,
      price: listings.price,
      createdAt: listings.createdAt,
      seller: {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
      }
    })
    .from(listings)
    .leftJoin(users, eq(listings.userId, users.id))
    .orderBy(desc(listings.createdAt));

    res.json(allListings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.post('/api/listings', authenticate, async (req, res) => {
  try {
    const { category, item, quantity, units, location, price } = req.body;

    const [newListing] = await db.insert(listings).values({
      userId: req.user.id,
      category,
      item,
      quantity,
      units,
      location,
      price,
    }).returning();

    res.json(newListing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// ==================== SOCIAL ROUTES ====================

app.get('/api/posts', authenticate, async (req, res) => {
  try {
    const allPosts = await db.select({
      id: posts.id,
      text: posts.text,
      media: posts.media,
      mediaType: posts.mediaType,
      likes: posts.likes,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        avatar: users.avatar,
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));

    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', authenticate, upload.single('media'), async (req, res) => {
  try {
    const { text } = req.body;
    const media = req.file ? `/uploads/${req.file.filename}` : null;
    const mediaType = req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'image') : null;

    const [newPost] = await db.insert(posts).values({
      userId: req.user.id,
      text,
      media,
      mediaType,
    }).returning();

    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.post('/api/posts/:id/like', authenticate, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await db.update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, postId));

    const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId));
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

app.get('/api/posts/:id/comments', authenticate, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const postComments = await db.select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
      }
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

    res.json(postComments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/posts/:id/comments', authenticate, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { text } = req.body;

    const [newComment] = await db.insert(comments).values({
      postId,
      userId: req.user.id,
      text,
    }).returning();

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// ==================== SPONSOR ROUTES ====================

app.get('/api/sponsor/content', authenticate, requireRole('sponsor'), async (req, res) => {
  try {
    const sponsorItems = await db.select().from(sponsorContent)
      .where(eq(sponsorContent.sponsorId, req.user.id))
      .orderBy(desc(sponsorContent.createdAt));
    res.json(sponsorItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsor content' });
  }
});

app.post('/api/sponsor/content', authenticate, requireRole('sponsor'), upload.single('media'), async (req, res) => {
  try {
    const { title, description, learnMoreUrl, features } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const mediaType = req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'image') : 'image';

    const [newContent] = await db.insert(sponsorContent).values({
      sponsorId: req.user.id,
      title,
      description,
      mediaUrl,
      mediaType,
      learnMoreUrl,
      features: features ? JSON.parse(features) : null,
    }).returning();

    res.json(newContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sponsor content' });
  }
});

// ==================== PUBLIC SPONSOR CONTENT ====================

app.get('/api/learning-hub/content', authenticate, async (req, res) => {
  try {
    const approvedContent = await db.select({
      id: sponsorContent.id,
      title: sponsorContent.title,
      description: sponsorContent.description,
      mediaUrl: sponsorContent.mediaUrl,
      mediaType: sponsorContent.mediaType,
      learnMoreUrl: sponsorContent.learnMoreUrl,
      features: sponsorContent.features,
      createdAt: sponsorContent.createdAt,
      sponsor: {
        id: users.id,
        fullName: users.fullName,
      }
    })
    .from(sponsorContent)
    .leftJoin(users, eq(sponsorContent.sponsorId, users.id))
    .where(eq(sponsorContent.isApproved, true))
    .orderBy(desc(sponsorContent.createdAt));

    res.json(approvedContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning hub content' });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/posts', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const allPosts = await db.select({
      id: posts.id,
      text: posts.text,
      media: posts.media,
      likes: posts.likes,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));

    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.delete('/api/admin/posts/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await db.delete(posts).where(eq(posts.id, postId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

app.get('/api/admin/sponsor-content', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const allContent = await db.select({
      id: sponsorContent.id,
      title: sponsorContent.title,
      description: sponsorContent.description,
      mediaUrl: sponsorContent.mediaUrl,
      isApproved: sponsorContent.isApproved,
      isActive: sponsorContent.isActive,
      createdAt: sponsorContent.createdAt,
      sponsor: {
        id: users.id,
        fullName: users.fullName,
      }
    })
    .from(sponsorContent)
    .leftJoin(users, eq(sponsorContent.sponsorId, users.id))
    .orderBy(desc(sponsorContent.createdAt));

    res.json(allContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sponsor content' });
  }
});

app.patch('/api/admin/sponsor-content/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const [updated] = await db.update(sponsorContent)
      .set({ isApproved: true })
      .where(eq(sponsorContent.id, contentId))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

app.patch('/api/admin/sponsor-content/:id/reject', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const [updated] = await db.update(sponsorContent)
      .set({ isApproved: false, isActive: false })
      .where(eq(sponsorContent.id, contentId))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject content' });
  }
});

app.get('/api/admin/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
    }).from(users).orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
