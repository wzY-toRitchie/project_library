package com.bookstore.controller;

import com.bookstore.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * 获取核心指标汇总
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    /**
     * 获取销售趋势数据
     */
    @GetMapping("/sales-trend")
    public ResponseEntity<Map<String, Object>> getSalesTrend(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getSalesTrend(days));
    }

    /**
     * 获取订单状态分布
     */
    @GetMapping("/order-status")
    public ResponseEntity<Map<String, Object>> getOrderStatusDistribution() {
        return ResponseEntity.ok(dashboardService.getOrderStatusDistribution());
    }

    /**
     * 获取热销商品排行
     */
    @GetMapping("/top-products")
    public ResponseEntity<Map<String, Object>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getTopProducts(limit));
    }

    /**
     * 获取分类销售数据
     */
    @GetMapping("/category-sales")
    public ResponseEntity<Map<String, Object>> getCategorySales() {
        return ResponseEntity.ok(dashboardService.getCategorySales());
    }

    /**
     * 获取用户增长趋势
     */
    @GetMapping("/user-growth")
    public ResponseEntity<Map<String, Object>> getUserGrowth(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getUserGrowth(days));
    }

    /**
     * 获取待办事项统计
     */
    @GetMapping("/todos")
    public ResponseEntity<Map<String, Object>> getTodoItems() {
        return ResponseEntity.ok(dashboardService.getTodoItems());
    }
}
