import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/cashbox_provider.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  String _selectedStatus = 'pending';

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      Provider.of<CashBoxProvider>(context, listen: false).fetchCashBoxes();
      Provider.of<CashBoxProvider>(context, listen: false).fetchWithdrawalTypes();
      Provider.of<TransactionProvider>(context, listen: false).fetchTransactions(status: 'pending');
    });
  }

  @override
  Widget build(BuildContext context) {
    final cashBoxes = Provider.of<CashBoxProvider>(context).cashBoxes;
    final transactions = Provider.of<TransactionProvider>(context).transactions;
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('لوحة تحكم المسؤول'),
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
          bottom: TabBar(
            labelStyle: GoogleFonts.cairo(fontWeight: FontWeight.bold),
            unselectedLabelStyle: GoogleFonts.cairo(fontWeight: FontWeight.normal),
            indicatorColor: theme.colorScheme.primary,
            labelColor: theme.colorScheme.primary,
            unselectedLabelColor: Colors.grey,
            tabs: const [
              Tab(text: 'الصناديق', icon: Icon(Icons.account_balance_rounded)),
              Tab(text: 'العمليات', icon: Icon(Icons.history_rounded)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // CashBoxes Tab
            RefreshIndicator(
              onRefresh: () => Provider.of<CashBoxProvider>(context, listen: false).fetchCashBoxes(),
              child: ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: cashBoxes.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (ctx, i) {
                  final box = cashBoxes[i];
                  final isMain = box['type'] == 'main';
                  
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.withOpacity(0.1)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: (isMain ? Colors.orange : theme.colorScheme.primary).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isMain ? Icons.stars_rounded : Icons.person_rounded,
                            color: isMain ? Colors.orange : theme.colorScheme.primary,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                box['name'],
                                style: GoogleFonts.cairo(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: const Color(0xFF1E293B),
                                ),
                              ),
                              Text(
                                box['owner']['name'],
                                style: GoogleFonts.cairo(
                                  fontSize: 13,
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
                              '${box['balance']}',
                              style: GoogleFonts.cairo(
                                fontWeight: FontWeight.w900,
                                fontSize: 18,
                                color: theme.colorScheme.primary,
                              ),
                            ),
                            Text(
                              'MRU',
                              style: GoogleFonts.cairo(
                                color: Colors.grey,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline_rounded, color: Colors.green, size: 24),
                                  onPressed: () => _showFundDialog(box, 'deposit'),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline_rounded, color: Colors.red, size: 24),
                                  onPressed: () => _showFundDialog(box, 'withdrawal'),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            
            // Transactions Tab
            StatefulBuilder(
              builder: (ctx, setState) {
                return RefreshIndicator(
                  onRefresh: () => Provider.of<TransactionProvider>(context, listen: false).fetchTransactions(status: _selectedStatus == 'all' ? null : _selectedStatus),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('تصفية حسب الحالة:', style: GoogleFonts.cairo(fontSize: 14)),
                            DropdownButton<String>(
                              value: _selectedStatus,
                              underline: const SizedBox(),
                              items: [
                                DropdownMenuItem(value: 'all', child: Text('الكل', style: GoogleFonts.cairo(fontSize: 13))),
                                DropdownMenuItem(value: 'pending', child: Text('معلقة', style: GoogleFonts.cairo(fontSize: 13))),
                                DropdownMenuItem(value: 'approved', child: Text('مقبولة', style: GoogleFonts.cairo(fontSize: 13))),
                                DropdownMenuItem(value: 'rejected', child: Text('مرفوضة', style: GoogleFonts.cairo(fontSize: 13))),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() => _selectedStatus = val);
                                  Provider.of<TransactionProvider>(context, listen: false).fetchTransactions(status: val == 'all' ? null : val);
                                }
                              },
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          itemCount: transactions.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (ctx, i) {
                            final t = transactions[i];
                            final isDeposit = t['type'] == 'deposit';
                            final status = t['status'];
                            
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
                                      isDeposit ? Icons.arrow_downward : Icons.arrow_upward,
                                      color: isDeposit ? Colors.green : Colors.red,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          '${t['cash_box']?['name'] ?? 'غير معروف'}',
                                          style: GoogleFonts.cairo(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                            color: const Color(0xFF1E293B),
                                          ),
                                        ),
                                        Text(
                                          t['creator']?['name'] ?? 'غير معروف',
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
                                        '${t['amount']} MRU',
                                        style: GoogleFonts.cairo(
                                          fontWeight: FontWeight.w900,
                                          fontSize: 15,
                                          color: isDeposit ? Colors.green : Colors.red,
                                        ),
                                      ),
                                      if (status == 'pending')
                                        IconButton(
                                          icon: const Icon(Icons.check_circle_rounded, color: Colors.orange, size: 28),
                                          onPressed: () => _showApproveDialog(t),
                                          padding: EdgeInsets.zero,
                                          constraints: const BoxConstraints(),
                                        )
                                      else
                                        _buildStatusIndicator(status),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(
          'اعتماد العملية',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('المبلغ:', style: GoogleFonts.cairo(color: Colors.grey)),
                      Text('${t['amount']} MRU', style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 18)),
                    ],
                  ),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('النوع:', style: GoogleFonts.cairo(color: Colors.grey)),
                      Text(t['type'] == 'deposit' ? 'إيداع' : 'سحب', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            if (t['media'] != null && t['media'].isNotEmpty)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('صور الإثبات:', style: GoogleFonts.cairo(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 120,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: t['media'].length,
                      separatorBuilder: (c, i) => const SizedBox(width: 8),
                      itemBuilder: (c, i) => ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(t['media'][i]['image_url'], width: 120, fit: BoxFit.cover),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        actions: [
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: Text('إلغاء', style: GoogleFonts.cairo(color: Colors.grey, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    final success = await Provider.of<TransactionProvider>(context, listen: false).approveTransaction(t['id']);
                    if (success && mounted) {
                      Navigator.of(ctx).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('تم اعتماد العملية بنجاح', style: GoogleFonts.cairo()),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                  child: Text('موافقة', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showFundDialog(dynamic box, String type) {
    final TextEditingController amountController = TextEditingController();
    final TextEditingController accountController = TextEditingController();
    final TextEditingController phoneController = TextEditingController();
    final TextEditingController notesController = TextEditingController();
    int? selectedWithdrawalTypeId;
    List<XFile> selectedImages = [];
    final ImagePicker picker = ImagePicker();

    final isMain = box['type'] == 'main';
    final title = isMain 
      ? (type == 'deposit' ? 'تعبئة الصندوق الرئيسي' : 'سحب من الصندوق الرئيسي')
      : (type == 'deposit' ? 'شحن رصيد الصندوق' : 'سحب الرصيد للصندوق الرئيسي');
    
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) {
          final withdrawalTypes = Provider.of<CashBoxProvider>(context).withdrawalTypes;

          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Text(title, style: GoogleFonts.cairo(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isMain 
                      ? (type == 'deposit' ? 'إيداع رصيد خارجي في:' : 'سحب رصيد خارجي من:')
                      : (type == 'deposit' ? 'سيتم تحويل رصيد من الرئيسي إلى:' : 'سيتم سحب الرصيد من الصندوق إلى الرئيسي:'),
                    textAlign: TextAlign.center,
                    style: GoogleFonts.cairo(fontSize: 13, color: Colors.grey),
                  ),
                  Text(box['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 20),
                  TextField(
                    controller: amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      hintText: 'المبلغ (MRU)',
                      hintStyle: GoogleFonts.cairo(),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 20),
                  ),

                  if (type == 'withdrawal') ...[
                    const SizedBox(height: 16),
                    DropdownButtonFormField<int>(
                      isExpanded: true,
                      decoration: InputDecoration(
                        labelText: 'نوع السحب',
                        labelStyle: GoogleFonts.cairo(),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      value: selectedWithdrawalTypeId,
                      items: withdrawalTypes.map<DropdownMenuItem<int>>((t) {
                        return DropdownMenuItem<int>(
                          value: t['id'],
                          child: Text(t['name'], style: GoogleFonts.cairo()),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => selectedWithdrawalTypeId = val),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: accountController,
                      decoration: InputDecoration(
                        labelText: 'رقم الحساب (اختياري)',
                        labelStyle: GoogleFonts.cairo(),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      style: GoogleFonts.cairo(),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: phoneController,
                      decoration: InputDecoration(
                        labelText: 'رقم الهاتف (اختياري)',
                        labelStyle: GoogleFonts.cairo(),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      style: GoogleFonts.cairo(),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: notesController,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'ملاحظات (اختياري)',
                        labelStyle: GoogleFonts.cairo(),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      style: GoogleFonts.cairo(),
                    ),
                    const SizedBox(height: 16),
                    InkWell(
                      onTap: () async {
                        final List<XFile> images = await picker.pickMultiImage();
                        if (images.isNotEmpty) {
                          setState(() => selectedImages = images);
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.withOpacity(0.3)),
                          borderRadius: BorderRadius.circular(12),
                          color: Colors.grey.withOpacity(0.05),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.camera_alt_rounded, color: Colors.grey),
                            const SizedBox(width: 8),
                            Text(
                              selectedImages.isEmpty ? 'إرفاق صور إثبات' : 'تم اختيار ${selectedImages.length} صور',
                              style: GoogleFonts.cairo(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text('إلغاء', style: GoogleFonts.cairo(color: Colors.grey)),
              ),
              ElevatedButton(
                onPressed: () async {
                  final amount = double.tryParse(amountController.text);
                  if (amount == null || amount <= 0) return;
                  
                  if (type == 'withdrawal' && selectedWithdrawalTypeId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('يرجى اختيار نوع السحب', style: GoogleFonts.cairo())),
                    );
                    return;
                  }
                  
                  final success = await Provider.of<CashBoxProvider>(context, listen: false).fundCashBox(
                    box['id'], 
                    amount, 
                    type,
                    withdrawalTypeId: selectedWithdrawalTypeId,
                    accountNumber: accountController.text.isNotEmpty ? accountController.text : null,
                    phoneNumber: phoneController.text.isNotEmpty ? phoneController.text : null,
                    notes: notesController.text.isNotEmpty ? notesController.text : null,
                    images: selectedImages.isNotEmpty ? selectedImages : null,
                  );
                  
                  if (success && mounted) {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('تمت العملية بنجاح', style: GoogleFonts.cairo()), backgroundColor: Colors.green),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: type == 'deposit' ? Colors.green : Colors.red),
                child: Text('تأكيد', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
              ),
            ],
          );
        },
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
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: GoogleFonts.cairo(color: color, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }
}
