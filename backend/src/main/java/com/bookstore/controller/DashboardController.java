package com.bookstore.controller;

import com.bookstore.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "管理后台", description = "管理员数据看板与统计接口")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * 获取核心指标汇总
     */
    @Operation(summary = "获取核心指标汇总", description = "获取管理后台的核心数据指标，如用户数、订单数、销售额等")
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    /**
     * 获取销售趋势数据
     */
    @Operation(summary = "获取销售趋势数据", description = "获取指定天数内的销售额趋势数据")
    @GetMapping("/sales-trend")
    public ResponseEntity<Map<String, Object>> getSalesTrend(
            @RequestParam(defaultValue = "30") @Parameter(description = "查询天数，默认 30 天") int days) {
        return ResponseEntity.ok(dashboardService.getSalesTrend(days));
    }

    /**
     * 获取订单状态分布
     */
    @Operation(summary = "获取订单状态分布", description = "获取各订单状态的数量分布")
    @GetMapping("/order-status")
    public ResponseEntity<Map<String, Object>> getOrderStatusDistribution() {
        return ResponseEntity.ok(dashboardService.getOrderStatusDistribution());
    }

    /**
     * 获取热销商品排行
     */
    @Operation(summary = "获取热销商品排行", description = "获取销量最高的商品排行榜")
    @GetMapping("/top-products")
    public ResponseEntity<Map<String, Object>> getTopProducts(
            @RequestParam(defaultValue = "10") @Parameter(description = "返回数量，默认 10") int limit) {
        return ResponseEntity.ok(dashboardService.getTopProducts(limit));
    }

    /**
     * 获取分类销售数据
     */
    @Operation(summary = "获取分类销售数据", description = "获取各图书分类的销售数据")
    @GetMapping("/category-sales")
    public ResponseEntity<Map<String, Object>> getCategorySales() {
        return ResponseEntity.ok(dashboardService.getCategorySales());
    }

    /**
     * 获取用户增长趋势
     */
    @Operation(summary = "获取用户增长趋势", description = "获取指定天数内的用户增长趋势数据")
    @GetMapping("/user-growth")
    public ResponseEntity<Map<String, Object>> getUserGrowth(
            @RequestParam(defaultValue = "30") @Parameter(description = "查询天数，默认 30 天") int days) {
        return ResponseEntity.ok(dashboardService.getUserGrowth(days));
    }

    /**
     * 获取待办事项统计
     */
    @Operation(summary = "获取待办事项统计", description = "获取管理员待办事项数量统计，如待发货订单等")
    @GetMapping("/todos")
    public ResponseEntity<Map<String, Object>> getTodoItems() {
        return ResponseEntity.ok(dashboardService.getTodoItems());
    }
}
