package mini.cafe.project.service.auth;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.User;
import mini.cafe.project.dto.auth.AuthResponse;
import mini.cafe.project.dto.auth.LoginRequest;
import mini.cafe.project.dto.auth.RegisterRequest;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.exception.UnauthorizedException;
import mini.cafe.project.repository.UserRepository;
import mini.cafe.project.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OTPService otpService;

    @Transactional
    public void register(RegisterRequest request) {
        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("Phone number already registered");
        }

        // Create new user
        User user = User.builder()
                .phone(request.getPhone())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(User.UserRole.RESTAURANT_ADMIN)
                .isActive(true)
                .build();

        userRepository.save(user);

        // Send OTP for verification
        otpService.sendOTP(request.getPhone());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new UnauthorizedException("Invalid phone or password"));

        // Check if account is locked
        if (user.isAccountLocked()) {
            throw new UnauthorizedException("Account is locked. Please try again later.");
        }

        // Verify password (if set)
        if (user.getPasswordHash() != null) {
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                user.incrementFailedAttempts();
                userRepository.save(user);
                throw new UnauthorizedException("Invalid phone or password");
            }
        } else {
            throw new BusinessException("Password not set. Please use OTP login.");
        }

        // Reset failed attempts
        user.resetFailedAttempts();
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L) // 1 hour
                .userId(user.getId())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse verifyOTPAndLogin(String phone, String otp) {
        // Verify OTP
        otpService.verifyOTP(phone, otp);

        // Get user
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException("User not found"));

        // Update last login
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void setPassword(String phone, String password) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!Boolean.TRUE.equals(user.getOtpVerified())) {
            throw new BusinessException("Phone not verified. Please verify OTP first.");
        }

        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        try {
            String phone = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByPhoneAndDeletedAtIsNull(phone)
                    .orElseThrow(() -> new BusinessException("User not found"));

            if (!jwtService.isTokenValid(refreshToken, user)) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            String newAccessToken = jwtService.generateAccessToken(user);

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(3600L)
                    .userId(user.getId())
                    .phone(user.getPhone())
                    .role(user.getRole().name())
                    .build();
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    @Transactional
    public void forgotPassword(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException("User not found with this phone number"));

        if (!user.getIsActive()) {
            throw new BusinessException("Account is inactive");
        }

        // Send OTP for password reset
        otpService.sendOTP(phone);
    }

    @Transactional
    public void resetPassword(String phone, String otp, String newPassword) {
        // Verify OTP first
        otpService.verifyOTP(phone, otp);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException("User not found"));

        // Set new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.resetFailedAttempts();
        userRepository.save(user);
    }

    @Transactional
    public void updatePhoneNumber(java.util.UUID userId, String newPhone, String otp) {
        // Verify OTP for new phone number
        otpService.verifyOTP(newPhone, otp);

        // Check if new phone is already taken by ACTIVE user
        userRepository.findByPhone(newPhone).ifPresent(existingUser -> {
            // Agar deleted user bo'lsa, update qilishga ruxsat beramiz
            if (existingUser.getDeletedAt() == null) {
                throw new BusinessException("This phone number is already registered");
            }
        });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        // Update phone number
        user.setPhone(newPhone);
        user.setOtpVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void sendOTPForPhoneUpdate(String newPhone) {
        // Check if phone is already registered by ACTIVE user
        userRepository.findByPhone(newPhone).ifPresent(existingUser -> {
            // Agar deleted user bo'lsa, OTP yuborishga ruxsat beramiz
            if (existingUser.getDeletedAt() == null) {
                throw new BusinessException("This phone number is already registered");
            }
        });

        // Send OTP to new phone
        otpService.sendOTP(newPhone);
    }

    @Transactional
    public void changePassword(java.util.UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        // Verify current password
        if (user.getPasswordHash() == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect");
        }

        // Set new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(java.util.UUID userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        // Verify password
        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BusinessException("Password is incorrect");
        }

        // Check if user has active restaurant
        if (user.getRestaurant() != null && user.getRestaurant().getDeletedAt() == null) {
            throw new BusinessException("Cannot delete account. Please delete your restaurant first.");
        }

        // Soft delete user
        user.softDelete();
        userRepository.save(user);
    }
}
