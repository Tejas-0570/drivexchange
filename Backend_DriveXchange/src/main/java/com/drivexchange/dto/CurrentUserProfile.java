package com.drivexchange.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record CurrentUserProfile(UUID id, String name, String email, String mobile, LocalDateTime created_at, Set<String> role) {

}
