import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _user;
  String? _token;
  bool _isLoading = false;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  bool get isAdmin => _user != null && _user!['role'] == 'admin';

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/login', {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['access_token'];
        _user = data['user'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('access_token', _token!);
        await prefs.setString('user_data', jsonEncode(_user));

        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _apiService.post('/logout', {});
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('user_data');
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('access_token')) return;

    _token = prefs.getString('access_token');
    final userData = prefs.getString('user_data');
    if (userData != null) {
      _user = jsonDecode(userData);
    }
    notifyListeners();
  }
}
