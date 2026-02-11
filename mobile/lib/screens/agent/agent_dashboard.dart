import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/cashbox_provider.dart';
import 'new_transaction_screen.dart';

class AgentDashboard extends StatefulWidget {
  const AgentDashboard({super.key});

  @override
  State<AgentDashboard> createState() => _AgentDashboardState();
}

class _AgentDashboardState extends State<AgentDashboard> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      Provider.of<CashBoxProvider>(context, listen: false).fetchCashBoxes();
      Provider.of<TransactionProvider>(context, listen: false).fetchTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final cashBoxes = Provider.of<CashBoxProvider>(context).cashBoxes;
    final transactions = Provider.of<TransactionProvider>(context).transactions;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة تحكم الوكيل'),
        actions: [
          Container(
            margin: const EdgeInsets.only(left: 8),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(Icons.logout, color: Colors.red, size: 20),
              onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout(),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Provider.of<CashBoxProvider>(context, listen: false).fetchCashBoxes();
          await Provider.of<TransactionProvider>(context, listen: false).fetchTransactions();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome & Balance Card with Gradient
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E3A8A), Color(0xFF1E40AF), Color(0xFF2563EB)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1E3A8A).withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'مرحباً،',
                              style: GoogleFonts.cairo(color: Colors.white70, fontSize: 16),
                            ),
                            Text(
                              user?['name'] ?? '',
                              style: GoogleFonts.cairo(
                                color: Colors.white, 
                                fontSize: 20, 
                                fontWeight: FontWeight.bold
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.account_balance_wallet, color: Colors.white, size: 28),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    Text(
                      'رصيد الصندوق الحالي',
                      style: GoogleFonts.cairo(color: Colors.white70, fontSize: 14),
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          cashBoxes.isNotEmpty 
                              ? '${cashBoxes[0]['balance']}' 
                              : '0',
                          style: GoogleFonts.cairo(
                            color: Colors.white, 
                            fontSize: 38, 
                            fontWeight: FontWeight.w900
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'MRU',
                          style: GoogleFonts.cairo(
                            color: Colors.white60, 
                            fontSize: 18, 
                            fontWeight: FontWeight.bold
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'العمليات الأخيرة',
                    style: theme.textTheme.titleMedium,
                  ),
                  TextButton(
                    onPressed: () {}, // Future: View all transactions
                    child: Text(
                      'عرض الكل',
                      style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 8),
              
              if (transactions.isEmpty)
                Center(
                  child: Column(
                    children: [
                      const SizedBox(height: 48),
                      Icon(Icons.history_toggle_off, size: 64, color: Colors.grey.withOpacity(0.3)),
                      const SizedBox(height: 16),
                      Text(
                        'لا توجد عمليات حالياً',
                        style: GoogleFonts.cairo(color: Colors.grey, fontSize: 16),
                      ),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: transactions.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (ctx, i) {
                    final t = transactions[i];
                    final isDeposit = t['type'] == 'deposit';
                    
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.withOpacity(0.1)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: (isDeposit ? Colors.green : Colors.red).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              isDeposit ? Icons.arrow_downward : Icons.arrow_upward, // Deposit comes INTO the box
                              color: isDeposit ? Colors.green : Colors.red,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isDeposit ? 'إيداع رصيد' : 'سحب رصيد',
                                  style: GoogleFonts.cairo(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: const Color(0xFF1E293B),
                                  ),
                                ),
                                Text(
                                  DateFormat('yyyy/MM/dd HH:mm').format(DateTime.parse(t['created_at'])),
                                  style: GoogleFonts.cairo(
                                    fontSize: 12,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${isDeposit ? '+' : '-'}${t['amount']} MRU',
                                style: GoogleFonts.cairo(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                  color: isDeposit ? Colors.green : Colors.red,
                                ),
                              ),
                              _buildStatusIndicator(t['status']),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
                const SizedBox(height: 80), // Space for FAB
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (cashBoxes.isNotEmpty) {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => NewTransactionScreen(cashboxId: cashBoxes[0]['id']),
              ),
            );
          }
        },
        label: Text(
          'عملية جديدة',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold, letterSpacing: 0),
        ),
        icon: const Icon(Icons.add_rounded),
        elevation: 4,
        highlightElevation: 8,
      ),
    );
  }

  Widget _buildStatusIndicator(String status) {
    Color color;
    String label;
    switch (status) {
      case 'approved':
        color = Colors.green;
        label = 'مقبول';
        break;
      case 'rejected':
        color = Colors.red;
        label = 'مرفوض';
        break;
      default:
        color = Colors.orange;
        label = 'معلق';
    }
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.cairo(color: color, fontSize: 11, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
