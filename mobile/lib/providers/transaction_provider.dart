import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TransactionProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<dynamic> _transactions = [];
  bool _isLoading = false;

  List<dynamic> get transactions => _transactions;
  bool get isLoading => _isLoading;

  Future<void> fetchTransactions({int? cashboxId}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final endpoint = cashboxId != null ? '/transactions?cashbox_id=$cashboxId' : '/transactions';
      final response = await _apiService.get(endpoint);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _transactions = data['data'];
      }
    } catch (e) {
      debugPrint('Fetch transactions error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createTransaction({
    required int cashboxId,
    required String type,
    required double amount,
    required List<File> images,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.postWithImages('/transactions', {
        'cashbox_id': cashboxId.toString(),
        'type': type,
        'amount': amount.toString(),
      }, images);

      final respBody = await response.stream.bytesToString();
      if (response.statusCode == 201) {
        await fetchTransactions(cashboxId: cashboxId);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        debugPrint('Create transaction error: $respBody');
      }
    } catch (e) {
      debugPrint('Create transaction error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> approveTransaction(int id) async {
    try {
      final response = await _apiService.post('/transactions/$id/approve', {});
      if (response.statusCode == 200) {
        // Find and update local list
        final index = _transactions.indexWhere((t) => t['id'] == id);
        if (index != -1) {
          _transactions[index]['status'] = 'approved';
          notifyListeners();
        }
        return true;
      }
    } catch (e) {
      debugPrint('Approve error: $e');
    }
    return false;
  }
}
