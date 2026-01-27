import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../providers/transaction_provider.dart';

class NewTransactionScreen extends StatefulWidget {
  final int cashboxId;
  const NewTransactionScreen({super.key, required this.cashboxId});

  @override
  State<NewTransactionScreen> createState() => _NewTransactionScreenState();
}

class _NewTransactionScreenState extends State<NewTransactionScreen> {
  final _amountController = TextEditingController();
  String _type = 'withdrawal'; // Default to withdrawal as it's common
  final List<File> _images = [];
  final ImagePicker _picker = ImagePicker();

  void _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() {
        _images.add(File(image.path));
      });
    }
  }

  void _submit() async {
    if (_amountController.text.isEmpty || _images.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال المبلغ ورفع صورة واحدة على الأقل')),
      );
      return;
    }

    final success = await Provider.of<TransactionProvider>(context, listen: false).createTransaction(
      cashboxId: widget.cashboxId,
      type: _type,
      amount: double.parse(_amountController.text),
      images: _images,
    );

    if (success && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إرسال العملية بنجاح')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = Provider.of<TransactionProvider>(context).isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('عملية مالية جديدة')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'withdrawal', label: Text('سحب'), icon: Icon(Icons.arrow_downward)),
                ButtonSegment(value: 'deposit', label: Text('إيداع'), icon: Icon(Icons.arrow_upward)),
              ],
              selected: {_type},
              onSelectionChanged: (val) => setState(() => _type = val.first),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'المبلغ (د.ج)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.money),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 32),
            const Text('صور الإثبات (إلزامي)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: [
                ..._images.map((file) => Stack(
                  children: [
                    Image.file(file, width: 80, height: 80, fit: BoxFit.cover),
                    Positioned(
                      right: 0,
                      child: GestureDetector(
                        onTap: () => setState(() => _images.remove(file)),
                        child: const CircleAvatar(
                          radius: 10,
                          backgroundColor: Colors.red,
                          child: Icon(Icons.close, size: 12, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                )),
                GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.add_a_photo, color: Colors.grey),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E3A8A),
                  foregroundColor: Colors.white,
                ),
                child: isLoading 
                  ? const CircularProgressIndicator(color: Colors.white) 
                  : const Text('إرسال العملية'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
