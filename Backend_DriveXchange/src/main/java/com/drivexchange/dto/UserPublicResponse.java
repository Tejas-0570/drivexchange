package com.drivexchange.dto;

import java.util.Set;

public record UserPublicResponse(
    String createdAt,
    String email,
    String mobile,
    String name,
    Set<String> role
) {}
