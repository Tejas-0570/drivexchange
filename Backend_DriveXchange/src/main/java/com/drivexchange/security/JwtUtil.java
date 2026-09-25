package com.drivexchange.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
	
	@Value("${app.jwt.secret}")
	private String secretString;
	
	private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;
	
	private SecretKey secretKey;
	
	@PostConstruct
	public void init() {
		this.secretKey = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
	}
	
    public String generateToken(String email) {
        return generateToken(email, new HashMap<>());
    }
    
    public String generateToken(String email, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .claims(extraClaims)      // custom data (roles, etc.)
                .subject(email)           // standard 'sub' claim — who this token is about
                .issuedAt(now)            // standard 'iat' claim — when it was created
                .expiration(expiryDate)   // standard 'exp' claim — when it stops being valid
                .signWith(secretKey)      // cryptographically signs header+payload with our secret
                .compact();               // serializes everything into the final "header.payload.signature" string
    }
	
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }
    
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        List<String> roles = claims.get("roles", List.class);
        return roles != null ? roles : List.of();
    }
    
    public boolean validateToken(String token, String expectedEmail) {
        try {
            String tokenEmail = extractEmail(token);
            return tokenEmail.equals(expectedEmail);
            // No manual expiry check needed — extractEmail() calls extractAllClaims(),
            // which throws ExpiredJwtException automatically if expired, caught below.
        } catch (JwtException | IllegalArgumentException e) {
            // Covers: expired token, invalid signature, malformed token, null/empty token
            return false;
        }
    }
    
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
