import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';

class CashBoxProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<dynamic> _cashBoxes = [];
  List<dynamic> _withdrawalTypes = [];
  bool _isLoading = false;

  List<dynamic> get cashBoxes => _cashBoxes;
  List<dynamic> get withdrawalTypes => _withdrawalTypes;
  bool get isLoading => _isLoading;

  Future<void> fetchCashBoxes() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/cashboxes');
      if (response.statusCode == 200) {
        _cashBoxes = jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Fetch cashboxes error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchWithdrawalTypes() async {
    try {
      final response = await _apiService.get('/withdrawal-types');
      if (response.statusCode == 200) {
        _withdrawalTypes = jsonDecode(response.body);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Fetch withdrawal types error: $e');
    }
  }

  Future<bool> createCashBox(String name, int ownerId, double? limit) async {
    try {
      final response = await _apiService.post('/cashboxes', {
        'name': name,
        'owner_id': ownerId,
        'daily_limit': limit,
      });
      if (response.statusCode == 201) {
        await fetchCashBoxes();
        return true;
      }
    } catch (e) {
      debugPrint('Create cashbox error: $e');
    }
    return false;
  }

  Future<bool> fundCashBox(
    int cashboxId, 
    double amount, 
    String type, {
    int? withdrawalTypeId,
    String? accountNumber,
    String? phoneNumber,
    String? notes,
    List<XFile>? images,
  }) async {
    try {
      if (images != null && images.isNotEmpty) {
        final fields = {
          'amount': amount.toString(),
          'type': type,
          if (withdrawalTypeId != null) 'withdrawal_type_id': withdrawalTypeId.toString(),
          if (accountNumber != null) 'account_number': accountNumber,
          if (phoneNumber != null) 'phone_number': phoneNumber,
          if (notes != null) 'notes': notes,
        };
        final response = await _apiService.postWithImages('/cashboxes/$cashboxId/fund', fields, images);
        if (response.statusCode == 200) {
          await fetchCashBoxes();
          return true;
        }
      } else {
        final response = await _apiService.post('/cashboxes/$cashboxId/fund', {
          'amount': amount,
          'type': type,
          'withdrawal_type_id': withdrawalTypeId,
          'account_number': accountNumber,
          'phone_number': phoneNumber,
          'notes': notes,
        });
        if (response.statusCode == 200) {
          await fetchCashBoxes();
          return true;
        }
      }
    } catch (e) {
      debugPrint('Fund cashbox error: $e');
    }
    return false;
  }
}
