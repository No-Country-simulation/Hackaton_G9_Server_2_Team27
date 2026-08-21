package EnegiAI.Backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"https://hackaton-g9-server-2-team27.vercel.app", "http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        // Retorna un JWT simulado para la hackatón
        return ResponseEntity.ok(Map.of("token", "simulated_jwt_token_from_backend"));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> userData) {
        // Retorna éxito para la hackatón
        return ResponseEntity.ok(Map.of("message", "Usuario registrado exitosamente"));
    }
}
