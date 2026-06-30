import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'core/constants/api_constants.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  final Dio _dio = Dio();
  List<dynamic> _cartItems = [];
  bool _isLoading = true;
  String _errorMessage = '';
  Set<int> _selectedItemIds = {}; // Menyimpan ID cart item yang dipilih untuk checkout

  @override
  void initState() {
    super.initState();
    _fetchCartItems();
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  Future<void> _fetchCartItems() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final token = await _getToken();
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/cart',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        setState(() {
          _cartItems = response.data['data'] ?? [];
          _isLoading = false;
        });
      } else {
        throw Exception(response.data['message'] ?? 'Gagal memuat keranjang');
      }
    } catch (e) {
      debugPrint("Error fetching cart: $e");
      setState(() {
        _isLoading = false;
        _errorMessage = 'Gagal memuat keranjang. Silakan coba lagi.';
      });
    }
  }

  Future<void> _updateQuantity(int cartItemId, int currentQuantity, int change) async {
    final newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      final token = await _getToken();
      final response = await _dio.put(
        '${ApiConstants.baseUrl}/cart/$cartItemId',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
        data: {
          'quantity': newQuantity,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        _fetchCartItems(); // Refresh data
      } else {
        throw Exception(response.data['message'] ?? 'Gagal mengubah kuantitas');
      }
    } catch (e) {
      debugPrint("Error updating quantity: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal mengubah kuantitas')),
        );
      }
    }
  }

  Future<void> _deleteItem(int cartItemId) async {
    try {
      final token = await _getToken();
      final response = await _dio.delete(
        '${ApiConstants.baseUrl}/cart/$cartItemId',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        setState(() {
          _selectedItemIds.remove(cartItemId);
        });
        _fetchCartItems(); // Refresh data
      } else {
        throw Exception(response.data['message'] ?? 'Gagal menghapus produk');
      }
    } catch (e) {
      debugPrint("Error deleting item: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menghapus produk')),
        );
      }
    }
  }

  Future<void> _checkout() async {
    if (_selectedItemIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih setidaknya satu produk untuk checkout')),
      );
      return;
    }

    // TODO: Sesuaikan dengan endpoint checkout Anda
    try {
      final token = await _getToken();
      final response = await _dio.post(
        '${ApiConstants.baseUrl}/checkout',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
        data: {
          'cartItemIds': _selectedItemIds.toList(),
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Checkout berhasil!')),
          );
        }
        setState(() {
          _selectedItemIds.clear();
        });
        _fetchCartItems(); // Refresh keranjang setelah checkout
      } else {
        throw Exception(response.data['message'] ?? 'Checkout gagal');
      }
    } catch (e) {
      debugPrint("Error checkout: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Checkout gagal. Silakan coba lagi.')),
        );
      }
    }
  }

  String _getImageUrl(String? filename) {
    if (filename == null || filename.isEmpty) return '';
    final serverUrl = ApiConstants.baseUrl.replaceAll('/api', '');
    return '$serverUrl/uploads/$filename';
  }

  double _calculateTotal() {
    double total = 0;
    for (var item in _cartItems) {
      if (_selectedItemIds.contains(item['id'])) {
        final price = double.tryParse(item['product']['price'].toString()) ?? 0.0;
        final quantity = item['quantity'] as int? ?? 1;
        total += (price * quantity);
      }
    }
    return total;
  }

  bool _isAllSelected() {
    if (_cartItems.isEmpty) return false;
    return _selectedItemIds.length == _cartItems.length;
  }

  void _toggleSelectAll(bool? value) {
    setState(() {
      if (value == true) {
        _selectedItemIds = _cartItems.map<int>((item) => item['id'] as int).toSet();
      } else {
        _selectedItemIds.clear();
      }
    });
  }

  void _toggleSelectItem(int cartItemId, bool? value) {
    setState(() {
      if (value == true) {
        _selectedItemIds.add(cartItemId);
      } else {
        _selectedItemIds.remove(cartItemId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Keranjang Belanja'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
              ? Center(child: Text(_errorMessage))
              : _cartItems.isEmpty
                  ? const Center(child: Text('Keranjang Anda kosong'))
                  : Column(
                      children: [
                        // Pilih Semua Checkbox
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                          child: Row(
                            children: [
                              Checkbox(
                                value: _isAllSelected(),
                                onChanged: _toggleSelectAll,
                              ),
                              const Text('Pilih Semua', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const Divider(),
                        // List Produk Keranjang
                        Expanded(
                          child: ListView.builder(
                            itemCount: _cartItems.length,
                            itemBuilder: (context, index) {
                              final cartItem = _cartItems[index];
                              final cartItemId = cartItem['id'];
                              final product = cartItem['product'] ?? {};
                              final quantity = cartItem['quantity'] ?? 1;
                              final imageUrl = _getImageUrl(product['imageUrl']);
                              final isSelected = _selectedItemIds.contains(cartItemId);

                              return Card(
                                margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Row(
                                    children: [
                                      Checkbox(
                                        value: isSelected,
                                        onChanged: (val) => _toggleSelectItem(cartItemId, val),
                                      ),
                                      // Gambar Produk
                                      Container(
                                        width: 80,
                                        height: 80,
                                        color: Colors.grey[200],
                                        child: imageUrl.isNotEmpty
                                            ? CachedNetworkImage(
                                                imageUrl: imageUrl,
                                                fit: BoxFit.cover,
                                                placeholder: (context, url) => const Center(
                                                  child: SizedBox(
                                                      width: 20,
                                                      height: 20,
                                                      child: CircularProgressIndicator()),
                                                ),
                                                errorWidget: (context, url, error) =>
                                                    const Icon(Icons.image_not_supported, color: Colors.grey),
                                              )
                                            : const Icon(Icons.pets, color: Colors.grey),
                                      ),
                                      const SizedBox(width: 12),
                                      // Detail Produk
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              product['name'] ?? 'No Name',
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Rp ${product['price'] ?? 0}',
                                              style: const TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold),
                                            ),
                                            const SizedBox(height: 8),
                                            // Pengatur Kuantitas dan Hapus
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Row(
                                                  children: [
                                                    IconButton(
                                                      icon: const Icon(Icons.remove_circle_outline),
                                                      onPressed: quantity > 1
                                                          ? () => _updateQuantity(cartItemId, quantity, -1)
                                                          : null,
                                                      constraints: const BoxConstraints(),
                                                      padding: EdgeInsets.zero,
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                                      child: Text('$quantity', style: const TextStyle(fontSize: 16)),
                                                    ),
                                                    IconButton(
                                                      icon: const Icon(Icons.add_circle_outline),
                                                      onPressed: () => _updateQuantity(cartItemId, quantity, 1),
                                                      constraints: const BoxConstraints(),
                                                      padding: EdgeInsets.zero,
                                                    ),
                                                  ],
                                                ),
                                                IconButton(
                                                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                                                  onPressed: () => _deleteItem(cartItemId),
                                                  constraints: const BoxConstraints(),
                                                  padding: EdgeInsets.zero,
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
      // Bagian Bawah untuk Checkout
      bottomNavigationBar: _cartItems.isEmpty
          ? null
          : Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.3),
                    spreadRadius: 1,
                    blurRadius: 5,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Harga', style: TextStyle(color: Colors.grey)),
                      Text(
                        'Rp ${_calculateTotal().toStringAsFixed(0)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.deepPurple),
                      ),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: _selectedItemIds.isEmpty ? null : _checkout,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                    ),
                    child: Text('Checkout (${_selectedItemIds.length})'),
                  ),
                ],
              ),
            ),
    );
  }
}
