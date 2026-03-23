package com.bookstore.service;

import com.bookstore.enums.OrderStatus;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * 获取核心指标汇总
     */
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        // 总销售额（排除已取消订单）
        BigDecimal totalSales = orderRepository.sumTotalSales();
        summary.put("totalSales", totalSales != null ? totalSales : BigDecimal.ZERO);
        
        // 订单总数
        summary.put("totalOrders", orderRepository.count());
        
        // 用户总数
        summary.put("totalUsers", userRepository.count());
        
        // 商品总数
        summary.put("totalBooks", bookRepository.count());
        
        // 今日订单数
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        summary.put("todayOrders", orderRepository.countByCreateTimeBetween(startOfDay, endOfDay));
        
        // 今日销售额
        BigDecimal todaySales = orderRepository.sumSalesByDateRange(startOfDay, endOfDay);
        summary.put("todaySales", todaySales != null ? todaySales : BigDecimal.ZERO);
        
        return summary;
    }

    /**
     * 获取销售趋势数据（最近30天）
     */
    public Map<String, Object> getSalesTrend(int days) {
        Map<String, Object> result = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<BigDecimal> sales = new ArrayList<>();
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        
        List<Object[]> salesData = orderRepository.getDailySales(startDate, endDate);
        Map<String, BigDecimal> salesMap = new HashMap<>();
        
        for (Object[] row : salesData) {
            String date = row[0].toString();
            BigDecimal amount = (BigDecimal) row[1];
            salesMap.put(date, amount);
        }
        
        // 填充所有日期
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i).toLocalDate();
            String dateStr = date.toString();
            dates.add(dateStr.substring(5)); // MM-DD格式
            sales.add(salesMap.getOrDefault(dateStr, BigDecimal.ZERO));
        }
        
        result.put("dates", dates);
        result.put("sales", sales);
        return result;
    }

    /**
     * 获取订单状态分布
     */
    public Map<String, Object> getOrderStatusDistribution() {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> statusData = orderRepository.getOrderStatusDistribution();
        
        List<Map<String, Object>> data = new ArrayList<>();
        Map<String, String> statusLabels = Map.of(
            "PENDING", "待支付",
            "PAID", "已支付",
            "SHIPPED", "已发货",
            "COMPLETED", "已完成",
            "CANCELLED", "已取消"
        );
        
        for (Object[] row : statusData) {
            // o.status 是 OrderStatus 枚举，需要转为 String
            OrderStatus statusEnum = (OrderStatus) row[0];
            String status = statusEnum.name();
            Long count = (Long) row[1];
            Map<String, Object> item = new HashMap<>();
            item.put("name", statusLabels.getOrDefault(status, status));
            item.put("value", count);
            data.add(item);
        }
        
        result.put("data", data);
        return result;
    }

    /**
     * 获取热销商品排行
     */
    public Map<String, Object> getTopProducts(int limit) {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> topProducts = orderRepository.getTopProducts(PageRequest.of(0, limit));
        
        List<String> names = new ArrayList<>();
        List<Long> sales = new ArrayList<>();
        
        for (Object[] row : topProducts) {
            com.bookstore.entity.Book book = (com.bookstore.entity.Book) row[0];
            Long quantity = (Long) row[1];
            names.add(book.getTitle());
            sales.add(quantity);
        }
        
        result.put("names", names);
        result.put("sales", sales);
        return result;
    }

    /**
     * 获取分类销售数据
     */
    public Map<String, Object> getCategorySales() {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> categoryData = orderRepository.getCategorySales();
        
        List<Map<String, Object>> data = new ArrayList<>();
        for (Object[] row : categoryData) {
            String category = (String) row[0];
            Long count = (Long) row[1];
            Map<String, Object> item = new HashMap<>();
            item.put("name", category);
            item.put("value", count);
            data.add(item);
        }
        
        result.put("data", data);
        return result;
    }

    /**
     * 获取用户增长趋势（最近30天）
     */
    public Map<String, Object> getUserGrowth(int days) {
        Map<String, Object> result = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<Long> counts = new ArrayList<>();
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        
        List<Object[]> userData = userRepository.getDailyRegistrations(startDate, endDate);
        Map<String, Long> userMap = new HashMap<>();
        
        for (Object[] row : userData) {
            String date = row[0].toString();
            Long count = (Long) row[1];
            userMap.put(date, count);
        }
        
        // 填充所有日期
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i).toLocalDate();
            String dateStr = date.toString();
            dates.add(dateStr.substring(5)); // MM-DD格式
            counts.add(userMap.getOrDefault(dateStr, 0L));
        }
        
        result.put("dates", dates);
        result.put("counts", counts);
        return result;
    }

    /**
     * 获取待办事项统计
     */
    public Map<String, Object> getTodoItems() {
        Map<String, Object> result = new HashMap<>();
        
        // 待支付订单数
        Long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        result.put("pendingOrders", pendingOrders != null ? pendingOrders : 0L);
        
        // 待发货订单数
        Long paidOrders = orderRepository.countByStatus(OrderStatus.PAID);
        result.put("paidOrders", paidOrders != null ? paidOrders : 0L);
        
        // 已发货订单数
        Long shippedOrders = orderRepository.countByStatus(OrderStatus.SHIPPED);
        result.put("shippedOrders", shippedOrders != null ? shippedOrders : 0L);
        
        // 库存预警商品数
        Long lowStockBooks = bookRepository.countLowStockBooks(10);
        result.put("lowStockBooks", lowStockBooks != null ? lowStockBooks : 0L);
        
        return result;
    }
}
