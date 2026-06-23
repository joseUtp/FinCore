package pe.edu.utp.fincore.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping({"/", "/login"})
    public String login() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Gerente");
        return "dashboard";
    }

    @GetMapping("/ingresos/nuevo")
    public String ingresos(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Contador");
        return "ingresos";
    }

    @GetMapping("/egresos/nuevo")
    public String egresos(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Contador");
        return "egresos";
    }

    @GetMapping("/conciliacion")
    public String conciliacion(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Tesorero");
        return "conciliacion";
    }

    @GetMapping("/usuarios")
    public String usuarios(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Administrador");
        return "usuarios";
    }
}