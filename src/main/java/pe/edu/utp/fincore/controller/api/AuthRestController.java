package pe.edu.utp.fincore.controller.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pe.edu.utp.fincore.model.Auditoria;
import pe.edu.utp.fincore.model.UserStatus;
import pe.edu.utp.fincore.model.Usuario;
import pe.edu.utp.fincore.repository.AuditoriaRepository;
import pe.edu.utp.fincore.repository.UsuarioRepository;
import pe.edu.utp.fincore.security.JwtTokenProvider;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final UsuarioRepository usuarioRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final JwtTokenProvider tokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthRestController(UsuarioRepository usuarioRepository,
                              AuditoriaRepository auditoriaRepository,
                              JwtTokenProvider tokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ip = request.getRemoteAddr();

        Usuario usuario = usuarioRepository.findByCorreo(loginRequest.getCorreo()).orElse(null);

        if (usuario == null) {
            auditoriaRepository.save(new Auditoria(null, "SEGURIDAD", "LOGIN_FALLIDO", 
                    "Intento de ingreso con correo inexistente: " + loginRequest.getCorreo(), ip));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Credenciales incorrectas"));
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), usuario.getPasswordHash())) {
            int intentos = usuario.getIntentosFallidos() + 1;
            usuario.setIntentosFallidos(intentos);
            if (intentos >= 5) {
                usuario.setEstado(UserStatus.BLOQUEADO);
                usuarioRepository.save(usuario);
                auditoriaRepository.save(new Auditoria(usuario, "SEGURIDAD", "USUARIO_BLOQUEADO", 
                        "Usuario bloqueado tras 5 intentos fallidos: " + usuario.getCorreo(), ip));
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("mensaje", "Cuenta bloqueada por exceso de intentos"));
            }
            usuarioRepository.save(usuario);

            auditoriaRepository.save(new Auditoria(usuario, "SEGURIDAD", "LOGIN_FALLIDO", 
                    "Contraseña incorrecta para: " + usuario.getCorreo(), ip));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Credenciales incorrectas"));
        }

        if (usuario.getEstado() != UserStatus.ACTIVO) {
            String statusMsg = usuario.getEstado() == UserStatus.BLOQUEADO ? "Cuenta bloqueada" : "Cuenta inactiva";
            auditoriaRepository.save(new Auditoria(usuario, "SEGURIDAD", "LOGIN_RECHAZADO", 
                    "Intento de login fallido. Estado del usuario: " + usuario.getEstado(), ip));
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", statusMsg));
        }

        usuario.setIntentosFallidos(0);
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = tokenProvider.generateToken(usuario.getCorreo(), usuario.getRol().getNombre());

        auditoriaRepository.save(new Auditoria(usuario, "SEGURIDAD", "LOGIN_EXITOSO", 
                "Inicio de sesión exitoso para: " + usuario.getCorreo(), ip));

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("nombre", usuario.getNombre());
        response.put("correo", usuario.getCorreo());
        response.put("rol", usuario.getRol().getNombre());

        return ResponseEntity.ok(response);
    }

    public static class LoginRequest {
        private String correo;
        private String password;

        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
