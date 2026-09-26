package com.drivexchange.dao;

import java.util.Set;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.drivexchange.dto.CurrentUserProfile;
import com.drivexchange.dto.RegisterRequest;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.exceptions.UserAlreadyExistsException;
import com.drivexchange.repo.UserRepository;
import com.drivexchange.service.UserService;

@Service
public class UserDao implements UserService{

	private UserRepository userRepository;
	private PasswordEncoder passwordEncoder;
	
	public UserDao(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}
	
	@Override
	public void register(RegisterRequest request) {
		
		if(userRepository.findByEmail(request.email()).isPresent()) {
			throw new UserAlreadyExistsException("User already exists with email "+request.email());
		}
		
		UserEntity u = new UserEntity();
		
		u.setName(request.name());
		u.setEmail(request.email());
		u.setPassword(passwordEncoder.encode(request.password()));
		u.setRole(Set.of("USER"));
		
		userRepository.save(u);
		
	}

	@Override
	public CurrentUserProfile getUserProfileByEmail(String email) {
		UserEntity u = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
		
		
		return new CurrentUserProfile(
				u.getId(),
				u.getName(),
				u.getEmail(),
				u.getRole()
		);
	}

}
