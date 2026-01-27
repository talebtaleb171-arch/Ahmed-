import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/cashbox_provider.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
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
    final cashBoxes = Provider.of<CashBoxProvider>(context).cashBoxes;
    final transactions = Provider.of<TransactionProvider>(context).transactions;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('لوحة تحكم المسؤول'),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout(),
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(text: 'الصناديق', icon: Icon(Icons.account_balance)),
              Tab(text: 'العمليات', icon: Icon(Icons.history)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // CashBoxes Tab
            RefreshIndicator(
              onRefresh: () => Provider.of<CashBoxProvider>(context, listen: false).fetchCashBoxes(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: cashBoxes.length,
                itemBuilder: (ctx, i) {
                  final box = cashBoxes[i];
                  return Card(
                    child: ListTile(
                      title: Text(box['name']),
                      subtitle: Text(box['owner']['name']),
                      trailing: Text(
                        '${box['balance']} د.ج',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                  );
                },
              ),
            ),
            // Transactions Tab
            RefreshIndicator(
              onRefresh: () => Provider.of<TransactionProvider>(context, listen: false).fetchTransactions(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: transactions.length,
                itemBuilder: (ctx, i) {
                  final t = transactions[i];
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: t['status'] == 'pending' ? Colors.orange : (t['status'] == 'approved' ? Colors.green : Colors.red),
                        child: Icon(
                          t['type'] == 'deposit' ? Icons.arrow_upward : Icons.arrow_downward,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      title: Text('${t['amount']} د.ج - ${t['cash_box']['name']}'),
                      subtitle: Text(t['creator']['name']),
                      trailing: t['status'] == 'pending' 
                        ? IconButton(
                            icon: const Icon(Icons.check_circle, color: Colors.green),
                            onPressed: () => _showApproveDialog(t),
                          )
                        : _buildStatusChip(t['status']),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showApproveDialog(dynamic t) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('اعتماد العملية'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('المبلغ: ${t['amount']} د.ج'),
            Text('النوع: ${t['type'] == 'deposit' ? 'إيداع' : 'سحب'}'),
            const SizedBox(height: 16),
            if (t['media'].isNotEmpty)
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: t['media'].length,
                  itemBuilder: (c, i) => Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: Image.network(t['media'][i]['image_url'], width: 100, fit: BoxFit.cover),
                  ),
                ),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              final success = await Provider.of<TransactionProvider>(context, listen: false).approveTransaction(t['id']);
              if (success && mounted) {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم اعتماد العملية')));
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
            child: const Text('موافقة'),
          ),
        ],
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
    return Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold));
  }
}
