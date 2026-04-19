package com.bookstore.service;

import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.payload.request.AddressRequest;
import com.bookstore.repository.AddressRepository;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AddressServiceExceptionSemanticsTest {

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressService addressService;

    @Test
    void createAddressThrowsResourceNotFoundWhenUserMissing() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> addressService.createAddress(1L, addressRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
        verify(addressRepository, never()).save(any());
    }

    @Test
    void updateAddressThrowsResourceNotFoundWhenAddressMissing() {
        when(addressRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> addressService.updateAddress(1L, 10L, addressRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Address not found");
        verify(addressRepository, never()).save(any());
    }

    @Test
    void setDefaultThrowsResourceNotFoundWhenAddressMissing() {
        when(addressRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> addressService.setDefault(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Address not found");
        verify(addressRepository, never()).save(any());
    }

    @Test
    void deleteAddressThrowsResourceNotFoundWhenAddressMissing() {
        when(addressRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> addressService.deleteAddress(1L, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Address not found");
        verify(addressRepository, never()).delete(any());
    }

    private AddressRequest addressRequest() {
        AddressRequest request = new AddressRequest();
        request.setFullName("Alice");
        request.setPhoneNumber("13800138000");
        request.setAddress("Test Street 1");
        request.setIsDefault(false);
        return request;
    }
}
