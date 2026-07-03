package pe.edu.utp.fincore.controller.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.utp.fincore.model.CuentaBancaria;
import pe.edu.utp.fincore.repository.CuentaBancariaRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cuentas-bancarias")
public class CuentaBancariaRestController {

    private final CuentaBancariaRepository repository;

    public CuentaBancariaRestController(CuentaBancariaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CuentaBancaria> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CuentaBancaria cuenta, Authentication authentication) {
        boolean isTesorero = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_TESORERO"));
        
        if (!isTesorero) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "Solo el rol TESORERO puede registrar cuentas bancarias"));
        }

        cuenta.setSaldoActual(cuenta.getSaldoInicial());
        cuenta.setEstado(true);

        CuentaBancaria saved = repository.save(cuenta);
        return ResponseEntity.ok(saved);
    }
}
