package com.drivexchange.dto;

import java.util.Set;
import java.util.UUID;

public record UpdatedUserResponse(UUID id,String name, String email, String mobile, Set<String> role) {

}
