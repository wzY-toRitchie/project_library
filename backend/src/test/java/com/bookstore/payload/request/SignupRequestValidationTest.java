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

class SignupRequestValidationTest {

    private static final ValidatorFactory VALIDATOR_FACTORY = Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = VALIDATOR_FACTORY.getValidator();

    @AfterAll
    static void tearDown() {
        VALIDATOR_FACTORY.close();
    }

    @Test
    void rejectsPasswordWithoutUppercaseLowercaseAndDigit() {
        SignupRequest request = validRequest();
        request.setPassword("weakpass");

        Set<ConstraintViolation<SignupRequest>> violations = VALIDATOR.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString(), ConstraintViolation::getMessage)
                .contains(tuple("password", "密码必须包含至少一个大写字母、一个小写字母和一个数字"));
    }

    private SignupRequest validRequest() {
        SignupRequest request = new SignupRequest();
        request.setUsername("user123");
        request.setEmail("user@example.com");
        request.setPassword("Strong123");
        return request;
    }
}
