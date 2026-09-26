package com.drivexchange.dto;

import java.util.Set;
import java.util.UUID;

public record CurrentUserProfile(UUID id, String name, String email, Set<String> role) {

}
