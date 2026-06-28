package pe.edu.utp.fincore;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@SpringBootTest
@AutoConfigureMockMvc
class FincoreApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void shouldRenderConfigurationPage() throws Exception {
		mockMvc.perform(get("/configuracion"))
				.andExpect(status().isOk())
				.andExpect(view().name("configuracion"));
	}

	@Test
	void shouldLogoutAndRedirectToLogin() throws Exception {
		mockMvc.perform(get("/logout"))
				.andExpect(status().is3xxRedirection())
				.andExpect(redirectedUrl("/login"));
	}

	@Test
	void shouldSaveConfigurationAndRedirect() throws Exception {
		mockMvc.perform(post("/configuracion/guardar")
					.param("nombreEmpresa", "FinCore S.A.C.")
					.param("ruc", "20601234567")
					.param("moneda", "USD")
					.param("alertasCorreo", "true")
					.param("resumenDiario", "true")
					.param("edicionTransaccionesCerradas", "false")
					.param("zonaHoraria", "America/Bogota"))
				.andExpect(status().is3xxRedirection())
				.andExpect(redirectedUrl("/configuracion"));
	}
}
