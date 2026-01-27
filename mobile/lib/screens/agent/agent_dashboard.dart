import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة تحكم الوكيل'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout(),
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
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome & Balance Card
              Card(
                color: const Color(0xFF1E3A8A),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'مرحباً، ${user?['name']}',
                        style: const TextStyle(color: Colors.white70, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'الرصيد الحالي',
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                      Text(
                        cashBoxes.isNotEmpty 
                            ? '${cashBoxes[0]['balance']} د.ج' 
                            : '0 د.ج',
                        style: const TextStyle(
                          color: Colors.white, 
                          fontSize: 32, 
                          fontWeight: FontWeight.bold
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'آخر العمليات',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              if (transactions.isEmpty)
                const Center(child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Text('لا توجد عمليات حالياً'),
                ))
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: transactions.length,
                  itemBuilder: (ctx, i) {
                    final t = transactions[i];
                    return Card(
                      child: ListTile(
                        leading: Icon(
                          t['type'] == 'deposit' ? Icons.arrow_upward : Icons.arrow_downward,
                          color: t['type'] == 'deposit' ? Colors.green : Colors.red,
                        ),
                        title: Text('${t['amount']} د.ج'),
                        subtitle: Text(t['created_at'].toString().split('T')[0]),
                        trailing: _buildStatusChip(t['status']),
                      ),
                    );
                  },
                ),
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
        label: const Text('عملية جديدة'),
        icon: const Icon(Icons.add),
        backgroundColor: const Color(0xFF1E3A8A),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
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
    return Chip(
      label: Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
      backgroundColor: color,
    );
  }
}
