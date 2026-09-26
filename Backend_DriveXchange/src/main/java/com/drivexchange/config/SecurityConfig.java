package com.drivexchange.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.drivexchange.security.JwtAuthFilter;
import com.drivexchange.service.CustomUserDetailsService;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
    private JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
		return config.getAuthenticationManager();
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http
		    .csrf(csrf -> csrf.disable())
		    
		    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
		    
		    .authorizeHttpRequests(auth -> auth
		    		.requestMatchers("/api/v1/auth/**", "/public", "/error").permitAll()
		    		.requestMatchers("/api/v1/user/**").hasAnyRole("USER", "ADMIN")
		    		.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
		    		.anyRequest().authenticated()
		    )
		    .sessionManagement(session -> session
		    		.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
		    )
		    
		    .logout(logout -> logout
		    	    .logoutUrl("/api/v1/auth/logout")
		    	    .logoutSuccessHandler((request, response, authentication) -> {
		    	        response.setStatus(HttpServletResponse.SC_OK);
		    	        response.setContentType("application/json");
		    	        
		    	        // Match the structural footprint of the clean wrapper format
		    	        String jsonResponse = String.format(
		    	            "{\"timestamp\":\"%s\",\"status\":200,\"success\":true,\"message\":\"Logout Successful\",\"data\":null}",
		    	            java.time.LocalDateTime.now()
		    	        );
		    	        
		    	        response.getWriter().write(jsonResponse);
		    	    })
		    	    .permitAll()
		    	)
;
		    
		
		return http.build();
	}
	
}
