package com.drivexchange.config;


import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
	public CorsConfigurationSource corsConfigurationSource() {
	    CorsConfiguration config = new CorsConfiguration();
	    config.setAllowedOrigins(List.of("http://localhost:5173"));
	    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
	    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
	    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	    source.registerCorsConfiguration("/**", config);
	    return source;
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http
		    .csrf(csrf -> csrf.disable())
		    .cors(Customizer.withDefaults())
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
