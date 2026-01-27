import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CashBoxProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<dynamic> _cashBoxes = [];
  bool _isLoading = false;

  List<dynamic> get cashBoxes => _cashBoxes;
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
}
