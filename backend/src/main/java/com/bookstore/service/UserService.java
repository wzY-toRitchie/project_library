package com.bookstore.service;

import com.bookstore.entity.User;
import com.bookstore.entity.Address;
import com.bookstore.entity.Order;
import com.bookstore.entity.Notification;
import com.bookstore.repository.AddressRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.payload.response.UserSummaryResponse;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(@NonNull User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        notificationRepository.save(new Notification("USER", "新用户注册: " + user.getUsername()));
        return savedUser;
    }

    public Optional<User> login(@NonNull String username, @NonNull String password) {
        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()));
    }

    public Optional<User> getUserById(@NonNull Long id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserSummaryResponse> getAllUserSummaries() {
        List<User> users = userRepository.findAll();
        List<Long> userIds = users.stream().map(User::getId).toList();

        // 批量获取地址数量
        List<Object[]> addressCounts = addressRepository.countByUserIdGrouped();
        java.util.Map<Long, Long> countMap = new java.util.HashMap<>();
        for (Object[] row : addressCounts) {
            countMap.put((Long) row[0], (Long) row[1]);
        }

        // 批量获取默认地址
        List<Address> defaultAddresses = addressRepository.findDefaultAddressesByUserIds(userIds);
        java.util.Map<Long, String> addressMap = new java.util.HashMap<>();
        for (Address addr : defaultAddresses) {
            addressMap.put(addr.getUser().getId(), addr.getAddress());
        }

        return users.stream().map(user -> new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                addressMap.get(user.getId()),
                user.getRole(),
                user.getCreateTime(),
                countMap.getOrDefault(user.getId(), 0L))).toList();
    }

    public Optional<UserSummaryResponse> getUserSummary(@NonNull Long userId) {
        return userRepository.findById(userId)
                .map(user -> new UserSummaryResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getPhoneNumber(),
                        resolveDefaultAddress(user.getId()),
                        user.getRole(),
                        user.getCreateTime(),
                        addressRepository.countByUserId(user.getId())));
    }

    public User updateRole(@NonNull Long userId, @NonNull String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        return userRepository.save(Objects.requireNonNull(user));
    }

    @Transactional
    public void deleteUser(@NonNull Long userId) {
        // 先删除关联的地址
        addressRepository.deleteAll(addressRepository.findByUserId(userId));
        // 先删除关联的订单（如果需要保留订单历史，可以改为软删除）
        orderRepository.deleteAll(orderRepository.findByUserId(userId));
        // 最后删除用户
        userRepository.deleteById(userId);
    }

    public User updateProfile(@NonNull Long userId,
            @NonNull com.bookstore.payload.request.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        // Email and Username updates might need validation for uniqueness if allowed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        return userRepository.save(Objects.requireNonNull(user));
    }

    public User updateUserByAdmin(@NonNull Long userId,
            @NonNull com.bookstore.payload.request.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        return userRepository.save(Objects.requireNonNull(user));
    }

    public void updatePassword(@NonNull Long userId,
            @NonNull com.bookstore.payload.request.UpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String resolveDefaultAddress(Long userId) {
        return addressRepository.findFirstByUserIdOrderByIsDefaultDescIdAsc(userId)
                .map(Address::getAddress)
                .orElse(null);
    }
}
