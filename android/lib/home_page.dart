import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'core/constants/api_constants.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final TextEditingController _searchController = TextEditingController();
  final Dio _dio = Dio();
  
  // State variables
  List<dynamic> _categories = [];
  List<dynamic> _products = [];
  String? _selectedCategoryId; // null berarti "Semua"
  
  bool _isLoadingCategories = true;
  bool _isLoadingProducts = true;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _fetchCategories();
    _fetchProducts();
  }

  Future<void> _fetchCategories() async {
    try {
      final response = await _dio.get('${ApiConstants.baseUrl}/categories');
      if (response.statusCode == 200) {
        setState(() {
          _categories = response.data['data'];
          _isLoadingCategories = false;
        });
      }
    } catch (e) {
      debugPrint("Error fetching categories: $e");
      setState(() {
        _isLoadingCategories = false;
      });
    }
  }

  Future<void> _fetchProducts({String query = ''}) async {
    setState(() {
      _isLoadingProducts = true;
      _errorMessage = '';
    });

    try {
      final Map<String, dynamic> queryParams = {};
      if (query.isNotEmpty) {
        queryParams['search'] = query;
      }
      if (_selectedCategoryId != null) {
        queryParams['categoryId'] = _selectedCategoryId;
      }

      final response = await _dio.get(
        '${ApiConstants.baseUrl}/products',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        setState(() {
          _products = response.data['data'];
          _isLoadingProducts = false;
        });
      }
    } catch (e) {
      debugPrint("Error fetching products: $e");
      setState(() {
        _isLoadingProducts = false;
        _errorMessage = 'Gagal memuat produk. Silakan coba lagi.';
      });
    }
  }

  void _performSearch(String query) {
    _fetchProducts(query: query);
  }

  // Membantu untuk mendapatkan URL gambar yang benar (mengganti /api dengan /uploads)
  String _getImageUrl(String? filename) {
    if (filename == null || filename.isEmpty) return '';
    final serverUrl = ApiConstants.baseUrl.replaceAll('/api', '');
    return '$serverUrl/uploads/$filename';
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari kebutuhan hewan peliharaan...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
              onSubmitted: _performSearch,
            ),
          ),

          // 2. Filter Kategori Horizontal
          SizedBox(
            height: 40,
            child: _isLoadingCategories
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: _categories.length + 1, // +1 untuk kategori "Semua"
                    itemBuilder: (context, index) {
                      final isAllOption = index == 0;
                      final category = isAllOption ? null : _categories[index - 1];
                      final categoryId = isAllOption ? null : category['id'];
                      final categoryName = isAllOption ? 'Semua' : category['name'];
                      final isSelected = _selectedCategoryId == categoryId;
                      
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: ChoiceChip(
                          label: Text(categoryName),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              _selectedCategoryId = categoryId;
                            });
                            // Fetch ulang produk berdasarkan kategori baru
                            _fetchProducts(query: _searchController.text);
                          },
                        ),
                      );
                    },
                  ),
          ),
          
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Produk Terbaru',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),

          // 3. Grid Produk
          Expanded(
            child: _isLoadingProducts
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage.isNotEmpty
                    ? Center(child: Text(_errorMessage))
                    : _products.isEmpty
                        ? const Center(child: Text('Tidak ada produk ditemukan'))
                        : GridView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,           
                              childAspectRatio: 0.70,      
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                            ),
                            itemCount: _products.length,
                            itemBuilder: (context, index) {
                              final product = _products[index];
                              final imageUrl = _getImageUrl(product['imageUrl']);
                              
                              return Card(
                                clipBehavior: Clip.antiAlias,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: InkWell(
                                  onTap: () {
                                    // TODO: Navigasi ke Detail Produk passing productId
                                    debugPrint('Klik produk: ${product['name']}');
                                  },
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Gambar Asli dari Backend
                                      Container(
                                        height: 120,
                                        width: double.infinity,
                                        color: Colors.grey[200],
                                        child: imageUrl.isNotEmpty
                                            ? CachedNetworkImage(
                                                imageUrl: imageUrl,
                                                fit: BoxFit.cover,
                                                placeholder: (context, url) => const Center(
                                                  child: SizedBox(
                                                    width: 30, height: 30, 
                                                    child: CircularProgressIndicator()
                                                  ),
                                                ),
                                                errorWidget: (context, url, error) => const Icon(Icons.image_not_supported, color: Colors.grey),
                                              )
                                            : const Icon(Icons.pets, size: 50, color: Colors.grey),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              product['name'] ?? 'No Name',
                                              style: const TextStyle(fontWeight: FontWeight.bold),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Rp ${product['price'] ?? 0}', // Nanti bisa ditambah fungsi format Rupiah
                                              style: const TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold),
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
    );
  }
}
