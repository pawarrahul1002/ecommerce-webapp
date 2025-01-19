// getBarCharts,
// getDashboardStats,
// getLineCharts,
// getPieCharts,

import { disconnect } from "process";
import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import {
  calculatePercentage,
  getChartData,
  getInventories,
} from "../utils/features.js";
import { allOrder } from "./orderController.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats;
  let key = "admin-stats";
  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const sixMonthsAgo = new Date();

    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const thisMonthProductPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUserPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUserPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrderPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrderPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrderPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const latestTransactionPromise = Order.find()
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      lastMonthOrders,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUserCount,
      latestTransaction,
    ] = await Promise.all([
      thisMonthProductPromise,
      thisMonthUserPromise,
      thisMonthOrderPromise,
      lastMonthProductPromise,
      lastMonthUserPromise,
      lastMonthOrderPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().select("total"),
      lastSixMonthOrderPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      product: productsCount,
      user: usersCount,
      order: allOrder.length,
    };

    // for last six months stats
    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthlyRevenue = new Array(6).fill(0);

    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12; //The addition of 12 and % 12 ensures the result is always positive (to handle cases where creationDate is in a later month of the previous year)

      // if monthDiff is 5 = orderMonthCounts[0]
      // if monthDiff is 4 = orderMonthCounts[1]
      // if monthDiff is 3 = orderMonthCounts[2]

      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    const categoryCount = getInventories({ categories, productsCount });

    const userRatio = {
      male: usersCount - femaleUserCount,
      femaleUserCount,
    };

    const modifiedLatestTransaction = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    stats = {
      categoryCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userRatio,
      latestTransaction: modifiedLatestTransaction,
    };

    myCache.set(key, JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats: stats,
  });
});

export const getBarCharts = TryCatch(async (req, res, next) => {
  const key = "admin-bar-charts";
  let charts;
  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    const todayDate = new Date();

    const sixMonthAgoDate = new Date();
    sixMonthAgoDate.setMonth(sixMonthAgoDate.getMonth() - 6);

    const twelveMonthAgoDate = new Date();
    twelveMonthAgoDate.setMonth(twelveMonthAgoDate.getMonth() - 12);

    const sixMonnthProductPromise = Product.find({
      createdAt: {
        $gte: sixMonthAgoDate,
        $lte: todayDate,
      },
    }).select("createdAt");

    const sixMonnthUserPromise = User.find({
      createdAt: {
        $gte: sixMonthAgoDate,
        $lte: todayDate,
      },
    }).select("createdAt");

    const twelveMonnthOrderPromise = Order.find({
      createdAt: {
        $gte: twelveMonthAgoDate,
        $lte: todayDate,
      },
    }).select("createdAt");

    const [products, users, orders] = await Promise.all([
      sixMonnthProductPromise,
      sixMonnthUserPromise,
      twelveMonnthOrderPromise,
    ]);

    const productsCount = getChartData({
      length: 6,
      today: todayDate,
      docArr: products,
    });
    const usersCount = getChartData({
      length: 6,
      today: todayDate,
      docArr: users,
    });
    const ordersCount = getChartData({
      length: 12,
      today: todayDate,
      docArr: orders,
    });

    charts = {
      users: usersCount,
      products: productsCount,
      order: ordersCount,
    };

    myCache.set(key, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getLineCharts = TryCatch(async (req, res, next) => {
  const key = "admin-line-charts";
  let charts;
  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    const todayDate = new Date();

    const twelveMonthAgoDate = new Date();
    twelveMonthAgoDate.setMonth(twelveMonthAgoDate.getMonth() - 12);

    const basequery = {
      createdAt: {
        $gte: twelveMonthAgoDate,
        $lte: todayDate,
      },
    };

    const [products, users, orders] = await Promise.all([
      Product.find(basequery).select("createdAt"),
      User.find(basequery).select("createdAt"),
      Order.find(basequery).select(["createdAt", "discount", "total"]),
    ]);

    const productsCount = getChartData({
      length: 12,
      today: todayDate,
      docArr: products,
    });
    const usersCount = getChartData({
      length: 12,
      today: todayDate,
      docArr: users,
    });

    const disocunt = getChartData({
      length: 12,
      today: todayDate,
      docArr: orders,
      property: "discount",
    });

    const revenue = getChartData({
      length: 12,
      today: todayDate,
      docArr: orders,
      property: "total",
    });

    charts = {
      users: usersCount,
      products: productsCount,
      disocunt,
      revenue,
    };

    myCache.set(key, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getPieCharts = TryCatch(async (req, res, next) => {
  const key = "admin-pie-charts";
  let charts;
  if (myCache.has(key)) {
    charts = myCache.get(key);
  } else {
    const allOrderPromise = Order.find().select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]);
    // ["processing", "shipped", "delivered", "cancelled"]
    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      categories,
      productsCount,
      outOfStock,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers,
    ] = await Promise.all([
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "shipped" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      allOrderPromise,
      User.find({}).select(["dob"]),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
    ]);

    const orderFullfillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    const productCategories = await getInventories({
      categories,
      productsCount,
    });

    const stockAvailablity = {
      inStock: productsCount - outOfStock,
      outOfStock,
    };

    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (30 / 100));

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const usersAgeGroup = {
      teen: allUsers.filter((i) => i.age < 20).length,
      adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
      old: allUsers.filter((i) => i.age >= 40).length,
    };

    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    charts = {
      orderFullfillment,
      productCategories,
      stockAvailablity,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };

    myCache.set(key, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});
