package com.drivexchange.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http
		    .csrf(csrf -> csrf.disable())
		    .authorizeHttpRequests(auth -> auth
		    		.requestMatchers("/api/v1/auth/**", "/public", "/error").permitAll()
		    		.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
		    		.anyRequest().authenticated()
		    )
		    .sessionManagement(session -> session
		    		.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
		    )
//		    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
		    
		    .logout(logout -> logout
		    		.logoutUrl("/api/v1/auth/logout")
		    		.logoutSuccessHandler((request, response, authentication) -> {
		    			response.setStatus(HttpServletResponse.SC_OK);
		    			response.setContentType("application/json");
		    			response.getWriter().write("{\"message\": \"Logout Successful\"}");
		    		})
		    		.permitAll()
		    
		    );
		    
		
		return http.build();
	}
	
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
		return config.getAuthenticationManager();
	}
}
