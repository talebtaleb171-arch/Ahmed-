import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/transaction_provider.dart';
import 'providers/cashbox_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/agent/agent_dashboard.dart';
import 'screens/admin/admin_dashboard.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TransactionProvider()),
        ChangeNotifierProvider(create: (_) => CashBoxProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Caisse Ahmed',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E3A8A),
          primary: const Color(0xFF1E3A8A),
          secondary: const Color(0xFF10B981),
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.cairoTextTheme(Theme.of(context).textTheme),
      ),
      home: Consumer<AuthProvider>(
        builder: (ctx, auth, _) {
          if (auth.isAuthenticated) {
            return auth.isAdmin ? const AdminDashboard() : const AgentDashboard();
          }
          return FutureBuilder(
            future: auth.tryAutoLogin(),
            builder: (ctx, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                );
              }
              return const LoginScreen();
            },
          );
        },
      ),
    );
  }
}
