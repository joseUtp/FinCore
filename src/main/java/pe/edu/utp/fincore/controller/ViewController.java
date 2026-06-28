package pe.edu.utp.fincore.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

    @GetMapping("/cuentas")
    public String cuentas(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Tesorero");
        return "cuentas";
    }

    @GetMapping("/conciliacion")
    public String conciliacion(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Tesorero");
        return "conciliacion";
    }

    @GetMapping("/reportes")
    public String reportes(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Contador");
        return "reportes";
    }

    @PostMapping("/configuracion/guardar")
    public String guardarConfiguracion(
            @RequestParam("nombreEmpresa") String nombreEmpresa,
            @RequestParam("ruc") String ruc,
            @RequestParam("moneda") String moneda,
            @RequestParam("alertasCorreo") String alertasCorreo,
            @RequestParam("resumenDiario") String resumenDiario,
            @RequestParam("edicionTransaccionesCerradas") String edicionTransaccionesCerradas,
            @RequestParam("zonaHoraria") String zonaHoraria,
            Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Administrador");
        model.addAttribute("mensajeExito", "Configuración guardada correctamente.");
        model.addAttribute("nombreEmpresa", nombreEmpresa);
        model.addAttribute("ruc", ruc);
        model.addAttribute("moneda", moneda);
        model.addAttribute("alertasCorreo", Boolean.parseBoolean(alertasCorreo));
        model.addAttribute("resumenDiario", Boolean.parseBoolean(resumenDiario));
        model.addAttribute("edicionTransaccionesCerradas", Boolean.parseBoolean(edicionTransaccionesCerradas));
        model.addAttribute("zonaHoraria", zonaHoraria);
        return "redirect:/configuracion";
    }

    @GetMapping("/logout")
    public String logout() {
        return "redirect:/login";
    }

    @GetMapping("/configuracion")
    public String configuracion(Model model) {
        model.addAttribute("usuario", "Usuario");
        model.addAttribute("rol", "Administrador");
        return "configuracion";
    }
}