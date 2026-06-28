package pe.edu.utp.fincore.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.validation.Valid;
import pe.edu.utp.fincore.model.Role;
import pe.edu.utp.fincore.model.UserStatus;
import pe.edu.utp.fincore.model.Usuario;
import pe.edu.utp.fincore.model.UsuarioForm;
import pe.edu.utp.fincore.repository.RoleRepository;
import pe.edu.utp.fincore.repository.UsuarioRepository;

@Controller
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository,
                             RoleRepository roleRepository) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @GetMapping("/usuarios")
    public String listUsuarios(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Administrador");
        model.addAttribute("usuarios", usuarioRepository.findAll());
        return "usuarios";
    }

    @GetMapping("/usuarios/nuevo")
    public String nuevoUsuario(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Administrador");
        model.addAttribute("usuarioForm", new UsuarioForm());
        model.addAttribute("roles", roleRepository.findAll());
        model.addAttribute("estados", UserStatus.values());
        return "usuario-nuevo";
    }

    @PostMapping("/usuarios")
    public String guardarUsuario(@Valid @ModelAttribute("usuarioForm") UsuarioForm usuarioForm,
                                 BindingResult result,
                                 Model model) {
        if (result.hasErrors()) {
            model.addAttribute("usuario", "Usuario");
            model.addAttribute("rol", "Administrador");
            model.addAttribute("roles", roleRepository.findAll());
            model.addAttribute("estados", UserStatus.values());
            return "usuario-nuevo";
        }

        Role rol = roleRepository.findById(usuarioForm.getRolId())
                .orElseThrow(() -> new IllegalArgumentException("Rol inválido"));

        Usuario usuario = new Usuario();
        usuario.setNombre(usuarioForm.getNombre());
        usuario.setCorreo(usuarioForm.getCorreo());
        usuario.setPasswordHash(passwordEncoder.encode(usuarioForm.getPassword()));
        usuario.setRol(rol);
        usuario.setEstado(usuarioForm.getEstado());

        usuarioRepository.save(usuario);

        return "redirect:/usuarios";
    }
}
