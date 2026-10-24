package com.drivexchange.service;

import java.util.Collection;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.drivexchange.entity.UserEntity;
import com.drivexchange.repo.UserRepository;

/** Small helpers shared by the admin services. */
@Component
public class AdminSupport {

    private final UserRepository userRepository;

    public AdminSupport(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * THE server-side admin check. Every admin service method starts with this, so even if a URL rule in
     * SecurityConfig is wrong, a normal user still gets 403 here. (The frontend guard is only cosmetic.)
     */
    public UserEntity requireAdmin(String email) {
        UserEntity u = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!isAdmin(u)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins only");
        }
        return u;
    }

    public static List<String> rolesOf(UserEntity u) {
        Collection<String> roles = u.getRole();   // your UserEntity: Set<String> such as "ROLE_ADMIN"
        return roles == null ? List.of() : List.copyOf(roles);
    }

    public static boolean isAdmin(UserEntity u) {
        return rolesOf(u).stream().anyMatch(r -> r.toUpperCase().contains("ADMIN"));
    }

    // ---- helpers ----------------------------------------------------------------------
    /** "swift" -> "%swift%" ; empty -> "%" (never null: Postgres + null LIKE parameters is a classic trap) */
    public static String like(String search) {
        return search == null || search.isBlank() ? "%" : "%" + search.trim().toLowerCase() + "%";
    }

    public static <E extends Enum<E>> E parse(Class<E> type, String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown value: " + value);
        }
    }

    public static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    public static ResponseStatusException notFound(String what) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, what + " not found");
    }
}
