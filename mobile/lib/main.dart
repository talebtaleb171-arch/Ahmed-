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
      title: 'Ahmed BMS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F172A),
          primary: const Color(0xFF0F172A),
          secondary: const Color(0xFF6366F1),
          surface: const Color(0xFFF8FAFC),
          tertiary: const Color(0xFF10B981),
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF1F5F9),
        textTheme: TextTheme(
          titleLarge: GoogleFonts.cairo(
            fontWeight: FontWeight.w800, 
            color: const Color(0xFF0F172A),
            letterSpacing: -0.5,
          ),
          titleMedium: GoogleFonts.cairo(
            fontWeight: FontWeight.w700, 
            color: const Color(0xFF1E293B),
          ),
          bodyLarge: GoogleFonts.cairo(
            color: const Color(0xFF334155),
            fontSize: 16,
          ),
          bodyMedium: GoogleFonts.cairo(
            color: const Color(0xFF64748B),
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(color: const Color(0xFFE2E8F0).withValues(alpha: 0.5)),
          ),
          color: Colors.white,
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.cairo(
            color: const Color(0xFF0F172A),
            fontSize: 20,
            fontWeight: FontWeight.w800,
          ),
          iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F172A),
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 56),
            elevation: 8,
            shadowColor: const Color(0xFF0F172A).withOpacity(0.3),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            textStyle: GoogleFonts.cairo(
              fontWeight: FontWeight.w800, 
              fontSize: 18,
              letterSpacing: 0.5,
            ),
          ),
        ),
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
