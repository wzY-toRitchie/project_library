package com.bookstore.repository;

import com.bookstore.entity.PointsRuleSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PointsRuleSettingRepository extends JpaRepository<PointsRuleSetting, Long> {
    Optional<PointsRuleSetting> findByRuleKey(String ruleKey);

    boolean existsByRuleKey(String ruleKey);
}
