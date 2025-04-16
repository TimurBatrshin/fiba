package com.fiba.api.controller;

import com.fiba.api.dto.AuthRequest;
import com.fiba.api.dto.AuthResponse;
import com.fiba.api.dto.RegisterRequest;
import com.fiba.api.model.User;
import com.fiba.api.security.JwtTokenProvider;
import com.fiba.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(path = "/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Auth endpoint is working!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        log.info("Запрос на вход: {}", authRequest.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getEmail(), 
                    authRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtTokenProvider.createToken(userDetails.getUsername(), 
                    userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""));
            
            User user = userService.findByEmail(authRequest.getEmail());
            
            log.info("Пользователь успешно вошел: {}", user.getEmail());
            
            return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
            ));
        } catch (Exception e) {
            log.error("Ошибка входа пользователя: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Запрос на регистрацию: {}", registerRequest.getEmail());
        try {
            User user = userService.registerUser(registerRequest);
            
            String jwt = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
            
            log.info("Пользователь успешно зарегистрирован: {}", user.getEmail());
            
            return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
            ));
        } catch (Exception e) {
            log.error("Ошибка регистрации пользователя: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        log.info("Запрос на обновление токена");
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                if (jwtTokenProvider.validateToken(token)) {
                    String username = jwtTokenProvider.getUsername(token);
                    User user = userService.findByEmail(username);
                    
                    // Создание нового токена с обновленным сроком действия
                    String newToken = jwtTokenProvider.createToken(username, user.getRole());
                    
                    log.info("Токен успешно обновлен для пользователя: {}", username);
                    
                    return ResponseEntity.ok(new AuthResponse(
                        newToken,
                        user.getId(),
                        user.getEmail(),
                        user.getName(),
                        user.getRole()
                    ));
                }
            }
            
            log.error("Недействительный токен для обновления");
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
        } catch (Exception e) {
            log.error("Ошибка обновления токена: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to refresh token"));
        }
    }
} 