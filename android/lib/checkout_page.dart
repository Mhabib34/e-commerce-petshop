import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'core/constants/api_constants.dart';

class CheckoutPage extends StatefulWidget {
  final List<Map<String, dynamic>> checkoutItems;
  final bool isDirectCheckout;

  const CheckoutPage({
    super.key,
    required this.checkoutItems,
    this.isDirectCheckout = false,
  });

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final Dio _dio = Dio();
  bool _isLoading = false;

  // Mocked data for customer info, address, and payment method
  String _customerName = "Memuat...";
  String _customerPhone = "Memuat...";
  String _shippingAddress = "Memuat alamat...";
  String _selectedPaymentMethod = "Transfer Bank";

  final List<String> _paymentMethods = [
    "Transfer Bank",
    "Gopay",
    "OVO",
    "DANA",
    "COD (Bayar di Tempat)"
  ];

  @override
  void initState() {
    super.initState();
    _fetchCustomerInfo();
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  // TODO: Sesuaikan dengan endpoint profile backend Anda
  Future<void> _fetchCustomerInfo() async {
    try {
      final token = await _getToken();
      if (token == null) return;

      final response = await _dio.get(
        '${ApiConstants.baseUrl}/auth/me', // Menggunakan endpoint /auth/me sesuai spec
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        setState(() {
          _customerName = data['name'] ?? 'Nama Pengguna';
          _customerPhone = data['phone'] ?? '0812xxxxxxxx';
          _shippingAddress = data['address'] ?? 'Jl. Contoh Alamat No. 123, Kota, Provinsi';
        });
      }
    } catch (e) {
      debugPrint("Error fetching profile: $e");
      // Menggunakan data dummy jika API gagal / belum tersedia
      setState(() {
        _customerName = "Budi Santoso";
        _customerPhone = "081234567890";
        _shippingAddress = "Jl. Merdeka No. 45, Jakarta Selatan";
      });
    }
  }

  Future<void> _processCheckout() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final token = await _getToken();
      if (token == null) {
        throw Exception("Token tidak ditemukan, silakan login kembali.");
      }

      // Payload untuk backend
      Map<String, dynamic> payload = {
        'paymentMethod': _selectedPaymentMethod,
        'shippingAddress': _shippingAddress,
      };

      String endpoint = '${ApiConstants.baseUrl}/orders';

      if (widget.isDirectCheckout) {
        // Jika direct checkout, kirim variantId dan quantity
        endpoint = '${ApiConstants.baseUrl}/orders/direct';
        payload['variantId'] = widget.checkoutItems[0]['id'];
        payload['quantity'] = widget.checkoutItems[0]['quantity'];
      } else {
        // Jika dari keranjang, kirim array ID dari cart item
        payload['cartItemIds'] = widget.checkoutItems.map((e) => e['cartItemId']).toList();
      }

      final response = await _dio.post(
        endpoint,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
        data: payload,
      );

      if ((response.statusCode == 200 || response.statusCode == 201) && response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Pesanan berhasil dibuat!')),
          );
          // Kembali ke halaman home / success page
          Navigator.popUntil(context, (route) => route.isFirst);
        }
      } else {
        throw Exception(response.data['message'] ?? 'Gagal membuat pesanan');
      }
    } catch (e) {
      debugPrint("Checkout error: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _getImageUrl(String? filename) {
    if (filename == null || filename.isEmpty) return '';
    final serverUrl = ApiConstants.baseUrl.replaceAll('/api', '');
    return '$serverUrl/uploads/$filename';
  }

  double _calculateSubtotal() {
    double total = 0;
    for (var item in widget.checkoutItems) {
      final price = double.tryParse(item['price'].toString()) ?? 0.0;
      final quantity = item['quantity'] as int? ?? 1;
      total += (price * quantity);
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    final subtotal = _calculateSubtotal();
    final shippingFee = 15000.0; // Contoh biaya ongkir statis
    final total = subtotal + shippingFee;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Informasi Pelanggan & Alamat
                  const Text(
                    'Informasi Pengiriman',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.person, color: Colors.deepPurple),
                              const SizedBox(width: 8),
                              Text(_customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(width: 8),
                              Text('($_customerPhone)', style: const TextStyle(color: Colors.grey)),
                            ],
                          ),
                          const Divider(),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.location_on, color: Colors.deepPurple),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _shippingAddress,
                                  style: const TextStyle(height: 1.5),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 2. Daftar Produk yang Dibeli
                  const Text(
                    'Produk Dipesan',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: widget.checkoutItems.length,
                    itemBuilder: (context, index) {
                      final item = widget.checkoutItems[index];
                      final imageUrl = _getImageUrl(item['imageUrl']);
                      final price = double.tryParse(item['price'].toString()) ?? 0.0;
                      final quantity = item['quantity'] as int? ?? 1;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 8.0),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            children: [
                              Container(
                                width: 60,
                                height: 60,
                                color: Colors.grey[200],
                                child: imageUrl.isNotEmpty
                                    ? CachedNetworkImage(
                                        imageUrl: imageUrl,
                                        fit: BoxFit.cover,
                                        errorWidget: (context, url, error) => const Icon(Icons.image_not_supported),
                                      )
                                    : const Icon(Icons.pets),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['name'] ?? 'No Name',
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text('Rp $price x $quantity'),
                                  ],
                                ),
                              ),
                              Text(
                                'Rp ${price * quantity}',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.deepPurple),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // 3. Metode Pembayaran
                  const Text(
                    'Metode Pembayaran',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Card(
                    elevation: 2,
                    child: Column(
                      children: _paymentMethods.map((method) {
                        return RadioListTile<String>(
                          title: Text(method),
                          value: method,
                          groupValue: _selectedPaymentMethod,
                          onChanged: (String? value) {
                            setState(() {
                              _selectedPaymentMethod = value!;
                            });
                          },
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 4. Ringkasan Pesanan
                  const Text(
                    'Ringkasan Belanja',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Subtotal Produk', style: TextStyle(color: Colors.grey)),
                              Text('Rp $subtotal'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Biaya Pengiriman', style: TextStyle(color: Colors.grey)),
                              Text('Rp $shippingFee'),
                            ],
                          ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Tagihan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text(
                                'Rp $total',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: Colors.deepPurple,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Tombol Checkout
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _processCheckout,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: Colors.deepPurple,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text(
                        'Buat Pesanan',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}
