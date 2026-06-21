package com.craftflow.controller;

import com.craftflow.dto.request.LoginRequest;
import com.craftflow.dto.request.RegisterBusinessRequest;
import com.craftflow.dto.response.AuthResponse;
import com.craftflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterBusinessRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerBusiness(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
