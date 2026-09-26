package com.drivexchange.service;

import com.drivexchange.dto.CurrentUserProfile;
import com.drivexchange.dto.RegisterRequest;

public interface UserService {
	
	public void register(RegisterRequest request);
	
	public CurrentUserProfile getUserProfileByEmail(String email);
}
