import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000/api'; 

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return await http.post(url, headers: headers, body: jsonEncode(data));
  }

  Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return await http.get(url, headers: headers);
  }

  Future<http.StreamedResponse> postWithImages(
    String endpoint, 
    Map<String, String> fields, 
    List<XFile> images
  ) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final token = await _getToken();
    final request = http.MultipartRequest('POST', url);
    
    request.headers.addAll({
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    });

    request.fields.addAll(fields);

    for (var image in images) {
      final bytes = await image.readAsBytes();
      final multipartFile = http.MultipartFile.fromBytes(
        'images[]', 
        bytes,
        filename: image.name,
      );
      request.files.add(multipartFile);
    }

    return await request.send();
  }
}
