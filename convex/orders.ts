import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function isAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
  
  return userRole?.role === "admin";
}

export const createOrder = mutation({
  args: {
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
    })),
    shippingAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create order");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Calculate total and validate products
    let total = 0;
    const orderItems = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      // Update stock
      await ctx.db.patch(item.productId, {
        stock: product.stock - item.quantity,
      });
    }

    return await ctx.db.insert("orders", {
      userId,
      items: orderItems,
      total,
      status: "pending",
      customerEmail: user.email || "",
      shippingAddress: args.shippingAddress,
    });
  },
});

export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("orders").collect();
  },
});

export const cancelOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if user owns the order or is admin
    const isOwner = order.userId === userId;
    const adminCheck = await isAdmin(ctx);

    if (!isOwner && !adminCheck) {
      throw new Error("Unauthorized");
    }

    if (order.status !== "pending") {
      throw new Error("Can only cancel pending orders");
    }

    // Restore stock
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
        });
      }
    }

    await ctx.db.patch(args.orderId, { status: "cancelled" });
  },
});
