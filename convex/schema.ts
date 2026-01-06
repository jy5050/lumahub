import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    stock: v.number(),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      price: v.number(),
    })),
    total: v.number(),
    status: v.union(v.literal("pending"), v.literal("cancelled"), v.literal("completed")),
    customerEmail: v.string(),
    shippingAddress: v.string(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  userRoles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("customer")),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
