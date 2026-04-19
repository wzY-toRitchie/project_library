package com.bookstore.service;

import com.bookstore.entity.Address;
import com.bookstore.entity.User;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.payload.request.AddressRequest;
import com.bookstore.repository.AddressRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Address> getAddresses(@NonNull Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescIdAsc(userId);
    }

    @Transactional
    public List<Address> createAddress(@NonNull Long userId, @NonNull AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setAddress(Objects.requireNonNullElse(request.getAddress(), ""));
        boolean shouldDefault = Boolean.TRUE.equals(request.getIsDefault())
                || addressRepository.findByUserId(userId).isEmpty();
        if (shouldDefault) {
            clearDefault(userId);
        }
        address.setDefault(shouldDefault);
        addressRepository.save(address);
        if (shouldDefault) {
            syncUserDefault(user, address);
        }
        return getAddresses(userId);
    }

    @Transactional
    public List<Address> updateAddress(@NonNull Long userId, @NonNull Long addressId, @NonNull AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (request.getFullName() != null) {
            address.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            address.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            address.setAddress(request.getAddress());
        }
        boolean shouldDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (shouldDefault) {
            clearDefault(userId);
            address.setDefault(true);
            syncUserDefault(address.getUser(), address);
        }
        addressRepository.save(address);
        ensureDefault(userId);
        return getAddresses(userId);
    }

    @Transactional
    public List<Address> setDefault(@NonNull Long userId, @NonNull Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        clearDefault(userId);
        address.setDefault(true);
        addressRepository.save(address);
        syncUserDefault(address.getUser(), address);
        return getAddresses(userId);
    }

    @Transactional
    public List<Address> deleteAddress(@NonNull Long userId, @NonNull Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);
        if (wasDefault) {
            assignFirstDefault(userId);
        }
        return getAddresses(userId);
    }

    private void clearDefault(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address item : addresses) {
            if (item.isDefault()) {
                item.setDefault(false);
            }
        }
        addressRepository.saveAll(addresses);
    }

    private void ensureDefault(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        boolean hasDefault = addresses.stream().anyMatch(Address::isDefault);
        if (!addresses.isEmpty() && !hasDefault) {
            Address first = addresses.get(0);
            first.setDefault(true);
            addressRepository.save(first);
            syncUserDefault(first.getUser(), first);
        }
    }

    private void assignFirstDefault(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        if (addresses.isEmpty()) {
            return;
        }
        Address first = addresses.get(0);
        first.setDefault(true);
        addressRepository.save(first);
        syncUserDefault(first.getUser(), first);
    }

    private void syncUserDefault(User user, Address address) {
        if (address.getFullName() != null && !address.getFullName().isBlank()) {
            user.setFullName(address.getFullName());
        }
        if (address.getPhoneNumber() != null && !address.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(address.getPhoneNumber());
        }
        userRepository.save(user);
    }
}
