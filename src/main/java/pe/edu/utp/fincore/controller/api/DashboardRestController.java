package pe.edu.utp.fincore.controller.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardRestController {

    @GetMapping("/stats")
    public List<Map<String, Object>> getStats() {
        List<Map<String, Object>> statsList = new ArrayList<>();

        statsList.add(createStatCard("Ingresos Totales", "124,500.00", true, "↑ 12.5% vs mes anterior", true, "TrendingUp", "text-emerald-500", "bg-emerald-50"));
        statsList.add(createStatCard("Egresos Totales", "78,250.00", true, "↓ 8.3% vs mes anterior", false, "TrendingDown", "text-rose-500", "bg-rose-50"));
        statsList.add(createStatCard("Saldo Actual", "47,180.00", true, "↑ 5.7% vs mes anterior", true, "Wallet", "text-blue-500", "bg-blue-50"));
        statsList.add(createStatCard("Operaciones", "152", false, "↑ 16 vs mes anterior", true, "Activity", "text-amber-500", "bg-amber-50"));

        return statsList;
    }

    @GetMapping("/charts")
    public Map<String, Object> getChartsData() {
        Map<String, Object> response = new HashMap<>();

        // 1. Monthly data
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        monthlyData.add(createMonthlyItem("Ene", 95000, 62000));
        monthlyData.add(createMonthlyItem("Feb", 108000, 71000));
        monthlyData.add(createMonthlyItem("Mar", 115000, 75000));
        monthlyData.add(createMonthlyItem("Abr", 121000, 83000));
        monthlyData.add(createMonthlyItem("May", 118000, 79000));
        monthlyData.add(createMonthlyItem("Jun", 124500, 78250));

        // 2. Expenses distribution
        List<Map<String, Object>> expensesDistribution = new ArrayList<>();
        expensesDistribution.add(createExpenseDistributionItem("Operativos", 45, "bg-emerald-500", "#10B981"));
        expensesDistribution.add(createExpenseDistributionItem("Administrativos", 30, "bg-blue-500", "#3B82F6"));
        expensesDistribution.add(createExpenseDistributionItem("Financieros", 15, "bg-amber-500", "#F59E0B"));
        expensesDistribution.add(createExpenseDistributionItem("Otros", 10, "bg-zinc-400", "#A1A1AA"));

        response.put("monthly", monthlyData);
        response.put("expensesDistribution", expensesDistribution);

        return response;
    }

    @GetMapping("/recent-transactions")
    public List<Map<String, Object>> getRecentTransactions() {
        List<Map<String, Object>> transactions = new ArrayList<>();

        transactions.add(createTransaction("03/06/2024", "Pago de servicio hosting", "Egreso", "280.00", false, "Completado"));
        transactions.add(createTransaction("03/06/2024", "Cobro a cliente A", "Ingreso", "2,500.00", true, "Completado"));
        transactions.add(createTransaction("02/06/2024", "Compra de útiles oficina", "Egreso", "120.00", false, "Pendiente"));

        return transactions;
    }

    private Map<String, Object> createStatCard(String title, String value, boolean isCurrency, String change, boolean isPositive, String iconName, String iconColor, String bgColor) {
        Map<String, Object> card = new HashMap<>();
        card.put("title", title);
        card.put("value", value);
        card.put("isCurrency", isCurrency);
        card.put("change", change);
        card.put("isPositive", isPositive);
        card.put("iconName", iconName); // We pass the icon name to let React dynamically map it
        card.put("iconColor", iconColor);
        card.put("bgColor", bgColor);
        return card;
    }

    private Map<String, Object> createMonthlyItem(String name, double ingresos, double egresos) {
        Map<String, Object> item = new HashMap<>();
        item.put("name", name);
        item.put("Ingresos", ingresos);
        item.put("Egresos", egresos);
        return item;
    }

    private Map<String, Object> createExpenseDistributionItem(String category, int percentage, String color, String barColor) {
        Map<String, Object> item = new HashMap<>();
        item.put("category", category);
        item.put("percentage", percentage);
        item.put("color", color);
        item.put("barColor", barColor);
        return item;
    }

    private Map<String, Object> createTransaction(String date, String description, String type, String amount, boolean isIncome, String status) {
        Map<String, Object> tx = new HashMap<>();
        tx.put("date", date);
        tx.put("description", description);
        tx.put("type", type);
        tx.put("amount", amount);
        tx.put("isIncome", isIncome);
        tx.put("status", status);
        return tx;
    }
}
