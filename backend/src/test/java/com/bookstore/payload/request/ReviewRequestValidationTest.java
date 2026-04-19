package com.bookstore.payload.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

class ReviewRequestValidationTest {

    private static final ValidatorFactory VALIDATOR_FACTORY = Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = VALIDATOR_FACTORY.getValidator();

    @AfterAll
    static void tearDown() {
        VALIDATOR_FACTORY.close();
    }

    @Test
    void doesNotRequireUserId() {
        ReviewRequest request = new ReviewRequest();
        request.setBookId(1L);
        request.setRating(5);
        request.setComment("great book");

        Set<ConstraintViolation<ReviewRequest>> violations = VALIDATOR.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void stillRequiresBookId() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(5);
        request.setComment("great book");

        Set<ConstraintViolation<ReviewRequest>> violations = VALIDATOR.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString(), ConstraintViolation::getMessage)
                .containsExactly(tuple("bookId", "图书ID不能为空"));
    }
}
