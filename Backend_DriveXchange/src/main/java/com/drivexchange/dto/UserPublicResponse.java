package com.drivexchange.dto;

import java.util.List;

public record UserPublicResponse(
    String createdAt,
    String email,
    String mobile,
    String name,
    List<String> role
) {}
