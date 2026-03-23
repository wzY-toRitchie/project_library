package com.bookstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "browsing_history", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "book_id"})
}, indexes = {
    @Index(name = "idx_history_user", columnList = "user_id"),
    @Index(name = "idx_history_book", columnList = "book_id"),
    @Index(name = "idx_history_time", columnList = "user_id, last_view_time DESC")
})
@Data
@NoArgsConstructor
public class BrowsingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 1;

    @Column(name = "last_view_time")
    private LocalDateTime lastViewTime;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createTime == null) {
            createTime = now;
        }
        if (lastViewTime == null) {
            lastViewTime = now;
        }
    }

    public BrowsingHistory(User user, Book book) {
        this.user = user;
        this.book = book;
        this.viewCount = 1;
    }

    /**
     * 更新浏览记录
     */
    public void updateView() {
        this.viewCount++;
        this.lastViewTime = LocalDateTime.now();
    }
}
