package com.bookstore.entity;

import org.junit.jupiter.api.Test;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewEntityMappingTest {

    @Test
    void reviewDeclaresUserBookUniqueConstraint() {
        Table table = Review.class.getAnnotation(Table.class);

        assertThat(table).isNotNull();
        assertThat(table.uniqueConstraints()).hasSize(1);

        UniqueConstraint constraint = table.uniqueConstraints()[0];
        assertThat(constraint.name()).isEqualTo("uk_review_user_book");
        assertThat(constraint.columnNames()).containsExactly("user_id", "book_id");
    }
}
