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
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header
              Row(
                children: [
                   CircleAvatar(
                    radius: 20,
                    backgroundColor: const Color(0xFF6366F1).withOpacity(0.1),
                    child: Text(
                      user?['name']?.substring(0, 1).toUpperCase() ?? 'U',
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF6366F1),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'مرحباً بك،',
                        style: GoogleFonts.cairo(
                          color: const Color(0xFF64748B),
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        user?['name'] ?? 'مستخدم',
                        style: GoogleFonts.cairo(
                          color: const Color(0xFF0F172A),
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Balance Card (Premium)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withOpacity(0.4),
                      blurRadius: 24,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: -20,
                      right: -20,
                      child: Icon(
                        Icons.account_balance_wallet_rounded,
                        size: 100,
                        color: Colors.white.withOpacity(0.05),
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'رصيد الصندوق',
                          style: GoogleFonts.cairo(
                            color: Colors.white.withOpacity(0.5),
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              cashBoxes.isNotEmpty ? '${cashBoxes[0]['balance']}' : '0',
                              style: GoogleFonts.outfit(
                                color: Colors.white,
                                fontSize: 42,
                                fontWeight: FontWeight.w900,
                                height: 1,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Text(
                                'MRU',
                                style: GoogleFonts.outfit(
                                  color: const Color(0xFF6366F1),
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 14),
                              const SizedBox(width: 6),
                              Text(
                                'نشط',
                                style: GoogleFonts.cairo(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
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
                    style: GoogleFonts.cairo(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'عرض الكل',
                      style: GoogleFonts.cairo(
                        color: const Color(0xFF6366F1),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              if (transactions.isEmpty)
                Center(
                  child: Column(
                    children: [
                      const SizedBox(height: 64),
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Icon(Icons.history_rounded, size: 48, color: Colors.grey.withOpacity(0.3)),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'لا توجد عمليات حالياً',
                        style: GoogleFonts.cairo(
                          color: const Color(0xFF94A3B8), 
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: transactions.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (ctx, i) {
                    final t = transactions[i];
                    final isDeposit = t['type'] == 'deposit';
                    
                    return GestureDetector(
                      onTap: () => _showTransactionDetails(t),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0F172A).withOpacity(0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: (isDeposit ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: Icon(
                                isDeposit ? Icons.add_circle_outline_rounded : Icons.remove_circle_outline_rounded,
                                color: isDeposit ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                size: 26,
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
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                      color: const Color(0xFF0F172A),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    DateFormat('yyyy/MM/dd | HH:mm').format(DateTime.parse(t['created_at'])),
                                    style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF94A3B8),
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
                                  style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 17,
                                    color: isDeposit ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                _buildStatusIndicator(t['status']),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      floatingActionButton: Container(
        height: 64,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: FloatingActionButton.extended(
          onPressed: () {
            if (cashBoxes.isNotEmpty) {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => NewTransactionScreen(cashboxId: cashBoxes[0]['id']),
                ),
              );
            }
          },
          backgroundColor: const Color(0xFF6366F1),
          foregroundColor: Colors.white,
          elevation: 12,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          label: Text(
            'عملية جديدة',
            style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          icon: const Icon(Icons.add_rounded, size: 28),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  void _showTransactionDetails(Map<String, dynamic> t) {
    final isDeposit = t['type'] == 'deposit';
    final typeColor = isDeposit ? const Color(0xFF10B981) : const Color(0xFFEF4444);
    final status = t['status'] ?? 'pending';
    final media = t['media'] as List<dynamic>? ?? [];
    final withdrawalType = t['withdrawal_type'];
    final creator = t['creator'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.92,
        builder: (ctx, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF8FAFC),
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFF94A3B8).withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // Header
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 24),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFF0F172A), const Color(0xFF1E293B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withOpacity(0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: typeColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(
                        isDeposit ? Icons.add_circle_outline_rounded : Icons.remove_circle_outline_rounded,
                        color: typeColor,
                        size: 32,
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
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${isDeposit ? '+' : '-'}${t['amount']} MRU',
                            style: GoogleFonts.outfit(
                              color: typeColor,
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusIndicator(status),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Details
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  children: [
                    // Info Section
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0).withOpacity(0.5)),
                      ),
                      child: Column(
                        children: [
                          _buildDetailRow(
                            Icons.calendar_today_rounded,
                            'التاريخ',
                            DateFormat('yyyy/MM/dd  -  HH:mm').format(DateTime.parse(t['created_at'])),
                          ),
                          if (t['balance_before'] != null && t['balance_before'] != 0) ...[
                            const Divider(height: 24, color: Color(0xFFF1F5F9)),
                            _buildDetailRow(
                              Icons.account_balance_wallet_outlined,
                              'الرصيد قبل',
                              '${t['balance_before']} MRU',
                            ),
                          ],
                          if (t['balance_after'] != null && t['balance_after'] != 0) ...[
                            const Divider(height: 24, color: Color(0xFFF1F5F9)),
                            _buildDetailRow(
                              Icons.account_balance_wallet_rounded,
                              'الرصيد بعد',
                              '${t['balance_after']} MRU',
                            ),
                          ],
                          if (withdrawalType != null) ...[
                            const Divider(height: 24, color: Color(0xFFF1F5F9)),
                            _buildDetailRow(
                              Icons.category_rounded,
                              'نوع السحب',
                              withdrawalType['name'] ?? '',
                            ),
                          ],
                          if (t['account_number'] != null && t['account_number'].toString().isNotEmpty) ...[
                            const Divider(height: 24, color: Color(0xFFF1F5F9)),
                            _buildDetailRow(
                              Icons.credit_card_rounded,
                              'رقم الحساب',
                              t['account_number'],
                            ),
                          ],
                          if (t['phone_number'] != null && t['phone_number'].toString().isNotEmpty) ...[
                            const Divider(height: 24, color: Color(0xFFF1F5F9)),
                            _buildDetailRow(
                              Icons.phone_rounded,
                              'رقم الهاتف',
                              t['phone_number'],
                            ),
                          ],
                          if (creator != null) ...[
                            const Divider(height: 24, color: Color(0xFFF1F5F9)),
                            _buildDetailRow(
                              Icons.person_outline_rounded,
                              'بواسطة',
                              creator['name'] ?? '',
                            ),
                          ],
                        ],
                      ),
                    ),
                    // Notes
                    if (t['notes'] != null && t['notes'].toString().isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0).withOpacity(0.5)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.sticky_note_2_rounded, color: const Color(0xFF6366F1), size: 20),
                                const SizedBox(width: 8),
                                Text('ملاحظات', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15, color: const Color(0xFF0F172A))),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              t['notes'],
                              style: GoogleFonts.cairo(color: const Color(0xFF64748B), fontSize: 14, height: 1.6),
                            ),
                          ],
                        ),
                      ),
                    ],
                    // Rejection reason
                    if (status == 'rejected' && t['reason'] != null && t['reason'].toString().isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.05),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.15)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.info_outline_rounded, color: const Color(0xFFEF4444), size: 20),
                                const SizedBox(width: 8),
                                Text('سبب الرفض', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15, color: const Color(0xFFEF4444))),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              t['reason'],
                              style: GoogleFonts.cairo(color: const Color(0xFFEF4444).withOpacity(0.8), fontSize: 14, height: 1.6),
                            ),
                          ],
                        ),
                      ),
                    ],
                    // Images
                    if (media.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0).withOpacity(0.5)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.photo_library_rounded, color: const Color(0xFF6366F1), size: 20),
                                const SizedBox(width: 8),
                                Text('المرفقات', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15, color: const Color(0xFF0F172A))),
                                const Spacer(),
                                Text('${media.length}', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14, color: const Color(0xFF94A3B8))),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              height: 140,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: media.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 12),
                                itemBuilder: (ctx, i) {
                                  final imageUrl = media[i]['image_url'] ?? '';
                                  return GestureDetector(
                                    onTap: () {
                                      showDialog(
                                        context: context,
                                        builder: (_) => Dialog(
                                          backgroundColor: Colors.transparent,
                                          insetPadding: const EdgeInsets.all(16),
                                          child: Stack(
                                            alignment: Alignment.topRight,
                                            children: [
                                              ClipRRect(
                                                borderRadius: BorderRadius.circular(16),
                                                child: InteractiveViewer(
                                                  child: Image.network(imageUrl, fit: BoxFit.contain),
                                                ),
                                              ),
                                              Positioned(
                                                top: 8,
                                                right: 8,
                                                child: GestureDetector(
                                                  onTap: () => Navigator.of(context).pop(),
                                                  child: Container(
                                                    padding: const EdgeInsets.all(8),
                                                    decoration: BoxDecoration(
                                                      color: Colors.black.withOpacity(0.5),
                                                      shape: BoxShape.circle,
                                                    ),
                                                    child: const Icon(Icons.close, color: Colors.white, size: 20),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(16),
                                      child: Image.network(
                                        imageUrl,
                                        width: 140,
                                        height: 140,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(
                                          width: 140,
                                          height: 140,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF1F5F9),
                                            borderRadius: BorderRadius.circular(16),
                                          ),
                                          child: const Icon(Icons.broken_image_rounded, color: Color(0xFF94A3B8), size: 32),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF6366F1).withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFF6366F1), size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: GoogleFonts.cairo(
              color: const Color(0xFF94A3B8),
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Text(
          value,
          style: GoogleFonts.cairo(
            color: const Color(0xFF0F172A),
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusIndicator(String status) {
    Color color;
    String label;
    switch (status) {
      case 'approved':
        color = const Color(0xFF10B981);
        label = 'مقبول';
        break;
      case 'rejected':
        color = const Color(0xFFEF4444);
        label = 'مرفوض';
        break;
      default:
        color = const Color(0xFFF59E0B);
        label = 'معلق';
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        label,
        style: GoogleFonts.cairo(
          color: color, 
          fontSize: 10, 
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
