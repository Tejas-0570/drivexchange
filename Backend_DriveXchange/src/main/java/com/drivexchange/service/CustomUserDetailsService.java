package com.drivexchange.service;

import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.drivexchange.entity.UserEntity;
import com.drivexchange.repo.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService{
	private UserRepository userRepository;
	
	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		UserEntity userEntity = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Not found with email "+email));
		
		return User.builder()
				.username(userEntity.getEmail())
				.password(userEntity.getPassword())
				.authorities(userEntity.getRole().stream().map(role -> new SimpleGrantedAuthority("ROLE_"+ role.toUpperCase())).collect(Collectors.toList()))
				.build();
	}
	
	
}
