package mini.cafe.project.repository;

import mini.cafe.project.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    Optional<User> findByPhoneAndRole(String phone, User.UserRole role);

    Optional<User> findByPhoneAndDeletedAtIsNull(String phone);
}
