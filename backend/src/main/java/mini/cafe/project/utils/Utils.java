package mini.cafe.project.utils;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.User;
import mini.cafe.project.exception.UnauthorizedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class Utils {

    private final UserDetailsService userDetailsService;

    public User getUserFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(principal.getName());
        if (!(userDetails instanceof User)) {
            throw new UnauthorizedException("Invalid user details");
        }
        return (User) userDetails;
    }
}
