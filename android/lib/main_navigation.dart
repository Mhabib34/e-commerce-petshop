import 'package:flutter/material.dart';
import 'home_page.dart';
import 'cart_page.dart';

class MainNavigation extends StatefulWidget {
    const MainNavigation({super.key});

    @override
    State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation>{
 int _selectIndex = 0;

 //daftar hal untuk setiap tab navbar

 final List<Widget> _pages = [
    const HomePage(),
    const CartPage(),
    const Center(child: Text('profil (segera hadir)')),
 ];
 void _onItemTapped(int index){
    setState(() {
      _selectIndex = index;
    });
 }

 @override
 Widget build(BuildContext context){
   return Scaffold(
    appBar: AppBar(
      title: const Text('petshop app'),
    ),
    body: _pages[_selectIndex],
    bottomNavigationBar: BottomNavigationBar(
      items: const <BottomNavigationBarItem>[
        BottomNavigationBarItem(icon: Icon(Icons.home),
        label: 'home',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.shopping_cart),
        label: 'Keranjang',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.person),
        label: 'Profil',
        ),
      ],
      currentIndex: _selectIndex,
      selectedItemColor: Colors.amber[800],
      onTap: _onItemTapped,
      ),
   );
 }
}