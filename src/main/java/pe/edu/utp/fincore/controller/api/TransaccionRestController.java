package pe.edu.utp.fincore.controller.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.utp.fincore.model.*;
import pe.edu.utp.fincore.repository.*;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transacciones")
public class TransaccionRestController {

    private final TransaccionRepository transaccionRepository;
    private final ClienteRepository clienteRepository;
    private final ProveedorRepository proveedorRepository;
    private final CategoriaRepository categoriaRepository;
    private final CuentaBancariaRepository cuentaBancariaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ComprobanteRepository comprobanteRepository;

    private static final String UPLOAD_DIR = "uploads/";

    public TransaccionRestController(TransaccionRepository transaccionRepository,
                                     ClienteRepository clienteRepository,
                                     ProveedorRepository proveedorRepository,
                                     CategoriaRepository categoriaRepository,
                                     CuentaBancariaRepository cuentaBancariaRepository,
                                     UsuarioRepository usuarioRepository,
                                     ComprobanteRepository comprobanteRepository) {
        this.transaccionRepository = transaccionRepository;
        this.clienteRepository = clienteRepository;
        this.proveedorRepository = proveedorRepository;
        this.categoriaRepository = categoriaRepository;
        this.cuentaBancariaRepository = cuentaBancariaRepository;
        this.usuarioRepository = usuarioRepository;
        this.comprobanteRepository = comprobanteRepository;
    }

    @GetMapping
    public List<Transaccion> getAll() {
        return transaccionRepository.findAll();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestParam("tipo") String tipo,
            @RequestParam("fecha") String fecha,
            @RequestParam("monto") Double monto,
            @RequestParam("moneda") String moneda,
            @RequestParam("categoriaId") Long categoriaId,
            @RequestParam("cuentaBancariaId") Long cuentaBancariaId,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "referencia", required = false) String referencia,
            @RequestParam(value = "clienteId", required = false) Long clienteId,
            @RequestParam(value = "proveedorId", required = false) Long proveedorId,
            @RequestParam(value = "comprobante", required = false) MultipartFile comprobante,
            Authentication authentication
    ) {
        boolean hasAccess = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_CONTADOR") || auth.getAuthority().equals("ROLE_TESORERO"));

        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("mensaje", "Solo los roles CONTADOR y TESORERO pueden registrar transacciones"));
        }

        Usuario usuario = usuarioRepository.findByCorreo(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no válido"));

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no válida"));

        CuentaBancaria cuentaBancaria = cuentaBancariaRepository.findById(cuentaBancariaId)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta bancaria no válida"));

        Transaccion tx = new Transaccion();
        tx.setTipo(TipoTransaccion.valueOf(tipo.toUpperCase()));
        tx.setFecha(LocalDate.parse(fecha));
        tx.setMonto(BigDecimal.valueOf(monto));
        tx.setMoneda(Moneda.valueOf(moneda.toUpperCase()));
        tx.setDescripcion(descripcion);
        tx.setReferencia(referencia);
        tx.setCategoria(categoria);
        tx.setCuentaBancaria(cuentaBancaria);
        tx.setUsuario(usuario);
        tx.setEstado(EstadoTransaccion.PENDIENTE_CONCILIACION);

        if (clienteId != null) {
            Cliente cliente = clienteRepository.findById(clienteId).orElse(null);
            tx.setCliente(cliente);
        }
        if (proveedorId != null) {
            Proveedor proveedor = proveedorRepository.findById(proveedorId).orElse(null);
            tx.setProveedor(proveedor);
        }

        Transaccion saved = transaccionRepository.save(tx);

        if (comprobante != null && !comprobante.isEmpty()) {
            try {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                String filename = System.currentTimeMillis() + "_" + comprobante.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + filename);
                Files.write(path, comprobante.getBytes());

                Comprobante comp = new Comprobante();
                comp.setTransaccion(saved);
                comp.setNombreArchivo(comprobante.getOriginalFilename());
                comp.setRutaArchivo(UPLOAD_DIR + filename);
                
                String contentType = comprobante.getContentType();
                TipoArchivo tipoArchivo = TipoArchivo.PDF;
                if (contentType != null) {
                    if (contentType.contains("image/png") || filename.endsWith(".png")) {
                        tipoArchivo = TipoArchivo.PNG;
                    } else if (contentType.contains("image/jpeg") || filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
                        tipoArchivo = TipoArchivo.JPG;
                    } else if (contentType.contains("xml") || filename.endsWith(".xml")) {
                        tipoArchivo = TipoArchivo.XML;
                    }
                }
                comp.setTipoArchivo(tipoArchivo);
                comp.setPesoBytes(comprobante.getSize());

                comprobanteRepository.save(comp);
            } catch (IOException e) {
                System.err.println("Error saving comprobante file: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(saved);
    }
}
