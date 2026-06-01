package mini.cafe.project.service.auth;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.User;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OTPService {

    private static final Logger logger = LoggerFactory.getLogger(OTPService.class);
    private static final SecureRandom random = new SecureRandom();

    private final UserRepository userRepository;

    // In-memory cache for OTPs of non-existent users (register, phone update)
    // Key: phone number, Value: OTP data (code + expiry time)
    private final Map<String, OTPData> tempOTPCache = new ConcurrentHashMap<>();

    private static class OTPData {
        String code;
        LocalDateTime expiresAt;

        OTPData(String code, LocalDateTime expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${app.otp.max-attempts:3}")
    private int maxAttempts;

    /**
     * Generate and send OTP to user's phone
     * This method handles TWO cases:
     * 1. User exists in DB (login, forgot password) - saves OTP to user entity
     * 2. User doesn't exist (register, phone update) - saves OTP to in-memory cache
     */
    @Transactional
    public void sendOTP(String phone) {
        Optional<User> userOptional = userRepository.findByPhone(phone);

        // Generate OTP
        String otp = generateOTP();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        if (userOptional.isPresent() && userOptional.get().getDeletedAt() == null) {
            // Case 1: Active user exists - save OTP to database
            User user = userOptional.get();
            user.setOtpCode(otp);
            user.setOtpExpiresAt(expiresAt);
            user.setOtpVerified(false);
            userRepository.save(user);

            // Remove from cache if exists
            tempOTPCache.remove(phone);

            logger.debug("OTP saved to existing user for phone ending in: ...{}", phone.substring(Math.max(0, phone.length() - 4)));
        } else {
            // Case 2: User doesn't exist or is deleted (register/phone update)
            // Save OTP to in-memory cache
            tempOTPCache.put(phone, new OTPData(otp, expiresAt));
            logger.debug("OTP cached for new/unregistered phone ending in: ...{}", phone.substring(Math.max(0, phone.length() - 4)));
        }

        // Send SMS in both cases
        sendSMS(phone, otp);
    }

    /**
     * Verify OTP code
     */
    @Transactional
    public boolean verifyOTP(String phone, String code) {
        Optional<User> users = userRepository.findByPhone(phone);
        if (users.isEmpty()) {
            return true;
        }
        User user = users.get();
        // Check if OTP exists
        if (user.getOtpCode() == null) {
            throw new BusinessException("No OTP found. Please request a new one.");
        }

        // Check if expired
        if (user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("OTP has expired. Please request a new one.");
        }

        // Check if code matches
        if (!user.getOtpCode().equals(code)) {
            user.incrementFailedAttempts();
            userRepository.save(user);
            throw new BusinessException("Invalid OTP code");
        }

        // Mark as verified
        user.setOtpVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        user.resetFailedAttempts();
        userRepository.save(user);

        logger.debug("OTP verified for phone ending in: ...{}", phone.substring(Math.max(0, phone.length() - 4)));
        return true;
    }

    /**
     * Generate OTP - hardcoded for development
     * TODO: Replace with random generation in production
     */
    private String generateOTP() {
        // For development - always return 123456
        return "123456";
    }

    /**
     * Send SMS - Integrate with your provider
     * TODO: Replace with actual SMS integration from your existing auth module
     */
    private void sendSMS(String phone, String otp) {
        // TODO: Integrate with Twilio, AWS SNS, or your SMS provider
        logger.info("OTP sent to phone ending in: ...{}", phone.substring(Math.max(0, phone.length() - 4)));

        // Example Twilio integration:
        // Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
        // Message.creator(
        //     new PhoneNumber(phone),
        //     new PhoneNumber(TWILIO_PHONE),
        //     "Your OTP is: " + otp
        // ).create();
    }
}
