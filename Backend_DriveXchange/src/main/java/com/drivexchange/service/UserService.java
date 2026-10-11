package com.drivexchange.service;

import com.drivexchange.dto.CurrentUserProfile;
import com.drivexchange.dto.RegisterRequest;
import com.drivexchange.dto.UpdateUser;
import com.drivexchange.dto.UpdatedUserResponse;
import com.drivexchange.entity.UserEntity;

public interface UserService {
	
	public void register(RegisterRequest request);
	
	public CurrentUserProfile getUserProfileByEmail(String email);
	
	public UpdatedUserResponse updateUser(String email, UpdateUser user);
	
	public UserEntity getUserEntityByEmail(String email);
}
