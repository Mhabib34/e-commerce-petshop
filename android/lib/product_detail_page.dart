import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'core/constants/api_constants.dart';
import 'checkout_page.dart';

class ProductDetailPage extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailPage({super.key, required this.product});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  final Dio _dio = Dio();
  bool _isLoading = true;
  String _errorMessage = '';
  Map<String, dynamic>? _product;
  int _quantity = 1;
  String? _selectedVariantId;

  @override
  void initState() {
    super.initState();
    _product = widget.product;
    final variants = _product?['variants'];
    if (variants != null && variants is List && variants.isNotEmpty) {
      _selectedVariantId = variants[0]['id'].toString();
    }
    _isLoading = false;
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  String? _getVariantId() {
    return _selectedVariantId;
  }

  // Fetch logic dihilangkan karena data produk di-passing langsung dari HomePage

  Future<void> _addToCart() async {
    try {
      final token = await _getToken();
      if (token == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Anda harus login terlebih dahulu')),
        );
        return;
      }

      final variantId = _getVariantId();
      if (variantId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Varian produk tidak tersedia')),
        );
        return;
      }

      final response = await _dio.post(
        '${ApiConstants.baseUrl}/cart',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
        data: {
          'variantId': variantId,
          'quantity': _quantity,
        },
      );

      if ((response.statusCode == 200 || response.statusCode == 201) && response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Berhasil ditambahkan ke keranjang')),
          );
        }
      } else {
        throw Exception(response.data['message'] ?? 'Gagal menambah ke keranjang');
      }
    } catch (e) {
      debugPrint("Error add to cart: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menambahkan ke keranjang')),
        );
      }
    }
  }

  Future<void> _directCheckout() async {
    final token = await _getToken();
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Anda harus login terlebih dahulu')),
      );
      return;
    }

    if (_product != null) {
      final variantId = _getVariantId();
      if (variantId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Varian produk tidak tersedia')),
        );
        return;
      }

      final List<Map<String, dynamic>> checkoutItems = [
        {
          'id': variantId, // Menggunakan variantId agar sesuai dengan API
          'name': _product!['name'],
          'price': _product!['price'],
          'imageUrl': _product!['imageUrl'],
          'quantity': _quantity,
        }
      ];

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CheckoutPage(
            checkoutItems: checkoutItems,
            isDirectCheckout: true,
          ),
        ),
      );
    }
  }

  String _getImageUrl(String? filename) {
    if (filename == null || filename.isEmpty) return '';
    final serverUrl = ApiConstants.baseUrl.replaceAll('/api', '');
    return '$serverUrl/uploads/$filename';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Produk'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
              ? Center(child: Text(_errorMessage))
              : _product == null
                  ? const Center(child: Text('Produk tidak ditemukan'))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Expanded(
                          child: SingleChildScrollView(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Gambar Produk
                                Container(
                                  height: 250,
                                  width: double.infinity,
                                  color: Colors.grey[200],
                                  child: _product!['imageUrl'] != null
                                      ? CachedNetworkImage(
                                          imageUrl: _getImageUrl(_product!['imageUrl']),
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) => const Center(
                                            child: CircularProgressIndicator(),
                                          ),
                                          errorWidget: (context, url, error) =>
                                              const Icon(Icons.image_not_supported, size: 100, color: Colors.grey),
                                        )
                                      : const Icon(Icons.pets, size: 100, color: Colors.grey),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Nama Produk
                                      Text(
                                        _product!['name'] ?? 'No Name',
                                        style: const TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      // Harga
                                      Text(
                                        'Rp ${_product!['price'] ?? 0}',
                                        style: const TextStyle(
                                          fontSize: 20,
                                          color: Colors.deepPurple,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      const Divider(),
                                      const SizedBox(height: 8),
                                      // Pilihan Varian
                                      if (_product!['variants'] != null && (_product!['variants'] as List).isNotEmpty) ...[
                                        const Text(
                                          'Pilih Varian',
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Wrap(
                                          spacing: 8.0,
                                          children: (_product!['variants'] as List).map<Widget>((variant) {
                                            final variantId = variant['id'].toString();
                                            final isSelected = _selectedVariantId == variantId;
                                            return ChoiceChip(
                                              label: Text(variant['name'] ?? 'Varian'),
                                              selected: isSelected,
                                              onSelected: (selected) {
                                                if (selected) {
                                                  setState(() {
                                                    _selectedVariantId = variantId;
                                                  });
                                                }
                                              },
                                            );
                                          }).toList(),
                                        ),
                                        const SizedBox(height: 16),
                                        const Divider(),
                                        const SizedBox(height: 8),
                                      ],
                                      // Deskripsi (opsional, jika dari API ada 'description')
                                      const Text(
                                        'Deskripsi Produk',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        _product!['description'] ?? 'Tidak ada deskripsi tersedia.',
                                        style: const TextStyle(fontSize: 16, height: 1.5),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        
                        // Bagian Bawah: Kuantitas dan Tombol Aksi
                        Container(
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
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Pengatur Kuantitas
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Jumlah',
                                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove_circle_outline),
                                        onPressed: _quantity > 1
                                            ? () {
                                                setState(() {
                                                  _quantity--;
                                                });
                                              }
                                            : null,
                                      ),
                                      Text('$_quantity', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      IconButton(
                                        icon: const Icon(Icons.add_circle_outline),
                                        onPressed: () {
                                          setState(() {
                                            _quantity++;
                                          });
                                        },
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              // Tombol Keranjang dan Checkout
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: _addToCart,
                                      icon: const Icon(Icons.add_shopping_cart),
                                      label: const Text('Keranjang'),
                                      style: OutlinedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        foregroundColor: Colors.deepPurple,
                                        side: const BorderSide(color: Colors.deepPurple),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: _directCheckout,
                                      style: ElevatedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        backgroundColor: Colors.deepPurple,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: const Text('Beli Langsung'),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
    );
  }
}
