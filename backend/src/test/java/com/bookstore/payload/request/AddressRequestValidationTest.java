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

class AddressRequestValidationTest {

    private static final ValidatorFactory VALIDATOR_FACTORY = Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = VALIDATOR_FACTORY.getValidator();

    @AfterAll
    static void tearDown() {
        VALIDATOR_FACTORY.close();
    }

    @Test
    void rejectsBlankFullName() {
        AddressRequest request = validRequest();
        request.setFullName("   ");

        Set<ConstraintViolation<AddressRequest>> violations = VALIDATOR.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString(), ConstraintViolation::getMessage)
                .containsExactly(tuple("fullName", "收货人不能为空"));
    }

    @Test
    void rejectsBlankPhoneNumber() {
        AddressRequest request = validRequest();
        request.setPhoneNumber(" ");

        Set<ConstraintViolation<AddressRequest>> violations = VALIDATOR.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString(), ConstraintViolation::getMessage)
                .containsExactly(tuple("phoneNumber", "手机号不能为空"));
    }

    @Test
    void rejectsBlankAddress() {
        AddressRequest request = validRequest();
        request.setAddress("");

        Set<ConstraintViolation<AddressRequest>> violations = VALIDATOR.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString(), ConstraintViolation::getMessage)
                .containsExactly(tuple("address", "收货地址不能为空"));
    }

    private AddressRequest validRequest() {
        AddressRequest request = new AddressRequest();
        request.setFullName("Alice");
        request.setPhoneNumber("13800138000");
        request.setAddress("Test Street 1");
        request.setIsDefault(false);
        return request;
    }
}
