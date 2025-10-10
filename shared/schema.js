import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // 'farmer', 'trader', 'sponsor', 'admin'
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  product: text("product").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  wholesale: integer("wholesale"),
  type: text("type").notNull(), // 'fixed' or 'negotiable'
  total: integer("total").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const costs = pgTable("costs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  item: text("item").notNull(),
  category: text("category").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(),
  item: text("item").notNull(),
  quantity: integer("quantity").notNull(),
  units: text("units").notNull(),
  location: text("location").notNull(),
  price: integer("price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  text: text("text"),
  media: text("media"), // URL to uploaded media
  mediaType: text("media_type"), // 'image' or 'video'
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sponsorContent = pgTable("sponsor_content", {
  id: serial("id").primaryKey(),
  sponsorId: integer("sponsor_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mediaUrl: text("media_url").notNull(), // image or video URL
  mediaType: text("media_type").notNull(), // 'image' or 'video'
  learnMoreUrl: text("learn_more_url"),
  features: jsonb("features"), // array of feature strings
  isApproved: boolean("is_approved").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sales: many(sales),
  costs: many(costs),
  listings: many(listings),
  posts: many(posts),
  comments: many(comments),
  sponsorContent: many(sponsorContent),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
}));

export const costsRelations = relations(costs, ({ one }) => ({
  user: one(users, {
    fields: [costs.userId],
    references: [users.id],
  }),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const sponsorContentRelations = relations(sponsorContent, ({ one }) => ({
  sponsor: one(users, {
    fields: [sponsorContent.sponsorId],
    references: [users.id],
  }),
}));

// Types are inferred by Drizzle ORM at runtime
