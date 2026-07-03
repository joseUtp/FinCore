package pe.edu.utp.fincore.controller.api;

import org.springframework.web.bind.annotation.*;
import pe.edu.utp.fincore.model.Cliente;
import pe.edu.utp.fincore.model.Proveedor;
import pe.edu.utp.fincore.model.Categoria;
import pe.edu.utp.fincore.model.TipoCategoria;
import pe.edu.utp.fincore.repository.ClienteRepository;
import pe.edu.utp.fincore.repository.ProveedorRepository;
import pe.edu.utp.fincore.repository.CategoriaRepository;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EntidadesAuxiliaresRestController {

    private final ClienteRepository clienteRepository;
    private final ProveedorRepository proveedorRepository;
    private final CategoriaRepository categoriaRepository;

    public EntidadesAuxiliaresRestController(ClienteRepository clienteRepository,
                                             ProveedorRepository proveedorRepository,
                                             CategoriaRepository categoriaRepository) {
        this.clienteRepository = clienteRepository;
        this.proveedorRepository = proveedorRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("/clientes")
    public List<Cliente> getClientes() {
        return clienteRepository.findAll();
    }

    @GetMapping("/proveedores")
    public List<Proveedor> getProveedores() {
        return proveedorRepository.findAll();
    }

    @GetMapping("/categorias")
    public List<Categoria> getCategorias(@RequestParam(value = "tipo", required = false) String tipo) {
        if (tipo != null) {
            try {
                TipoCategoria tipoEnum = TipoCategoria.valueOf(tipo.toUpperCase());
                return categoriaRepository.findByTipoOrTipo(tipoEnum, TipoCategoria.AMBOS);
            } catch (IllegalArgumentException e) {
                // Fallback to all
            }
        }
        return categoriaRepository.findAll();
    }
}
