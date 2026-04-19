package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.payload.request.AddressRequest;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.AddressService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AddressControllerExceptionSemanticsTest {

    @Mock
    private AddressService addressService;

    @InjectMocks
    private AddressController addressController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateAddressReturnsUnauthorizedWhenUnauthenticated() {
        ResponseEntity<?> response = addressController.updateAddress(10L, addressRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(401);
    }

    @Test
    void updateAddressPropagatesResourceNotFoundException() {
        AddressRequest request = addressRequest();
        authenticate(1L, "USER");
        when(addressService.updateAddress(1L, 10L, request))
                .thenThrow(new ResourceNotFoundException("Address not found"));

        assertThatThrownBy(() -> addressController.updateAddress(10L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Address not found");
        verify(addressService).updateAddress(1L, 10L, request);
    }

    @Test
    void deleteAddressPropagatesResourceNotFoundException() {
        authenticate(1L, "USER");
        when(addressService.deleteAddress(1L, 10L))
                .thenThrow(new ResourceNotFoundException("Address not found"));

        assertThatThrownBy(() -> addressController.deleteAddress(10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Address not found");
        verify(addressService).deleteAddress(1L, 10L);
    }

    private AddressRequest addressRequest() {
        AddressRequest request = new AddressRequest();
        request.setFullName("Alice");
        request.setPhoneNumber("13800138000");
        request.setAddress("Test Street 1");
        request.setIsDefault(false);
        return request;
    }

    private void authenticate(Long userId, String role) {
        User user = new User();
        user.setId(userId);
        user.setUsername("user" + userId);
        user.setPassword("secret");
        user.setEmail("user" + userId + "@example.com");
        user.setRole(role);

        UserDetailsImpl principal = UserDetailsImpl.build(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }
}
