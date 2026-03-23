package com.bookstore.repository;

import com.bookstore.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);

    List<Address> findByUserIdOrderByIsDefaultDescIdAsc(Long userId);

    Optional<Address> findFirstByUserIdOrderByIsDefaultDescIdAsc(Long userId);

    Optional<Address> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    @Query("SELECT a.user.id, COUNT(a) FROM Address a GROUP BY a.user.id")
    List<Object[]> countByUserIdGrouped();

    @Query("SELECT a FROM Address a WHERE a.isDefault = true AND a.user.id IN :userIds")
    List<Address> findDefaultAddressesByUserIds(@Param("userIds") List<Long> userIds);
}
