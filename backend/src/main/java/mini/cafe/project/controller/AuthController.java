package mini.cafe.project.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.auth.*;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.domain.User;
import mini.cafe.project.service.auth.AuthService;
import mini.cafe.project.service.auth.OTPService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OTPService otpService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful. OTP sent to your phone.", null));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOTP(@Valid @RequestBody SendOTPRequest request) {
        otpService.sendOTP(request.getPhone());
        return ResponseEntity.ok(
                ApiResponse.success("OTP sent successfully", null)
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        authService.verifyOTP(request.getPhone(), request.getCode());
        return ResponseEntity.ok(
                ApiResponse.success("OTP verified successfully. Please set your password.", null)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    @PostMapping("/set-password")
    public ResponseEntity<ApiResponse<Void>> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        authService.setPassword(request.getPhone(), request.getPassword());
        return ResponseEntity.ok(
                ApiResponse.success("Password set successfully", null)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(
                ApiResponse.success("Token refreshed", response)
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getPhone());
        return ResponseEntity.ok(
                ApiResponse.success("OTP sent to your phone for password reset", null)
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getPhone(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(
                ApiResponse.success("Password reset successfully", null)
        );
    }

    @PostMapping("/send-otp-for-phone-update")
    public ResponseEntity<ApiResponse<Void>> sendOTPForPhoneUpdate(@Valid @RequestBody SendOTPRequest request) {
        authService.sendOTPForPhoneUpdate(request.getPhone());
        return ResponseEntity.ok(
                ApiResponse.success("OTP sent to new phone number", null)
        );
    }

    @PostMapping("/update-phone")
    public ResponseEntity<ApiResponse<Void>> updatePhoneNumber(
            @Valid @RequestBody UpdatePhoneRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        authService.updatePhoneNumber(currentUser.getId(), request.getNewPhone(), request.getOtp());
        return ResponseEntity.ok(
                ApiResponse.success("Phone number updated successfully", null)
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        authService.changePassword(currentUser.getId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully", null)
        );
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @RequestBody DeleteAccountRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        authService.deleteAccount(currentUser.getId(), request.getPassword());
        return ResponseEntity.ok(
                ApiResponse.success("Account deleted successfully", null)
        );
    }
}
